import {
  useNavigate,
} from "react-router-dom";

export default function ProjectGallery({
  projects = [],
}) {
  const navigate =
    useNavigate();

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
     COTIZAR REFERENCIA
  ========================================= */

  const cotizarElemento = (
    project
  ) => {
    navigate(
      "/crear-cotizacion",
      {
        state: {
          desdeIA: true,

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
        },
      }
    );
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

        <h3 className="text-lg font-bold text-white mt-1">

          {contieneProyecto
            ? "Proyectos relacionados"
            : "Diseños disponibles"}

        </h3>

        <p className="text-xs text-zinc-500 mt-1">

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
              className="
                group
                overflow-hidden
                rounded-2xl
                bg-[#151517]
                border
                border-zinc-800
                hover:border-[#c89b3c]/60
                transition
              "
            >

              {/* FOTO */}

              <button
                type="button"
                onClick={() =>
                  verElemento(
                    project
                  )
                }
                className="w-full aspect-[4/3] bg-zinc-900 overflow-hidden"
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
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
                    Sin imagen
                  </div>
                )}

              </button>

              {/* INFO */}

              <div className="p-3">

                <h4 className="font-bold text-white text-sm sm:text-base line-clamp-2">
                  {project.title}
                </h4>

                {project.descripcion && (
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                    {
                      project.descripcion
                    }
                  </p>
                )}

                {project.ubicacion && (
                  <p className="text-[11px] text-zinc-600 mt-2">
                    📍{" "}
                    {
                      project.ubicacion
                    }
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
                    className="
                      py-2
                      rounded-xl
                      border
                      border-zinc-700
                      text-sm
                      text-zinc-300
                      hover:border-[#c89b3c]
                      transition
                    "
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
        className="
          mt-4
          p-4
          rounded-2xl
          border
          border-zinc-800
          bg-[#0d0d0f]
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-3
        "
      >

        <div>
          <p className="text-sm font-semibold text-white">
            ¿Buscas algo diferente?
          </p>

          <p className="text-xs text-zinc-500 mt-1">
            Puedes solicitar un diseño completamente personalizado.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/crear-cotizacion",
              {
                state: {
                  desdeIA:
                    true,
                },
              }
            )
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