import { useState } from "react";
import { db } from "../firebase.config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { FaCloudUploadAlt } from "react-icons/fa";

function Subirgaleria() {
  const [categoria, setCategoria] = useState("Construcciones");
  const [subcategoria, setSubcategoria] = useState("Puertas");

  // 🔥 ahora SIEMPRE array real
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 👉 CLOUDINARY
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

  // 👉 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imagenes.length === 0) {
      alert("Selecciona al menos una imagen");
      return;
    }

    try {
      setLoading(true);

      const urls = await Promise.all(
        imagenes.map((file) => subirImagen(file))
      );

      await addDoc(collection(db, "galeria"), {
        categoria,
        subcategoria,
        imagenes: urls,
        fecha: serverTimestamp(),
      });

      alert("Galería subida correctamente");

      // reset
      setImagenes([]);
      e.target.reset();
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-4xl font-bold mb-8">
        Subir <span className="text-yellow-500">Galería</span>
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl bg-zinc-900 p-8 rounded-3xl space-y-6"
      >

        {/* CATEGORÍA */}
        <select
          className="w-full p-3 bg-zinc-800 rounded-xl"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option>Construcciones</option>
          <option>Inmobiliaria</option>
          <option>Vidrio y Aluminio</option>
        </select>

        {/* SUBCATEGORÍA */}
        <select
          className="w-full p-3 bg-zinc-800 rounded-xl"
          value={subcategoria}
          onChange={(e) => setSubcategoria(e.target.value)}
        >
          <option>Puertas</option>
          <option>Ventanas</option>
          <option>Cancelería</option>
          <option>Fachadas</option>
          <option>Otros</option>
        </select>

        {/* IMÁGENES */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files); // 🔥 CLAVE
            setImagenes(files);
          }}
          className="w-full text-sm"
        />

        {/* PREVIEW */}
        {imagenes.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {imagenes.map((file, i) => (
              <div
                key={i}
                className="text-xs text-green-400 bg-zinc-800 p-2 rounded-xl"
              >
                {file.name}
              </div>
            ))}
          </div>
        )}

        {/* BOTÓN */}
        <button
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
        >
          <FaCloudUploadAlt />
          {loading ? "Subiendo..." : "Subir Galería"}
        </button>

      </form>
    </div>
  );
}

export default Subirgaleria;