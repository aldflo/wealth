import ProjectCard from "./ProjectCard";

export default function ProjectGallery({ projects }) {
  return (
    <div className="p-3 bg-[#0a0a0a] border-t border-[#c89b3c]/30">
      <h2 className="text-sm font-bold mb-2 text-[#c89b3c] tracking-wide">
        Proyectos recomendados
      </h2>

      <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-[#c89b3c]/40">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}