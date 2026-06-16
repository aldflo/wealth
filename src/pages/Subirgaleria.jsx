import { useState, useEffect } from "react";
import { db } from "../firebase.config";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
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

  // 🔥 EDIT MODE
  const [editId, setEditId] = useState(null);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);

  // LISTAR
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "galeria"), (snap) => {
      setGaleriaDB(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // CLOUDINARY
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

  // SUBIR / ACTUALIZAR (MERGE REAL)
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
    e.target.reset();
    setLoading(false);
  };

  // ELIMINAR GALERÍA COMPLETA
  const eliminarGaleria = async (id) => {
    if (confirm("¿Eliminar esta galería?")) {
      await deleteDoc(doc(db, "galeria", id));
    }
  };

  // EDITAR
  const handleEdit = (g) => {
    setEditId(g.id);
    setCategoria(g.categoria);
    setSubcategoria(g.subcategoria);
    setImagenesExistentes(g.imagenes || []);
  };

  // QUITAR IMAGEN EXISTENTE
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

        <button
          onClick={() => navigate("/galeria")}
          className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-700"
        >
          <FaImages />
          Ver Galería
        </button>

      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-6"
      >

        <select
          className="w-full p-4 bg-zinc-800 rounded-2xl"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option>Construcciones</option>
          <option>Inmobiliaria</option>
          <option>Vidrio y Aluminio</option>
        </select>

        <select
          className="w-full p-4 bg-zinc-800 rounded-2xl"
          value={subcategoria}
          onChange={(e) => setSubcategoria(e.target.value)}
        >
          <option>Puertas</option>
          <option>Ventanas</option>
          <option>Cancelería</option>
          <option>Fachadas</option>
          <option>Otros</option>
        </select>

        {/* INPUT */}
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

        {/* PREVIEW NUEVAS */}
        {imagenes.length > 0 && (
          <div>
            <p className="text-zinc-400 mb-3">
              Nuevas imágenes ({imagenes.length})
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {imagenes.map((file, i) => (
                <div key={i} className="relative bg-zinc-800 rounded-2xl overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    className="h-36 w-full object-contain bg-black"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setImagenes((prev) => prev.filter((_, index) => index !== i))
                    }
                    className="absolute top-2 right-2 bg-red-500 p-2 rounded-full"
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PREVIEW EXISTENTES (EDIT MODE) */}
        {imagenesExistentes.length > 0 && (
          <div>
            <p className="text-zinc-400 mb-3">
              Imágenes actuales
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {imagenesExistentes.map((img, i) => (
                <div key={i} className="relative bg-zinc-800 rounded-2xl overflow-hidden">
                  <img src={img} className="h-36 w-full object-contain bg-black" />

                  <button
                    type="button"
                    onClick={() => quitarImagenExistente(img)}
                    className="absolute top-2 right-2 bg-red-500 p-2 rounded-full"
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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