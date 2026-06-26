import { useState, useEffect } from "react";
import { db } from "../firebase.config";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { FaCloudUploadAlt, FaTrash, FaImages, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Subirgaleria() {
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState("Construcciones");
  const [subcategoria, setSubcategoria] = useState("Puertas");

  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [galeriaDB, setGaleriaDB] = useState([]);

  const [editId, setEditId] = useState(null);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);

  /* 🔥 SUBCATEGORÍAS */
  const subcategorias = {
    Construcciones: [
      "Servicios de Electrificación",
      "Remodelaciones y Obra Ligera",
      "Instalación y Mantenimiento",
      "Estructuras Metálicas y Herrería",
      "Estructuras metálicas",
      "Barandales",
      "Cortinas metálicas",
      "Domos",
      "Protectores",
      "Rejas y portones",
      "Cercado de malla ciclónica",
      "Estructuras a diseño"
    ],

    "Vidrio y Aluminio": [
      "Fabricación de vidrio templado",
      "Canceles de baño",
      "Espejos y vitrinas",
      "Ventanas de aluminio",
      "Puertas residenciales",
      "Puertas de baño y mosquiteras",
      "Domos de vidrio y aluminio",
      "Cancelería moderna",
      "Diseños arquitectónicos ligeros",
      "Barandales de vidrio y aluminio",
      "Protectores y rejas ligeras",
      "Seguridad estética",
      "Portones eléctricos",
      "Sistemas automáticos de apertura",
      "Estructuras residenciales",
      "Fabricación personalizada",
      "Diseños arquitectónicos",
      "Proyectos especiales en aluminio y vidrio"
    ]
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "galeria"), (snap) => {
      setGaleriaDB(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  const subirImagen = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "wealth");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dxj4iczvk/image/upload",
      { method: "POST", body: formData }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imagenes.length === 0 && editId === null) {
      alert("Selecciona al menos una imagen");
      return;
    }

    setLoading(true);

    const nuevasUrls =
      imagenes.length > 0
        ? await Promise.all(imagenes.map(subirImagen))
        : [];

    if (editId) {
      await updateDoc(doc(db, "galeria", editId), {
        categoria,
        subcategoria,
        imagenes: [...imagenesExistentes, ...nuevasUrls],
      });

      setEditId(null);
    } else {
      await addDoc(collection(db, "galeria"), {
        categoria,
        subcategoria,
        imagenes: nuevasUrls,
        fecha: serverTimestamp(),
      });
    }

    setImagenes([]);
    setImagenesExistentes([]);
    setLoading(false);
  };

  const eliminarGaleria = async (id) => {
    if (confirm("¿Eliminar esta galería?")) {
      await deleteDoc(doc(db, "galeria", id));
    }
  };

  const handleEdit = (g) => {
    setEditId(g.id);
    setCategoria(g.categoria);
    setSubcategoria(g.subcategoria);
    setImagenesExistentes(g.imagenes || []);
  };

  const quitarImagenExistente = (url) => {
    setImagenesExistentes((prev) => prev.filter((i) => i !== url));
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-14">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-10 flex justify-between items-center">

        <div>
          <h1 className="text-4xl font-bold">
            Subir <span className="text-yellow-500">Galería</span>
          </h1>
          <p className="text-zinc-400 mt-2">
            Administra imágenes de diseños y proyectos
          </p>
        </div>

      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-6"
      >

        {/* CATEGORÍA */}
        <select
          className="w-full p-4 bg-zinc-800 rounded-2xl"
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
            setSubcategoria("");
          }}
        >
          <option>Construcciones</option>
          <option>Vidrio y Aluminio</option>
          <option>Inmobiliaria</option>
        </select>

        {/* BOTÓN VER GALERÍA */}
        <button
          onClick={() => navigate("/galeria")}
          className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-700"
        >
          <FaImages />
          Ver Galería
        </button>

        {/* SUBCATEGORÍA DINÁMICA */}
        <select
          className="w-full p-4 bg-zinc-800 rounded-2xl"
          value={subcategoria}
          onChange={(e) => setSubcategoria(e.target.value)}
        >
          <option value="">Selecciona subcategoría</option>

          {subcategorias[categoria]?.map((item, i) => (
            <option key={i} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* INPUT IMÁGENES */}
        <label className="block border-2 border-dashed border-yellow-500 rounded-2xl p-8 text-center cursor-pointer">
          <p className="text-lg font-semibold">📸 Seleccionar imágenes</p>

          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => setImagenes(Array.from(e.target.files))}
          />
        </label>

        {/* BOTÓN SUBIR */}
        <button
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-bold flex justify-center gap-2"
        >
          <FaCloudUploadAlt />
          {loading ? "Subiendo..." : editId ? "Actualizar Galería" : "Subir Galería"}
        </button>

      </form>

      {/* CATÁLOGO */}
      <div className="max-w-6xl mx-auto mt-14">

        <h2 className="text-2xl font-bold mb-6">
          Catálogo de <span className="text-yellow-500">Imágenes</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8">

          {galeriaDB.map((g) => (
            <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

              <div className="grid grid-cols-2 gap-1 p-2 bg-black">
                {g.imagenes?.slice(0, 4).map((img, i) => (
                  <img key={i} src={img} className="h-28 w-full object-cover rounded-xl" />
                ))}
              </div>

              <div className="p-5">

                <p className="text-sm text-zinc-400">
                  {g.categoria} • {g.subcategoria}
                </p>

                <div className="flex gap-2 mt-4">

                  <button
                    onClick={() => handleEdit(g)}
                    className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-2 rounded-xl"
                  >
                    <FaEdit />
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarGaleria(g.id)}
                    className="flex items-center gap-2 bg-red-500/10 text-red-400 px-3 py-2 rounded-xl"
                  >
                    <FaTrash />
                    Eliminar
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}

export default Subirgaleria;