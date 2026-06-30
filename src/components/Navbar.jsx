import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
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
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setRole(snap.data().role);
        } else {
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsub();
  }, []);

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
     <div className="w-full px-6">

        <div className="flex items-center h-20">

          {/* LOGO */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex flex-col">
              <h1 className="text-white font-black text-2xl tracking-wider">
                WEALTH
              </h1>
              <span className="text-[#d4af37] text-xs uppercase tracking-[3px]">
                Grupo Empresarial
              </span>
            </Link>
          </div>

          {/* MENU CENTRO */}
          <div className="flex-1 flex justify-center">
            <div className="hidden lg:flex items-center gap-10">

              <Link to="/chat-ia" className="text-white hover:text-[#d4af37] transition">
                🤖 Asistente IA
              </Link>

              <Link to="/inmobiliaria" className="text-white hover:text-[#d4af37] transition">
                <FaBuilding className="inline mr-1" />
                Inmobiliaria
              </Link>

              <Link to="/construcciones" className="text-white hover:text-[#d4af37] transition">
                <FaHardHat className="inline mr-1" />
                Construcciones
              </Link>

              <Link to="/aluminios" className="text-white hover:text-[#d4af37] transition">
                <FaDoorOpen className="inline mr-1" />
                Aluminios
              </Link>

              <Link to="/contacto" className="text-white hover:text-[#d4af37] transition">
                <FaPhoneAlt className="inline mr-1" />
                Contacto
              </Link>

              <Link to="/ubicacion" className="text-white hover:text-[#d4af37] transition">
                <FaMapMarkerAlt className="inline mr-1" />
                Ubicación
              </Link>

            </div>
          </div>

          {/* DERECHA USUARIO */}
          <div className="flex items-center gap-6 border-l border-white/10 pl-6">

            {role === "admin" && (
              <Link to="/admin" className="text-white hover:text-[#d4af37] transition">
                Panel Admin
              </Link>
            )}

            {role === "cliente" && (
              <Link to="/cliente" className="text-white hover:text-[#d4af37] transition">
                Mi Panel
              </Link>
            )}

            <div className="hidden lg:block">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-bold transition"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-[#b88a2d] to-[#d4af37] text-white px-5 py-2 rounded-xl font-bold transition"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>

          </div>

          {/* HAMBURGUESA */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-white text-2xl ml-4"
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>

        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`lg:hidden fixed top-0 left-0 w-full h-screen bg-black/95 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 text-lg">

          <Link onClick={() => setOpen(false)} to="/chat-ia">🤖 Asistente IA</Link>
          <Link onClick={() => setOpen(false)} to="/inmobiliaria">Inmobiliaria</Link>
          <Link onClick={() => setOpen(false)} to="/construcciones">Construcciones</Link>
          <Link onClick={() => setOpen(false)} to="/aluminios">Aluminios</Link>
          <Link onClick={() => setOpen(false)} to="/contacto">Contacto</Link>
          <Link onClick={() => setOpen(false)} to="/ubicacion">Ubicación</Link>

          {role === "admin" && (
            <Link onClick={() => setOpen(false)} to="/admin">
              Panel Admin
            </Link>
          )}

          {role === "cliente" && (
            <Link onClick={() => setOpen(false)} to="/cliente">
              Mi Panel
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 px-6 py-3 rounded-xl font-bold mt-6"
            >
              Cerrar Sesión
            </button>
          ) : (
            <Link
              onClick={() => setOpen(false)}
              to="/login"
              className="bg-gradient-to-r from-[#b88a2d] to-[#d4af37] px-6 py-3 rounded-xl font-bold mt-6"
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