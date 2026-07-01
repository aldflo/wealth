import { FaImages } from "react-icons/fa";
import {
  FaUsers,
  FaBuilding,
  FaPlusCircle,
  FaEnvelope,
  FaHome,
  FaFileInvoiceDollar
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function MenuAdmin() {
  const navigate = useNavigate();

  const cards = [
    {
      titulo: "Clientes",
      icono: <FaUsers size={35} />,
      descripcion: "Administrar clientes registrados.",
      color: "text-cyan-400",
      ruta: "/admin/clientes",
    },
    {
      titulo: "Proyectos",
      icono: <FaBuilding size={35} />,
      descripcion: "Gestionar proyectos publicados.",
      color: "text-green-400",
      ruta: "/proyectos",
    },
    {
      titulo: "Subir Proyecto",
      icono: <FaPlusCircle size={35} />,
      descripcion: "Publicar un nuevo proyecto.",
      color: "text-yellow-400",
      ruta: "/admin/subir-proyecto",
    },
    {
      titulo: "Subir Galería",
      icono: <FaImages size={35} />,
      descripcion: "Agregar imágenes a la galería.",
      color: "text-pink-400",
      ruta: "/subir-galeria",
    },
    {
      titulo: "Mensajes",
      icono: <FaEnvelope size={35} />,
      descripcion: "Visualizar mensajes recibidos.",
      color: "text-blue-400",
      ruta: "/admin/mensajes",
    },
    {
      titulo: "Cotizaciones",
      icono: <FaFileInvoiceDollar size={35} />,
      descripcion: "Aceptar o rechazar solicitudes.",
      color: "text-orange-400",
      ruta: "/admin/cotizaciones",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">

      {/* SIDEBAR SOLO ESCRITORIO */}
      <aside className="hidden lg:block w-72 bg-zinc-950 border-r border-yellow-600/20 p-6">

       

        <nav className="space-y-4">

          <button
            className="w-full flex items-center gap-4 bg-yellow-500 text-black px-5 py-4 rounded-2xl font-bold"
          >
            <FaHome />
            Dashboard
          </button>

          <button
            onClick={() => navigate("/admin/clientes")}
            className="w-full flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 px-5 py-4 rounded-2xl transition"
          >
            <FaUsers />
            Clientes
          </button>

          <button
            onClick={() => navigate("/proyectos")}
            className="w-full flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 px-5 py-4 rounded-2xl transition"
          >
            <FaBuilding />
            Proyectos
          </button>

          <button
            onClick={() => navigate("/admin/subir-proyecto")}
            className="w-full flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 px-5 py-4 rounded-2xl transition"
          >
            <FaPlusCircle />
            Subir Proyecto
          </button>

          <button
            onClick={() => navigate("/subir-galeria")}
            className="w-full flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 px-5 py-4 rounded-2xl transition"
          >
            <FaImages />
            Subir Galería
          </button>

          <button
            onClick={() => navigate("/admin/mensajes")}
            className="w-full flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 px-5 py-4 rounded-2xl transition"
          >
            <FaEnvelope />
            Mensajes
          </button>

        </nav>

      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6 lg:p-10">

        {/* Encabezado */}
        <div className="mb-12">

          <h2 className="text-4xl lg:text-5xl font-bold">
            Panel <span className="text-yellow-500">Administrativo</span>
          </h2>

          <p className="text-zinc-400 text-lg mt-4">
            Bienvenido al sistema de administración de Wealth Grupo Empresarial.
          </p>

        </div>

        {/* Card de información SOLO escritorio */}
        <div className="hidden lg:block bg-zinc-900 rounded-3xl p-10 border border-yellow-600/20 mb-10">

          <h3 className="text-3xl font-bold text-yellow-500 mb-6">
            Centro de Administración
          </h3>

          <p className="text-zinc-300 text-lg leading-relaxed">
            Desde este panel podrás gestionar usuarios, administrar proyectos,
            publicar nuevos trabajos realizados y visualizar los mensajes
            recibidos desde el sitio web.
          </p>

        </div>

        {/* =================== */}
        {/* CELULAR */}
        {/* =================== */}

        <div className="grid grid-cols-1 gap-6 lg:hidden">

          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.ruta)}
              className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-yellow-500 transition cursor-pointer"
            >

              <div className={`${card.color} mb-4`}>
                {card.icono}
              </div>

              <h3 className="text-2xl font-bold mb-2">
                {card.titulo}
              </h3>

              <p className="text-zinc-400">
                {card.descripcion}
              </p>

            </div>
          ))}

        </div>

        {/* =================== */}
        {/* ESCRITORIO */}
        {/* =================== */}

        <div className="hidden lg:grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div
            onClick={() => navigate("/admin/cotizaciones")}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-black p-8 rounded-3xl cursor-pointer hover:scale-105 transition"
          >

            <FaFileInvoiceDollar size={40} />

            <h3 className="text-2xl font-bold mt-4">
              Cotizaciones
            </h3>

            <p className="mt-2 font-medium">
              Ver solicitudes de clientes, aceptar o rechazar proyectos
            </p>

            <button className="mt-5 bg-black text-white px-4 py-2 rounded-xl font-bold">
              Ver solicitudes
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default MenuAdmin;