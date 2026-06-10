import {
  FaBuilding,
  FaMapMarkerAlt,
} from "react-icons/fa";

function WealthVyA() {
  const servicios = [
    {
      icon: <FaBuilding size={40} />,
      titulo: "Vidrio Templado y Canceles",
      descripcion: [
        "Fabricación de vidrio templado",
        "Canceles de baño",
        "Espejos y vitrinas",
      ],
    },

    {
      icon: <FaBuilding size={40} />,
      titulo: "Ventanas y Puertas",
      descripcion: [
        "Ventanas de aluminio",
        "Puertas residenciales",
        "Puertas de baño y mosquiteras",
      ],
    },

    {
      icon: <FaBuilding size={40} />,
      titulo: "Domos y Cancelería Arquitectónica",
      descripcion: [
        "Domos de vidrio y aluminio",
        "Cancelería moderna",
        "Diseños arquitectónicos ligeros",
      ],
    },

    {
      icon: <FaBuilding size={40} />,
      titulo: "Barandales y Protecciones",
      descripcion: [
        "Barandales de vidrio y aluminio",
        "Protectores y rejas ligeras",
        "Seguridad estética",
      ],
    },

    {
      icon: <FaBuilding size={40} />,
      titulo: "Portones y Automatización",
      descripcion: [
        "Portones eléctricos",
        "Sistemas automáticos de apertura",
        "Estructuras residenciales",
      ],
    },

    {
      icon: <FaBuilding size={40} />,
      titulo: "Estructuras a Diseño",
      descripcion: [
        "Fabricación personalizada",
        "Diseños arquitectónicos",
        "Proyectos especiales en aluminio y vidrio",
      ],
    },
  ];

  const proyectos = [
    {
      cliente: "Residencial Privado",
      descripcion:
        "Instalación de cancelería de aluminio y vidrio templado en vivienda moderna.",
      ubicacion: "Campeche, México",
    },
    {
      cliente: "Edificio Comercial",
      descripcion:
        "Fabricación de ventanas de aluminio y fachadas de vidrio templado.",
      ubicacion: "Champotón, Campeche",
    },
    {
      cliente: "Proyecto Habitacional",
      descripcion:
        "Instalación de barandales de vidrio y portones automáticos.",
      ubicacion: "Carmen, Campeche",
    },
    {
      cliente: "Residencia Privada",
      descripcion:
        "Diseño e instalación de domos y cancelería arquitectónica moderna.",
      ubicacion: "Calakmul, Campeche",
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto bg-zinc-950/80 rounded-[40px] p-10">

        {/* HERO */}
        <section className="mb-12 text-center">
          <p className="text-yellow-500 uppercase tracking-[5px] mb-4 font-semibold">
            Wealth V&A
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Vidrio, aluminio{" "}
            <span className="text-yellow-500">
              y cancelería profesional
            </span>
          </h1>

          <p className="text-zinc-300 text-lg max-w-3xl mx-auto">
            Especialistas en fabricación e instalación de vidrio templado,
            aluminio arquitectónico y soluciones modernas para viviendas y
            proyectos comerciales.
          </p>
        </section>

        {/* SERVICIOS */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-yellow-500 mb-8 text-center">
            Servicios de Vidrio y Aluminio
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicios.map((servicio, index) => (
              <div
                key={index}
                className="bg-black/40 p-8 rounded-3xl border border-zinc-800 hover:border-yellow-500 transition"
              >
                <div className="text-yellow-500 mb-5">
                  {servicio.icon}
                </div>

                <h3 className="text-2xl font-bold mb-4">
                  {servicio.titulo}
                </h3>

                <div className="text-zinc-400 space-y-2">
                  {servicio.descripcion.map((item, i) => (
                    <p key={i} className="flex gap-2">
                      <span className="text-yellow-500">•</span>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROYECTOS */}
        <section>
          <h2 className="text-4xl font-bold text-yellow-500 mb-8 text-center">
            Proyectos Realizados
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {proyectos.map((proyecto, index) => (
              <div
                key={index}
                className="bg-black/40 p-8 rounded-3xl border border-zinc-800"
              >
                <h3 className="text-2xl font-bold text-yellow-500 mb-3">
                  {proyecto.cliente}
                </h3>

                <p className="text-zinc-300 mb-4">
                  {proyecto.descripcion}
                </p>

                <div className="flex items-center gap-2 text-zinc-400">
                  <FaMapMarkerAlt />
                  <span>{proyecto.ubicacion}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default WealthVyA;