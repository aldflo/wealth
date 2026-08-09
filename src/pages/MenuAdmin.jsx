import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase.config";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import {
  FaUsers,
  FaBuilding,
  FaPlusCircle,
  FaHome,
  FaFileInvoiceDollar,
  FaImages,
  FaBell,
  FaArrowRight,
  FaCheckCircle,
  FaTools,
  FaBriefcase,
  FaChartLine,
  FaEye,
  FaClock,
} from "react-icons/fa";

function MenuAdmin() {
  const navigate = useNavigate();

  // ======================================================
  // FIREBASE DATA
  // ======================================================

  const [cotizaciones, setCotizaciones] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [proyectosClientes, setProyectosClientes] =
    useState([]);

  const [cargando, setCargando] = useState(true);

  // ======================================================
  // ESCUCHAR COTIZACIONES
  // ======================================================

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "cotizaciones"),

      (snapshot) => {
        const data = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        setCotizaciones(data);
        setCargando(false);
      },

      (error) => {
        console.error(
          "Error cargando cotizaciones:",
          error
        );

        setCargando(false);
      }
    );

    return () => unsub();
  }, []);

  // ======================================================
  // ESCUCHAR PROYECTOS PUBLICADOS
  // ======================================================

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "proyectos"),

      (snapshot) => {
        const data = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        setProyectos(data);
      },

      (error) => {
        console.error(
          "Error cargando proyectos:",
          error
        );
      }
    );

    return () => unsub();
  }, []);

  // ======================================================
  // ESCUCHAR PROYECTOS TERMINADOS
  // ======================================================

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "proyectosClientes"),

      (snapshot) => {
        const data = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        setProyectosClientes(data);
      },

      (error) => {
        console.error(
          "Error cargando proyectos terminados:",
          error
        );
      }
    );

    return () => unsub();
  }, []);

  // ======================================================
  // ESTADÍSTICAS
  // ======================================================

  const estadisticas = useMemo(() => {
    // ===============================================
    // COTIZACIONES ACTIVAS
    // ===============================================

    const activas = cotizaciones.filter(
      (c) =>
        ![
          "finalizada",
          "terminada",
          "terminado",
          "rechazada",
        ].includes(c.estado)
    );

    // ===============================================
    // NOVEDADES
    // ===============================================

    const novedades = activas.filter(
      (c) => c.vistoPorAdmin === false
    ).length;

    // ===============================================
    // TRABAJOS EN EJECUCIÓN
    // ===============================================

    const enEjecucion = activas.filter((c) =>
      [
        "confirmada_admin",
        "anticipo_pendiente",
        "anticipo_pagado",
        "anticipo_recibido",
        "en_proceso",
        "proceso",
        "instalacion_programada",
        "instalacion",
      ].includes(c.estado)
    ).length;

    // ===============================================
    // CLIENTES ÚNICOS
    // ===============================================

    const clientesUnicos = new Set();

    cotizaciones.forEach((c) => {
      const identificador =
        c.uid ||
        c.usuario;

      if (identificador) {
        clientesUnicos.add(identificador);
      }
    });

    return {
      activas: activas.length,

      novedades,

      enEjecucion,

      clientes:
        clientesUnicos.size,

      terminados:
        proyectosClientes.length,

      publicados:
        proyectos.length,
    };
  }, [
    cotizaciones,
    proyectos,
    proyectosClientes,
  ]);

  // ======================================================
  // CARDS PARA CELULAR
  // ======================================================

  const cardsMobile = [
    {
      titulo: "Clientes",
      descripcion:
        "Consulta los clientes con actividad registrada.",
      icono: <FaUsers size={28} />,
      color: "text-cyan-400",
      ruta: "/admin/clientes",
    },

    {
      titulo: "Cotizaciones",
      descripcion:
        "Solicitudes, propuestas y trabajos en ejecución.",
      icono: <FaFileInvoiceDollar size={28} />,
      color: "text-yellow-400",
      ruta: "/admin/cotizaciones",
      badge:
        estadisticas.novedades,
    },

    {
      titulo: "Proyectos",
      descripcion:
        "Consulta los proyectos publicados en Wealth.",
      icono: <FaBuilding size={28} />,
      color: "text-green-400",
      ruta: "/proyectos",
    },

    {
      titulo: "Subir Proyecto",
      descripcion:
        "Publica un nuevo trabajo en el catálogo.",
      icono: <FaPlusCircle size={28} />,
      color: "text-yellow-400",
      ruta: "/admin/subir-proyecto",
    },

    {
      titulo: "Subir Galería",
      descripcion:
        "Agrega nuevas fotografías a la galería.",
      icono: <FaImages size={28} />,
      color: "text-pink-400",
      ruta: "/subir-galeria",
    },
  ];

  // ======================================================
  // LOADING
  // ======================================================

  if (cargando) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-11 h-11 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin mx-auto" />

          <p className="text-zinc-500 mt-4">
            Cargando panel administrativo...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* ================================================= */}
      {/* SIDEBAR ESCRITORIO */}
      {/* ================================================= */}

      <aside
        className="
          hidden
          lg:block
          w-72
          bg-zinc-950
          border-r
          border-zinc-800
          p-6
          shrink-0
        "
      >

        {/* TÍTULO */}

        <div className="mb-7">

          <p className="text-xs uppercase tracking-[0.25em] text-yellow-500 font-semibold">
            Administración
          </p>

          <p className="text-zinc-500 text-sm mt-1">
            Wealth
          </p>

        </div>

        <nav className="space-y-3">

          {/* DASHBOARD */}

          <BotonMenu
            activo={true}
            icon={<FaHome />}
            texto="Dashboard"
          />

          {/* CLIENTES */}

          <BotonMenu
            icon={<FaUsers />}
            texto="Clientes"
            onClick={() =>
              navigate("/admin/clientes")
            }
          />

          {/* COTIZACIONES */}

          <BotonMenu
            icon={
              <div className="relative">

                <FaFileInvoiceDollar />

                {estadisticas.novedades >
                  0 && (
                  <span
                    className="
                      absolute
                      -top-3
                      -right-3
                      bg-red-500
                      text-white
                      text-[8px]
                      font-bold
                      min-w-[18px]
                      h-[18px]
                      rounded-full
                      flex
                      items-center
                      justify-center
                      px-1
                    "
                  >
                    {
                      estadisticas.novedades
                    }
                  </span>
                )}

              </div>
            }
            texto="Cotizaciones"
            badge={
              estadisticas.novedades
            }
            especial
            onClick={() =>
              navigate(
                "/admin/cotizaciones"
              )
            }
          />

          {/* PROYECTOS */}

          <BotonMenu
            icon={<FaBuilding />}
            texto="Proyectos"
            onClick={() =>
              navigate("/proyectos")
            }
          />

          {/* SUBIR */}

          <BotonMenu
            icon={<FaPlusCircle />}
            texto="Subir Proyecto"
            onClick={() =>
              navigate(
                "/admin/subir-proyecto"
              )
            }
          />

          {/* GALERÍA */}

          <BotonMenu
            icon={<FaImages />}
            texto="Subir Galería"
            onClick={() =>
              navigate(
                "/subir-galeria"
              )
            }
          />

        </nav>

        {/* ================================================= */}
        {/* ESTADO DEL SISTEMA */}
        {/* ================================================= */}

        <div
          className="
            mt-10
            bg-black
            border
            border-zinc-800
            rounded-2xl
            p-4
          "
        >

          <div className="flex items-center gap-2">

            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />

            <p className="text-sm font-medium">
              Sistema activo
            </p>

          </div>

          <p className="text-xs text-zinc-600 mt-2">
            Datos sincronizados en tiempo real.
          </p>

        </div>

      </aside>

      {/* ================================================= */}
      {/* CONTENIDO */}
      {/* ================================================= */}

      <main className="flex-1 min-w-0 bg-black p-5 md:p-7 lg:p-10">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <section className="mb-9">

          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">

            <div>

              <p
                className="
                  text-xs
                  uppercase
                  tracking-[0.3em]
                  text-yellow-500
                  font-semibold
                "
              >
                Wealth Grupo Empresarial
              </p>

              <h1 className="text-3xl md:text-5xl font-bold mt-3 tracking-tight">

                Panel{" "}

                <span className="text-yellow-500">
                  Administrativo
                </span>

              </h1>

              <p className="text-zinc-400 mt-3 text-base md:text-lg">
                Aquí tienes el estado actual de las operaciones de Wealth.
              </p>

            </div>

            {/* ALERTA */}

            {estadisticas.novedades >
              0 ? (
              <button
                onClick={() =>
                  navigate(
                    "/admin/cotizaciones"
                  )
                }
                className="
                  bg-zinc-900
                  border
                  border-red-500/40
                  hover:border-red-500/70
                  rounded-2xl
                  px-5
                  py-4
                  flex
                  items-center
                  gap-4
                  text-left
                  transition
                "
              >

                <div className="relative w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">

                  <FaBell className="text-yellow-500" />

                  <span
                    className="
                      absolute
                      -top-2
                      -right-2
                      bg-red-500
                      text-white
                      text-[10px]
                      font-bold
                      min-w-[20px]
                      h-5
                      px-1
                      rounded-full
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {
                      estadisticas.novedades
                    }
                  </span>

                </div>

                <div>

                  <p className="font-bold">
                    {estadisticas.novedades ===
                    1
                      ? "1 novedad pendiente"
                      : `${estadisticas.novedades} novedades pendientes`}
                  </p>

                  <p className="text-xs text-zinc-500 mt-1">
                    Revisar cotizaciones
                  </p>

                </div>

              </button>
            ) : (
              <div
                className="
                  bg-zinc-900
                  border
                  border-green-500/20
                  rounded-2xl
                  px-5
                  py-4
                  flex
                  items-center
                  gap-3
                "
              >

                <FaCheckCircle className="text-green-500" />

                <div>

                  <p className="font-semibold text-green-400">
                    Todo revisado
                  </p>

                  <p className="text-xs text-zinc-500">
                    No tienes novedades pendientes.
                  </p>

                </div>

              </div>
            )}

          </div>

        </section>

        {/* ================================================= */}
        {/* ESTADÍSTICAS */}
        {/* ================================================= */}

        <section className="grid grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-9">

          <TarjetaEstadistica
            titulo="Clientes"
            valor={
              estadisticas.clientes
            }
            descripcion="Con actividad"
            icon={
              <FaUsers />
            }
            color="cyan"
          />

          <TarjetaEstadistica
            titulo="Cotizaciones"
            valor={
              estadisticas.activas
            }
            descripcion="Activas"
            icon={
              <FaFileInvoiceDollar />
            }
            color="yellow"
            onClick={() =>
              navigate(
                "/admin/cotizaciones"
              )
            }
          />

          <TarjetaEstadistica
            titulo="Novedades"
            valor={
              estadisticas.novedades
            }
            descripcion="Por revisar"
            icon={
              <FaBell />
            }
            color={
              estadisticas.novedades >
              0
                ? "red"
                : "green"
            }
            onClick={() =>
              navigate(
                "/admin/cotizaciones"
              )
            }
          />

          <TarjetaEstadistica
            titulo="En ejecución"
            valor={
              estadisticas.enEjecucion
            }
            descripcion="Trabajos activos"
            icon={
              <FaTools />
            }
            color="purple"
            onClick={() =>
              navigate(
                "/admin/cotizaciones"
              )
            }
          />

          <TarjetaEstadistica
            titulo="Terminados"
            valor={
              estadisticas.terminados
            }
            descripcion="Trabajos entregados"
            icon={
              <FaCheckCircle />
            }
            color="green"
          />

          <TarjetaEstadistica
            titulo="Publicados"
            valor={
              estadisticas.publicados
            }
            descripcion="Proyectos del catálogo"
            icon={
              <FaBuilding />
            }
            color="blue"
            onClick={() =>
              navigate("/proyectos")
            }
          />

        </section>

        {/* ================================================= */}
        {/* COTIZACIONES PRINCIPAL */}
        {/* ================================================= */}

        <section className="mb-9">

          <div
            className="
              relative
              overflow-hidden
              bg-zinc-900
              border
              border-zinc-700
              hover:border-yellow-500/50
              rounded-[30px]
              p-6
              md:p-8
              transition-all
              duration-300
            "
          >

            {/* LÍNEA SUPERIOR */}

            <div
              className="
                absolute
                top-0
                left-8
                right-8
                h-[2px]
                bg-gradient-to-r
                from-transparent
                via-yellow-500
                to-transparent
              "
            />

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-7">

              <div className="flex items-start gap-5">

                {/* ICONO */}

                <div
                  className="
                    relative
                    w-16
                    h-16
                    rounded-2xl
                    bg-yellow-500/10
                    border
                    border-yellow-500/20
                    flex
                    items-center
                    justify-center
                    text-yellow-500
                    shrink-0
                  "
                >

                  <FaFileInvoiceDollar size={28} />

                  {estadisticas.novedades >
                    0 && (
                    <span
                      className="
                        absolute
                        -top-2
                        -right-2
                        bg-red-500
                        text-white
                        text-xs
                        font-bold
                        min-w-[25px]
                        h-[25px]
                        px-1
                        rounded-full
                        flex
                        items-center
                        justify-center
                      "
                    >
                      {
                        estadisticas.novedades
                      }
                    </span>
                  )}

                </div>

                {/* TEXTO */}

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h2 className="text-2xl md:text-3xl font-bold">
                      Cotizaciones y trabajos
                    </h2>

                    {estadisticas.novedades >
                      0 && (
                      <span
                        className="
                          bg-red-500/10
                          border
                          border-red-500/30
                          text-red-400
                          text-xs
                          font-bold
                          px-3
                          py-1.5
                          rounded-full
                        "
                      >
                        {
                          estadisticas.novedades
                        }{" "}
                        nuevas
                      </span>
                    )}

                  </div>

                  <p className="text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                    Revisa solicitudes de clientes, envía propuestas, confirma trabajos y controla el avance de cada proyecto.
                  </p>

                  {/* MINI ESTADÍSTICAS */}

                  <div className="flex flex-wrap gap-3 mt-5">

                    <MiniDato
                      icon={
                        <FaBriefcase />
                      }
                      valor={
                        estadisticas.activas
                      }
                      texto="activas"
                    />

                    <MiniDato
                      icon={
                        <FaTools />
                      }
                      valor={
                        estadisticas.enEjecucion
                      }
                      texto="en ejecución"
                    />

                    <MiniDato
                      icon={
                        <FaCheckCircle />
                      }
                      valor={
                        estadisticas.terminados
                      }
                      texto="terminadas"
                    />

                  </div>

                </div>

              </div>

              {/* BOTÓN */}

              <button
                onClick={() =>
                  navigate(
                    "/admin/cotizaciones"
                  )
                }
                className="
                  shrink-0
                  bg-black
                  border
                  border-yellow-500/40
                  hover:border-yellow-500
                  hover:bg-yellow-500/10
                  text-yellow-400
                  px-6
                  py-4
                  rounded-2xl
                  font-semibold
                  flex
                  items-center
                  justify-center
                  gap-3
                  transition-all
                  duration-300
                  group
                "
              >

                <FaEye />

                Ver cotizaciones

                <FaArrowRight
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />

              </button>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* ACCESOS RÁPIDOS ESCRITORIO */}
        {/* ================================================= */}

        <section className="hidden lg:block">

          <div className="flex items-center justify-between mb-5">

            <div>

              <p className="text-xl font-bold">
                Accesos rápidos
              </p>

              <p className="text-sm text-zinc-500 mt-1">
                Herramientas frecuentes del administrador.
              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-5">

            {/* PROYECTOS */}

            <AccesoRapido
              icon={
                <FaBuilding />
              }
              titulo="Ver proyectos"
              descripcion="Consulta el catálogo publicado."
              color="green"
              onClick={() =>
                navigate(
                  "/proyectos"
                )
              }
            />

            {/* SUBIR */}

            <AccesoRapido
              icon={
                <FaPlusCircle />
              }
              titulo="Nuevo proyecto"
              descripcion="Publica un nuevo trabajo realizado."
              color="yellow"
              onClick={() =>
                navigate(
                  "/admin/subir-proyecto"
                )
              }
            />

            {/* GALERÍA */}

            <AccesoRapido
              icon={
                <FaImages />
              }
              titulo="Subir galería"
              descripcion="Agrega fotografías a Wealth."
              color="pink"
              onClick={() =>
                navigate(
                  "/subir-galeria"
                )
              }
            />

          </div>

        </section>

        {/* ================================================= */}
        {/* MENÚ CELULAR */}
        {/* ================================================= */}

        <section className="lg:hidden mt-8">

          <p className="font-bold text-lg mb-4">
            Administración
          </p>

          <div className="grid grid-cols-1 gap-4">

            {cardsMobile.map(
              (card) => (
                <button
                  key={
                    card.titulo
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      card.ruta
                    )
                  }
                  className="
                    relative
                    text-left
                    bg-zinc-900
                    border
                    border-zinc-700
                    hover:border-yellow-500/50
                    rounded-3xl
                    p-5
                    transition
                  "
                >

                  {card.badge >
                    0 && (
                    <span
                      className="
                        absolute
                        top-4
                        right-4
                        bg-red-500
                        text-white
                        min-w-[24px]
                        h-6
                        rounded-full
                        px-2
                        flex
                        items-center
                        justify-center
                        text-xs
                        font-bold
                      "
                    >
                      {
                        card.badge
                      }
                    </span>
                  )}

                  <div className="flex items-start gap-4">

                    <div
                      className={`
                        w-12
                        h-12
                        bg-black
                        border
                        border-zinc-700
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        ${card.color}
                      `}
                    >
                      {
                        card.icono
                      }
                    </div>

                    <div>

                      <h3 className="font-bold text-lg">
                        {
                          card.titulo
                        }
                      </h3>

                      <p className="text-sm text-zinc-500 mt-1">
                        {
                          card.descripcion
                        }
                      </p>

                      <p className="text-sm text-yellow-500 mt-3 flex items-center gap-2">
                        Abrir
                        <FaArrowRight />
                      </p>

                    </div>

                  </div>

                </button>
              )
            )}

          </div>

        </section>

      </main>

    </div>
  );
}

// ======================================================
// BOTÓN SIDEBAR
// ======================================================

function BotonMenu({
  icon,
  texto,
  onClick,
  activo = false,
  badge = 0,
  especial = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        w-full
        flex
        items-center
        gap-4
        px-5
        py-4
        rounded-2xl
        border
        transition-all
        duration-200

        ${
          activo
            ? `
              bg-yellow-500/10
              border-yellow-500/50
              text-yellow-400
            `
            : especial
            ? `
              bg-zinc-900
              border-yellow-500/30
              hover:bg-yellow-500/5
              hover:border-yellow-500/60
              text-white
            `
            : `
              bg-zinc-900
              border-zinc-800
              hover:bg-zinc-800
              hover:border-zinc-600
              text-zinc-300
            `
        }
      `}
    >

      <span
        className={
          activo ||
          especial
            ? "text-yellow-500"
            : "text-zinc-400"
        }
      >
        {icon}
      </span>

      <span className="font-medium">
        {texto}
      </span>

      {badge > 0 && (
        <span
          className="
            ml-auto
            bg-red-500
            text-white
            min-w-[23px]
            h-[23px]
            px-1.5
            rounded-full
            flex
            items-center
            justify-center
            text-[10px]
            font-bold
          "
        >
          {badge}
        </span>
      )}

    </button>
  );
}

// ======================================================
// TARJETA ESTADÍSTICA
// ======================================================

function TarjetaEstadistica({
  titulo,
  valor,
  descripcion,
  icon,
  color,
  onClick,
}) {
  const colores = {
    yellow:
      "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",

    cyan:
      "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",

    red:
      "text-red-400 bg-red-500/10 border-red-500/20",

    green:
      "text-green-400 bg-green-500/10 border-green-500/20",

    purple:
      "text-purple-400 bg-purple-500/10 border-purple-500/20",

    blue:
      "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        text-left
        bg-zinc-900
        border
        border-zinc-700
        rounded-2xl
        p-4
        md:p-5
        transition-all
        duration-300
        ${
          onClick
            ? "hover:border-zinc-500 hover:-translate-y-[2px] cursor-pointer"
            : "cursor-default"
        }
      `}
    >

      <div className="flex items-center justify-between gap-4">

        <div>

          <p className="text-xs md:text-sm text-zinc-500">
            {titulo}
          </p>

          <p className="text-2xl md:text-3xl font-bold text-white mt-1">
            {valor}
          </p>

          <p className="text-[11px] md:text-xs text-zinc-600 mt-1">
            {descripcion}
          </p>

        </div>

        <div
          className={`
            w-11
            h-11
            md:w-12
            md:h-12
            rounded-xl
            border
            flex
            items-center
            justify-center
            text-lg
            ${colores[color]}
          `}
        >
          {icon}
        </div>

      </div>

    </button>
  );
}

// ======================================================
// MINI DATO
// ======================================================

function MiniDato({
  icon,
  valor,
  texto,
}) {
  return (
    <div
      className="
        bg-black
        border
        border-zinc-700
        rounded-xl
        px-3.5
        py-2
        flex
        items-center
        gap-2
        text-sm
      "
    >

      <span className="text-yellow-500">
        {icon}
      </span>

      <strong className="text-white">
        {valor}
      </strong>

      <span className="text-zinc-500">
        {texto}
      </span>

    </div>
  );
}

// ======================================================
// ACCESO RÁPIDO
// ======================================================

function AccesoRapido({
  icon,
  titulo,
  descripcion,
  color,
  onClick,
}) {
  const colores = {
    yellow:
      "text-yellow-500 border-yellow-500/20 bg-yellow-500/10",

    green:
      "text-green-400 border-green-500/20 bg-green-500/10",

    pink:
      "text-pink-400 border-pink-500/20 bg-pink-500/10",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        text-left
        bg-zinc-900
        border
        border-zinc-700
        hover:border-yellow-500/40
        rounded-3xl
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
      "
    >

      <div
        className={`
          w-12
          h-12
          rounded-xl
          border
          flex
          items-center
          justify-center
          text-xl
          ${colores[color]}
        `}
      >
        {icon}
      </div>

      <h3 className="font-bold text-xl mt-5">
        {titulo}
      </h3>

      <p className="text-sm text-zinc-500 mt-2">
        {descripcion}
      </p>

      <div className="mt-5 flex items-center gap-2 text-yellow-500 text-sm font-medium">

        Abrir

        <FaArrowRight
          className="
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        />

      </div>

    </button>
  );
}

export default MenuAdmin;