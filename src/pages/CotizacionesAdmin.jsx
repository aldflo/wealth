import { useEffect, useState } from "react";
import { db } from "../firebase.config";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  FaCheck,
  FaTimes,
  FaTrash,
  FaUser,
  FaEdit
} from "react-icons/fa";

function CotizacionesAdmin() {

  const [cotizaciones, setCotizaciones] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [imagenesActivas, setImagenesActivas] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "cotizaciones"), (snap) => {
      setCotizaciones(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  const cambiarEstado = async (cotizacion, estado) => {
    await updateDoc(doc(db, "cotizaciones", cotizacion.id), {
      estado,
      leido: true
    });

    await addDoc(collection(db, "notificaciones"), {
      usuario: cotizacion.usuario,
      mensaje:
        estado === "aceptada"
          ? `Tu cotización "${cotizacion.nombre}" fue ACEPTADA`
          : `Tu cotización "${cotizacion.nombre}" fue RECHAZADA`,
      leido: false,
      tipo: "cotizacion",
      fecha: serverTimestamp()
    });
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar cotización?")) return;
    await deleteDoc(doc(db, "cotizaciones", id));
  };

  const resetEstado = async (id) => {
    await updateDoc(doc(db, "cotizaciones", id), {
      estado: "pendiente"
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "aceptada":
        return "bg-green-600";
      case "rechazada":
        return "bg-red-600";
      default:
        return "bg-yellow-500 text-black";
    }
  };

  // 🔥 abrir modal (soporta imagen o array)
  const openModal = (imagenes, i = 0) => {
    const imgs = Array.isArray(imagenes)
      ? imagenes
      : [imagenes];

    setImagenesActivas(imgs);
    setIndex(i);
    setModalOpen(true);
  };

  const next = () => {
    setIndex((prev) =>
      prev + 1 >= imagenesActivas.length ? 0 : prev + 1
    );
  };

  const prev = () => {
    setIndex((prev) =>
      prev === 0 ? imagenesActivas.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-4xl font-bold mb-8 text-yellow-500">
        Cotizaciones Recibidas
      </h1>

      <div className="grid gap-6">

        {cotizaciones.map((c) => (

          <div
            key={c.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
          >

            <div className="flex justify-between gap-4">

              <div className="flex-1">

                <h2 className="text-xl font-bold">{c.nombre}</h2>

                <p className="text-zinc-400 text-sm mt-1">
                  {c.descripcion}
                </p>

                <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
                  <FaUser />
                  {c.usuario}
                </div>

                <p className="text-xs mt-2 text-yellow-400">
                  Tipo: {c.tipo}
                </p>

                <p className="text-xs mt-2 text-green-400">
                  WhatsApp: {c.telefono || "No registrado"}
                </p>

              </div>

              {/* 🔥 IMAGENES (SOPORTE MULTI + LEGACY) */}
              {c.imagenes?.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto">

                  {c.imagenes.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      onClick={() => openModal(c.imagenes, i)}
                      className="w-20 h-20 object-cover rounded-xl border border-zinc-700 cursor-zoom-in hover:scale-105 transition"
                    />
                  ))}

                </div>
              ) : c.imagen ? (
                <img
                  src={c.imagen}
                  onClick={() => openModal(c.imagen)}
                  className="w-28 h-28 object-cover rounded-xl border border-zinc-700 cursor-zoom-in hover:scale-105 transition"
                />
              ) : null}

            </div>

            {/* ESTADO */}
            <div className="mt-4 flex items-center gap-3">

              <span className={`px-4 py-1 rounded-full text-sm font-bold ${getEstadoColor(c.estado)}`}>
                {c.estado || "pendiente"}
              </span>

              {c.estado && c.estado !== "pendiente" && (
                <button
                  onClick={() => resetEstado(c.id)}
                  className="flex items-center gap-2 text-xs bg-zinc-700 px-3 py-1 rounded-xl"
                >
                  <FaEdit /> Editar
                </button>
              )}

            </div>

            {/* BOTONES */}
            {(!c.estado || c.estado === "pendiente") && (
              <div className="flex gap-3 mt-5">

                <button
                  onClick={() => cambiarEstado(c, "aceptada")}
                  className="bg-green-600 px-4 py-2 rounded-xl"
                >
                  <FaCheck /> Aceptar
                </button>

                <button
                  onClick={() => cambiarEstado(c, "rechazada")}
                  className="bg-red-600 px-4 py-2 rounded-xl"
                >
                  <FaTimes /> Rechazar
                </button>

                <button
                  onClick={() => eliminar(c.id)}
                  className="bg-zinc-700 px-4 py-2 rounded-xl"
                >
                  <FaTrash /> Eliminar
                </button>

              </div>
            )}

          </div>
        ))}
      </div>

      {/* 🔥 MODAL PRO */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
        >

          {imagenesActivas.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-6 text-white text-4xl"
            >
              ❮
            </button>
          )}

          <img
            src={imagenesActivas[index]}
            className="max-w-[90%] max-h-[90%] rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {imagenesActivas.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-6 text-white text-4xl"
            >
              ❯
            </button>
          )}

          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-6 right-6 text-white text-5xl hover:text-yellow-500"
          >
            ×
          </button>

        </div>
      )}

    </div>
  );
}

export default CotizacionesAdmin;