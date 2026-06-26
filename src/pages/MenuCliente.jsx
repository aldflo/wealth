import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase.config";

import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import {
  FaFileInvoiceDollar,
  FaBuilding,
  FaUser,
  FaSearch,
  FaHeart,
  FaBars,
  FaTimes,
  FaHome,
  FaBell
} from "react-icons/fa";

function MenuCliente() {

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // 🔥 NOTIFICACIONES NO LEÍDAS
  const [unread, setUnread] = useState(0);

  useEffect(() => {

    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notificaciones"),
      where("usuario", "==", auth.currentUser.email),
      where("leido", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      setUnread(snap.size);
    });

    return () => unsub();

  }, []);

  const cards = [
    {
      titulo: "Explorar Proyectos",
      icono: <FaSearch size={35} />,
      descripcion: "Descubre nuestro catálogo completo de proyectos.",
      color: "text-yellow-400",
      ruta: "/proyectos"
    },
    {
      titulo: "Solicitar Cotización",
      icono: <FaFileInvoiceDollar size={35} />,
      descripcion: "Pide una cotización de tu idea o proyecto.",
      color: "text-orange-400",
      ruta: "/crear-cotizacion"
    },
    {
      titulo: "Mis Cotizaciones",
      icono: <FaFileInvoiceDollar size={35} />,
      descripcion: "Revisa tus solicitudes de presupuesto.",
      color: "text-blue-400",
      ruta: "/cotizaciones"
    },
    {
      titulo: "Mis Proyectos",
      icono: <FaBuilding size={35} />,
      descripcion: "Seguimiento de construcción en curso.",
      color: "text-green-400",
      ruta: "/mis-proyectos"
    },
    {
      titulo: "Favoritos",
      icono: <FaHeart size={35} />,
      descripcion: "Proyectos que te interesan.",
      color: "text-pink-400",
      ruta: "/favoritos"
    },
    {
      titulo: "Notificaciones",
      icono: <FaBell size={35} />,
      descripcion: "Estado de tus cotizaciones y avisos.",
      color: "text-cyan-400",
      ruta: "/notificaciones"
    },
    {
      titulo: "Perfil",
      icono: <FaUser size={35} />,
      descripcion: "Administra tu información personal.",
      color: "text-purple-400",
      ruta: "/perfil"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">

      {/* TOP BAR MOBILE */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-yellow-600/20">

        <h1 className="text-xl font-bold">
          Wealth <span className="text-yellow-500">Cliente</span>
        </h1>

        <button onClick={() => setOpen(true)} className="text-white text-2xl">
          <FaBars />
        </button>

      </div>

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:block w-64 bg-zinc-950 border-r border-yellow-600/20 p-6">

        <h1 className="text-3xl font-bold mb-10">
          Wealth <span className="text-yellow-500">Cliente</span>
        </h1>

        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 bg-yellow-500 text-black px-5 py-4 rounded-2xl font-bold mb-4"
        >
          <FaHome />
          Inicio
        </button>

        <div className="space-y-3">

          <button onClick={() => navigate("/proyectos")} className="w-full flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
            <FaSearch />
            Proyectos
          </button>

          <button onClick={() => navigate("/crear-cotizacion")} className="w-full flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
            <FaFileInvoiceDollar />
            Solicitar Cotización
          </button>

          <button onClick={() => navigate("/cotizaciones")} className="w-full flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
            <FaFileInvoiceDollar />
            Cotizaciones
          </button>
          <button
  onClick={() => navigate("/favoritos")}
  className="w-full flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl"
>
  <FaHeart />
  Favoritos
</button>

          {/* 🔥 CAMPANA CON BADGE */}
          <button
            onClick={() => navigate("/notificaciones")}
            className="w-full flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl relative"
          >
            <FaBell />
            Notificaciones

            {unread > 0 && (
              <span className="absolute right-4 bg-red-500 text-xs px-2 py-1 rounded-full font-bold">
                {unread}
              </span>
            )}
          </button>

          <button onClick={() => navigate("/perfil")} className="w-full flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
            <FaUser />
            Perfil
          </button>

        </div>

      </aside>

      {/* MENU MOBILE */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-6 lg:hidden">

          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-bold">
              Wealth <span className="text-yellow-500">Cliente</span>
            </h1>

            <button onClick={() => setOpen(false)} className="text-2xl">
              <FaTimes />
            </button>
          </div>

          <div className="flex flex-col gap-4">

            <button onClick={() => { navigate("/"); setOpen(false); }} className="flex items-center gap-3 bg-yellow-500 text-black px-5 py-4 rounded-2xl font-bold">
              <FaHome />
              Inicio
            </button>

            <button onClick={() => { navigate("/proyectos"); setOpen(false); }} className="flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
              <FaSearch />
              Proyectos
            </button>

            <button onClick={() => { navigate("/crear-cotizacion"); setOpen(false); }} className="flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
              <FaFileInvoiceDollar />
              Solicitar Cotización
            </button>

            <button onClick={() => { navigate("/cotizaciones"); setOpen(false); }} className="flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
              <FaFileInvoiceDollar />
              Cotizaciones
            </button>
            <button
  onClick={() => {
    navigate("/favoritos");
    setOpen(false);
  }}
  className="flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl"
>
  <FaHeart />
  Favoritos
</button>

            <button onClick={() => { navigate("/notificaciones"); setOpen(false); }} className="flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
              <FaBell />
              Notificaciones
            </button>

            <button onClick={() => { navigate("/perfil"); setOpen(false); }} className="flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
              <FaUser />
              Perfil
            </button>

          </div>

        </div>
      )}

      {/* CONTENIDO */}
      <main className="flex-1 p-6 lg:p-10">

        <div className="bg-gradient-to-r from-black to-zinc-900 py-16 px-6 border-b border-yellow-600/20 rounded-2xl">

          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Bienvenido a <span className="text-yellow-500">Wealth</span>
          </h1>

          <p className="text-zinc-400 text-lg max-w-2xl">
            Explora nuestros proyectos, solicitudes y notificaciones en tiempo real.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.ruta)}
              className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-yellow-500 transition cursor-pointer"
            >
              <div className={`${card.color} mb-4`}>
                {card.icono}
              </div>

              <h3 className="text-xl font-bold mb-2">
                {card.titulo}
              </h3>

              <p className="text-zinc-400 text-sm">
                {card.descripcion}
              </p>
            </div>
          ))}

        </div>

      </main>
    </div>
  );
}

export default MenuCliente;