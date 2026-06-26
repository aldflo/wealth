export default function ProjectCard({ project }) {
  return (
    <div className="min-w-[180px] bg-zinc-900 border border-[#c89b3c]/20 rounded-xl overflow-hidden shadow-lg hover:border-[#c89b3c]/60 transition duration-300">
      <img
        src={project.img}
        className="h-24 w-full object-cover"
        alt={project.title}
      />

      <div className="p-2">
        <p className="text-sm font-semibold text-white">
          {project.title}
        </p>

        <button className="text-xs text-[#c89b3c] mt-1 hover:text-[#e0b84d] transition">
          Ver más
        </button>
      </div>
    </div>
  );
}