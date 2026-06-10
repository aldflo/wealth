import { Link } from "react-router-dom";

import {
  FaBuilding,
  FaHardHat,
  FaDoorOpen,
  FaMapMarkerAlt,
  FaPhoneAlt
} from "react-icons/fa";

function Navbar() {

  return (

    <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Link
            to="/"
            className="flex flex-col"
          >

            <h1 className="text-white font-black text-2xl tracking-wider">
              WEALTH
            </h1>

            <span className="text-[#d4af37] text-xs uppercase tracking-[3px]">
              Grupo Empresarial
            </span>

          </Link>

          {/* MENU */}
          <div className="hidden lg:flex items-center gap-8">

            <Link
              to="/"
              className="text-white hover:text-[#d4af37] transition duration-300 font-medium"
            >
              Inicio
            </Link>

            <Link
              to="/inmobiliaria"
              className="flex items-center gap-2 text-white hover:text-[#d4af37] transition duration-300 font-medium"
            >
              <FaBuilding className="text-sm" />
              Inmobiliaria
            </Link>

            <Link
              to="/construcciones"
              className="flex items-center gap-2 text-white hover:text-[#d4af37] transition duration-300 font-medium"
            >
              <FaHardHat className="text-sm" />
              Construcciones
            </Link>

            <Link
              to="/aluminios"
              className="flex items-center gap-2 text-white hover:text-[#d4af37] transition duration-300 font-medium"
            >
              <FaDoorOpen className="text-sm" />
              Aluminios y Vidrios
            </Link>

            <Link
              to="/contacto"
              className="flex items-center gap-2 text-white hover:text-[#d4af37] transition duration-300 font-medium"
            >
              <FaPhoneAlt className="text-sm" />
              Contacto
            </Link>

            <Link
              to="/ubicacion"
              className="flex items-center gap-2 text-white hover:text-[#d4af37] transition duration-300 font-medium"
            >
              <FaMapMarkerAlt className="text-sm" />
              Ubicación
            </Link>

          </div>

          {/* BOTON LOGIN */}
          <Link
            to="/login"
            className="bg-gradient-to-r from-[#b88a2d] to-[#d4af37] hover:scale-105 text-white px-6 py-3 rounded-2xl font-bold transition duration-300 shadow-2xl"
          >
            Iniciar Sesión
          </Link>

        </div>

      </div>

    </nav>

  );

}

export default Navbar;