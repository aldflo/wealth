import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase.config";
import { doc, getDoc } from "firebase/firestore";

import {
  FaPhone,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaUser,
} from "react-icons/fa";

function DetalleProyecto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proyecto, setProyecto] = useState(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const ref = doc(db, "proyectos", id);
      const snap = await getDoc(ref);

      setProyecto(
        snap.exists() ? { id: snap.id, ...snap.data() } : null
      );

      setLoading(false);
    };

    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Cargando...
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Proyecto no encontrado
      </div>
    );
  }

  const imagenes =
    Array.isArray(proyecto.imagenes) && proyecto.imagenes.length > 0
      ? proyecto.imagenes
      : [proyecto.imagen];

  // 👉 WHATSAPP
  const enviarWhatsApp = () => {
    const telefono = "529811574778";
    const mensaje = `Hola 👋, me gustaría cotizar el proyecto: *${proyecto.nombre}*`;
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
  };

  // 👉 MAPS
  const abrirUbicacion = () => {
    const url =
      "https://www.google.com/maps/search/?api=1&query=Av+Aviaci%C3%B3n+89+H%C3%A9roe+de+Nacozari+Campeche";

    window.open(url, "_blank");
  };

  // 🔵 LOGIN / REGISTER
  const handleAuth = () => {
    navigate("/login", {
      state: {
        from: "detalleProyecto",
        proyectoId: proyecto.id,
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* NAV */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">

        <button
          onClick={() => navigate(-1)}
          className="text-zinc-400 hover:text-white transition"
        >
          ← Volver
        </button>

        <h1 className="font-semibold">{proyecto.nombre}</h1>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleAuth}
          className="flex items-center gap-2 text-sm bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-700 transition"
        >
          <FaUser />
          Registrarse / Iniciar sesión
        </button>

      </div>

      {/* MAIN */}
      <div className="grid md:grid-cols-2 gap-10 max-w-7xl mx-auto px-6 py-12">

        {/* IMAGEN */}
        <div className="space-y-4">

          <div className="bg-zinc-900 rounded-3xl overflow-hidden">
            <img
              src={imagenes[index]}
              className="w-full h-[500px] object-contain p-6"
            />
          </div>

          {/* MINI GALERÍA */}
          <div className="flex gap-3 overflow-x-auto">

            {imagenes.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setIndex(i)}
                className={`w-24 h-20 object-cover rounded-xl cursor-pointer border-2 transition ${
                  i === index
                    ? "border-yellow-500"
                    : "border-transparent opacity-60"
                }`}
              />
            ))}

          </div>
        </div>

        {/* INFO */}
        <div className="space-y-6">

          <span className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">
            {proyecto.categoria}
          </span>

          <h2 className="text-4xl font-bold">
            {proyecto.nombre}
          </h2>

          <p className="text-zinc-400 text-lg leading-relaxed">
            {proyecto.descripcion}
          </p>

          {/* BOTÓN WHATSAPP */}
          <button
            onClick={enviarWhatsApp}
            className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold transition"
          >
            <FaWhatsapp size={22} />
            Solicitar cotización
          </button>

          {/* CONTACTO */}
          <div className="border border-zinc-800 rounded-2xl p-5 space-y-4">

            <div className="flex items-center gap-3 text-zinc-300">
              <FaPhone />
              <span>+52 981 157 4778</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-300">
              <FaWhatsapp />
              <span>WhatsApp disponible 24/7</span>
            </div>

            <div
              onClick={abrirUbicacion}
              className="flex items-center gap-3 text-zinc-300 cursor-pointer hover:text-yellow-400 transition"
            >
              <FaMapMarkerAlt />
              <span>Ver ubicación en mapa</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default DetalleProyecto;