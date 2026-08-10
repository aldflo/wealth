export default function ChatInput({
  value,
  setValue,
  onSend,
  loading,
  onCancel,
}) {
  /* =========================================
     ENTER PARA ENVIAR
  ========================================= */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (
        value.trim() &&
        !loading
      ) {
        onSend();
      }
    }
  };

  /* =========================================
     ENVIAR
  ========================================= */

  const handleSend = () => {
    if (
      !value.trim() ||
      loading
    ) {
      return;
    }

    onSend();
  };

  /* =========================================
     CANCELAR
  ========================================= */

  const handleCancel = () => {
    if (!loading) {
      return;
    }

    onCancel?.();
  };

  return (
    <div className="px-3 pb-3 sm:px-4 sm:pb-4">

      {/* =========================================
          INPUT
      ========================================= */}

      <div
        className="
          flex
          items-end
          gap-2

          bg-[#151517]

          border
          border-zinc-800

          rounded-2xl

          p-2

          focus-within:border-[#c89b3c]/60
          focus-within:ring-1
          focus-within:ring-[#c89b3c]/10

          shadow-[0_10px_40px_rgba(0,0,0,0.25)]

          transition
        "
      >

        <textarea
          rows={1}

          value={value}

          onChange={(event) =>
            setValue(
              event.target.value
            )
          }

          onKeyDown={
            handleKeyDown
          }

          placeholder={
            loading
              ? "WEALTH IA está preparando una respuesta..."
              : "Pregúntame sobre proyectos, canceles, vidrio, aluminio..."
          }

          disabled={loading}

          className="
            flex-1

            resize-none

            bg-transparent

            text-zinc-100

            placeholder:text-zinc-600

            text-sm
            sm:text-[15px]

            px-3
            py-2.5

            min-h-[45px]
            max-h-32

            outline-none

            disabled:opacity-50
          "
        />

        {/* =========================================
            BOTÓN
        ========================================= */}

        {loading ? (

          <button
            type="button"

            onClick={
              handleCancel
            }

            className="
              shrink-0

              h-11
              px-4
              sm:px-5

              rounded-xl

              flex
              items-center
              justify-center
              gap-2

              bg-red-500/10

              border
              border-red-500/40

              hover:bg-red-500/20
              hover:border-red-400/70

              text-red-400

              text-sm
              font-bold

              transition-all
              duration-200
            "
          >

            {/* CUADRADO STOP */}

            <span
              className="
                w-3
                h-3

                rounded-[2px]

                bg-red-400
              "
            />

            <span>
              Cancelar
            </span>

          </button>

        ) : (

          <button
            type="button"

            onClick={
              handleSend
            }

            disabled={
              !value.trim()
            }

            className="
              shrink-0

              h-11
              px-5

              rounded-xl

              flex
              items-center
              justify-center
              gap-2

              bg-gradient-to-br
              from-[#d8ae50]
              to-[#bd8b2e]

              hover:from-[#e0ba61]
              hover:to-[#c99a3d]

              text-black

              text-sm
              font-bold

              disabled:opacity-30
              disabled:cursor-not-allowed

              transition-all
              duration-200

              shadow-lg
            "
          >

            <span>
              Enviar
            </span>

            <span className="text-base">
              ↑
            </span>

          </button>

        )}

      </div>

      {/* =========================================
          AVISO
      ========================================= */}

      <div
        className="
          flex
          justify-center

          mt-2
        "
      >
        <p
          className="
            text-[10px]
            sm:text-[11px]

            text-zinc-700

            text-center
          "
        >
          WEALTH IA puede cometer errores. Confirma precios y
          especificaciones con un asesor.
        </p>
      </div>

    </div>
  );
}