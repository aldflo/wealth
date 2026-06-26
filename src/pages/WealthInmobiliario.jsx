import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBuilding,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { db } from "../firebase.config";

import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
} from "firebase/firestore";
function WealthInmobiliario() {
  const navigate = useNavigate();

const [proyectos, setProyectos] = useState([]);
  const servicios = [
    {
      icon: <FaBuilding size={40} />,
      titulo: "Ingeniería y Arquitectura",
      descripcion: [
        "Diseño de proyectos ejecutivos",
        "Análisis estructural",
        "Modelados 3D y renderizados",
        "Supervisión y consultoría profesional",
      ],
    },
    {
      icon: <FaBuilding size={40} />,
      titulo: "Gestión y Desarrollo de Proyectos",
      descripcion: [
        "Planeación de proyectos",
        "Administración de obra",
        "Control y seguimiento técnico",
      ],
    },
    {
      icon: <FaBuilding size={40} />,
      titulo: "Supervisión de Obra",
      descripcion: [
        "Inspección técnica",
        "Control de calidad",
        "Seguimiento de ejecución",
      ],
    },
    {
      icon: <FaBuilding size={40} />,
      titulo: "Diseño de Infraestructura Hidráulica",
      descripcion: [
        "Sistemas de agua potable",
        "Drenaje sanitario y pluvial",
        "Sistemas de riego",
      ],
    },
    {
      icon: <FaBuilding size={40} />,
      titulo: "Consultoría Técnica",
      descripcion: [
        "Asesoría en ingeniería",
        "Evaluación de proyectos",
        "Soporte técnico especializado",
      ],
    },
  ];

 useEffect(() => {

  const q = query(
    collection(db, "proyectos"),
    where("categoria", "==", "Inmobiliaria"),
    limit(6)
  );

  const unsub = onSnapshot(q, (snapshot) => {

    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setProyectos(lista);

  });

  return () => unsub();

}, []);

  return (
    <div className="bg-black text-white min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto bg-zinc-950/80 rounded-[40px] p-10">

        {/* HERO */}
        <section className="mb-14">
          <p className="text-yellow-500 uppercase tracking-[5px] mb-4 font-semibold">
            Wealth Inmobiliario
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Diseño, planeación{" "}
            <span className="text-yellow-500">
              y desarrollo de proyectos.
            </span>
          </h1>

          <p className="text-zinc-300 text-lg max-w-3xl">
            Especialistas en ingeniería, arquitectura y gestión de proyectos de infraestructura,
            enfocados en soluciones técnicas, diseño profesional y desarrollo integral.
          </p>
        </section>

        {/* SERVICIOS */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-yellow-500 mb-10">
            Servicios Inmobiliarios e Ingeniería
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicios.map((servicio, index) => (
              <div
                key={index}
                className="bg-black/40 p-8 rounded-3xl border border-zinc-800 hover:border-yellow-500 transition duration-300"
              >
                <div className="text-yellow-500 mb-5">
                  {servicio.icon}
                </div>

                <h3 className="text-2xl font-bold mb-4">
                  {servicio.titulo}
                </h3>

                <div className="text-zinc-400 space-y-2">
                  {servicio.descripcion.map((item, i) => (
                    <p key={i} className="flex gap-2">
                      <span className="text-yellow-500">•</span>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      {/* PROYECTOS */}
<section>

  <h2 className="text-4xl font-bold text-yellow-500 mb-10">
    Proyectos Ejecutivos
  </h2>

  {proyectos.length === 0 ? (

    <div className="text-center py-16 text-zinc-500">
      No hay proyectos disponibles.
    </div>

  ) : (

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

      {proyectos.map((proyecto) => (

        <div
          key={proyecto.id}
          onClick={() => navigate(`/proyecto/${proyecto.id}`)}
          className="
            cursor-pointer
            bg-black/40
            rounded-3xl
            overflow-hidden
            border
            border-zinc-800
            hover:border-yellow-500
            transition-all
            duration-300
            hover:scale-[1.02]
            group
          "
        >

          <img
            src={proyecto.imagen}
            alt={proyecto.nombre}
            className="
              w-full
              h-64
              object-cover
              transition
              duration-500
              group-hover:scale-105
            "
          />

          <div className="p-7">

            <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs mb-4">
              {proyecto.categoria}
            </span>

            <h3 className="text-2xl font-bold mb-3">
              {proyecto.nombre}
            </h3>

            <p className="text-zinc-400 line-clamp-3">
              {proyecto.descripcion}
            </p>

            <div className="flex items-center gap-2 text-zinc-500 mt-5">
              <FaMapMarkerAlt />
              {proyecto.ubicacion || "Ubicación no especificada"}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/proyecto/${proyecto.id}`);
              }}
              className="
                mt-7
                w-full
                bg-yellow-500
                hover:bg-yellow-400
                text-black
                py-3
                rounded-xl
                font-semibold
                transition
              "
            >
              Ver proyecto
            </button>

          </div>

        </div>

      ))}

    </div>

  )}

</section>

      </div>
    </div>
  );
}

export default WealthInmobiliario;