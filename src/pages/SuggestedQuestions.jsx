export default function SuggestedQuestions({
  onSelect,
  loading,
  modoOscuro,
}) {
  const suggestions = [
    "🏗️ Construcción",
    "📍 Ubicación",
    "💬 Contacto",
    "📋 Cotizar",
    "🖼️ Galería",
    "🏢 Proyectos",
  ];

  const messages = {
    "🏗️ Construcción":
      "Quiero información sobre construcción",

    "📍 Ubicación":
      "¿Dónde están ubicados?",

    "💬 Contacto":
      "¿Cómo puedo contactar a Wealth?",

    "📋 Cotizar":
      "Quiero solicitar una cotización",

    "🖼️ Galería":
      "Muéstrame la galería de imágenes",

    "🏢 Proyectos":
      "Muéstrame proyectos realizados por Wealth",
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
      {suggestions.map((item) => (
        <button
          key={item}
          type="button"
          disabled={loading}
          onClick={() =>
            onSelect(messages[item])
          }
          className={`
            shrink-0
            px-3.5
            py-2
            rounded-full
            text-xs
            sm:text-sm
            border
            disabled:opacity-40
            transition-all
            duration-200

            ${
              modoOscuro
                ? `
                  text-zinc-300
                  bg-zinc-900
                  border-zinc-800
                  hover:border-[#c89b3c]/70
                  hover:text-[#d7ae50]
                  hover:bg-[#c89b3c]/5
                `
                : `
                  text-gray-700
                  bg-white
                  border-gray-200
                  shadow-sm
                  hover:border-[#c89b3c]/70
                  hover:text-[#9b7429]
                  hover:bg-[#c89b3c]/5
                `
            }
          `}
        >
          {item}
        </button>
      ))}
    </div>
  );
}