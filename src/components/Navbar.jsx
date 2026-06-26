import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase.config";

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
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Detectar usuario logueado
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsub();
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setOpen(false);
      navigate("/");
    } catch (error) {
      console.log("Error al cerrar sesión:", error);
    }
  };

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

          {/* MENU DESKTOP */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-white hover:text-[#d4af37] transition">
              Inicio
            </Link>

            <Link to="/inmobiliaria" className="flex items-center gap-2 text-white hover:text-[#d4af37] transition">
              <FaBuilding />
              Inmobiliaria
            </Link>

            <Link to="/construcciones" className="flex items-center gap-2 text-white hover:text-[#d4af37] transition">
              <FaHardHat />
              Construcciones
            </Link>

            <Link to="/aluminios" className="flex items-center gap-2 text-white hover:text-[#d4af37] transition">
              <FaDoorOpen />
              Aluminios y Vidrios
            </Link>

            <Link to="/contacto" className="flex items-center gap-2 text-white hover:text-[#d4af37] transition">
              <FaPhoneAlt />
              Contacto
            </Link>

            <Link to="/ubicacion" className="flex items-center gap-2 text-white hover:text-[#d4af37] transition">
              <FaMapMarkerAlt />
              Ubicación
            </Link>
          </div>

          {/* BOTÓN LOGIN / LOGOUT DESKTOP */}
          <div className="hidden lg:block">
            {user ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition"
              >
                Cerrar Sesión
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-[#b88a2d] to-[#d4af37] hover:scale-105 text-white px-6 py-3 rounded-2xl font-bold transition shadow-2xl"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* HAMBURGUESA */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-white text-2xl z-50"
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* MENU MOBILE */}
      <div
        className={`lg:hidden fixed top-0 left-0 w-full h-screen bg-black/95 backdrop-blur-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 text-lg">

          <Link onClick={() => setOpen(false)} to="/" className="text-white hover:text-[#d4af37]">
            Inicio
          </Link>

          <Link onClick={() => setOpen(false)} to="/inmobiliaria" className="flex items-center gap-2 text-white hover:text-[#d4af37]">
            <FaBuilding /> Inmobiliaria
          </Link>

          <Link onClick={() => setOpen(false)} to="/construcciones" className="flex items-center gap-2 text-white hover:text-[#d4af37]">
            <FaHardHat /> Construcciones
          </Link>

          <Link onClick={() => setOpen(false)} to="/aluminios" className="flex items-center gap-2 text-white hover:text-[#d4af37]">
            <FaDoorOpen /> Aluminios y Vidrios
          </Link>

          <Link onClick={() => setOpen(false)} to="/contacto" className="flex items-center gap-2 text-white hover:text-[#d4af37]">
            <FaPhoneAlt /> Contacto
          </Link>

          <Link onClick={() => setOpen(false)} to="/ubicacion" className="flex items-center gap-2 text-white hover:text-[#d4af37]">
            <FaMapMarkerAlt /> Ubicación
          </Link>

          {/* LOGIN / LOGOUT MOBILE */}
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold mt-6"
            >
              Cerrar Sesión
            </button>
          ) : (
            <Link
              onClick={() => setOpen(false)}
              to="/login"
              className="bg-gradient-to-r from-[#b88a2d] to-[#d4af37] text-white px-8 py-3 rounded-2xl font-bold mt-6"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;