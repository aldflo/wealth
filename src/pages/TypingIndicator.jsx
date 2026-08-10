export default function TypingIndicator() {
  return (
    <div
      className="
        flex
        items-start
        gap-3

        px-4
        sm:px-6

        mt-5
      "
    >

      <div
        className="
          w-8
          h-8

          rounded-xl

          flex
          items-center
          justify-center

          bg-gradient-to-br
          from-[#d8ae50]
          to-[#966d21]

          text-black
          font-black
          text-xs
        "
      >
        W
      </div>

      <div>

        <div
          className="
            text-[11px]
            text-[#c89b3c]
            font-semibold
            mb-1.5
          "
        >
          WEALTH IA
        </div>

        <div
          className="
            flex
            items-center
            gap-1.5

            px-4
            py-4

            rounded-2xl
            rounded-tl-md

            bg-[#151517]

            border
            border-zinc-800
          "
        >

          <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" />

          <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />

          <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />

        </div>

      </div>

    </div>
  );
}