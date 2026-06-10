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

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Construcciones");

  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [proyectos, setProyectos] = useState([]);
  const [editId, setEditId] = useState(null);

  const [filtro, setFiltro] = useState("Todos");

  // LISTAR
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "proyectos"), (snap) => {
      setProyectos(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
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
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  // CREATE / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !descripcion || !categoria) {
      alert("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const urls =
        imagenes.length > 0
          ? await Promise.all(Array.from(imagenes).map(subirImagen))
          : [];

      if (editId) {
        await updateDoc(doc(db, "proyectos", editId), {
          nombre,
          descripcion,
          categoria,
          ...(urls.length > 0 && {
            imagen: urls[0],
            imagenes: urls,
          }),
        });

        setEditId(null);
      } else {
        await addDoc(collection(db, "proyectos"), {
          nombre,
          descripcion,
          categoria,
          imagen: urls[0] || "",
          imagenes: urls,
          fecha: serverTimestamp(),
        });
      }

      resetForm();
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setCategoria("Construcciones");
    setImagenes([]);
    document.getElementById("fileInput").value = "";
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setNombre(p.nombre);
    setDescripcion(p.descripcion);
    setCategoria(p.categoria);
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar proyecto?")) {
      await deleteDoc(doc(db, "proyectos", id));
    }
  };

  const proyectosFiltrados =
    filtro === "Todos"
      ? proyectos
      : proyectos.filter((p) => p.categoria === filtro);

  return (

    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white px-6 py-14">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10 flex items-center gap-4 justify-between">

        <div className="flex items-center gap-4">
          <FaFolderOpen className="text-yellow-500 text-5xl" />
          <div>
            <h1 className="text-4xl font-bold">Panel de Proyectos</h1>
            <p className="text-zinc-400">
              Administra tu catálogo empresarial
            </p>
          </div>
        </div>

        {/* 🔥 BOTÓN NUEVO */}
        <button
          onClick={() => navigate("/proyectos")}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-5 py-3 rounded-2xl text-sm font-semibold transition"
        >
          Ver proyectos
        </button>

      </div>

      {/* FORM */}
      <div className="max-w-4xl mx-auto bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-10 shadow-2xl">

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 outline-none focus:border-yellow-500"
            placeholder="Nombre del proyecto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <textarea
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 outline-none focus:border-yellow-500"
            rows="4"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <select
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option>Construcciones</option>
            <option>Inmobiliaria</option>
            <option>Aluminios y Vidrios</option>
          </select>

          <input
            id="fileInput"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImagenes(e.target.files)}
            className="w-full text-sm text-zinc-300"
          />

          <button
            disabled={loading}
            className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-bold hover:scale-[1.02] transition flex justify-center gap-2"
          >
            <FaCloudUploadAlt />
            {editId ? "Actualizar Proyecto" : "Publicar Proyecto"}
          </button>

        </form>

      </div>

      {/* FILTROS */}
      <div className="max-w-6xl mx-auto mt-14 mb-8 flex flex-wrap gap-3">

        {["Todos", "Construcciones", "Inmobiliaria", "Aluminios y Vidrios"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltro(cat)}
            className={`px-5 py-2 rounded-full border transition text-sm font-semibold ${
              filtro === cat
                ? "bg-yellow-500 text-black border-yellow-500"
                : "bg-zinc-900 border-zinc-700 text-white hover:border-yellow-500"
            }`}
          >
            {cat}
          </button>
        ))}

      </div>

      {/* LISTA */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        {proyectosFiltrados.map((p) => (
          <div
            key={p.id}
            className="group bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden hover:border-yellow-500 transition hover:-translate-y-1"
          >

            <img
              src={p.imagen}
              className="h-52 w-full object-cover group-hover:scale-105 transition"
            />

            <div className="p-6">

              <h2 className="text-xl font-bold">{p.nombre}</h2>

              <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
                {p.descripcion}
              </p>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={() => handleEdit(p)}
                  className="flex-1 bg-blue-500 py-2 rounded-xl flex justify-center"
                >
                  <FaEdit />
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 bg-red-500 py-2 rounded-xl flex justify-center"
                >
                  <FaTrash />
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