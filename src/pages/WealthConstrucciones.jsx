import {
  FaHardHat,
  FaBolt,
  FaTools,
  FaShieldAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

function WealthConstrucciones() {
  const servicios = [
    {
      icon: <FaHardHat size={40} />,
      titulo: "Construcción de Ingeniería Civil u Obra Pesada",
      descripcion: [
        "Estructuras de acero",
        "Cimentaciones",
        "Edificaciones",
        "Construcción civil en general",
      ],
    },

    {
      icon: <FaBolt size={40} />,
      titulo: "Construcción de Obras de Urbanización",
      descripcion: [
        "Alumbrado público",
        "Banquetas",
        "Calles, avenidas y tránsito",
        "Jardinería",
      ],
    },

    {
      icon: <FaTools size={40} />,
      titulo: "Obras de Agua y Drenaje",
      descripcion: [
        "Cálculo y diseño",
        "Distribución y suministro de agua",
        "Drenaje sanitario y pluvial",
        "Mantenimiento y rehabilitación de sistemas hidráulicos",
      ],
    },

    {
      icon: <FaBolt size={40} />,
      titulo: "Servicios de Electrificación",
      descripcion: [
        "Redes eléctricas de transmisión y distribución",
        "Subestaciones eléctricas",
        "Electrificación industrial y rural",
        "Alumbrado público",
      ],
    },

    {
      icon: <FaTools size={40} />,
      titulo: "Remodelaciones y Obra Ligera",
      descripcion: [
        "Construcción ligera",
        "Remodelación y rehabilitación",
        "Fachadas",
        "Acabados",
        "Pintura",
      ],
    },

    {
      icon: <FaShieldAlt size={40} />,
      titulo: "Instalación y Mantenimiento",
      descripcion: [
        "Plomería",
        "Sistemas eléctricos",
        "Impermeabilización",
        "Albañilería",
        "Aire acondicionado",
        "CCTV y sistemas de alarmas",
        "Mantenimiento general",
      ],
    },

    {
      icon: <FaHardHat size={40} />,
      titulo: "Estructuras Metálicas y Herrería",
      descripcion: [
        "Estructuras metálicas",
        "Barandales",
        "Cortinas metálicas",
        "Domos",
        "Protectores",
        "Rejas y portones",
        "Cercado de malla ciclónica",
        "Estructuras a diseño",
      ],
    },
  ];

  const proyectos = [
    {
      cliente: "SEDUMOP",
      descripcion:
        "Ampliación de red eléctrica en Emiliano Zapata, municipio de Calakmul.",
      ubicacion: "Calakmul, Campeche",
    },
    {
      cliente: "INIFEEC",
      descripcion:
        "Rehabilitación de espacios educativos y obra complementaria.",
      ubicacion: "Champotón, Campeche",
    },
    {
      cliente: "INIFEEC",
      descripcion:
        "Construcción de servicios sanitarios y obra exterior.",
      ubicacion: "Palizada, Campeche",
    },
    {
      cliente: "INIFEEC",
      descripcion:
        "Construcción de dirección, bodega y obra exterior.",
      ubicacion: "Carmen, Campeche",
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden py-16 px-6">
      <div className="max-w-7xl mx-auto bg-zinc-950/80 backdrop-blur-sm rounded-[40px] shadow-2xl overflow-hidden">

        {/* HERO */}
        <section className="relative overflow-hidden">
          <img
            src="/hero.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-black/70"></div>

          <div className="relative z-10 p-8 md:p-14 pb-6">
            <p className="text-yellow-500 uppercase tracking-[5px] mb-6 font-semibold">
              Wealth Construcciones
            </p>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 max-w-5xl">
              Construcción, desarrollo{" "}
              <span className="text-yellow-500">y obra integral.</span>
            </h1>

            <p className="text-zinc-300 text-xl leading-relaxed max-w-3xl">
              Especialistas en construcción de obra civil, infraestructura,
              urbanización y mantenimiento de proyectos en Campeche.
            </p>
          </div>
        </section>

        {/* SERVICIOS */}
        <section className="px-10 md:px-20 pt-10 pb-6">
          <h2 className="text-5xl font-bold text-yellow-500 mb-10">
            Servicios de Construcción
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicios.map((servicio, index) => (
              <div
                key={index}
                className="bg-black/40 rounded-3xl p-8 border border-zinc-800 hover:border-yellow-500 transition"
              >
                <div className="text-yellow-500 mb-5">{servicio.icon}</div>

                <h3 className="text-2xl font-bold mb-4">
                  {servicio.titulo}
                </h3>

                <div className="text-zinc-400">
                  {servicio.descripcion.map((item, i) => (
                    <span key={i} className="block">
                      • {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROYECTOS */}
        <section className="px-10 md:px-20 py-10">
          <h2 className="text-5xl font-bold text-yellow-500 mb-10">
            Proyectos Realizados
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {proyectos.map((proyecto, index) => (
              <div
                key={index}
                className="bg-black/40 rounded-3xl p-8 border border-zinc-800"
              >
                <h3 className="text-3xl font-bold text-yellow-500 mb-3">
                  {proyecto.cliente}
                </h3>

                <p className="text-zinc-300 mb-3">
                  {proyecto.descripcion}
                </p>

                <div className="flex items-center gap-2 text-zinc-400">
                  <FaMapMarkerAlt />
                  {proyecto.ubicacion}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default WealthConstrucciones;