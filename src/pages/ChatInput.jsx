export default function ChatInput({ value, setValue, onSend, loading }) {
  return (
    <div className="p-3 bg-[#0a0a0a] border-t border-[#c89b3c]/30 flex gap-2">
      <input
        className="flex-1 bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-[#c89b3c] placeholder:text-zinc-500"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escribe tu mensaje..."
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />

      <button
        onClick={onSend}
        disabled={loading}
        className="bg-[#c89b3c] hover:bg-[#d6ab4c] disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg transition duration-300"
      >
        Enviar
      </button>
    </div>
  );
}