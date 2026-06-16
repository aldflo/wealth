import { useEffect, useState } from "react";
import { db } from "../firebase.config";
import { useNavigate } from "react-router-dom";

import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  FaCloudUploadAlt,
  FaFolderOpen,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

function SubirProyecto() {
  const navigate = useNavigate();

  const [imagenes, setImagenes] = useState([]);
  const [galeria, setGaleria] = useState([]);

  const [previewImagenes, setPreviewImagenes] = useState([]);
const [previewGaleria, setPreviewGaleria] = useState([]);

  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [galeriaExistente, setGaleriaExistente] = useState([]);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Construcciones");

  const [proyectos, setProyectos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("Todos");

  // LISTAR
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "proyectos"), (snap) => {
      setProyectos(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });
    return () => unsub();
  }, []);
const handlePreviewImagenes = (files) => {
  const imgs = Array.from(files).map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));
  setPreviewImagenes(imgs);
  setImagenes(files);
};

const handlePreviewGaleria = (files) => {
  const imgs = Array.from(files).map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));
  setPreviewGaleria(imgs);
  setGaleria(files);
};
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

  // CREATE / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const urls =
      imagenes.length > 0
        ? await Promise.all([...imagenes].map(subirImagen))
        : [];

    const galeriaUrls =
      galeria.length > 0
        ? await Promise.all([...galeria].map(subirImagen))
        : [];

    if (editId) {
      await updateDoc(doc(db, "proyectos", editId), {
        nombre,
        descripcion,
        categoria,
        imagenes: [...imagenesExistentes, ...urls],
        imagen: [...imagenesExistentes, ...urls][0] || "",
        galeria: [...galeriaExistente, ...galeriaUrls],
      });

      setEditId(null);
    } else {
      await addDoc(collection(db, "proyectos"), {
        nombre,
        descripcion,
        categoria,
        imagen: urls[0] || "",
        imagenes: urls,
        galeria: galeriaUrls,
        fecha: serverTimestamp(),
      });
    }

    setLoading(false);
    setImagenes([]);
    setGaleria([]);
    setImagenesExistentes([]);
    setGaleriaExistente([]);
    setNombre("");
    setDescripcion("");
  };

  // EDITAR
  const handleEdit = (p) => {
    setEditId(p.id);
    setNombre(p.nombre);
    setDescripcion(p.descripcion);
    setCategoria(p.categoria);
    setImagenesExistentes(p.imagenes || []);
    setGaleriaExistente(p.galeria || []);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar proyecto?")) {
      await deleteDoc(doc(db, "proyectos", id));
    }
  };

  const eliminarImg = (url, tipo) => {
    if (tipo === "main") {
      setImagenesExistentes((prev) => prev.filter((i) => i !== url));
    } else {
      setGaleriaExistente((prev) => prev.filter((i) => i !== url));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-14">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex justify-between mb-10">
        <div className="flex gap-4 items-center">
          <FaFolderOpen className="text-yellow-500 text-5xl" />
          <div>
            <h1 className="text-4xl font-bold">Panel de Proyectos</h1>
            <p className="text-zinc-400">Administra tu catálogo empresarial</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/proyectos")}
          className="bg-zinc-800 px-5 py-3 rounded-2xl border border-zinc-700"
        >
          Ver proyectos
        </button>
      </div>

      {/* FORM */}
      <div className="max-w-4xl mx-auto bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10">

        <form className="space-y-6" onSubmit={handleSubmit}>

          <input
            className="w-full p-4 bg-zinc-800 rounded-2xl"
            placeholder="Nombre del proyecto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <textarea
            className="w-full p-4 bg-zinc-800 rounded-2xl"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <select
            className="w-full p-4 bg-zinc-800 rounded-2xl"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option>Construcciones</option>
            <option>Inmobiliaria</option>
            <option>Aluminios y Vidrios</option>
          </select>

          {/* IMAGENES */}
          <label className="block border-2 border-dashed border-yellow-500 rounded-2xl p-6 text-center cursor-pointer hover:bg-yellow-500/10 transition">
            <p className="text-lg">📸 Imágenes del proyecto</p>
            <p className="text-xs text-zinc-400">Click aquí para subir imágenes principales</p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => setImagenes(e.target.files)}
            />
          </label>

          {/* GALERÍA */}
          <label className="block border-2 border-dashed border-blue-500 rounded-2xl p-6 text-center cursor-pointer hover:bg-blue-500/10 transition">
            <p className="text-lg">🖼️ Diseños relacionados</p>
            <p className="text-xs text-zinc-400">Click aquí para subir diseños adicionales</p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => setGaleria(e.target.files)}
            />
          </label>

          {/* PREVIEW MAIN */}
          {imagenesExistentes.length > 0 && (
            <div>
              <p className="text-sm text-zinc-400">Imágenes del proyecto</p>

              <div className="grid grid-cols-3 gap-3 mt-2">
                {imagenesExistentes.map((img, i) => (
                  <div key={i} className="relative bg-black rounded-xl overflow-hidden h-32">
                    <img src={img} className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => eliminarImg(img, "main")}
                      className="absolute top-2 right-2 bg-red-500 px-2 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PREVIEW GALERIA */}
          {galeriaExistente.length > 0 && (
            <div>
              <p className="text-sm text-zinc-400">Diseños relacionados</p>

              <div className="grid grid-cols-3 gap-3 mt-2">
                {galeriaExistente.map((img, i) => (
                  <div key={i} className="relative bg-black rounded-xl overflow-hidden h-32">
                    <img src={img} className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => eliminarImg(img, "galeria")}
                      className="absolute top-2 right-2 bg-red-500 px-2 rounded"
                    >
                      ✕
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
            {editId ? "Actualizar Proyecto" : "Publicar Proyecto"}
          </button>

        </form>
      </div>

      {/* LISTA PROYECTOS MEJORADA */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 mt-12">

        {proyectos.map((p) => (
          <div
            key={p.id}
            className="group bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden hover:border-yellow-500 transition-all duration-300 hover:-translate-y-1 shadow-xl"
          >

            {/* IMAGEN */}
            <div className="relative h-72 bg-black flex items-center justify-center overflow-hidden">

              <img
                src={p.imagen}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              <div className="absolute top-3 left-3 bg-black/70 px-3 py-1 text-xs rounded-full border border-zinc-700">
                {p.categoria}
              </div>

            </div>

            {/* INFO */}
            <div className="p-6">

              <h2 className="text-xl font-bold mb-2">{p.nombre}</h2>

              <p className="text-zinc-400 text-sm line-clamp-3">
                {p.descripcion}
              </p>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={() => handleEdit(p)}
                  className="flex-1 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  <FaEdit />
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
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
  );
}

export default SubirProyecto;