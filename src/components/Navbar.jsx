import { useState } from "react";
import { Link } from "react-router-dom";

import {
  FaBuilding,
  FaHardHat,
  FaDoorOpen,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";

function Navbar() {

  const [open, setOpen] = useState(false);

  return (

    <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Link to="/" className="flex flex-col z-50">

            <h1 className="text-white font-black text-2xl tracking-wider">
              WEALTH
            </h1>

            <span className="text-[#d4af37] text-xs uppercase tracking-[3px]">
              Grupo Empresarial
            </span>

          </Link>

          {/* MENU DESKTOP (NO SE TOCA) */}
          <div className="hidden lg:flex items-center gap-8">

            <Link to="/" className="text-white hover:text-[#d4af37] transition duration-300 font-medium">
              Inicio
            </Link>

            <Link to="/inmobiliaria" className="flex items-center gap-2 text-white hover:text-[#d4af37] transition duration-300 font-medium">
              <FaBuilding className="text-sm" />
              Inmobiliaria
            </Link>

            <Link to="/construcciones" className="flex items-center gap-2 text-white hover:text-[#d4af37] transition duration-300 font-medium">
              <FaHardHat className="text-sm" />
              Construcciones
            </Link>

            <Link to="/aluminios" className="flex items-center gap-2 text-white hover:text-[#d4af37] transition duration-300 font-medium">
              <FaDoorOpen className="text-sm" />
              Aluminios y Vidrios
            </Link>

            <Link to="/contacto" className="flex items-center gap-2 text-white hover:text-[#d4af37] transition duration-300 font-medium">
              <FaPhoneAlt className="text-sm" />
              Contacto
            </Link>

            <Link to="/ubicacion" className="flex items-center gap-2 text-white hover:text-[#d4af37] transition duration-300 font-medium">
              <FaMapMarkerAlt className="text-sm" />
              Ubicación
            </Link>

          </div>

          {/* BOTON LOGIN (desktop igual) */}
          <Link
            to="/login"
            className="hidden lg:block bg-gradient-to-r from-[#b88a2d] to-[#d4af37] hover:scale-105 text-white px-6 py-3 rounded-2xl font-bold transition duration-300 shadow-2xl"
          >
            Iniciar Sesión
          </Link>

          {/* BOTON HAMBURGUESA (mobile) */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-white text-2xl z-50"
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>

        </div>
      </div>

      {/* MENU MOBILE */}
      <div className={`
        lg:hidden fixed top-0 left-0 w-full h-screen bg-black/95 backdrop-blur-xl
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}>

        <div className="flex flex-col items-center justify-center h-full gap-8 text-lg">

          <Link onClick={() => setOpen(false)} to="/" className="text-white hover:text-[#d4af37]">
            Inicio
          </Link>

          <Link onClick={() => setOpen(false)} to="/inmobiliaria" className="flex items-center gap-2 text-white hover:text-[#d4af37]">
            <FaBuilding />
            Inmobiliaria
          </Link>

          <Link onClick={() => setOpen(false)} to="/construcciones" className="flex items-center gap-2 text-white hover:text-[#d4af37]">
            <FaHardHat />
            Construcciones
          </Link>

          <Link onClick={() => setOpen(false)} to="/aluminios" className="flex items-center gap-2 text-white hover:text-[#d4af37]">
            <FaDoorOpen />
            Aluminios y Vidrios
          </Link>

          <Link onClick={() => setOpen(false)} to="/contacto" className="flex items-center gap-2 text-white hover:text-[#d4af37]">
            <FaPhoneAlt />
            Contacto
          </Link>

          <Link onClick={() => setOpen(false)} to="/ubicacion" className="flex items-center gap-2 text-white hover:text-[#d4af37]">
            <FaMapMarkerAlt />
            Ubicación
          </Link>

          <Link
            onClick={() => setOpen(false)}
            to="/login"
            className="bg-gradient-to-r from-[#b88a2d] to-[#d4af37] text-white px-8 py-3 rounded-2xl font-bold mt-6"
          >
            Iniciar Sesión
          </Link>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;