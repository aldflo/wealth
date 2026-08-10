export default function ChatHistory({
  conversations = [],
  currentId,
  onSelect,
  onNew,
  onDelete,
}) {
  return (
    <aside
      className="
        hidden
        lg:flex
        w-64
        xl:w-72
        shrink-0
        flex-col

        bg-[#070707]

        border-r
        border-[#c89b3c]/15
      "
    >
      {/* NUEVA CONVERSACIÓN */}

      <div className="p-4 border-b border-zinc-900">

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
          className="
            px-2
            mb-3

            text-[10px]
            uppercase
            tracking-[0.2em]

            text-zinc-600
            font-semibold
          "
        >
          Historial
        </p>

        {conversations.length === 0 ? (

          <div className="px-2 py-6 text-center">

            <p className="text-sm text-zinc-600">
              Aún no tienes conversaciones guardadas.
            </p>

          </div>

        ) : (

          <div className="space-y-1">

            {conversations.map((conversation) => (

              <div
                key={conversation.id}
                className={`
                  group
                  flex
                  items-center

                  rounded-xl

                  border

                  ${
                    currentId === conversation.id
                      ? "bg-[#c89b3c]/10 border-[#c89b3c]/30"
                      : "border-transparent hover:bg-zinc-900"
                  }

                  transition
                `}
              >

                <button
                  type="button"
                  onClick={() =>
                    onSelect(conversation)
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
                        currentId === conversation.id
                          ? "text-[#d6ab4c]"
                          : "text-zinc-400"
                      }
                    `}
                  >
                    {conversation.titulo ||
                      "Conversación"}
                  </p>

                  {conversation.updatedAt && (
                    <p className="text-[10px] text-zinc-700 mt-1">

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
                  className="
                    opacity-0
                    group-hover:opacity-100

                    mr-2

                    w-8
                    h-8

                    rounded-lg

                    text-zinc-600
                    hover:text-red-400
                    hover:bg-red-500/10

                    transition
                  "
                  title="Eliminar conversación"
                >
                  ×
                </button>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* FOOTER */}

      <div className="p-4 border-t border-zinc-900">

        <p className="text-[10px] leading-relaxed text-zinc-700">
          Tus conversaciones están asociadas a tu cuenta.
        </p>

      </div>

    </aside>
  );
}