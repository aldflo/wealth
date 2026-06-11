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

  // 🔥 TRAER DATOS (NO MODIFICA FIRESTORE)
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

  // 🔥 CAMBIAR ESTADO + CREAR NOTIFICACIÓN
  const cambiarEstado = async (cotizacion, estado) => {
    try {

      // 🔥 SOLO AGREGA / ACTUALIZA CAMPOS, NO BORRA NADA
      await updateDoc(doc(db, "cotizaciones", cotizacion.id), {
        estado: estado,
        leido: true
      });

      // 🔥 CREA NOTIFICACIÓN SIN TOCAR LAS ANTERIORES
      await addDoc(collection(db, "notificaciones"), {
        usuario: cotizacion.usuario,
        mensaje:
          estado === "aceptada"
            ? `Tu cotización "${cotizacion.nombre}" fue ACEPTADA, nos pondremos en contacto por via whatsapp.`
            : `Tu cotización "${cotizacion.nombre}" fue RECHAZADA.`,
        leido: false,
        tipo: "cotizacion",
        fecha: serverTimestamp()
      });

    } catch (error) {
      console.log("Error:", error);
    }
  };

  // 🗑️ ELIMINAR (NO AFECTA OTROS DATOS)
  const eliminar = async (id) => {
    const ok = confirm("¿Eliminar cotización?");
    if (!ok) return;

    await deleteDoc(doc(db, "cotizaciones", id));
  };

  // 🔁 VOLVER A PENDIENTE (NO BORRA DATOS)
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

            {/* HEADER */}
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

              {c.imagen && (
                <img
                  src={c.imagen}
                  className="w-28 h-28 object-cover rounded-xl border border-zinc-700"
                />
              )}

            </div>

            {/* ESTADO */}
            <div className="mt-4 flex items-center gap-3">

              <span className={`px-4 py-1 rounded-full text-sm font-bold ${getEstadoColor(c.estado)}`}>
                {c.estado || "pendiente"}
              </span>

              {/* 🔥 BOTÓN EDITAR SOLO SI YA RESPONDIDO */}
              {c.estado && c.estado !== "pendiente" && (
                <button
                  onClick={() => resetEstado(c.id)}
                  className="flex items-center gap-2 text-xs bg-zinc-700 px-3 py-1 rounded-xl"
                >
                  <FaEdit /> Editar
                </button>
              )}

            </div>

            {/* BOTONES SOLO SI PENDIENTE */}
            {(!c.estado || c.estado === "pendiente") && (
              <div className="flex flex-wrap gap-3 mt-5">

                <button
                  onClick={() => cambiarEstado(c, "aceptada")}
                  className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-xl"
                >
                  <FaCheck /> Aceptar
                </button>

                <button
                  onClick={() => cambiarEstado(c, "rechazada")}
                  className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-xl"
                >
                  <FaTimes /> Rechazar
                </button>

                <button
                  onClick={() => eliminar(c.id)}
                  className="flex items-center gap-2 bg-zinc-700 px-4 py-2 rounded-xl"
                >
                  <FaTrash /> Eliminar
                </button>

              </div>
            )}

          </div>

        ))}

      </div>
    </div>
  );
}

export default CotizacionesAdmin;