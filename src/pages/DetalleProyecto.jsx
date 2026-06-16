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
  const [modalAbierto, setModalAbierto] = useState(false);
const [imagenModal, setImagenModal] = useState("");
const [touchStart, setTouchStart] = useState(null);
const [touchEnd, setTouchEnd] = useState(null);

const minSwipeDistance = 50;

const onTouchStart = (e) => {
  setTouchEnd(null);
  setTouchStart(e.targetTouches[0].clientX);
};

const onTouchMove = (e) => {
  setTouchEnd(e.targetTouches[0].clientX);
};

const onTouchEnd = () => {
  if (!touchStart || !touchEnd) return;

  const distance = touchStart - touchEnd;

  if (distance > minSwipeDistance) {
    siguienteImagen();
  }

  if (distance < -minSwipeDistance) {
    anteriorImagen();
  }
};
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
// 👉 Cambiar imagen
const siguienteImagen = () => {
  setIndex((prev) => (prev + 1) % imagenes.length);
};

const anteriorImagen = () => {
  setIndex((prev) =>
    prev === 0 ? imagenes.length - 1 : prev - 1
  );
};
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

  <div
  className="relative bg-zinc-900 rounded-3xl overflow-hidden"
  onTouchStart={onTouchStart}
  onTouchMove={onTouchMove}
  onTouchEnd={onTouchEnd}
>
  {/* CONTADOR */}
  <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-md text-white text-sm px-3 py-1 rounded-full">
    {index + 1} / {imagenes.length}
  </div>

  {/* FLECHA IZQUIERDA */}
  <button
    onClick={anteriorImagen}
    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 items-center justify-center text-white text-2xl transition"
  >
    ❮
  </button>

  {/* FLECHA DERECHA */}
  <button
    onClick={siguienteImagen}
    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 items-center justify-center text-white text-2xl transition"
  >
    ❯
  </button>

  <img
    src={imagenes[index]}
    alt={proyecto.nombre}
    onClick={() => {
  setIndex(i);
}}
    className="w-full h-[500px] object-contain p-6 cursor-zoom-in select-none"
    draggable={false}
  />
</div>


          {/* MINI GALERÍA */}
          <div className="flex gap-3 overflow-x-auto">

            {imagenes.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${proyecto.nombre} ${i + 1}`}
               onClick={() => {
  setIndex(i);
  setImagenModal(img);
  setModalAbierto(true);
}}
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

      {/* GALERÍA DE DISEÑOS */}
      {proyecto.galeria && proyecto.galeria.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-16">

          <h2 className="text-3xl font-bold mb-3">
            Más diseños relacionados
          </h2>

          <p className="text-zinc-400 mb-8">
            Explora otros diseños y acabados que también podemos fabricar
            y personalizar para tu proyecto.
          </p>

         <div className="flex gap-6 overflow-x-auto pb-3 snap-x snap-mandatory">

            {proyecto.galeria.map((img, i) => (
              <div
                key={i}
               className="min-w-[280px] md:min-w-[320px] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 flex-shrink-0"
              >
               <img
  src={img}
  alt={`Diseño ${i + 1}`}
  onClick={() => {
    setImagenModal(img);
    setModalAbierto(true);
  }}
  className="w-full h-64 object-cover hover:scale-110 transition duration-300 cursor-zoom-in"
/>
              </div>
            ))}

          </div>

        </div>
      )}
      {/* MODAL DE IMAGEN */}
      {modalAbierto && (
        <div
          onClick={() => setModalAbierto(false)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <img
            src={imagenModal}
            alt="Vista previa"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full rounded-2xl object-contain"
          />

          <button
            onClick={() => setModalAbierto(false)}
            className="absolute top-6 right-6 text-white text-5xl hover:text-yellow-500 transition"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default DetalleProyecto;