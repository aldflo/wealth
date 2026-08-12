export default function ChatHistory({
  conversations = [],
  currentId,
  onSelect,
  onNew,
  onDelete,
  modoOscuro,
}) {
  return (
    <aside
      className={`
        hidden
        lg:flex

        w-64
        xl:w-72

        shrink-0
        flex-col

        border-r
        border-[#c89b3c]/15

        transition-colors
        duration-300

        ${
          modoOscuro
            ? "bg-[#070707]"
            : "bg-gray-50"
        }
      `}
    >
      {/* NUEVA CONVERSACIÓN */}

      <div
        className={`
          p-4
          border-b

          ${
            modoOscuro
              ? "border-zinc-900"
              : "border-gray-200"
          }
        `}
      >
        <button
          type="button"
          onClick={onNew}
          className="
            w-full

            px-4
            py-3

            rounded-xl

            bg-[#c89b3c]
            hover:bg-[#d5aa48]

            text-black
            font-bold
            text-sm

            transition
          "
        >
          + Nueva conversación
        </button>
      </div>

      {/* HISTORIAL */}

      <div className="flex-1 overflow-y-auto p-3">
        <p
          className={`
            px-2
            mb-3

            text-[10px]
            uppercase
            tracking-[0.2em]

            font-semibold

            ${
              modoOscuro
                ? "text-zinc-600"
                : "text-gray-500"
            }
          `}
        >
          Historial
        </p>

        {conversations.length === 0 ? (
          <div className="px-2 py-6 text-center">
            <p
              className={`
                text-sm

                ${
                  modoOscuro
                    ? "text-zinc-600"
                    : "text-gray-500"
                }
              `}
            >
              Aún no tienes conversaciones guardadas.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map(
              (conversation) => (
                <div
                  key={
                    conversation.id
                  }
                  className={`
                    group

                    flex
                    items-center

                    rounded-xl

                    border

                    transition

                    ${
                      currentId ===
                      conversation.id
                        ? "bg-[#c89b3c]/10 border-[#c89b3c]/30"
                        : modoOscuro
                        ? "border-transparent hover:bg-zinc-900"
                        : "border-transparent hover:bg-gray-100"
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() =>
                      onSelect(
                        conversation
                      )
                    }
                    className="
                      flex-1
                      min-w-0

                      text-left

                      px-3
                      py-3
                    "
                  >
                    <p
                      className={`
                        text-sm
                        truncate

                        ${
                          currentId ===
                          conversation.id
                            ? "text-[#d6ab4c]"
                            : modoOscuro
                            ? "text-zinc-400"
                            : "text-gray-700"
                        }
                      `}
                    >
                      {conversation.titulo ||
                        "Conversación"}
                    </p>

                    {conversation.updatedAt && (
                      <p
                        className={`
                          text-[10px]
                          mt-1

                          ${
                            modoOscuro
                              ? "text-zinc-700"
                              : "text-gray-400"
                          }
                        `}
                      >
                        {new Date(
                          conversation.updatedAt
                        ).toLocaleDateString(
                          "es-MX",
                          {
                            day: "2-digit",
                            month: "short",
                          }
                        )}
                      </p>
                    )}
                  </button>

                  {/* ELIMINAR */}

                  <button
                    type="button"
                    onClick={() =>
                      onDelete(
                        conversation.id
                      )
                    }
                    className={`
                      opacity-0
                      group-hover:opacity-100

                      mr-2

                      w-8
                      h-8

                      rounded-lg

                      hover:text-red-400
                      hover:bg-red-500/10

                      transition

                      ${
                        modoOscuro
                          ? "text-zinc-600"
                          : "text-gray-400"
                      }
                    `}
                    title="Eliminar conversación"
                  >
                    ×
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div
        className={`
          p-4
          border-t

          ${
            modoOscuro
              ? "border-zinc-900"
              : "border-gray-200"
          }
        `}
      >
        <p
          className={`
            text-[10px]
            leading-relaxed

            ${
              modoOscuro
                ? "text-zinc-700"
                : "text-gray-400"
            }
          `}
        >
          Tus conversaciones están asociadas a tu cuenta.
        </p>
      </div>
    </aside>
  );
}