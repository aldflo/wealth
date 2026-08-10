import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  auth,
  db,
} from "../firebase.config";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import {
  FaArrowRight,
  FaBars,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaFileInvoiceDollar,
  FaHeart,
  FaHome,
  FaRobot,
  FaSearch,
  FaTimes,
  FaUser,
  FaEye,
} from "react-icons/fa";

/* ======================================================
   MENU CLIENTE
====================================================== */

function MenuCliente() {
  const navigate =
    useNavigate();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    cotizaciones,
    setCotizaciones,
  ] = useState([]);

  const [
    proyectosCliente,
    setProyectosCliente,
  ] = useState([]);

  const [
    favoritos,
    setFavoritos,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  /* ======================================================
     USUARIO
  ====================================================== */

  const usuario =
    auth.currentUser;

  const userEmail =
    usuario?.email || "";

  const userUid =
    usuario?.uid || "";

  /* ======================================================
     COTIZACIONES
  ====================================================== */

  useEffect(() => {
    if (
      !userUid &&
      !userEmail
    ) {
      setCargando(false);
      return;
    }

    const consulta =
      query(
        collection(
          db,
          "cotizaciones"
        ),
        orderBy(
          "fecha",
          "desc"
        )
      );

    const unsub =
      onSnapshot(
        consulta,

        (snapshot) => {
          const data =
            snapshot.docs
              .map(
                (documento) => ({
                  id:
                    documento.id,

                  ...documento.data(),
                })
              )
              .filter(
                (cotizacion) =>
                  cotizacion.uid ===
                    userUid ||
                  cotizacion.usuario ===
                    userEmail
              );

          setCotizaciones(
            data
          );

          setCargando(
            false
          );
        },

        (error) => {
          console.error(
            "Error cargando cotizaciones:",
            error
          );

          setCargando(
            false
          );
        }
      );

    return () =>
      unsub();

  }, [
    userUid,
    userEmail,
  ]);

  /* ======================================================
     PROYECTOS DEL CLIENTE
  ====================================================== */

  useEffect(() => {
    if (
      !userUid &&
      !userEmail
    ) {
      return;
    }

    const unsub =
      onSnapshot(
        collection(
          db,
          "proyectosClientes"
        ),

        (snapshot) => {
          const data =
            snapshot.docs
              .map(
                (documento) => ({
                  id:
                    documento.id,

                  ...documento.data(),
                })
              )
              .filter(
                (proyecto) =>
                  proyecto.uid ===
                    userUid ||
                  proyecto.usuario ===
                    userEmail
              );

          setProyectosCliente(
            data
          );
        },

        (error) => {
          console.error(
            "Error cargando proyectos del cliente:",
            error
          );
        }
      );

    return () =>
      unsub();

  }, [
    userUid,
    userEmail,
  ]);

  /* ======================================================
     FAVORITOS
  ====================================================== */

  useEffect(() => {
    if (
      !userUid &&
      !userEmail
    ) {
      return;
    }

    const unsub =
      onSnapshot(
        collection(
          db,
          "favoritos"
        ),

        (snapshot) => {
          const data =
            snapshot.docs
              .map(
                (documento) => ({
                  id:
                    documento.id,

                  ...documento.data(),
                })
              )
              .filter(
                (favorito) =>
                  favorito.uid ===
                    userUid ||
                  favorito.usuario ===
                    userEmail
              );

          setFavoritos(
            data
          );
        },

        (error) => {
          console.error(
            "Error cargando favoritos:",
            error
          );
        }
      );

    return () =>
      unsub();

  }, [
    userUid,
    userEmail,
  ]);

  /* ======================================================
     ESTADÍSTICAS
  ====================================================== */

  const estadisticas =
    useMemo(() => {
      const nuevas =
        cotizaciones.filter(
          (cotizacion) =>
            cotizacion.vistoPorCliente ===
              false &&
            [
              "cotizada",
              "propuesta_enviada",
              "confirmada_admin",
              "anticipo_pendiente",
              "anticipo_pagado",
              "en_proceso",
              "proceso",
              "instalacion_programada",
              "instalacion",
              "finalizada",
              "terminada",
            ].includes(
              cotizacion.estado
            )
        );

      const activas =
        cotizaciones.filter(
          (cotizacion) =>
            ![
              "rechazada",
              "cancelada",
              "finalizada",
              "terminada",
              "terminado",
            ].includes(
              cotizacion.estado
            )
        );

      const esperando =
        cotizaciones.filter(
          (cotizacion) =>
            [
              "pendiente",
              "solicitada",
              "revision",
              "en_revision",
            ].includes(
              cotizacion.estado
            )
        );

      const enProceso =
        cotizaciones.filter(
          (cotizacion) =>
            [
              "confirmada_admin",
              "anticipo_pendiente",
              "anticipo_pagado",
              "en_proceso",
              "proceso",
              "instalacion_programada",
              "instalacion",
            ].includes(
              cotizacion.estado
            )
        );

      return {
        nuevas:
          nuevas.length,

        total:
          cotizaciones.length,

        activas:
          activas.length,

        esperando:
          esperando.length,

        enProceso:
          enProceso.length,

        proyectos:
          proyectosCliente.length,

        favoritos:
          favoritos.length,
      };

    }, [
      cotizaciones,
      proyectosCliente,
      favoritos,
    ]);

  /* ======================================================
     LOADING
  ====================================================== */

  if (
    cargando
  ) {
    return (
      <div
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
        "
      >
        <div className="text-center">

          <div
            className="
              w-11
              h-11

              border-4
              border-zinc-800
              border-t-yellow-500

              rounded-full

              animate-spin

              mx-auto
            "
          />

          <p className="text-zinc-500 mt-4">
            Cargando tu panel Wealth...
          </p>

        </div>
      </div>
    );
  }

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div
      className="
        min-h-screen
        bg-black
        text-white
        flex
      "
    >

      {/* =================================================
          HEADER MOBILE
      ================================================= */}

      <div
        className="
          lg:hidden

          fixed
          top-0
          left-0
          right-0

          z-40

          h-16

          bg-black/95
          backdrop-blur-xl

          border-b
          border-zinc-800

          flex
          items-center
          justify-between

          px-5
        "
      >

        <div>

          <p className="font-black tracking-wide">
            WEALTH
          </p>

          <p
            className="
              text-[9px]
              uppercase
              tracking-[0.25em]
              text-yellow-500
            "
          >
            Panel Cliente
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            setOpen(true)
          }
          className="
            w-10
            h-10

            rounded-xl

            bg-zinc-900

            border
            border-zinc-800

            flex
            items-center
            justify-center

            text-zinc-300
          "
        >
          <FaBars />
        </button>

      </div>

      {/* =================================================
          SIDEBAR DESKTOP
      ================================================= */}

      <aside
        className="
          hidden
          lg:flex

          w-72
          min-h-screen

          shrink-0

          bg-zinc-950

          border-r
          border-zinc-800

          p-6

          flex-col
        "
      >

        {/* TÍTULO */}

        <div className="mb-7">

          <p
            className="
              text-xs
              uppercase
              tracking-[0.25em]
              text-yellow-500
              font-semibold
            "
          >
            Área de clientes
          </p>

          <p className="text-zinc-500 text-sm mt-1">
            Wealth Grupo Empresarial
          </p>

        </div>

        {/* NAVEGACIÓN */}

        <nav className="space-y-3">

          <BotonMenuCliente
            activo
            icon={
              <FaHome />
            }
            texto="Inicio"
          />

          <BotonMenuCliente
            icon={
              <FaSearch />
            }
            texto="Proyectos"
            onClick={() =>
              navigate(
                "/proyectos"
              )
            }
          />

          <BotonMenuCliente
            especial
            icon={
              <FaFileInvoiceDollar />
            }
            texto="Solicitar cotización"
            onClick={() =>
              navigate(
                "/crear-cotizacion"
              )
            }
          />

          <BotonMenuCliente
            icon={
              <FaFileInvoiceDollar />
            }
            texto="Mis cotizaciones"
            badge={
              estadisticas.nuevas
            }
            onClick={() =>
              navigate(
                "/cotizaciones"
              )
            }
          />

          <BotonMenuCliente
            icon={
              <FaBuilding />
            }
            texto="Mis proyectos"
            onClick={() =>
              navigate(
                "/mis-proyectos"
              )
            }
          />

          <BotonMenuCliente
            icon={
              <FaHeart />
            }
            texto="Favoritos"
            onClick={() =>
              navigate(
                "/favoritos"
              )
            }
          />

          <BotonMenuCliente
            icon={
              <FaUser />
            }
            texto="Perfil"
            onClick={() =>
              navigate(
                "/perfil"
              )
            }
          />

        </nav>

        {/* =================================================
            WEALTH IA
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/chat-ia"
            )
          }
          className="
            mt-7

            w-full

            text-left

            relative
            overflow-hidden

            bg-gradient-to-br
            from-yellow-500/10
            via-yellow-500/5
            to-transparent

            border
            border-yellow-500/25

            hover:border-yellow-500/60

            rounded-2xl

            p-4

            transition-all
            duration-300

            group
          "
        >

          <div
            className="
              absolute
              top-0
              left-0
              right-0

              h-[1px]

              bg-gradient-to-r
              from-transparent
              via-yellow-500
              to-transparent
            "
          />

          <div className="flex items-center gap-3">

            <div
              className="
                w-11
                h-11

                rounded-xl

                bg-yellow-500

                flex
                items-center
                justify-center

                text-black

                shrink-0
              "
            >
              <FaRobot />
            </div>

            <div className="flex-1">

              <p className="font-bold text-sm">
                WEALTH IA
              </p>

              <p className="text-[11px] text-zinc-500 mt-1">
                Asistente virtual
              </p>

            </div>

            <FaArrowRight
              className="
                text-yellow-500

                transition-transform
                duration-300

                group-hover:translate-x-1
              "
            />

          </div>

        </button>

        {/* ESTADO */}

        <div
          className="
            mt-auto

            bg-black

            border
            border-zinc-800

            rounded-2xl

            p-4
          "
        >

          <div className="flex items-center gap-2">

            <div
              className="
                w-2.5
                h-2.5

                rounded-full

                bg-green-500
              "
            />

            <p className="text-sm font-medium">
              Cuenta activa
            </p>

          </div>

          <p className="text-xs text-zinc-600 mt-2">
            Cotizaciones y proyectos sincronizados.
          </p>

        </div>

      </aside>

      {/* =================================================
          MENU MOBILE
      ================================================= */}

      {open && (
        <div
          className="
            fixed
            inset-0

            z-50

            bg-black/80
            backdrop-blur-md

            lg:hidden
          "
        >

          <div
            className="
              absolute

              right-0
              top-0
              bottom-0

              w-[85%]
              max-w-sm

              bg-zinc-950

              border-l
              border-zinc-800

              p-6

              overflow-y-auto
            "
          >

            {/* CABECERA */}

            <div
              className="
                flex
                items-center
                justify-between

                mb-8
              "
            >

              <div>

                <p className="font-black text-xl">
                  WEALTH
                </p>

                <p
                  className="
                    text-[10px]
                    text-yellow-500
                    uppercase
                    tracking-[0.25em]
                  "
                >
                  Cliente
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="
                  w-10
                  h-10

                  bg-zinc-900

                  rounded-xl

                  flex
                  items-center
                  justify-center

                  text-zinc-400
                "
              >
                <FaTimes />
              </button>

            </div>

            {/* LINKS */}

            <div className="space-y-3">

              <BotonMobile
                icon={
                  <FaHome />
                }
                texto="Inicio"
                activo
                onClick={() => {
                  navigate(
                    "/cliente"
                  );

                  setOpen(
                    false
                  );
                }}
              />

              <BotonMobile
                icon={
                  <FaSearch />
                }
                texto="Proyectos"
                onClick={() => {
                  navigate(
                    "/proyectos"
                  );

                  setOpen(
                    false
                  );
                }}
              />

              <BotonMobile
                icon={
                  <FaFileInvoiceDollar />
                }
                texto="Solicitar cotización"
                especial
                onClick={() => {
                  navigate(
                    "/crear-cotizacion"
                  );

                  setOpen(
                    false
                  );
                }}
              />

              <BotonMobile
                icon={
                  <FaFileInvoiceDollar />
                }
                texto="Mis cotizaciones"
                badge={
                  estadisticas.nuevas
                }
                onClick={() => {
                  navigate(
                    "/cotizaciones"
                  );

                  setOpen(
                    false
                  );
                }}
              />

              <BotonMobile
                icon={
                  <FaBuilding />
                }
                texto="Mis proyectos"
                onClick={() => {
                  navigate(
                    "/mis-proyectos"
                  );

                  setOpen(
                    false
                  );
                }}
              />

              <BotonMobile
                icon={
                  <FaHeart />
                }
                texto="Favoritos"
                onClick={() => {
                  navigate(
                    "/favoritos"
                  );

                  setOpen(
                    false
                  );
                }}
              />

              <BotonMobile
                icon={
                  <FaUser />
                }
                texto="Perfil"
                onClick={() => {
                  navigate(
                    "/perfil"
                  );

                  setOpen(
                    false
                  );
                }}
              />

              {/* WEALTH IA MOBILE */}

              <BotonMobile
                icon={
                  <FaRobot />
                }
                texto="WEALTH IA"
                especial
                onClick={() => {
                  navigate(
                    "/chat-ia"
                  );

                  setOpen(
                    false
                  );
                }}
              />

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          CONTENIDO
      ================================================= */}

      <main
        className="
          flex-1
          min-w-0

          bg-black

          px-5
          pb-10
          pt-24

          md:px-7

          lg:p-10
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-9">

          <div
            className="
              flex
              flex-col

              xl:flex-row
              xl:items-end
              xl:justify-between

              gap-5
            "
          >

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

              <h1
                className="
                  text-3xl
                  md:text-5xl

                  font-bold

                  mt-3

                  tracking-tight
                "
              >
                Bienvenido a{" "}

                <span className="text-yellow-500">
                  Wealth
                </span>

              </h1>

              <p
                className="
                  text-zinc-400

                  mt-3

                  text-base
                  md:text-lg

                  max-w-2xl
                "
              >
                Consulta tus solicitudes, revisa avances y encuentra
                inspiración para tu próximo proyecto.
              </p>

            </div>

            {/* NOVEDADES */}

            {estadisticas.nuevas >
            0 ? (

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/cotizaciones"
                  )
                }
                className="
                  bg-zinc-900

                  border
                  border-yellow-500/40

                  hover:border-yellow-500/70

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

                <div
                  className="
                    relative

                    w-11
                    h-11

                    rounded-xl

                    bg-yellow-500/10

                    flex
                    items-center
                    justify-center

                    text-yellow-500
                  "
                >

                  <FaFileInvoiceDollar />

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
                      estadisticas.nuevas
                    }
                  </span>

                </div>

                <div>

                  <p className="font-bold">
                    {estadisticas.nuevas ===
                    1
                      ? "1 actualización nueva"
                      : `${estadisticas.nuevas} actualizaciones nuevas`}
                  </p>

                  <p className="text-xs text-zinc-500 mt-1">
                    Revisar mis cotizaciones
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
                    Todo actualizado
                  </p>

                  <p className="text-xs text-zinc-500">
                    No tienes novedades pendientes.
                  </p>

                </div>

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            ESTADÍSTICAS
        ================================================= */}

        <section
          className="
            grid

            grid-cols-2
            xl:grid-cols-4

            gap-4
            md:gap-5

            mb-9
          "
        >

          <TarjetaDato
            titulo="Cotizaciones"
            valor={
              estadisticas.total
            }
            descripcion="Solicitudes realizadas"
            icon={
              <FaFileInvoiceDollar />
            }
            color="yellow"
            onClick={() =>
              navigate(
                "/cotizaciones"
              )
            }
          />

          <TarjetaDato
            titulo="En proceso"
            valor={
              estadisticas.enProceso
            }
            descripcion="Trabajos activos"
            icon={
              <FaClock />
            }
            color="purple"
            onClick={() =>
              navigate(
                "/cotizaciones"
              )
            }
          />

          <TarjetaDato
            titulo="Mis proyectos"
            valor={
              estadisticas.proyectos
            }
            descripcion="Proyectos registrados"
            icon={
              <FaBuilding />
            }
            color="green"
            onClick={() =>
              navigate(
                "/mis-proyectos"
              )
            }
          />

          <TarjetaDato
            titulo="Favoritos"
            valor={
              estadisticas.favoritos
            }
            descripcion="Ideas guardadas"
            icon={
              <FaHeart />
            }
            color="pink"
            onClick={() =>
              navigate(
                "/favoritos"
              )
            }
          />

        </section>

        {/* =================================================
            TARJETA COTIZACIÓN
        ================================================= */}

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

            <div
              className="
                flex
                flex-col

                xl:flex-row
                xl:items-center
                xl:justify-between

                gap-7
              "
            >

              <div className="flex items-start gap-5">

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
                </div>

                <div>

                  <h2
                    className="
                      text-2xl
                      md:text-3xl

                      font-bold
                    "
                  >
                    ¿Tienes un nuevo proyecto?
                  </h2>

                  <p
                    className="
                      text-zinc-400

                      mt-2

                      max-w-2xl

                      leading-relaxed
                    "
                  >
                    Cuéntanos qué necesitas, agrega medidas,
                    fotografías o referencias y recibe una
                    propuesta personalizada de Wealth.
                  </p>

                  {/* MINI DATOS */}

                  <div
                    className="
                      flex
                      flex-wrap
                      gap-3

                      mt-5
                    "
                  >

                    <MiniDatoCliente
                      icon={
                        <FaFileInvoiceDollar />
                      }
                      valor={
                        estadisticas.activas
                      }
                      texto="activas"
                    />

                    <MiniDatoCliente
                      icon={
                        <FaClock />
                      }
                      valor={
                        estadisticas.esperando
                      }
                      texto="en revisión"
                    />

                    <MiniDatoCliente
                      icon={
                        <FaBuilding />
                      }
                      valor={
                        estadisticas.enProceso
                      }
                      texto="en proceso"
                    />

                  </div>

                </div>

              </div>

              {/* BOTONES */}

              <div
                className="
                  flex
                  flex-col

                  sm:flex-row
                  xl:flex-col

                  gap-3

                  shrink-0
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/crear-cotizacion"
                    )
                  }
                  className="
                    bg-yellow-500
                    hover:bg-yellow-400

                    text-black

                    px-6
                    py-4

                    rounded-2xl

                    font-bold

                    flex
                    items-center
                    justify-center
                    gap-3

                    transition-all
                    duration-300

                    group
                  "
                >

                  <FaFileInvoiceDollar />

                  Solicitar cotización

                  <FaArrowRight
                    className="
                      transition-transform
                      duration-300

                      group-hover:translate-x-1
                    "
                  />

                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/cotizaciones"
                    )
                  }
                  className="
                    bg-black

                    border
                    border-zinc-700

                    hover:border-yellow-500/50

                    text-zinc-300

                    px-6
                    py-4

                    rounded-2xl

                    font-medium

                    flex
                    items-center
                    justify-center
                    gap-3

                    transition
                  "
                >

                  <FaEye />

                  Ver solicitudes

                </button>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            WEALTH IA DESTACADO
        ================================================= */}

        <section className="mb-9">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/chat-ia"
              )
            }
            className="
              group

              relative
              overflow-hidden

              w-full

              text-left

              bg-gradient-to-r
              from-yellow-500/10
              via-zinc-900
              to-zinc-900

              border
              border-yellow-500/30

              hover:border-yellow-500/60

              rounded-[30px]

              p-6
              md:p-7

              transition-all
              duration-300
            "
          >

            <div
              className="
                absolute
                inset-0

                opacity-0

                group-hover:opacity-100

                bg-gradient-to-r
                from-yellow-500/5
                to-transparent

                transition-opacity
              "
            />

            <div
              className="
                relative

                flex
                flex-col

                sm:flex-row
                sm:items-center
                sm:justify-between

                gap-5
              "
            >

              <div className="flex items-center gap-5">

                <div
                  className="
                    w-16
                    h-16

                    rounded-2xl

                    bg-yellow-500

                    text-black

                    flex
                    items-center
                    justify-center

                    text-2xl

                    shrink-0
                  "
                >
                  <FaRobot />
                </div>

                <div>

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-[0.25em]

                      text-yellow-500

                      font-semibold
                    "
                  >
                    Asistente virtual
                  </p>

                  <h2
                    className="
                      text-2xl
                      md:text-3xl

                      font-bold

                      mt-1
                    "
                  >
                    Habla con WEALTH IA
                  </h2>

                  <p
                    className="
                      text-zinc-400

                      mt-2

                      max-w-2xl
                    "
                  >
                    Consulta proyectos, construcción, inmobiliaria,
                    aluminio, vidrio o recibe ayuda para iniciar
                    una cotización.
                  </p>

                </div>

              </div>

              <div
                className="
                  flex
                  items-center
                  gap-3

                  text-yellow-500

                  font-semibold

                  shrink-0
                "
              >

                Abrir asistente

                <FaArrowRight
                  className="
                    transition-transform
                    duration-300

                    group-hover:translate-x-1
                  "
                />

              </div>

            </div>

          </button>

        </section>

        {/* =================================================
            ACCESOS RÁPIDOS
        ================================================= */}

        <section>

          <div className="mb-5">

            <p className="text-xl font-bold">
              Accesos rápidos
            </p>

            <p className="text-sm text-zinc-500 mt-1">
              Administra tus proyectos y solicitudes desde un solo lugar.
            </p>

          </div>

          <div
            className="
              grid

              md:grid-cols-2
              xl:grid-cols-3

              gap-5
            "
          >

            <AccesoCliente
              icon={
                <FaSearch />
              }
              titulo="Explorar proyectos"
              descripcion="Consulta proyectos reales y encuentra inspiración."
              color="cyan"
              onClick={() =>
                navigate(
                  "/proyectos"
                )
              }
            />

            <AccesoCliente
              icon={
                <FaRobot />
              }
              titulo="WEALTH IA"
              descripcion="Pregunta sobre proyectos, construcción, inmobiliaria, vidrio o aluminio."
              color="yellow"
              onClick={() =>
                navigate(
                  "/chat-ia"
                )
              }
            />

            <AccesoCliente
              icon={
                <FaHeart />
              }
              titulo="Mis favoritos"
              descripcion="Vuelve rápidamente a las ideas y proyectos que guardaste."
              color="pink"
              onClick={() =>
                navigate(
                  "/favoritos"
                )
              }
            />

            <AccesoCliente
              icon={
                <FaBuilding />
              }
              titulo="Mis proyectos"
              descripcion="Consulta trabajos contratados y su seguimiento."
              color="green"
              onClick={() =>
                navigate(
                  "/mis-proyectos"
                )
              }
            />

            <AccesoCliente
              icon={
                <FaFileInvoiceDollar />
              }
              titulo="Mis cotizaciones"
              descripcion="Revisa propuestas y actualizaciones de Wealth."
              color="blue"
              badge={
                estadisticas.nuevas
              }
              onClick={() =>
                navigate(
                  "/cotizaciones"
                )
              }
            />

            <AccesoCliente
              icon={
                <FaUser />
              }
              titulo="Mi perfil"
              descripcion="Consulta y administra la información de tu cuenta."
              color="purple"
              onClick={() =>
                navigate(
                  "/perfil"
                )
              }
            />

          </div>

        </section>

      </main>

    </div>
  );
}

/* ======================================================
   BOTÓN SIDEBAR
====================================================== */

function BotonMenuCliente({
  icon,
  texto,
  onClick,
  activo = false,
  especial = false,
  badge = 0,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
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

      {badge >
      0 && (
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

/* ======================================================
   BOTÓN MOBILE
====================================================== */

function BotonMobile({
  icon,
  texto,
  onClick,
  activo = false,
  especial = false,
  badge = 0,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        relative

        w-full

        flex
        items-center
        gap-3

        px-5
        py-4

        rounded-2xl

        border

        ${
          activo
            ? "bg-yellow-500 text-black border-yellow-500"
            : especial
            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
            : "bg-zinc-900 text-zinc-300 border-zinc-800"
        }
      `}
    >

      {icon}

      <span className="font-medium">
        {texto}
      </span>

      {badge >
      0 && (
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

/* ======================================================
   TARJETA ESTADÍSTICA
====================================================== */

function TarjetaDato({
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

    green:
      "text-green-400 bg-green-500/10 border-green-500/20",

    pink:
      "text-pink-400 bg-pink-500/10 border-pink-500/20",

    purple:
      "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="
        text-left

        bg-zinc-900

        border
        border-zinc-700

        rounded-2xl

        p-4
        md:p-5

        transition-all
        duration-300

        hover:border-zinc-500
        hover:-translate-y-[2px]
      "
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

/* ======================================================
   MINI DATO
====================================================== */

function MiniDatoCliente({
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

/* ======================================================
   ACCESO RÁPIDO
====================================================== */

function AccesoCliente({
  icon,
  titulo,
  descripcion,
  color,
  onClick,
  badge = 0,
}) {
  const colores = {
    yellow:
      "text-yellow-500 border-yellow-500/20 bg-yellow-500/10",

    cyan:
      "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",

    pink:
      "text-pink-400 border-pink-500/20 bg-pink-500/10",

    green:
      "text-green-400 border-green-500/20 bg-green-500/10",

    blue:
      "text-blue-400 border-blue-500/20 bg-blue-500/10",

    purple:
      "text-purple-400 border-purple-500/20 bg-purple-500/10",
  };

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="
        group

        relative

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

      {badge >
      0 && (
        <span
          className="
            absolute

            top-5
            right-5

            min-w-[24px]
            h-6

            px-2

            rounded-full

            bg-red-500

            text-white

            text-xs
            font-bold

            flex
            items-center
            justify-center
          "
        >
          {badge}
        </span>
      )}

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

      <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
        {descripcion}
      </p>

      <div
        className="
          mt-5

          flex
          items-center
          gap-2

          text-yellow-500

          text-sm
          font-medium
        "
      >

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

export default MenuCliente;