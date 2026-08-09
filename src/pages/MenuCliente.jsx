import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase.config";

import {
  collection,
  query,
  onSnapshot,
  orderBy,
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
} from "react-icons/fa";

function MenuCliente() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  // ========================================
  // NOVEDADES EN COTIZACIONES
  // ========================================

  const [cotizacionesNuevas, setCotizacionesNuevas] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userEmail = auth.currentUser.email;
    const userUid = auth.currentUser.uid;

    const q = query(
      collection(db, "cotizaciones"),
      orderBy("fecha", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const cotizacionesUsuario = snapshot.docs
        .map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }))
        .filter(
          (c) =>
            c.uid === userUid ||
            c.usuario === userEmail
        );

      // Solo contamos cambios que vienen del administrador
      const nuevas = cotizacionesUsuario.filter(
        (c) =>
          c.vistoPorCliente === false &&
          (
            c.estado === "cotizada" ||
            c.estado === "propuesta_enviada" ||
            c.estado === "confirmada_admin" ||
            c.estado === "anticipo_pendiente" ||
            c.estado === "anticipo_pagado" ||
            c.estado === "en_proceso" ||
            c.estado === "proceso" ||
            c.estado === "instalacion_programada" ||
            c.estado === "instalacion" ||
            c.estado === "finalizada" ||
            c.estado === "terminada"
          )
      );

      setCotizacionesNuevas(nuevas.length);
    });

    return () => unsub();
  }, []);

  // ========================================
  // TARJETAS DEL PANEL
  // ========================================

  const cards = [
    {
      titulo: "Explorar Proyectos",
      icono: <FaSearch size={28} />,
      descripcion:
        "Descubre nuestro catálogo completo de proyectos.",
      color: "text-yellow-400",
      ruta: "/proyectos",
    },

    {
      titulo: "Solicitar Cotización",
      icono: <FaFileInvoiceDollar size={28} />,
      descripcion:
        "Pide una cotización de tu idea o proyecto.",
      color: "text-orange-400",
      ruta: "/crear-cotizacion",
    },

    {
      titulo: "Mis Cotizaciones",
      icono: <FaFileInvoiceDollar size={28} />,
      descripcion:
        "Revisa propuestas, precios y avances de tus solicitudes.",
      color: "text-blue-400",
      ruta: "/cotizaciones",
      badge: cotizacionesNuevas,
    },

    {
      titulo: "Mis Proyectos",
      icono: <FaBuilding size={28} />,
      descripcion:
        "Seguimiento de construcción en curso.",
      color: "text-green-400",
      ruta: "/mis-proyectos",
    },

    {
      titulo: "Favoritos",
      icono: <FaHeart size={28} />,
      descripcion:
        "Proyectos que te interesan.",
      color: "text-pink-400",
      ruta: "/favoritos",
    },

    {
      titulo: "Perfil",
      icono: <FaUser size={28} />,
      descripcion:
        "Administra tu información personal.",
      color: "text-purple-400",
      ruta: "/perfil",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white lg:flex">

      {/* ================================= */}
      {/* TOP BAR MOBILE */}
      {/* ================================= */}

      <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-yellow-600/20">

        <h1 className="text-xl font-bold">
          Wealth{" "}
          <span className="text-yellow-500">
            Cliente
          </span>
        </h1>

        <button
          onClick={() => setOpen(true)}
          className="text-white text-2xl"
        >
          <FaBars />
        </button>

      </div>

      {/* ================================= */}
      {/* SIDEBAR DESKTOP */}
      {/* ================================= */}

      <aside className="hidden lg:block w-64 min-h-screen bg-zinc-950 border-r border-yellow-600/20 p-6">

        <h1 className="text-3xl font-bold mb-10">
          Wealth{" "}
          <span className="text-yellow-500">
            Cliente
          </span>
        </h1>

        {/* INICIO */}
        <button
          onClick={() => navigate("/")}
          className="
            w-full
            flex
            items-center
            gap-3
            bg-yellow-500
            hover:bg-yellow-400
            text-black
            px-5
            py-4
            rounded-2xl
            font-bold
            mb-4
            transition
          "
        >
          <FaHome />
          Inicio
        </button>

        <div className="space-y-3">

          {/* PROYECTOS */}
          <button
            onClick={() => navigate("/proyectos")}
            className="
              w-full
              flex
              items-center
              gap-3
              bg-zinc-900
              hover:bg-zinc-800
              px-5
              py-4
              rounded-2xl
              transition
            "
          >
            <FaSearch />
            Proyectos
          </button>

          {/* SOLICITAR COTIZACIÓN */}
          <button
            onClick={() =>
              navigate("/crear-cotizacion")
            }
            className="
              w-full
              flex
              items-center
              gap-3
              bg-zinc-900
              hover:bg-zinc-800
              px-5
              py-4
              rounded-2xl
              transition
            "
          >
            <FaFileInvoiceDollar />
            Solicitar Cotización
          </button>

          {/* MIS COTIZACIONES */}
          <button
            onClick={() =>
              navigate("/cotizaciones")
            }
            className="
              w-full
              flex
              items-center
              gap-3
              bg-zinc-900
              hover:bg-zinc-800
              px-5
              py-4
              rounded-2xl
              relative
              transition
            "
          >

            <FaFileInvoiceDollar />

            <span>
              Cotizaciones
            </span>

            {/* BADGE */}
            {cotizacionesNuevas > 0 && (
              <span
                className="
                  absolute
                  right-4
                  bg-red-500
                  text-white
                  text-xs
                  min-w-[24px]
                  h-6
                  px-2
                  flex
                  items-center
                  justify-center
                  rounded-full
                  font-bold
                  shadow-lg
                "
              >
                {cotizacionesNuevas}
              </span>
            )}

          </button>

          {/* MIS PROYECTOS */}
          <button
            onClick={() =>
              navigate("/mis-proyectos")
            }
            className="
              w-full
              flex
              items-center
              gap-3
              bg-zinc-900
              hover:bg-zinc-800
              px-5
              py-4
              rounded-2xl
              transition
            "
          >
            <FaBuilding />
            Mis Proyectos
          </button>

          {/* FAVORITOS */}
          <button
            onClick={() =>
              navigate("/favoritos")
            }
            className="
              w-full
              flex
              items-center
              gap-3
              bg-zinc-900
              hover:bg-zinc-800
              px-5
              py-4
              rounded-2xl
              transition
            "
          >
            <FaHeart />
            Favoritos
          </button>

          {/* PERFIL */}
          <button
            onClick={() =>
              navigate("/perfil")
            }
            className="
              w-full
              flex
              items-center
              gap-3
              bg-zinc-900
              hover:bg-zinc-800
              px-5
              py-4
              rounded-2xl
              transition
            "
          >
            <FaUser />
            Perfil
          </button>

        </div>

      </aside>

      {/* ================================= */}
      {/* MENÚ MOBILE */}
      {/* ================================= */}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-6 lg:hidden">

          <div className="flex justify-between items-center mb-10">

            <h1 className="text-2xl font-bold">
              Wealth{" "}
              <span className="text-yellow-500">
                Cliente
              </span>
            </h1>

            <button
              onClick={() => setOpen(false)}
              className="text-2xl"
            >
              <FaTimes />
            </button>

          </div>

          <div className="flex flex-col gap-4">

            {/* INICIO */}
            <button
              onClick={() => {
                navigate("/");
                setOpen(false);
              }}
              className="
                flex
                items-center
                gap-3
                bg-yellow-500
                text-black
                px-5
                py-4
                rounded-2xl
                font-bold
              "
            >
              <FaHome />
              Inicio
            </button>

            {/* PROYECTOS */}
            <button
              onClick={() => {
                navigate("/proyectos");
                setOpen(false);
              }}
              className="
                flex
                items-center
                gap-3
                bg-zinc-900
                px-5
                py-4
                rounded-2xl
              "
            >
              <FaSearch />
              Proyectos
            </button>

            {/* SOLICITAR */}
            <button
              onClick={() => {
                navigate("/crear-cotizacion");
                setOpen(false);
              }}
              className="
                flex
                items-center
                gap-3
                bg-zinc-900
                px-5
                py-4
                rounded-2xl
              "
            >
              <FaFileInvoiceDollar />
              Solicitar Cotización
            </button>

            {/* COTIZACIONES */}
            <button
              onClick={() => {
                navigate("/cotizaciones");
                setOpen(false);
              }}
              className="
                flex
                items-center
                gap-3
                bg-zinc-900
                px-5
                py-4
                rounded-2xl
                relative
              "
            >

              <FaFileInvoiceDollar />

              Cotizaciones

              {/* BADGE MOBILE */}
              {cotizacionesNuevas > 0 && (
                <span
                  className="
                    absolute
                    right-4
                    bg-red-500
                    text-white
                    text-xs
                    min-w-[24px]
                    h-6
                    px-2
                    flex
                    items-center
                    justify-center
                    rounded-full
                    font-bold
                  "
                >
                  {cotizacionesNuevas}
                </span>
              )}

            </button>

            {/* MIS PROYECTOS */}
            <button
              onClick={() => {
                navigate("/mis-proyectos");
                setOpen(false);
              }}
              className="
                flex
                items-center
                gap-3
                bg-zinc-900
                px-5
                py-4
                rounded-2xl
              "
            >
              <FaBuilding />
              Mis Proyectos
            </button>

            {/* FAVORITOS */}
            <button
              onClick={() => {
                navigate("/favoritos");
                setOpen(false);
              }}
              className="
                flex
                items-center
                gap-3
                bg-zinc-900
                px-5
                py-4
                rounded-2xl
              "
            >
              <FaHeart />
              Favoritos
            </button>

            {/* PERFIL */}
            <button
              onClick={() => {
                navigate("/perfil");
                setOpen(false);
              }}
              className="
                flex
                items-center
                gap-3
                bg-zinc-900
                px-5
                py-4
                rounded-2xl
              "
            >
              <FaUser />
              Perfil
            </button>

          </div>

        </div>
      )}

      {/* ================================= */}
      {/* CONTENIDO */}
      {/* ================================= */}

      <main className="flex-1 p-6 lg:p-10">

        <div className="bg-gradient-to-r from-black to-zinc-900 py-16 px-6 border border-yellow-600/20 rounded-3xl">

          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Bienvenido a{" "}
            <span className="text-yellow-500">
              Wealth
            </span>
          </h1>

          <p className="text-zinc-400 text-lg max-w-2xl">
            Explora proyectos, solicita cotizaciones y
            consulta el estado de tus propuestas en tiempo real.
          </p>

        </div>

        {/* TARJETAS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() =>
                navigate(card.ruta)
              }
              className="
                relative
                bg-zinc-900
                rounded-3xl
                p-6
                border
                border-zinc-800
                hover:border-yellow-500
                hover:-translate-y-1
                hover:shadow-xl
                transition
                cursor-pointer
              "
            >

              {/* BADGE DE COTIZACIONES */}
              {card.badge > 0 && (
                <span
                  className="
                    absolute
                    top-5
                    right-5
                    bg-red-500
                    text-white
                    text-xs
                    min-w-[25px]
                    h-6
                    px-2
                    flex
                    items-center
                    justify-center
                    rounded-full
                    font-bold
                    shadow-lg
                  "
                >
                  {card.badge}
                </span>
              )}

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