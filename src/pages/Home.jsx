import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import wealthLogo from "../assets/wealthlogo.jpeg";

import {
  auth,
  db,
} from "../firebase.config";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  FaArrowRight,
  FaBuilding,
  FaHardHat,
  FaDraftingCompass,
  FaImages,
  FaMapMarkerAlt,
  FaFileInvoiceDollar,
  FaShieldAlt,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaPhoneAlt,
} from "react-icons/fa";


function Home() {

  const navigate =
    useNavigate();

  const {
    modoOscuro,
  } =
    useOutletContext();


  // ======================================================
  // AUTENTICACIÓN
  // ======================================================

  const [user, setUser] =
    useState(null);

  const [
    authReady,
    setAuthReady,
  ] =
    useState(false);


  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {

          setUser(
            currentUser
          );

          setAuthReady(
            true
          );

        }
      );


    return () =>
      unsubscribe();

  }, []);


  // ======================================================
  // FIREBASE
  // ======================================================

  const [
    proyectos,
    setProyectos,
  ] =
    useState([]);


  const [
    fotosGaleria,
    setFotosGaleria,
  ] =
    useState([]);


  // ======================================================
  // ROTACIÓN
  // ======================================================

  const [
    indiceProyecto,
    setIndiceProyecto,
  ] =
    useState(0);


  const [
    indiceGaleria,
    setIndiceGaleria,
  ] =
    useState(0);


  const PROYECTOS_VISIBLES =
    3;

  const FOTOS_VISIBLES =
    6;

  const TIEMPO_PROYECTOS =
    8000;

  const TIEMPO_GALERIA =
    6500;


  // ======================================================
  // DIVISIONES
  // ======================================================

  const divisiones = [
    {
      icon: (
        <FaHardHat
          size={24}
        />
      ),

      titulo:
        "Construcciones",

      descripcion:
        "Obra civil, infraestructura, urbanización, mantenimiento y soluciones integrales.",

      ruta:
        "/construcciones",
    },

    {
      icon: (
        <FaBuilding
          size={24}
        />
      ),

      titulo:
        "Inmobiliaria",

      descripcion:
        "Ingeniería, arquitectura, planeación y desarrollo integral de proyectos.",

      ruta:
        "/inmobiliaria",
    },

    {
      icon: (
        <FaDraftingCompass
          size={24}
        />
      ),

      titulo:
        "Aluminios y Vidrios",

      descripcion:
        "Cancelería, vidrio templado, estructuras de aluminio y diseños personalizados.",

      ruta:
        "/aluminios",
    },
  ];


  // ======================================================
  // PROYECTOS FIRESTORE
  // ======================================================

  useEffect(() => {

    const unsub =
      onSnapshot(
        collection(
          db,
          "proyectos"
        ),

        (snapshot) => {

          const lista =
            snapshot.docs.map(
              (
                documento
              ) => ({
                id:
                  documento.id,

                ...documento.data(),
              })
            );


          lista.sort(
            (a, b) => {

              if (
                Boolean(
                  a.destacado
                ) !==
                Boolean(
                  b.destacado
                )
              ) {
                return b.destacado
                  ? 1
                  : -1;
              }


              const fechaA =
                a.fechaActualizacion
                  ?.toMillis?.() ||
                a.fecha
                  ?.toMillis?.() ||
                0;


              const fechaB =
                b.fechaActualizacion
                  ?.toMillis?.() ||
                b.fecha
                  ?.toMillis?.() ||
                0;


              return (
                fechaB -
                fechaA
              );

            }
          );


          setProyectos(
            lista
          );


          setIndiceProyecto(
            (
              actual
            ) => {

              if (
                actual >=
                lista.length
              ) {
                return 0;
              }

              return actual;

            }
          );

        },

        (error) => {

          console.error(
            "❌ Error cargando proyectos:",
            error
          );

        }
      );


    return () =>
      unsub();

  }, []);


  // ======================================================
  // GALERÍA FIRESTORE
  // ======================================================

  useEffect(() => {

    const unsub =
      onSnapshot(
        collection(
          db,
          "galeria"
        ),

        (snapshot) => {

          const fotos =
            [];


          snapshot.docs.forEach(
            (
              documento
            ) => {

              const datos =
                documento.data();


              const imagenes =
                Array.isArray(
                  datos.imagenes
                )
                  ? datos.imagenes
                  : [];


              imagenes.forEach(
                (
                  imagen,
                  index
                ) => {

                  if (!imagen)
                    return;


                  fotos.push({
                    id:
                      `${documento.id}_${index}`,

                    imagen,

                    categoria:
                      datos.categoria ||
                      "Wealth",

                    subcategoria:
                      datos.subcategoria ||
                      "Diseño",
                  });

                }
              );

            }
          );


          setFotosGaleria(
            fotos
          );


          setIndiceGaleria(
            (
              actual
            ) => {

              if (
                actual >=
                fotos.length
              ) {
                return 0;
              }

              return actual;

            }
          );

        },

        (error) => {

          console.error(
            "❌ Error cargando galería en Home:",
            error
          );

        }
      );


    return () =>
      unsub();

  }, []);


  // ======================================================
  // ROTACIÓN AUTOMÁTICA PROYECTOS
  // ======================================================

  useEffect(() => {

    if (
      proyectos.length <=
      PROYECTOS_VISIBLES
    ) {
      return;
    }


    const intervalo =
      setInterval(
        () => {

          setIndiceProyecto(
            (
              actual
            ) => {

              const siguiente =
                actual +
                PROYECTOS_VISIBLES;


              if (
                siguiente >=
                proyectos.length
              ) {
                return 0;
              }


              return siguiente;

            }
          );

        },
        TIEMPO_PROYECTOS
      );


    return () =>
      clearInterval(
        intervalo
      );

  }, [
    proyectos,
  ]);


  // ======================================================
  // ROTACIÓN AUTOMÁTICA GALERÍA
  // ======================================================

  useEffect(() => {

    if (
      fotosGaleria.length <=
      FOTOS_VISIBLES
    ) {
      return;
    }


    const intervalo =
      setInterval(
        () => {

          setIndiceGaleria(
            (
              actual
            ) => {

              const siguiente =
                actual +
                FOTOS_VISIBLES;


              if (
                siguiente >=
                fotosGaleria.length
              ) {
                return 0;
              }


              return siguiente;

            }
          );

        },
        TIEMPO_GALERIA
      );


    return () =>
      clearInterval(
        intervalo
      );

  }, [
    fotosGaleria,
  ]);


  // ======================================================
  // PROYECTOS VISIBLES
  // ======================================================

  const proyectosVisibles =
    useMemo(
      () => {

        if (
          proyectos.length <=
          PROYECTOS_VISIBLES
        ) {
          return proyectos;
        }


        let visibles =
          proyectos.slice(
            indiceProyecto,
            indiceProyecto +
              PROYECTOS_VISIBLES
          );


        if (
          visibles.length <
          PROYECTOS_VISIBLES
        ) {

          visibles = [
            ...visibles,

            ...proyectos.slice(
              0,
              PROYECTOS_VISIBLES -
                visibles.length
            ),
          ];

        }


        return visibles;

      },
      [
        proyectos,
        indiceProyecto,
      ]
    );


  // ======================================================
  // FOTOS VISIBLES
  // ======================================================

  const fotosVisibles =
    useMemo(
      () => {

        if (
          fotosGaleria.length <=
          FOTOS_VISIBLES
        ) {
          return fotosGaleria;
        }


        let visibles =
          fotosGaleria.slice(
            indiceGaleria,
            indiceGaleria +
              FOTOS_VISIBLES
          );


        if (
          visibles.length <
          FOTOS_VISIBLES
        ) {

          visibles = [
            ...visibles,

            ...fotosGaleria.slice(
              0,
              FOTOS_VISIBLES -
                visibles.length
            ),
          ];

        }


        return visibles;

      },
      [
        fotosGaleria,
        indiceGaleria,
      ]
    );


  // ======================================================
  // ANTERIOR PROYECTOS
  // ======================================================

  const proyectosAnteriores =
    () => {

      if (
        proyectos.length <=
        PROYECTOS_VISIBLES
      ) {
        return;
      }


      setIndiceProyecto(
        (
          actual
        ) => {

          const anterior =
            actual -
            PROYECTOS_VISIBLES;


          if (
            anterior < 0
          ) {

            const ultimaPagina =
              Math.ceil(
                proyectos.length /
                  PROYECTOS_VISIBLES
              ) - 1;


            return (
              ultimaPagina *
              PROYECTOS_VISIBLES
            );

          }


          return anterior;

        }
      );

    };


  // ======================================================
  // SIGUIENTE PROYECTOS
  // ======================================================

  const proyectosSiguientes =
    () => {

      if (
        proyectos.length <=
        PROYECTOS_VISIBLES
      ) {
        return;
      }


      setIndiceProyecto(
        (
          actual
        ) => {

          const siguiente =
            actual +
            PROYECTOS_VISIBLES;


          if (
            siguiente >=
            proyectos.length
          ) {
            return 0;
          }


          return siguiente;

        }
      );

    };


  // ======================================================
  // ANTERIOR GALERÍA
  // ======================================================

  const galeriaAnterior =
    () => {

      if (
        fotosGaleria.length <=
        FOTOS_VISIBLES
      ) {
        return;
      }


      setIndiceGaleria(
        (
          actual
        ) => {

          const anterior =
            actual -
            FOTOS_VISIBLES;


          if (
            anterior < 0
          ) {

            const ultimaPagina =
              Math.ceil(
                fotosGaleria.length /
                  FOTOS_VISIBLES
              ) - 1;


            return (
              ultimaPagina *
              FOTOS_VISIBLES
            );

          }


          return anterior;

        }
      );

    };


  // ======================================================
  // SIGUIENTE GALERÍA
  // ======================================================

  const galeriaSiguiente =
    () => {

      if (
        fotosGaleria.length <=
        FOTOS_VISIBLES
      ) {
        return;
      }


      setIndiceGaleria(
        (
          actual
        ) => {

          const siguiente =
            actual +
            FOTOS_VISIBLES;


          if (
            siguiente >=
            fotosGaleria.length
          ) {
            return 0;
          }


          return siguiente;

        }
      );

    };


  // ======================================================
  // COTIZACIONES
  // ======================================================

  const irALoginParaCotizar =
    () => {

      navigate(
        "/login",
        {
          state: {
            mensaje:
              "Inicia sesión para solicitar una cotización.",
          },
        }
      );

    };


  const abrirCrearCotizacion =
    () => {

      if (
        !authReady
      ) {
        return;
      }


      if (!user) {

        irALoginParaCotizar();

        return;

      }


      navigate(
        "/crear-cotizacion"
      );

    };


  const solicitarCotizacion =
    (
      proyecto
    ) => {

      if (
        !authReady
      ) {
        return;
      }


      if (!user) {

        navigate(
          "/login",
          {
            state: {

              mensaje:
                "Inicia sesión para cotizar este proyecto.",

              proyectoPendiente: {
                id:
                  proyecto.id,

                nombre:
                  proyecto.nombre,

                descripcion:
                  proyecto.descripcion,

                categoria:
                  proyecto.categoria,

                imagen:
                  proyecto.imagen,

                imagenes:
                  proyecto.imagenes ||
                  [],
              },

            },
          }
        );


        return;

      }


      navigate(
        "/crear-cotizacion",
        {
          state: {

            proyecto: {
              id:
                proyecto.id,

              nombre:
                proyecto.nombre,

              descripcion:
                proyecto.descripcion,

              categoria:
                proyecto.categoria,

              imagen:
                proyecto.imagen,

              imagenes:
                proyecto.imagenes ||
                [],
            },

          },
        }
      );

    };


  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div
      className={`
        min-h-screen
        transition-colors
        duration-300

        ${
          modoOscuro
            ? `
              bg-black
              text-white
            `
            : `
              bg-gray-50
              text-gray-900
            `
        }
      `}
    >

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          border-b
          border-zinc-900
          bg-black
          text-white
        "
      >

        <img
          src={
            wealthLogo
          }
          alt="Wealth Grupo Empresarial"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            md:object-contain
            md:object-right
            opacity-65
          "
        />


        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 md:via-black/80 to-black/35" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />


        <div
          className="
            absolute
            inset-0
            overflow-hidden
            hidden
            lg:block
            pointer-events-none
          "
        >

          <div className="absolute w-[170%] h-[3px] bg-[#c89b3c] rotate-[27deg] top-[19%] -left-60 opacity-45" />

          <div className="absolute w-[170%] h-[1px] bg-[#e0b84d] rotate-[27deg] top-[21%] -left-60 opacity-40" />

          <div className="absolute w-[170%] h-[3px] bg-[#c89b3c] rotate-[27deg] bottom-[17%] -left-60 opacity-45" />

          <div className="absolute w-[170%] h-[1px] bg-[#e0b84d] rotate-[27deg] bottom-[19%] -left-60 opacity-40" />

        </div>


        <div
          className="
            relative
            z-10
            max-w-7xl
            mx-auto
            px-5
            sm:px-6
            lg:px-8
            py-16
            md:py-20
            lg:py-24
          "
        >

          <div className="max-w-3xl">

            <p className="text-[#c89b3c] uppercase tracking-[0.32em] text-xs font-semibold mb-4">

              Wealth Grupo Empresarial

            </p>


            <h1
              className="
                text-4xl
                sm:text-5xl
                md:text-6xl
                lg:text-7xl
                font-bold
                leading-[1.02]
                tracking-tight
              "
            >

              Construcción,
              innovación{" "}

              <span className="text-[#c89b3c]">

                y desarrollo integral.

              </span>

            </h1>


            <p className="text-zinc-300 text-base md:text-lg leading-relaxed max-w-2xl mt-5">

              En Wealth integramos
              construcción,
              ingeniería,
              desarrollo inmobiliario
              y soluciones en aluminio
              y vidrio para transformar
              ideas en proyectos
              funcionales, modernos
              y duraderos.

            </p>


            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-7">

              <Link
                to="/proyectos"
                className={`
                  ${botonBase(
                    true
                  )}

                  border-[#c89b3c]
                  text-[#d6ab4c]

                  hover:bg-[#c89b3c]/10
                `}
              >

                <FaImages />

                Explorar proyectos

                <FaArrowRight />

              </Link>


              <Link
                to="/galeria"
                className={`
                  ${botonBase(
                    true
                  )}

                  border-zinc-700
                  text-zinc-200

                  hover:border-[#c89b3c]/70
                  hover:text-[#d6ab4c]
                `}
              >

                <FaImages />

                Explorar galería de fotos

                <FaArrowRight />

              </Link>


              <button
                type="button"
                onClick={
                  abrirCrearCotizacion
                }
                disabled={
                  !authReady
                }
                className={`
                  ${botonBase(
                    true
                  )}

                  border-zinc-600
                  text-white

                  hover:border-[#c89b3c]/70
                  hover:text-[#d6ab4c]

                  disabled:opacity-50
                  disabled:cursor-wait
                `}
              >

                <FaFileInvoiceDollar />

                {user
                  ? "Solicitar cotización"
                  : "Inicia sesión para cotizar"}

              </button>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* CONTENIDO */}
      {/* ================================================= */}

      <main className="max-w-7xl mx-auto px-5 md:px-8">


        {/* ================================================= */}
        {/* DIVISIONES */}
        {/* ================================================= */}

        <section className="pt-10 pb-8">

          <div className="mb-6">

            <p className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] font-semibold">

              Grupo Wealth

            </p>


            <h2 className="text-3xl md:text-4xl font-bold mt-2">

              Una empresa.
              Tres divisiones.

            </h2>


            <p
              className={`
                mt-2
                max-w-2xl

                ${
                  modoOscuro
                    ? "text-zinc-500"
                    : "text-gray-600"
                }
              `}
            >

              Soluciones integrales
              para desarrollar
              proyectos desde la idea
              hasta su ejecución.

            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-4">

            {divisiones.map(
              (
                division
              ) => (

                <Link
                  key={
                    division.titulo
                  }
                  to={
                    division.ruta
                  }
                  className={`
                    group
                    border
                    hover:border-[#c89b3c]/60
                    rounded-2xl
                    p-5

                    transition-all
                    duration-300

                    hover:-translate-y-[2px]

                    ${
                      modoOscuro
                        ? `
                          bg-zinc-950
                          border-zinc-800
                        `
                        : `
                          bg-white
                          border-gray-200
                          shadow-sm
                        `
                    }
                  `}
                >

                  <div className="flex items-start gap-4">

                    <div
                      className="
                        w-12
                        h-12
                        shrink-0
                        rounded-xl

                        bg-[#c89b3c]/10

                        border
                        border-[#c89b3c]/20

                        text-[#d6ab4c]

                        flex
                        items-center
                        justify-center
                      "
                    >

                      {
                        division.icon
                      }

                    </div>


                    <div>

                      <h3 className="text-xl font-bold">

                        {
                          division.titulo
                        }

                      </h3>


                      <p
                        className={`
                          text-sm
                          mt-2
                          leading-relaxed

                          ${
                            modoOscuro
                              ? "text-zinc-500"
                              : "text-gray-600"
                          }
                        `}
                      >

                        {
                          division.descripcion
                        }

                      </p>

                    </div>

                  </div>


                  <div className="flex items-center gap-2 text-sm text-[#d6ab4c] mt-5">

                    Conocer división

                    <FaArrowRight className="group-hover:translate-x-1 transition" />

                  </div>

                </Link>

              )
            )}

          </div>

        </section>


        {/* ================================================= */}
        {/* CONFIANZA */}
        {/* ================================================= */}

        <section className="pb-8">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

            <MiniBeneficio
              modoOscuro={
                modoOscuro
              }
              icon={
                <FaCheckCircle />
              }
              titulo="Solución integral"
              texto="Diseño y ejecución"
            />


            <MiniBeneficio
              modoOscuro={
                modoOscuro
              }
              icon={
                <FaShieldAlt />
              }
              titulo="Atención directa"
              texto="Seguimiento personalizado"
            />


            <MiniBeneficio
              modoOscuro={
                modoOscuro
              }
              icon={
                <FaFileInvoiceDollar />
              }
              titulo="Cotización"
              texto="Proceso claro"
            />


            <MiniBeneficio
              modoOscuro={
                modoOscuro
              }
              icon={
                <FaMapMarkerAlt />
              }
              titulo="Campeche"
              texto="Atención regional"
            />

          </div>

        </section>


        <div
          className={`
            border-t

            ${
              modoOscuro
                ? "border-zinc-900"
                : "border-gray-200"
            }
          `}
        />


        {/* ================================================= */}
        {/* PROYECTOS */}
        {/* ================================================= */}

        <section className="py-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">

            <div>

              <p className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] font-semibold">

                Nuestro trabajo

              </p>


              <h2 className="text-3xl md:text-4xl font-bold mt-2">

                Proyectos recientes

              </h2>


              <p
                className={`
                  mt-2

                  ${
                    modoOscuro
                      ? "text-zinc-500"
                      : "text-gray-600"
                  }
                `}
              >

                Conoce algunos
                proyectos desarrollados
                por Wealth.

              </p>

            </div>


            <div className="flex flex-wrap gap-2">

              {proyectos.length >
                PROYECTOS_VISIBLES && (
                <>

                  <button
                    type="button"
                    onClick={
                      proyectosAnteriores
                    }
                    className={
                      botonCuadrado(
                        modoOscuro
                      )
                    }
                  >
                    <FaChevronLeft />
                  </button>


                  <button
                    type="button"
                    onClick={
                      proyectosSiguientes
                    }
                    className={
                      botonCuadrado(
                        modoOscuro
                      )
                    }
                  >
                    <FaChevronRight />
                  </button>

                </>
              )}


              <Link
                to="/proyectos"
                className={`
                  ${botonBase(
                    modoOscuro
                  )}

                  ${
                    modoOscuro
                      ? `
                        border-zinc-600
                        text-zinc-300
                      `
                      : `
                        border-gray-300
                        text-gray-700
                      `
                  }

                  hover:text-[#d6ab4c]
                  hover:border-[#c89b3c]/60
                `}
              >

                Ver todos

                <FaArrowRight />

              </Link>

            </div>

          </div>


          {proyectos.length >
          0 ? (

            <div
              key={
                indiceProyecto
              }
              className="grid md:grid-cols-3 gap-4"
            >

              {proyectosVisibles.map(
                (
                  proyecto
                ) => (

                  <article
                    key={
                      proyecto.id
                    }
                    className={`
                      group
                      border
                      hover:border-[#c89b3c]/60

                      rounded-2xl
                      overflow-hidden

                      transition-all
                      duration-300

                      hover:-translate-y-[2px]

                      ${
                        modoOscuro
                          ? `
                            bg-zinc-950
                            border-zinc-800
                          `
                          : `
                            bg-white
                            border-gray-200
                            shadow-sm
                          `
                      }
                    `}
                  >

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/proyecto/${proyecto.id}`
                        )
                      }
                      className={`
                        relative
                        block
                        w-full
                        h-52
                        md:h-56
                        overflow-hidden

                        ${
                          modoOscuro
                            ? "bg-zinc-900"
                            : "bg-gray-100"
                        }
                      `}
                    >

                      {proyecto.imagen ? (

                        <img
                          src={
                            proyecto.imagen
                          }
                          alt={
                            proyecto.nombre ||
                            "Proyecto Wealth"
                          }
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center">

                          <FaBuilding className="text-gray-400 text-5xl" />

                        </div>

                      )}


                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />


                      <div className="absolute top-3 left-3 flex gap-2">

                        <span className="bg-black/80 text-white border border-white/10 px-2.5 py-1 rounded-full text-[11px]">

                          {
                            proyecto.categoria ||
                            "Wealth"
                          }

                        </span>


                        {proyecto.destacado && (

                          <span className="bg-[#c89b3c] text-black px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">

                            <FaStar
                              size={10}
                            />

                            Destacado

                          </span>

                        )}

                      </div>

                    </button>


                    <div className="p-5">

                      <h3 className="text-xl font-bold line-clamp-2">

                        {
                          proyecto.nombre
                        }

                      </h3>


                      <p
                        className={`
                          text-sm
                          mt-2
                          line-clamp-2
                          min-h-[40px]

                          ${
                            modoOscuro
                              ? "text-zinc-400"
                              : "text-gray-600"
                          }
                        `}
                      >

                        {
                          proyecto.descripcion
                        }

                      </p>


                      <div
                        className={`
                          flex
                          items-center
                          gap-2
                          text-xs
                          mt-4

                          ${
                            modoOscuro
                              ? "text-zinc-500"
                              : "text-gray-500"
                          }
                        `}
                      >

                        <FaMapMarkerAlt className="text-[#d6ab4c]" />

                        <span className="truncate">

                          {
                            proyecto.ubicacion ||
                            "Campeche"
                          }

                        </span>

                      </div>


                      <div className="grid grid-cols-2 gap-2.5 mt-5">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/proyecto/${proyecto.id}`
                            )
                          }
                          className={`
                            ${botonCompacto(
                              modoOscuro
                            )}

                            ${
                              modoOscuro
                                ? `
                                  border-zinc-600
                                  text-zinc-300
                                `
                                : `
                                  border-gray-300
                                  text-gray-700
                                `
                            }

                            hover:text-blue-500
                            hover:border-blue-500/50
                          `}
                        >

                          Ver

                          <FaArrowRight />

                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            solicitarCotizacion(
                              proyecto
                            )
                          }
                          className={`
                            ${botonCompacto(
                              modoOscuro
                            )}

                            border-[#c89b3c]/60
                            text-[#d6ab4c]

                            hover:bg-[#c89b3c]/10
                          `}
                        >

                          <FaFileInvoiceDollar />

                          {user
                            ? "Cotizar"
                            : "Iniciar sesión"}

                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          ) : (

            <div
              className={`
                border
                rounded-2xl
                py-10
                text-center

                ${
                  modoOscuro
                    ? `
                      bg-zinc-950
                      border-zinc-800
                    `
                    : `
                      bg-white
                      border-gray-200
                      shadow-sm
                    `
                }
              `}
            >

              <FaBuilding className="text-gray-400 text-4xl mx-auto" />


              <p
                className={`
                  mt-4

                  ${
                    modoOscuro
                      ? "text-zinc-500"
                      : "text-gray-600"
                  }
                `}
              >

                Próximamente
                nuevos proyectos.

              </p>

            </div>

          )}

        </section>


        <div
          className={`
            border-t

            ${
              modoOscuro
                ? "border-zinc-900"
                : "border-gray-200"
            }
          `}
        />


        {/* ================================================= */}
        {/* GALERÍA */}
        {/* ================================================= */}

        {fotosGaleria.length >
          0 && (

          <section className="py-8">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">

              <div>

                <p className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] font-semibold">

                  Inspírate

                </p>


                <h2 className="text-3xl md:text-4xl font-bold mt-2">

                  Ideas y diseños

                </h2>


                <p
                  className={`
                    mt-2

                    ${
                      modoOscuro
                        ? "text-zinc-500"
                        : "text-gray-600"
                    }
                  `}
                >

                  Explora trabajos y
                  referencias para tu
                  próximo proyecto.

                </p>

              </div>


              <div className="flex items-center gap-2">

                {fotosGaleria.length >
                  FOTOS_VISIBLES && (
                  <>

                    <button
                      type="button"
                      onClick={
                        galeriaAnterior
                      }
                      className={
                        botonCuadrado(
                          modoOscuro
                        )
                      }
                    >
                      <FaChevronLeft />
                    </button>


                    <button
                      type="button"
                      onClick={
                        galeriaSiguiente
                      }
                      className={
                        botonCuadrado(
                          modoOscuro
                        )
                      }
                    >
                      <FaChevronRight />
                    </button>

                  </>
                )}


                <Link
                  to="/galeria"
                  className={`
                    ${botonBase(
                      modoOscuro
                    )}

                    ${
                      modoOscuro
                        ? `
                          border-zinc-600
                          text-zinc-300
                        `
                        : `
                          border-gray-300
                          text-gray-700
                        `
                    }

                    hover:text-[#d6ab4c]
                    hover:border-[#c89b3c]/60
                  `}
                >

                  <FaImages />

                  Ver galería

                  <FaArrowRight />

                </Link>

              </div>

            </div>


            <div
              key={
                indiceGaleria
              }
              className="
                grid
                grid-cols-2
                md:grid-cols-3
                lg:grid-cols-6
                gap-3
              "
            >

              {fotosVisibles.map(
                (
                  foto
                ) => (

                  <Link
                    key={
                      foto.id
                    }
                    to="/galeria"
                    className={`
                      group
                      relative
                      aspect-square
                      overflow-hidden
                      rounded-2xl

                      border

                      hover:border-[#c89b3c]/60

                      transition-all
                      duration-300

                      hover:-translate-y-[2px]

                      ${
                        modoOscuro
                          ? `
                            border-zinc-800
                            bg-zinc-900
                          `
                          : `
                            border-gray-200
                            bg-gray-100
                            shadow-sm
                          `
                      }
                    `}
                  >

                    <img
                      src={
                        foto.imagen
                      }
                      alt={
                        foto.subcategoria ||
                        "Galería Wealth"
                      }
                      loading="lazy"
                      className="
                        w-full
                        h-full
                        object-cover

                        transition-transform
                        duration-500

                        group-hover:scale-105
                      "
                    />


                    <div
                      className="
                        absolute
                        inset-0

                        bg-gradient-to-t
                        from-black/85
                        via-black/10
                        to-transparent

                        opacity-0
                        group-hover:opacity-100

                        transition-opacity
                        duration-300
                      "
                    />


                    <div
                      className="
                        absolute
                        left-3
                        right-3
                        bottom-3

                        translate-y-2
                        opacity-0

                        text-white

                        group-hover:translate-y-0
                        group-hover:opacity-100

                        transition-all
                        duration-300
                      "
                    >

                      <p className="text-[10px] uppercase tracking-wide text-[#d6ab4c]">

                        {
                          foto.categoria
                        }

                      </p>


                      <p className="text-sm font-semibold line-clamp-1 mt-0.5">

                        {
                          foto.subcategoria
                        }

                      </p>

                    </div>

                  </Link>

                )
              )}

            </div>


            <div className="flex items-center justify-between mt-4">

              <p
                className={`
                  text-xs

                  ${
                    modoOscuro
                      ? "text-zinc-600"
                      : "text-gray-500"
                  }
                `}
              >

                {
                  fotosGaleria.length
                }{" "}

                {fotosGaleria.length ===
                1
                  ? "imagen disponible"
                  : "imágenes disponibles"}

              </p>


              <Link
                to="/galeria"
                className="text-xs text-[#c89b3c] hover:text-[#e0b84d] transition flex items-center gap-1.5"
              >

                Explorar todas

                <FaArrowRight />

              </Link>

            </div>

          </section>

        )}


        {/* ================================================= */}
        {/* CTA FINAL */}
        {/* ================================================= */}

        <section className="pb-10">

          <div
            className={`
              border
              rounded-2xl

              p-6
              md:p-7

              flex
              flex-col

              lg:flex-row
              lg:items-center
              lg:justify-between

              gap-5

              ${
                modoOscuro
                  ? `
                    bg-zinc-950
                    border-zinc-800
                  `
                  : `
                    bg-white
                    border-gray-200
                    shadow-sm
                  `
              }
            `}
          >

            <div>

              <p className="text-xs uppercase tracking-[0.22em] text-[#c89b3c]">

                Hablemos

              </p>


              <h2 className="text-2xl md:text-3xl font-bold mt-2">

                ¿Tienes un proyecto
                en mente?

              </h2>


              <p
                className={`
                  mt-2

                  ${
                    modoOscuro
                      ? "text-zinc-500"
                      : "text-gray-600"
                  }
                `}
              >

                Cuéntanos qué
                necesitas y
                prepararemos una
                propuesta para ayudarte
                a desarrollarlo.

              </p>

            </div>


            <div className="flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={
                  abrirCrearCotizacion
                }
                disabled={
                  !authReady
                }
                className={`
                  ${botonBase(
                    modoOscuro
                  )}

                  border-[#c89b3c]/60
                  text-[#d6ab4c]

                  hover:bg-[#c89b3c]/10

                  disabled:opacity-50
                  disabled:cursor-wait
                `}
              >

                <FaFileInvoiceDollar />

                {user
                  ? "Solicitar cotización"
                  : "Inicia sesión para cotizar"}

                <FaArrowRight />

              </button>


              <a
                href="https://wa.me/529811574778"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  ${botonBase(
                    modoOscuro
                  )}

                  ${
                    modoOscuro
                      ? `
                        border-zinc-600
                        text-zinc-300
                      `
                      : `
                        border-gray-300
                        text-gray-700
                      `
                  }

                  hover:text-green-500
                  hover:border-green-500/50
                `}
              >

                <FaPhoneAlt />

                WhatsApp

              </a>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


// ======================================================
// BENEFICIO
// ======================================================

function MiniBeneficio({
  icon,
  titulo,
  texto,
  modoOscuro,
}) {

  return (
    <div
      className={`
        border
        rounded-xl
        p-4

        ${
          modoOscuro
            ? `
              bg-zinc-950
              border-zinc-800
            `
            : `
              bg-white
              border-gray-200
              shadow-sm
            `
        }
      `}
    >

      <div className="flex items-start gap-3">

        <div className="text-[#d6ab4c] mt-0.5">

          {icon}

        </div>


        <div>

          <p className="font-semibold text-sm">

            {titulo}

          </p>


          <p
            className={`
              text-xs
              mt-1

              ${
                modoOscuro
                  ? "text-zinc-600"
                  : "text-gray-500"
              }
            `}
          >

            {texto}

          </p>

        </div>

      </div>

    </div>
  );
}


// ======================================================
// BOTONES
// ======================================================

const botonBase =
  (
    modoOscuro
  ) => `
    ${
      modoOscuro
        ? "bg-black"
        : "bg-white"
    }

    border

    px-4
    py-2.5

    rounded-xl

    font-medium

    flex
    items-center
    justify-center
    gap-2

    transition-all
    duration-200

    hover:-translate-y-[1px]

    active:translate-y-0
  `;


const botonCompacto =
  (
    modoOscuro
  ) => `
    ${
      modoOscuro
        ? "bg-black"
        : "bg-white"
    }

    border

    px-3
    py-2.5

    rounded-xl

    text-sm
    font-medium

    flex
    items-center
    justify-center
    gap-2

    transition-all
    duration-200

    hover:-translate-y-[1px]

    active:translate-y-0
  `;


const botonCuadrado =
  (
    modoOscuro
  ) => `
    w-10
    h-10

    ${
      modoOscuro
        ? `
          bg-black
          border-zinc-700
          text-zinc-400
        `
        : `
          bg-white
          border-gray-300
          text-gray-600
        `
    }

    border

    hover:text-[#d6ab4c]
    hover:border-[#c89b3c]/60

    rounded-xl

    flex
    items-center
    justify-center

    transition-all
    duration-200
  `;


export default Home;