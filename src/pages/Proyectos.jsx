import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase.config";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { FaSearch } from "react-icons/fa";

function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, "proyectos"),
      orderBy("fecha", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setProyectos(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
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

          {filtrados.map((p) => (
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

              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default Proyectos;