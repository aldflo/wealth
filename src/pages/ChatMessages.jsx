export default function ChatMessages({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0a]">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-lg backdrop-blur-md border ${
            msg.role === "user"
              ? "ml-auto bg-[#c89b3c] text-black border-[#e0b84d]"
              : "mr-auto bg-zinc-900 text-white border-zinc-700"
          }`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
}