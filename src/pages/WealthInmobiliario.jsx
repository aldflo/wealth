import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import {
  FaBuilding,
  FaMapMarkerAlt,
  FaArrowRight,
  FaFileInvoiceDollar,
  FaDraftingCompass,
  FaProjectDiagram,
  FaClipboardCheck,
  FaWater,
  FaTools,
  FaStar,
  FaImages,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import { db } from "../firebase.config";

import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

function WealthInmobiliario() {
  const navigate = useNavigate();

  const { modoOscuro } = useOutletContext() || {};

  const [proyectos, setProyectos] = useState([]);
  const [indiceInicio, setIndiceInicio] = useState(0);

  const PROYECTOS_VISIBLES = 3;
  const TIEMPO_ROTACION = 8000;

  // ======================================================
  // SERVICIOS
  // ======================================================

  const servicios = [
    {
      icon: <FaDraftingCompass size={28} />,
      titulo: "Ingeniería y Arquitectura",
      descripcion: [
        "Diseño de proyectos ejecutivos",
        "Análisis estructural",
        "Modelados 3D y renderizados",
        "Supervisión y consultoría profesional",
      ],
    },

    {
      icon: <FaProjectDiagram size={28} />,
      titulo: "Gestión y Desarrollo de Proyectos",
      descripcion: [
        "Planeación de proyectos",
        "Administración de obra",
        "Control y seguimiento técnico",
      ],
    },

    {
      icon: <FaClipboardCheck size={28} />,
      titulo: "Supervisión de Obra",
      descripcion: [
        "Inspección técnica",
        "Control de calidad",
        "Seguimiento de ejecución",
      ],
    },

    {
      icon: <FaWater size={28} />,
      titulo: "Diseño de Infraestructura Hidráulica",
      descripcion: [
        "Sistemas de agua potable",
        "Drenaje sanitario y pluvial",
        "Sistemas de riego",
      ],
    },

    {
      icon: <FaTools size={28} />,
      titulo: "Consultoría Técnica",
      descripcion: [
        "Asesoría en ingeniería",
        "Evaluación de proyectos",
        "Soporte técnico especializado",
      ],
    },
  ];

  // ======================================================
  // FIRESTORE
  // ======================================================

  useEffect(() => {
    const q = query(
      collection(db, "proyectos"),
      where("categoria", "==", "Inmobiliaria")
    );

    const unsub = onSnapshot(
      q,

      (snapshot) => {
        const lista = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        lista.sort((a, b) => {
          if (Boolean(a.destacado) !== Boolean(b.destacado)) {
            return b.destacado ? 1 : -1;
          }

          const fechaA =
            a.fechaActualizacion?.toMillis?.() ||
            a.fecha?.toMillis?.() ||
            0;

          const fechaB =
            b.fechaActualizacion?.toMillis?.() ||
            b.fecha?.toMillis?.() ||
            0;

          return fechaB - fechaA;
        });

        setProyectos(lista);

        setIndiceInicio((actual) => {
          if (actual >= lista.length) {
            return 0;
          }

          return actual;
        });
      },

      (error) => {
        console.error(
          "Error cargando proyectos inmobiliarios:",
          error
        );
      }
    );

    return () => unsub();
  }, []);

  // ======================================================
  // PAGINACIÓN / ROTACIÓN
  // ======================================================

  const totalPaginas = Math.ceil(
    proyectos.length / PROYECTOS_VISIBLES
  );

  const paginaActual = Math.floor(
    indiceInicio / PROYECTOS_VISIBLES
  );

  useEffect(() => {
    if (proyectos.length <= PROYECTOS_VISIBLES) {
      return;
    }

    const intervalo = setInterval(() => {
      setIndiceInicio((actual) => {
        const siguiente =
          actual + PROYECTOS_VISIBLES;

        if (siguiente >= proyectos.length) {
          return 0;
        }

        return siguiente;
      });
    }, TIEMPO_ROTACION);

    return () => clearInterval(intervalo);
  }, [proyectos]);

  // ======================================================
  // PROYECTOS VISIBLES
  // ======================================================

  const proyectosVisibles = useMemo(() => {
    if (proyectos.length <= PROYECTOS_VISIBLES) {
      return proyectos;
    }

    let visibles = proyectos.slice(
      indiceInicio,
      indiceInicio + PROYECTOS_VISIBLES
    );

    if (visibles.length < PROYECTOS_VISIBLES) {
      visibles = [
        ...visibles,
        ...proyectos.slice(
          0,
          PROYECTOS_VISIBLES - visibles.length
        ),
      ];
    }

    return visibles;
  }, [proyectos, indiceInicio]);

  // ======================================================
  // ANTERIOR
  // ======================================================

  const proyectosAnteriores = () => {
    if (proyectos.length <= PROYECTOS_VISIBLES) {
      return;
    }

    setIndiceInicio((actual) => {
      const anterior =
        actual - PROYECTOS_VISIBLES;

      if (anterior < 0) {
        return (
          Math.max(totalPaginas - 1, 0) *
          PROYECTOS_VISIBLES
        );
      }

      return anterior;
    });
  };

  // ======================================================
  // SIGUIENTE
  // ======================================================

  const proyectosSiguientes = () => {
    if (proyectos.length <= PROYECTOS_VISIBLES) {
      return;
    }

    setIndiceInicio((actual) => {
      const siguiente =
        actual + PROYECTOS_VISIBLES;

      if (siguiente >= proyectos.length) {
        return 0;
      }

      return siguiente;
    });
  };

  // ======================================================
  // COTIZAR
  // ======================================================

  const solicitarCotizacion = (proyecto) => {
    navigate("/crear-cotizacion", {
      state: {
        proyecto: {
          id: proyecto.id,
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
          categoria: proyecto.categoria,
          imagen: proyecto.imagen,
          imagenes: proyecto.imagenes || [],
        },
      },
    });
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        modoOscuro
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="relative overflow-hidden border-b border-zinc-900">

        <div className="absolute inset-0 bg-gradient-to-r from-black via-zinc-950 to-black" />

        <div
          className="
            relative
            z-10
            max-w-7xl
            mx-auto
            px-5
            md:px-8
            lg:px-10
            py-12
            md:py-16
          "
        >

          <div className="max-w-5xl">

            <p className="text-yellow-500 uppercase tracking-[0.3em] text-xs font-semibold mb-3">
              Wealth Inmobiliario
            </p>

            <h1
              className="
                text-4xl
                sm:text-5xl
                md:text-6xl
                font-bold
                leading-[1.05]
                tracking-tight
                max-w-4xl
              "
            >
              Diseño, planeación{" "}

              <span className="text-yellow-500">
                y desarrollo de proyectos.
              </span>
            </h1>

            <p className="text-zinc-300 text-base md:text-lg leading-relaxed max-w-3xl mt-4">
              Especialistas en ingeniería, arquitectura y gestión de
              proyectos de infraestructura, enfocados en soluciones
              técnicas, diseño profesional y desarrollo integral.
            </p>

            {/* BOTONES HERO */}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">

              <button
                type="button"
                onClick={() =>
                  navigate("/crear-cotizacion")
                }
                className={`
                  ${botonBase(modoOscuro)}
                  border-yellow-500/50
                  text-yellow-400
                  hover:border-yellow-500
                  hover:bg-yellow-500/10
                `}
              >
                <FaFileInvoiceDollar />

                Solicitar cotización

                <FaArrowRight />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/proyectos")
                }
                className={`
                  ${botonBase(modoOscuro)}
                  ${modoOscuro ? "border-zinc-600 text-zinc-300" : "border-gray-300 text-gray-700"}
                  hover:border-yellow-500/60
                  hover:text-yellow-400
                `}
              >
                <FaImages />

                Ver proyectos
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* ================================================= */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ================================================= */}

      <main className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">

        {/* ================================================= */}
        {/* SERVICIOS */}
        {/* ================================================= */}

        <section className="pt-10 pb-8">

          <div className="mb-6">

            <p className="text-xs uppercase tracking-[0.25em] text-yellow-500 font-semibold">
              Servicios especializados
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Ingeniería y Desarrollo Inmobiliario
            </h2>

            <p className={`mt-2 max-w-2xl ${modoOscuro ? "text-zinc-500" : "text-gray-600"}`}>
              Soluciones profesionales para diseñar, planear,
              supervisar y desarrollar proyectos.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            {servicios.map((servicio, index) => (
              <article
                key={index}
                className={`
                  group
                  border
                  hover:border-yellow-500/50
                  rounded-2xl
                  p-5
                  transition-all
                  duration-300
                  hover:-translate-y-[2px]
                  ${
                    modoOscuro
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-white border-gray-200 shadow-sm"
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
                      bg-yellow-500/10
                      border
                      border-yellow-500/20
                      text-yellow-500
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {servicio.icon}
                  </div>

                  <div>

                    <h3 className="text-lg md:text-xl font-bold leading-tight">
                      {servicio.titulo}
                    </h3>

                  </div>

                </div>

                <div className="mt-4 space-y-1.5">

                  {servicio.descripcion.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 text-sm ${modoOscuro ? "text-zinc-400" : "text-gray-600"}`}
                    >

                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0" />

                      <span>
                        {item}
                      </span>

                    </div>
                  ))}

                </div>

              </article>
            ))}

          </div>

        </section>

        {/* ================================================= */}
        {/* DIVISIÓN */}
        {/* ================================================= */}

        <div className={`border-t ${modoOscuro ? "border-zinc-900" : "border-gray-200"}`} />

        {/* ================================================= */}
        {/* PROYECTOS */}
        {/* ================================================= */}

        <section className="py-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">

            <div>

              <p className="text-xs uppercase tracking-[0.25em] text-yellow-500 font-semibold">
                Nuestro trabajo
              </p>

              <h2 className="text-3xl md:text-4xl font-bold mt-2">
                Proyectos Inmobiliarios
              </h2>

              <p className={modoOscuro ? "text-zinc-500 mt-2" : "text-gray-600 mt-2"}>
                Conoce algunos de nuestros proyectos de ingeniería,
                arquitectura y desarrollo.
              </p>

            </div>

            <div className="flex flex-wrap items-center gap-2">

              {/* CONTADOR */}

              <div className={`border rounded-xl px-4 py-2.5 text-sm ${
                modoOscuro
                  ? "bg-zinc-950 border-zinc-800 text-zinc-400"
                  : "bg-white border-gray-200 text-gray-600 shadow-sm"
              }`}>

                <strong className={modoOscuro ? "text-white" : "text-gray-900"}>
                  {proyectos.length}
                </strong>{" "}

                {proyectos.length === 1
                  ? "proyecto"
                  : "proyectos"}

              </div>

              {/* ROTACIÓN */}

              {proyectos.length > PROYECTOS_VISIBLES && (
                <>
                  <button
                    type="button"
                    onClick={proyectosAnteriores}
                    aria-label="Proyectos anteriores"
                    className={botonCuadrado(modoOscuro)}
                  >
                    <FaChevronLeft />
                  </button>

                  <button
                    type="button"
                    onClick={proyectosSiguientes}
                    aria-label="Siguientes proyectos"
                    className={botonCuadrado(modoOscuro)}
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() =>
                  navigate("/proyectos")
                }
                className={`
                  ${botonBase(modoOscuro)}
                  ${modoOscuro ? "border-zinc-600 text-zinc-300" : "border-gray-300 text-gray-700"}
                  hover:border-yellow-500/60
                  hover:text-yellow-400
                `}
              >
                Ver todos

                <FaArrowRight />
              </button>

            </div>

          </div>

          {/* ================================================= */}
          {/* SIN PROYECTOS */}
          {/* ================================================= */}

          {proyectos.length === 0 ? (
            <div className={`border rounded-2xl py-10 text-center ${
              modoOscuro
                ? "bg-zinc-950 border-zinc-800"
                : "bg-white border-gray-200 shadow-sm"
            }`}>

              <FaBuilding className="text-zinc-700 text-4xl mx-auto" />

              <h3 className="font-bold text-lg mt-4">
                Próximamente nuevos proyectos
              </h3>

              <p className={`text-sm mt-1 ${modoOscuro ? "text-zinc-500" : "text-gray-500"}`}>
                Estamos preparando más proyectos para mostrarte.
              </p>

            </div>
          ) : (

            <div
              key={indiceInicio}
              className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-4
                animate-[fadeIn_.4s_ease]
              "
            >

              {proyectosVisibles.map((proyecto) => (
                <article
                  key={proyecto.id}
                  className={`
                    group
                    border
                    hover:border-yellow-500/50
                    rounded-2xl
                    overflow-hidden
                    transition-all
                    duration-300
                    hover:-translate-y-[2px]
                    ${
                      modoOscuro
                        ? "bg-zinc-950 border-zinc-800"
                        : "bg-white border-gray-200 shadow-sm"
                    }
                  `}
                >

                  {/* IMAGEN */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/proyecto/${proyecto.id}`
                      )
                    }
                    className="
                      relative
                      block
                      w-full
                      h-52
                      md:h-56
                      overflow-hidden
                      bg-zinc-900
                      text-left
                    "
                  >

                    {proyecto.imagen ? (
                      <img
                        src={proyecto.imagen}
                        alt={proyecto.nombre}
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
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">

                        <FaBuilding className="text-zinc-700 text-5xl" />

                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* BADGES */}

                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">

                      <span className="bg-black/80 backdrop-blur border border-white/10 px-2.5 py-1 rounded-full text-[11px]">

                        {proyecto.categoria || "Inmobiliaria"}

                      </span>

                      {proyecto.destacado && (
                        <span className="bg-yellow-500 text-black px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">

                          <FaStar size={10} />

                          Destacado

                        </span>
                      )}

                    </div>

                  </button>

                  {/* INFO */}

                  <div className="p-5">

                    <h3 className="text-xl font-bold line-clamp-2">
                      {proyecto.nombre}
                    </h3>

                    <p className={`text-sm mt-2 line-clamp-2 min-h-[40px] ${modoOscuro ? "text-zinc-400" : "text-gray-600"}`}>
                      {proyecto.descripcion}
                    </p>

                    <div className={`flex items-center gap-2 text-xs mt-4 ${modoOscuro ? "text-zinc-500" : "text-gray-500"}`}>

                      <FaMapMarkerAlt className="text-yellow-500 shrink-0" />

                      <span className="truncate">
                        {proyecto.ubicacion ||
                          "Campeche"}
                      </span>

                    </div>

                    {/* BOTONES */}

                    <div className="grid grid-cols-2 gap-2.5 mt-5">

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/proyecto/${proyecto.id}`
                          )
                        }
                        className={`
                          ${botonBaseCompacto(modoOscuro)}
                          border-zinc-600
                          text-zinc-300
                          hover:border-blue-500/60
                          hover:text-blue-400
                        `}
                      >
                        Ver

                        <FaArrowRight />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          solicitarCotizacion(proyecto)
                        }
                        className={`
                          ${botonBaseCompacto(modoOscuro)}
                          border-yellow-500/50
                          text-yellow-400
                          hover:border-yellow-500
                          hover:bg-yellow-500/10
                        `}
                      >
                        <FaFileInvoiceDollar />

                        Cotizar
                      </button>

                    </div>

                  </div>

                </article>
              ))}

            </div>
          )}

          {/* ================================================= */}
          {/* PUNTOS DE ROTACIÓN */}
          {/* ================================================= */}

          {proyectos.length > PROYECTOS_VISIBLES && (
            <div className="flex items-center justify-center gap-2 mt-6">

              {Array.from({
                length: totalPaginas,
              }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    setIndiceInicio(
                      index *
                        PROYECTOS_VISIBLES
                    )
                  }
                  aria-label={`Mostrar grupo ${
                    index + 1
                  }`}
                  className={`
                    h-2
                    rounded-full
                    transition-all
                    duration-300

                    ${
                      paginaActual === index
                        ? "w-7 bg-yellow-500"
                        : "w-2 bg-zinc-700 hover:bg-zinc-500"
                    }
                  `}
                />
              ))}

            </div>
          )}

        </section>

        {/* ================================================= */}
        {/* CTA COMPACTO */}
        {/* ================================================= */}

        <section className="pb-10">

          <div
            className={`
              border
              rounded-2xl
              p-5
              md:p-6
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-4
              ${
                modoOscuro
                  ? "border-zinc-800 bg-zinc-950"
                  : "border-gray-200 bg-white shadow-sm"
              }
            `}
          >

            <div>

              <h2 className="text-xl md:text-2xl font-bold">
                ¿Tienes un proyecto en mente?
              </h2>

              <p className={`text-sm mt-1 ${modoOscuro ? "text-zinc-500" : "text-gray-500"}`}>
                Cuéntanos tu idea y prepararemos una propuesta para desarrollarla.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/crear-cotizacion")
              }
              className={`
                ${botonBase(modoOscuro)}
                border-yellow-500/50
                text-yellow-400
                hover:border-yellow-500
                hover:bg-yellow-500/10
                shrink-0
              `}
            >
              <FaFileInvoiceDollar />

              Solicitar cotización

              <FaArrowRight />
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

// ======================================================
// BOTONES
// ======================================================

const botonBase = (modoOscuro) => `
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
  ${
    modoOscuro ? "bg-black" : "bg-white"
  }
`;

const botonBaseCompacto = (modoOscuro) => `
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
  ${
    modoOscuro ? "bg-black" : "bg-white"
  }
`;

const botonCuadrado = (modoOscuro) => `
  w-10
  h-10
  border
  hover:text-yellow-400
  hover:border-yellow-500/60
  rounded-xl
  flex
  items-center
  justify-center
  transition-all
  duration-200
  ${
    modoOscuro
      ? "bg-black border-zinc-700 text-zinc-400"
      : "bg-white border-gray-300 text-gray-600"
  }
`;

export default WealthInmobiliario;