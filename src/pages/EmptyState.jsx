export default function EmptyState({ onSelect }) {
  const options = [
    "Quiero un diseño moderno",
    "Cancel de vidrio para casa",
    "Ideas de fachadas",
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#0a0a0a]">
      <h2 className="text-xl font-bold text-[#c89b3c] tracking-wide">
        WEALTH IA
      </h2>

      <p className="text-zinc-400 mt-2">
        Describe tu proyecto y te ayudaré a diseñarlo
      </p>

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {options.map((o, i) => (
          <button
            key={i}
            onClick={() => onSelect(o)}
            className="text-xs bg-zinc-900 border border-[#c89b3c]/30 text-white px-3 py-1 rounded-full hover:bg-[#c89b3c] hover:text-black transition duration-300"
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}