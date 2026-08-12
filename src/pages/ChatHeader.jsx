export default function ChatHeader({
  modoOscuro,
}) {
  return (
    <div
      className={`
        flex
        items-center
        justify-between

        px-5
        sm:px-7
        py-4

        backdrop-blur-xl

        border-b
        border-[#c89b3c]/20

        transition-colors
        duration-300

        ${
          modoOscuro
            ? "bg-black/80"
            : "bg-white/90"
        }
      `}
    >
      {/* IZQUIERDA */}

      <div className="flex items-center gap-3">
        {/* ICONO */}

        <div
          className="
            w-11
            h-11
            rounded-2xl

            flex
            items-center
            justify-center

            bg-gradient-to-br
            from-[#d7ae50]
            to-[#9c7427]

            text-black
            font-black
            text-lg

            shadow-lg
          "
        >
          W
        </div>

        {/* TEXTO */}

        <div>
          <div className="flex items-center gap-2">
            <h1
              className="
                text-lg
                sm:text-xl
                font-bold
                text-[#d7ae50]
                tracking-wide
              "
            >
              WEALTH IA
            </h1>

            <span
              className="
                hidden
                sm:inline-flex

                text-[10px]

                px-2
                py-0.5

                rounded-full

                border
                border-[#c89b3c]/30

                text-[#c89b3c]
                bg-[#c89b3c]/5
              "
            >
              ASISTENTE
            </span>
          </div>

          <p
            className={`
              text-xs
              sm:text-sm
              mt-0.5

              ${
                modoOscuro
                  ? "text-zinc-500"
                  : "text-gray-500"
              }
            `}
          >
            Construcción · Vidrio · Aluminio · Inmobiliaria
          </p>
        </div>
      </div>

      {/* ESTADO */}

      <div
        className={`
          flex
          items-center
          gap-2

          border
          rounded-full

          px-3
          py-2

          transition-colors
          duration-300

          ${
            modoOscuro
              ? "bg-zinc-900/80 border-zinc-800"
              : "bg-gray-100 border-gray-200"
          }
        `}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="
              absolute
              inline-flex
              h-full
              w-full
              animate-ping
              rounded-full
              bg-emerald-400
              opacity-60
            "
          />

          <span
            className="
              relative
              inline-flex
              h-2.5
              w-2.5
              rounded-full
              bg-emerald-500
            "
          />
        </span>

        <span
          className={`
            text-xs
            sm:text-sm

            ${
              modoOscuro
                ? "text-zinc-300"
                : "text-gray-700"
            }
          `}
        >
          En línea
        </span>
      </div>
    </div>
  );
}