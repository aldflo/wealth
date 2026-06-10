import {
  FaFileInvoiceDollar,
  FaBuilding,
  FaComments,
  FaUser,
  FaClipboardList,
  FaSearch,
  FaHeart,
  FaThLarge
} from "react-icons/fa";

function MenuCliente() {

  const cards = [
    {
      titulo: "Explorar Proyectos",
      icono: <FaSearch size={35} />,
      descripcion: "Descubre nuestro catálogo completo de proyectos.",
      color: "text-yellow-400"
    },
    {
      titulo: "Mis Cotizaciones",
      icono: <FaFileInvoiceDollar size={35} />,
      descripcion: "Revisa tus solicitudes de presupuesto.",
      color: "text-blue-400"
    },
    {
      titulo: "Mis Proyectos",
      icono: <FaBuilding size={35} />,
      descripcion: "Seguimiento de construcción en curso.",
      color: "text-green-400"
    },
    {
      titulo: "Favoritos",
      icono: <FaHeart size={35} />,
      descripcion: "Proyectos que te interesan.",
      color: "text-pink-400"
    },
    {
      titulo: "Mensajes",
      icono: <FaComments size={35} />,
      descripcion: "Comunicación con el equipo.",
      color: "text-cyan-400"
    },
    {
      titulo: "Perfil",
      icono: <FaUser size={35} />,
      descripcion: "Administra tu información personal.",
      color: "text-purple-400"
    }
  ];

  const proyectosDestacados = [
    {
      nombre: "Residencial Palmas",
      categoria: "Residencial",
      estado: "En construcción"
    },
    {
      nombre: "Torre Cristal",
      categoria: "Vidrio / Moderno",
      estado: "Finalizado"
    },
    {
      nombre: "Centro Comercial Norte",
      categoria: "Comercial",
      estado: "Planeación"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-black to-zinc-900 py-20 px-8 border-b border-yellow-600/20">

        <h1 className="text-5xl font-bold mb-4">
          Bienvenido a <span className="text-yellow-500">Wealth</span>
        </h1>

        <p className="text-zinc-400 text-lg max-w-2xl">
          Explora nuestros proyectos, solicita cotizaciones y da seguimiento a tu experiencia como cliente.
        </p>

      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* CARDS PRINCIPALES */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-yellow-500 transition hover:scale-[1.02] cursor-pointer"
            >
              <div className={`${card.color} mb-4`}>
                {card.icono}
              </div>

              <h3 className="text-xl font-bold mb-2">
                {card.titulo}
              </h3>

              <p className="text-zinc-400 text-sm">
                {card.descripcion}
              </p>
            </div>
          ))}

        </div>

        {/* CATALOGO DE PROYECTOS */}
        <div className="mt-14">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
              <FaThLarge /> Catálogo de Proyectos
            </h2>

            <button className="text-sm text-zinc-400 hover:text-white">
              Ver todos →
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {proyectosDestacados.map((p, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-yellow-500 transition"
              >
                <h3 className="text-xl font-bold mb-2">
                  {p.nombre}
                </h3>

                <p className="text-zinc-400 text-sm">
                  {p.categoria}
                </p>

                <div className="mt-4 text-xs inline-block px-3 py-1 bg-black border border-zinc-700 rounded-full">
                  {p.estado}
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* ACTIVIDAD */}
        <div className="mt-14 bg-zinc-900 rounded-3xl p-8 border border-zinc-800">

          <h2 className="text-2xl font-bold text-yellow-500 mb-6">
            Actividad Reciente
          </h2>

          <div className="space-y-3 text-sm">

            <div className="bg-black rounded-xl p-4 border border-zinc-800">
              ✔ Cotización enviada correctamente
            </div>

            <div className="bg-black rounded-xl p-4 border border-zinc-800">
              🏗 Proyecto actualizado: Torre Cristal
            </div>

            <div className="bg-black rounded-xl p-4 border border-zinc-800">
              💬 Nuevo mensaje del asesor
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default MenuCliente;