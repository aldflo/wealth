export default function EmptyState({
  onSelect,
  modoOscuro,
}) {
  const options = [
    {
      icon: "🚿",
      title: "Canceles modernos",
      text: "Quiero un cancel moderno para baño",
    },
    {
      icon: "✨",
      title: "Vidrio templado",
      text: "Muéstrame opciones de vidrio templado",
    },
    {
      icon: "🏗️",
      title: "Construcción",
      text: "Quiero información sobre construcción",
    },
    {
      icon: "📍",
      title: "Ubicación",
      text: "¿Dónde están ubicados?",
    },
  ];

  return (
    <div
      className={`
        h-full
        min-h-[500px]

        flex
        flex-col
        items-center
        justify-center

        px-5
        py-12

        transition-colors
        duration-300

        ${
          modoOscuro
            ? "text-white"
            : "text-gray-900"
        }
      `}
    >
      {/* LOGO */}

      <div
        className="
          w-16
          h-16

          rounded-[22px]

          flex
          items-center
          justify-center

          bg-gradient-to-br
          from-[#d8ae50]
          to-[#966d21]

          text-black
          text-2xl
          font-black

          shadow-[0_15px_40px_rgba(200,155,60,0.18)]

          mb-6
        "
      >
        W
      </div>

      {/* TITULO */}

      <h2
        className={`
          text-3xl
          sm:text-4xl

          font-bold

          tracking-tight

          text-center

          transition-colors
          duration-300

          ${
            modoOscuro
              ? "text-white"
              : "text-gray-900"
          }
        `}
      >
        ¿En qué podemos ayudarte?
      </h2>

      <p
        className={`
          text-sm
          sm:text-base

          text-center

          max-w-xl

          mt-3

          transition-colors
          duration-300

          ${
            modoOscuro
              ? "text-zinc-500"
              : "text-gray-500"
          }
        `}
      >
        Consulta nuestros servicios, proyectos, canceles,
        aluminio, vidrio templado, construcción y opciones
        de cotización.
      </p>

      {/* OPCIONES */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2

          gap-3

          w-full
          max-w-2xl

          mt-8
        "
      >
        {options.map(
          (item, index) => (
            <button
              key={index}
              type="button"
              onClick={() =>
                onSelect(
                  item.text
                )
              }
              className={`
                group

                flex
                items-center
                gap-4

                text-left

                p-4

                rounded-2xl

                border

                hover:border-[#c89b3c]/60
                hover:bg-[#c89b3c]/5

                transition-all
                duration-200

                ${
                  modoOscuro
                    ? `
                      bg-zinc-900/60
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
              <div
                className={`
                  w-11
                  h-11

                  rounded-xl

                  flex
                  items-center
                  justify-center

                  border

                  text-xl

                  group-hover:border-[#c89b3c]/50

                  transition

                  ${
                    modoOscuro
                      ? `
                        bg-black
                        border-zinc-800
                      `
                      : `
                        bg-gray-50
                        border-gray-200
                      `
                  }
                `}
              >
                {item.icon}
              </div>

              <div>
                <p
                  className={`
                    text-sm
                    font-semibold

                    group-hover:text-[#d7ae50]

                    transition

                    ${
                      modoOscuro
                        ? "text-zinc-200"
                        : "text-gray-800"
                    }
                  `}
                >
                  {item.title}
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
                  Preguntar a WEALTH IA
                </p>
              </div>
            </button>
          )
        )}
      </div>

      {/* AVISO */}

      <p
        className={`
          mt-8
          text-[11px]
          text-center

          ${
            modoOscuro
              ? "text-zinc-600"
              : "text-gray-400"
          }
        `}
      >
        WEALTH IA puede ayudarte a explorar opciones antes de
        solicitar una cotización.
      </p>
    </div>
  );
}