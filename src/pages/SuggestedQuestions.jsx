export default function SuggestedQuestions({
  onSelect,
  loading,
}) {
  const suggestions = [
    "🚿 Cancel moderno",
    "✨ Vidrio templado",
    "🏗️ Construcción",
    "📍 Ubicación",
    "💬 Contacto",
    "📋 Cotizar",
  ];

  const messages = {
    "🚿 Cancel moderno":
      "Quiero un cancel moderno para baño",

    "✨ Vidrio templado":
      "Quiero información sobre vidrio templado",

    "🏗️ Construcción":
      "Quiero información sobre construcción",

    "📍 Ubicación":
      "¿Dónde están ubicados?",

    "💬 Contacto":
      "¿Cómo puedo contactar a Wealth?",

    "📋 Cotizar":
      "Quiero solicitar una cotización",
  };

  return (
    <div
      className="
        flex
        items-center
        gap-2

        overflow-x-auto

        pb-1

        [&::-webkit-scrollbar]:hidden
      "
    >

      {suggestions.map(
        (item) => (
          <button
            key={item}

            disabled={loading}

            onClick={() =>
              onSelect(
                messages[item]
              )
            }

            className="
              shrink-0

              px-3.5
              py-2

              rounded-full

              text-xs
              sm:text-sm

              text-zinc-300

              bg-zinc-900

              border
              border-zinc-800

              hover:border-[#c89b3c]/70
              hover:text-[#d7ae50]
              hover:bg-[#c89b3c]/5

              disabled:opacity-40

              transition-all
              duration-200
            "
          >
            {item}
          </button>
        )
      )}

    </div>
  );
}