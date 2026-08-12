import {
  useOutletContext,
} from "react-router-dom";

export default function ProjectCard({
  project,
}) {
  const {
    modoOscuro,
  } = useOutletContext() || {};

  return (
    <div
      className={`
        min-w-[180px]
        border
        border-[#c89b3c]/20
        rounded-xl
        overflow-hidden
        shadow-lg
        hover:border-[#c89b3c]/60
        transition
        duration-300

        ${
          modoOscuro
            ? "bg-zinc-900"
            : "bg-white border-gray-200 shadow-md"
        }
      `}
    >
      <img
        src={project.img}
        className="h-24 w-full object-cover"
        alt={project.title}
      />

      <div className="p-2">
        <p
          className={`
            text-sm
            font-semibold

            ${
              modoOscuro
                ? "text-white"
                : "text-gray-900"
            }
          `}
        >
          {project.title}
        </p>

        <button
          type="button"
          className="
            text-xs
            text-[#c89b3c]
            mt-1
            hover:text-[#e0b84d]
            transition
          "
        >
          Ver más
        </button>
      </div>
    </div>
  );
}