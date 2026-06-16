import { useState } from "react";
import { db, auth } from "../firebase.config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import {
  FaCloudUploadAlt,
  FaPhone,
  FaPen,
  FaTag,
  FaImage,
} from "react-icons/fa";

function CrearCotizacion() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("Construcción");
  const [telefono, setTelefono] = useState("");

  // 🔥 MULTI IMÁGENES (FILELIST)
  const [imagenes, setImagenes] = useState([]);

  const [loading, setLoading] = useState(false);

  // 🔥 CLOUDINARY UPLOAD
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

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !descripcion || !telefono) {
      alert("Completa todos los campos");
      return;
    }

    if (!auth.currentUser) {
      alert("Debes iniciar sesión para enviar una cotización.");
      return;
    }

    try {
      setLoading(true);

      // 🔥 SUBIR VARIAS IMÁGENES
      let imagenesUrls = [];

      if (imagenes && imagenes.length > 0) {
        imagenesUrls = await Promise.all(
          Array.from(imagenes).map((img) => subirImagen(img))
        );
      }

      await addDoc(collection(db, "cotizaciones"), {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        tipo,
        telefono: telefono.trim(),

        // 🔥 SIEMPRE ARRAY
        imagenes: imagenesUrls,

        usuario: auth.currentUser.email,
        uid: auth.currentUser.uid,

        estado: "pendiente",
        leido: false,
        fecha: serverTimestamp(),
      });

      alert("Cotización enviada correctamente");

      // RESET
      setNombre("");
      setDescripcion("");
      setTipo("Construcción");
      setTelefono("");
      setImagenes([]);

      const input = document.getElementById("imagenCotizacion");
      if (input) input.value = "";

    } catch (error) {
      console.error(error);
      alert("Error al enviar cotización");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">

      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-xl">

        <h1 className="text-3xl font-bold mb-2 text-yellow-500">
          Solicitar Cotización
        </h1>

        <p className="text-zinc-400 mb-8">
          Llena el formulario y nuestro equipo te contactará pronto.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* NOMBRE */}
          <div>
            <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">
              <FaPen /> Nombre del proyecto
            </label>

            <input
              className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Casa moderna"
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">
              <FaPen /> Descripción
            </label>

            <textarea
              rows="4"
              className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe tu proyecto..."
            />
          </div>

          {/* TIPO */}
          <div>
            <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">
              <FaTag /> Tipo de proyecto
            </label>

            <select
              className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option>Construcción</option>
              <option>Vidrio</option>
              <option>Inmobiliario</option>
              <option>Otro</option>
            </select>
          </div>

          {/* TELÉFONO */}
          <div>
            <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">
              <FaPhone /> Teléfono
            </label>

            <input
              type="tel"
              className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 999 123 4567"
            />
          </div>

          {/* IMÁGENES */}
          <div>
            <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">
              <FaImage /> Imágenes de referencia
            </label>

            <input
              id="imagenCotizacion"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImagenes(e.target.files)}
              className="w-full text-sm text-zinc-300"
            />

            {/* PREVIEW */}
            {imagenes.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {Array.from(imagenes).map((file, i) => (
                  <div
                    key={i}
                    className="text-xs text-green-400 bg-zinc-800 p-2 rounded-xl"
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <FaCloudUploadAlt />
            {loading ? "Enviando..." : "Enviar Cotización"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default CrearCotizacion;