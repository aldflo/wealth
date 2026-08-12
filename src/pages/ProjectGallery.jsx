import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  auth,
} from "../firebase.config";

export default function ProjectGallery({
  projects = [],
}) {
  const navigate =
    useNavigate();

  const {
    modoOscuro,
  } = useOutletContext() || {};

  if (
    !projects.length
  ) {
    return null;
  }

  /* =========================================
     VER
  ========================================= */

  const verElemento = (
    project
  ) => {
    if (
      project.type ===
      "proyecto"
    ) {
      navigate(
        project.route ||
          `/proyecto/${project.id}`
      );

      return;
    }

    navigate(
      "/galeria",
      {
        state: {
          categoria:
            project.categoria ||
            "",

          subcategoria:
            project.subcategoria ||
            project.title ||
            "",
        },
      }
    );
  };

  /* =========================================
     IR A COTIZACIÓN
     SIN SESIÓN -> LOGIN
     CON SESIÓN -> CREAR COTIZACIÓN
  ========================================= */

  const irACotizacion = (
    state = {}
  ) => {
    const usuario =
      auth.currentUser;

    if (!usuario) {
      navigate(
        "/login",
        {
          state: {
            desdeIA: true,

            redirectTo:
              "/crear-cotizacion",

            ...state,
          },
        }
      );

      return;
    }

    navigate(
      "/crear-cotizacion",
      {
        state: {
          desdeIA: true,

          ...state,
        },
      }
    );
  };

  /* =========================================
     COTIZAR REFERENCIA
  ========================================= */

  const cotizarElemento = (
    project
  ) => {
    irACotizacion({
      proyecto: {
        id:
          project.id,

        nombre:
          project.title ||
          "Referencia Wealth",

        descripcion:
          project.descripcion ||
          `Me interesa un trabajo similar a "${project.title}".`,

        categoria:
          project.categoria ||
          "",

        subcategoria:
          project.subcategoria ||
          "",

        imagen:
          project.img ||
          "",

        imagenes:
          project.img
            ? [
                project.img,
              ]
            : [],
      },
    });
  };

  const contieneProyecto =
    projects.some(
      (item) =>
        item.type ===
        "proyecto"
    );

  return (
    <div className="mt-5">

      {/* HEADER */}

      <div className="mb-3">

        <p className="text-[11px] uppercase tracking-[0.18em] text-[#c89b3c] font-bold">
          {contieneProyecto
            ? "Proyectos Wealth"
            : "Galería Wealth"}
        </p>

        <h3
          className={`
            text-lg
            font-bold
            mt-1

            ${
              modoOscuro
                ? "text-white"
                : "text-gray-900"
            }
          `}
        >
          {contieneProyecto
            ? "Proyectos relacionados"
            : "Diseños disponibles"}
        </h3>

        <p
          className={`
            text-xs
            mt-1

            ${
              modoOscuro
                ? "text-zinc-500"
                : "text-gray-500"
            }
          `}
        >
          {contieneProyecto
            ? "Proyectos reales publicados por Wealth."
            : "Referencias reales disponibles en nuestra galería."}
        </p>

      </div>

      {/* GRID */}

      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-3
          xl:grid-cols-4
          gap-3
        "
      >
        {projects.map(
          (
            project,
            index
          ) => (
            <article
              key={
                project.id ||
                index
              }
              className={`
                group
                overflow-hidden
                rounded-2xl
                border
                hover:border-[#c89b3c]/60
                transition

                ${
                  modoOscuro
                    ? `
                      bg-[#151517]
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

              {/* FOTO */}

              <button
                type="button"
                onClick={() =>
                  verElemento(
                    project
                  )
                }
                className={`
                  w-full
                  aspect-[4/3]
                  overflow-hidden

                  ${
                    modoOscuro
                      ? "bg-zinc-900"
                      : "bg-gray-100"
                  }
                `}
              >
                {project.img ? (
                  <img
                    src={
                      project.img
                    }
                    alt={
                      project.title ||
                      "Wealth"
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
                ) : (
                  <div
                    className={`
                      w-full
                      h-full
                      flex
                      items-center
                      justify-center
                      text-sm

                      ${
                        modoOscuro
                          ? "text-zinc-600"
                          : "text-gray-400"
                      }
                    `}
                  >
                    Sin imagen
                  </div>
                )}
              </button>

              {/* INFO */}

              <div className="p-3">

                <h4
                  className={`
                    font-bold
                    text-sm
                    sm:text-base
                    line-clamp-2

                    ${
                      modoOscuro
                        ? "text-white"
                        : "text-gray-900"
                    }
                  `}
                >
                  {project.title}
                </h4>

                {project.descripcion && (
                  <p
                    className={`
                      text-xs
                      mt-1
                      line-clamp-2

                      ${
                        modoOscuro
                          ? "text-zinc-500"
                          : "text-gray-500"
                      }
                    `}
                  >
                    {project.descripcion}
                  </p>
                )}

                {project.ubicacion && (
                  <p
                    className={`
                      text-[11px]
                      mt-2

                      ${
                        modoOscuro
                          ? "text-zinc-600"
                          : "text-gray-400"
                      }
                    `}
                  >
                    📍 {project.ubicacion}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 mt-3">

                  <button
                    type="button"
                    onClick={() =>
                      verElemento(
                        project
                      )
                    }
                    className={`
                      py-2
                      rounded-xl
                      border
                      text-sm
                      transition
                      hover:border-[#c89b3c]

                      ${
                        modoOscuro
                          ? `
                            border-zinc-700
                            text-zinc-300
                          `
                          : `
                            border-gray-300
                            text-gray-700
                            hover:bg-gray-50
                          `
                      }
                    `}
                  >
                    Ver
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      cotizarElemento(
                        project
                      )
                    }
                    className="
                      py-2
                      rounded-xl
                      border
                      border-[#c89b3c]/50
                      text-sm
                      text-[#d6ab4c]
                      hover:bg-[#c89b3c]/10
                      transition
                    "
                  >
                    Cotizar
                  </button>

                </div>

              </div>

            </article>
          )
        )}
      </div>

      {/* COTIZACIÓN SIN REFERENCIA */}

      <div
        className={`
          mt-4
          p-4
          rounded-2xl
          border
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-3

          ${
            modoOscuro
              ? `
                border-zinc-800
                bg-[#0d0d0f]
              `
              : `
                border-gray-200
                bg-white
                shadow-sm
              `
          }
        `}
      >

        <div>
          <p
            className={`
              text-sm
              font-semibold

              ${
                modoOscuro
                  ? "text-white"
                  : "text-gray-900"
              }
            `}
          >
            ¿Buscas algo diferente?
          </p>

          <p
            className={`
              text-xs
              mt-1

              ${
                modoOscuro
                  ? "text-zinc-500"
                  : "text-gray-500"
              }
            `}
          >
            Puedes solicitar un diseño completamente personalizado.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            irACotizacion()
          }
          className="
            shrink-0
            px-4
            py-2.5
            rounded-xl
            border
            border-[#c89b3c]/60
            text-[#d6ab4c]
            text-sm
            font-semibold
            hover:bg-[#c89b3c]/10
            transition
          "
        >
          📋 Crear otra cotización
        </button>

      </div>

    </div>
  );
}