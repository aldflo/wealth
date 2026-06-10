import {
  FaUsers,
  FaBuilding,
  FaPlusCircle,
  FaEnvelope,
  FaSignOutAlt,
  FaHome
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function MenuAdmin() {

  const navigate = useNavigate();

  const opciones = [
    {
      titulo: "Clientes",
      descripcion: "Administrar usuarios registrados en el sistema.",
      icono: <FaUsers size={35} />
    },
    {
      titulo: "Proyectos",
      descripcion: "Visualizar y administrar proyectos publicados.",
      icono: <FaBuilding size={35} />
    },
    {
      titulo: "Subir Proyecto",
      descripcion: "Agregar nuevos trabajos realizados por Wealth.",
      icono: <FaPlusCircle size={35} />
    },
    {
      titulo: "Mensajes",
      descripcion: "Consultar solicitudes y mensajes de contacto.",
      icono: <FaEnvelope size={35} />
    }
  ];

  return (

    <div className="min-h-screen bg-black text-white flex">

      {/* SIDEBAR */}

      <aside className="w-72 bg-zinc-950 border-r border-yellow-600/20 p-6">

        <h1 className="text-3xl font-bold mb-10">

          Wealth
          <span className="text-yellow-500">
            {" "}Admin
          </span>

        </h1>

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
            onClick={() => navigate("/admin/mensajes")}
            className="w-full flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 px-5 py-4 rounded-2xl transition"
          >
            <FaEnvelope />
            Mensajes
          </button>

        </nav>

        <div className="mt-12">

          <button
            className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-semibold transition"
          >
            <FaSignOutAlt />
            Cerrar Sesión
          </button>

        </div>

      </aside>

      {/* CONTENIDO */}

      <main className="flex-1 p-10">

        <div className="mb-12">

          <h2 className="text-5xl font-bold">

            Panel
            <span className="text-yellow-500">
              {" "}Administrativo
            </span>

          </h2>

          <p className="text-zinc-400 text-lg mt-4">
            Bienvenido al sistema de administración de Wealth Grupo Empresarial.
          </p>

        </div>

        {/* MENSAJE */}

        <div className="bg-zinc-900 rounded-3xl p-10 border border-yellow-600/20 mb-10">

          <h3 className="text-3xl font-bold text-yellow-500 mb-6">
            Centro de Administración
          </h3>

          <p className="text-zinc-300 text-lg leading-relaxed">
            Desde este panel podrás gestionar usuarios, administrar proyectos,
            publicar nuevos trabajos realizados y visualizar los mensajes
            recibidos desde el sitio web.
          </p>

        </div>

        {/* MODULOS */}

        <div className="grid md:grid-cols-2 gap-8">

          {opciones.map((opcion, index) => (

            <div
              key={index}
              className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 hover:border-yellow-500 transition duration-300 hover:-translate-y-1"
            >

              <div className="text-yellow-500 mb-6">
                {opcion.icono}
              </div>

              <h3 className="text-2xl font-bold mb-3">
                {opcion.titulo}
              </h3>

              <p className="text-zinc-400">
                {opcion.descripcion}
              </p>

            </div>

          ))}

        </div>

      </main>

    </div>

  );

}

export default MenuAdmin;