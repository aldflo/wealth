import { useState } from "react";

import {
  FaUsers,
  FaBuilding,
  FaPlusCircle,
  FaEnvelope,
  FaSignOutAlt,
  FaHome,
  FaBars,
  FaTimes,
  FaFileInvoiceDollar
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function MenuAdmin() {

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    window.location.replace("/");
  };

  return (

    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">

      {/* TOP BAR SOLO MOBILE */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-yellow-600/20">

        <h1 className="text-xl font-bold">
          Wealth <span className="text-yellow-500">Admin</span>
        </h1>

        <button
          onClick={() => setOpen(true)}
          className="text-white text-2xl"
        >
          <FaBars />
        </button>

      </div>

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:block w-72 bg-zinc-950 border-r border-yellow-600/20 p-6">

        <h1 className="text-3xl font-bold mb-10">
          Wealth <span className="text-yellow-500">Admin</span>
        </h1>

        <nav className="space-y-4">

          <button className="w-full flex items-center gap-4 bg-yellow-500 text-black px-5 py-4 rounded-2xl font-bold">
            <FaHome />
            Dashboard
          </button>

          <button onClick={() => navigate("/admin/clientes")} className="w-full flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 px-5 py-4 rounded-2xl transition">
            <FaUsers />
            Clientes
          </button>

          <button onClick={() => navigate("/proyectos")} className="w-full flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 px-5 py-4 rounded-2xl transition">
            <FaBuilding />
            Proyectos
          </button>

          <button onClick={() => navigate("/admin/subir-proyecto")} className="w-full flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 px-5 py-4 rounded-2xl transition">
            <FaPlusCircle />
            Subir Proyecto
          </button>

          <button onClick={() => navigate("/admin/mensajes")} className="w-full flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 px-5 py-4 rounded-2xl transition">
            <FaEnvelope />
            Mensajes
          </button>

        </nav>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-semibold transition"
        >
          <FaSignOutAlt />
          Cerrar Sesión
        </button>

      </aside>

      {/* MENU MOBILE */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-6 lg:hidden">

          <div className="flex justify-between items-center mb-10">

            <h1 className="text-2xl font-bold">
              Wealth <span className="text-yellow-500">Admin</span>
            </h1>

            <button onClick={() => setOpen(false)} className="text-2xl">
              <FaTimes />
            </button>

          </div>

          <div className="flex flex-col gap-4">

            <button onClick={() => { navigate("/"); setOpen(false); }} className="flex items-center gap-3 bg-yellow-500 text-black px-5 py-4 rounded-2xl font-bold">
              <FaHome />
              Dashboard
            </button>

            <button onClick={() => { navigate("/admin/clientes"); setOpen(false); }} className="flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
              <FaUsers />
              Clientes
            </button>

            <button onClick={() => { navigate("/proyectos"); setOpen(false); }} className="flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
              <FaBuilding />
              Proyectos
            </button>

            <button onClick={() => { navigate("/admin/subir-proyecto"); setOpen(false); }} className="flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
              <FaPlusCircle />
              Subir Proyecto
            </button>

            <button onClick={() => { navigate("/admin/mensajes"); setOpen(false); }} className="flex items-center gap-3 bg-zinc-900 px-5 py-4 rounded-2xl">
              <FaEnvelope />
              Mensajes
            </button>

          </div>

          <div className="mt-auto">

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 bg-red-600 py-4 rounded-2xl font-semibold"
            >
              <FaSignOutAlt />
              Cerrar Sesión
            </button>

          </div>

        </div>
      )}

      {/* 🔥 CONTENIDO (AQUÍ AGREGAMOS EL CARD) */}
      <main className="flex-1 p-10">

        <div className="mb-12">

          <h2 className="text-5xl font-bold">
            Panel <span className="text-yellow-500">Administrativo</span>
          </h2>

          <p className="text-zinc-400 text-lg mt-4">
            Bienvenido al sistema de administración de Wealth Grupo Empresarial.
          </p>

        </div>

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

        {/* 🔥 NUEVO CARD DE COTIZACIONES */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

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