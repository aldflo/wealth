import { useState } from "react";
import { db, auth } from "../firebase.config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FaCloudUploadAlt, FaPhone, FaPen, FaTag, FaImage } from "react-icons/fa";

function CrearCotizacion() {

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("Construcción");
  const [telefono, setTelefono] = useState("");
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 SUBIR IMAGEN A CLOUDINARY
  const subirImagen = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "wealth");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dxj4iczvk/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  // 🔥 CREAR COTIZACIÓN
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !descripcion || !telefono) {
      alert("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = "";

      if (imagen) {
        imageUrl = await subirImagen(imagen);
      }

      await addDoc(collection(db, "cotizaciones"), {
        nombre,
        descripcion,
        tipo,
        telefono,
        imagen: imageUrl,
        usuario: auth.currentUser ? auth.currentUser.email : "anonimo",
        estado: "pendiente",
        fecha: serverTimestamp()
      });

      alert("Cotización enviada correctamente");

      setNombre("");
      setDescripcion("");
      setTipo("Construcción");
      setTelefono("");
      setImagen(null);

    } catch (error) {
      console.log(error);
      alert("Error al enviar cotización");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">

      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-xl">

        {/* HEADER */}
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
              className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-yellow-500 outline-none"
              placeholder="Ej: Casa moderna, ventanales, etc."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">
              <FaPen /> Descripción
            </label>

            <textarea
              className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-yellow-500 outline-none"
              rows="4"
              placeholder="Describe lo que necesitas..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
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
              <FaPhone /> Teléfono de contacto
            </label>

            <input
              type="tel"
              className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-yellow-500 outline-none"
              placeholder="Ej: 922 123 4567"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          {/* IMAGEN */}
          <div>
            <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">
              <FaImage /> Imagen de referencia
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagen(e.target.files[0])}
              className="w-full text-sm text-zinc-300"
            />
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition"
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