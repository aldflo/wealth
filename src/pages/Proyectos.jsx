import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { db, auth } from "../firebase.config";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { FaSearch, FaHeart } from "react-icons/fa";

function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  // Nuevo: manejo de favoritos en localStorage
  const [favoritos, setFavoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favoritos")) ?? [];
    } catch {
      return [];
    }
  });
const [mostrarLoginModal, setMostrarLoginModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    const unsub = null; // placeholder por claridad

    // Función existente (sin cambios) para agregar/gestionar favoritos desde UI:
    // Solo la mantenemos para usar la lógica de localStorage, si así lo prefieres
    const agregarFavorito = (proyecto) => {
      const existentes =
        JSON.parse(localStorage.getItem("favoritos")) ?? [];

      const existe = existentes.some((item) => item.id === proyecto.id);

      if (existe) {
        const nuevos = existentes.filter((item) => item.id !== proyecto.id);
        localStorage.setItem("favoritos", JSON.stringify(nuevos));
        setFavoritos(nuevos);
      } else {
        const nuevos = [
          ...existentes,
          {
            id: proyecto.id,
            titulo: proyecto.nombre,
            imagen: proyecto.imagen,
            categoria: proyecto.categoria,
            descripcion: proyecto.descripcion,
          },
        ];
        localStorage.setItem("favoritos", JSON.stringify(nuevos));
        setFavoritos(nuevos);
      }

      // Actualizar cualquier listener de storage (opcional)
      window.dispatchEvent(new Event("storage"));
    };

    const q = query(
      collection(db, "proyectos"),
      orderBy("fecha", "desc")
    );

    const unsub2 = onSnapshot(q, (snap) => {
      setProyectos(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub2();
  }, []);

  // Mantener filtros en memoria, reflejando cambios en favoritos si es necesario
  useEffect(() => {
    // Sincronizar estado local con localStorage al inicio o cuando se guarden cambios
    try {
      const guardados = JSON.parse(localStorage.getItem("favoritos")) ?? [];
      setFavoritos(guardados);
    } catch {
      // ignorar
    }
  }, []);

  const filtrados = useMemo(() => {
    return proyectos.filter((p) => {
      const okNombre =
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase());

      const okCat =
        categoria === "Todos" || p.categoria === categoria;

      return okNombre && okCat;
    });
  }, [proyectos, busqueda, categoria]);

  // Funcion para toggle desde la UI
  const toggleFavorito = (proyecto) => {

  if (!auth.currentUser) {
    setMostrarLoginModal(true);
    return;
  }

  const yaExiste = favoritos.find(
    (f) => f.id === proyecto.id
  );

  let nuevos = [];

  if (yaExiste) {
    nuevos = favoritos.filter(
      (f) => f.id !== proyecto.id
    );
  } else {
    nuevos = [
      ...favoritos,
      {
        id: proyecto.id,
        titulo: proyecto.nombre,
        imagen: proyecto.imagen,
        categoria: proyecto.categoria,
        descripcion: proyecto.descripcion,
      },
    ];
  }

  setFavoritos(nuevos);

  localStorage.setItem(
    "favoritos",
    JSON.stringify(nuevos)
  );

  window.dispatchEvent(new Event("storage"));
};
  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO APPLE STYLE */}
      <section className="py-28 px-6 text-center border-b border-white/10">

        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
          Descubre nuestros
          <span className="text-white/60"> proyectos</span>
        </h1>

        <p className="mt-6 text-zinc-400 text-lg max-w-2xl mx-auto">
          Explora desarrollos creados con precisión, diseño limpio y visión empresarial.
        </p>

      </section>

      {/* CONTROLES APPLE STYLE */}
      <div className="max-w-6xl mx-auto px-6 py-12">

        <div className="flex flex-col md:flex-row gap-4 mb-14">

          {/* SEARCH */}
          <div className="relative flex-1">

            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar proyectos"
              className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl pl-12 py-4 outline-none focus:border-white/40 transition"
            />
          </div>

          {/* FILTER */}
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="bg-zinc-900/60 border border-white/10 rounded-2xl px-5 py-4 outline-none"
          >
            <option>Todos</option>
            <option>Construcciones</option>
            <option>Inmobiliaria</option>
            <option>Aluminios y Vidrios</option>
          </select>

        </div>

        {/* GRID APPLE STORE */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">

          {filtrados.map((p) => {
            const isFav = favoritos.some((f) => f.id === p.id);
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/proyecto/${p.id}`)}
                className="
                  cursor-pointer
                  group
                  bg-zinc-900/40
                  border border-white/10
                  rounded-3xl
                  p-6
                  hover:border-white/30
                  transition
                  hover:scale-[1.02]
                "
              >

                {/* IMAGE CENTERED (APPLE STYLE) */}
                <div className="h-64 flex items-center justify-center">

                  <img
                    src={p.imagen}
                    alt={p.nombre}
                    className="
                      max-h-full
                      max-w-full
                      object-contain
                      transition duration-300
                      group-hover:scale-105
                    "
                  />
                </div>

                {/* TEXT */}
                <div className="mt-6 text-center">

                  <p className="text-xs text-zinc-500 uppercase tracking-widest">
                    {p.categoria}
                  </p>

                  <h2 className="text-2xl font-semibold mt-2">
                    {p.nombre}
                  </h2>

                  <p className="text-zinc-400 mt-3 text-sm line-clamp-2">
                    {p.descripcion}
                  </p>

                  <div className="mt-5 text-sm text-white/60 group-hover:text-white transition">
                    Ver detalles →
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-4">
                   

                    <button
                      aria-label="Marcar como favorito"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorito(p);
                      }}
                      className="p-1 rounded-full hover:bg-white/10 transition"
                    >
                      <FaHeart color={isFav ? "red" : "white"} />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>
      {mostrarLoginModal && (
  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">

    <div className="w-full max-w-md bg-zinc-900 border border-yellow-500/20 rounded-3xl p-8 shadow-2xl">

      <div className="flex justify-center mb-5">
        <FaHeart
          size={50}
          className="text-pink-500"
        />
      </div>

      <h2 className="text-3xl font-semibold text-center mb-3">
        Guarda tus favoritos
      </h2>

      <p className="text-zinc-400 text-center mb-8">
        Inicia sesión para guardar proyectos,
        compararlos y solicitar cotizaciones
        cuando lo necesites.
      </p>

      <div className="space-y-3">

        <button
          onClick={() => navigate("/login")}
          className="
            w-full
            bg-yellow-500
            hover:bg-yellow-400
            text-black
            font-semibold
            py-4
            rounded-2xl
            transition
          "
        >
          Iniciar sesión
        </button>

        <button
          onClick={() => navigate("/registro")}
          className="
            w-full
            bg-zinc-800
            hover:bg-zinc-700
            py-4
            rounded-2xl
            transition
          "
        >
          Crear cuenta
        </button>

        <button
          onClick={() => setMostrarLoginModal(false)}
          className="
            w-full
            py-3
            text-zinc-500
            hover:text-white
            transition
          "
        >
          Continuar explorando
        </button>

      </div>

    </div>

  </div>
)}
    </div>
  );
}

export default Proyectos;
