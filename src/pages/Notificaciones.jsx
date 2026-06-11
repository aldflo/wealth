import { useEffect, useState } from "react";
import { db, auth } from "../firebase.config";

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";

import { FaBell, FaTrash, FaCheck } from "react-icons/fa";

function Notificaciones() {

  const [notificaciones, setNotificaciones] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);

  useEffect(() => {

    if (!auth.currentUser?.email) return;

    const q = query(
      collection(db, "notificaciones"),
      where("usuario", "==", auth.currentUser.email),
      orderBy("fecha", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotificaciones(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  // 🔥 seleccionar / deseleccionar
  const toggleSelect = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // 🔥 seleccionar todas
  const seleccionarTodas = () => {
    if (seleccionadas.length === notificaciones.length) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(notificaciones.map(n => n.id));
    }
  };

  // 🔥 marcar como leídas
  const marcarLeidas = async () => {
    await Promise.all(
      seleccionadas.map((id) =>
        updateDoc(doc(db, "notificaciones", id), {
          leido: true
        })
      )
    );

    setSeleccionadas([]);
  };

  // 🔥 eliminar
  const eliminar = async () => {
    const ok = confirm("¿Eliminar notificaciones?");
    if (!ok) return;

    await Promise.all(
      seleccionadas.map((id) =>
        deleteDoc(doc(db, "notificaciones", id))
      )
    );

    setSeleccionadas([]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="mb-6 flex items-center gap-3">
        <FaBell className="text-yellow-500 text-2xl" />
        <h1 className="text-3xl font-bold">Notificaciones</h1>
      </div>

      {/* ACCIONES */}
      <div className="flex flex-wrap gap-3 mb-6">

        <button
          onClick={seleccionarTodas}
          className="bg-zinc-800 px-4 py-2 rounded-xl text-sm"
        >
          Seleccionar todo
        </button>

        <button
          onClick={marcarLeidas}
          className="bg-green-600 px-4 py-2 rounded-xl text-sm flex items-center gap-2"
        >
          <FaCheck /> Marcar leídas
        </button>

        <button
          onClick={eliminar}
          className="bg-red-600 px-4 py-2 rounded-xl text-sm flex items-center gap-2"
        >
          <FaTrash /> Eliminar
        </button>

      </div>

      {/* LISTA */}
      <div className="space-y-4">

        {notificaciones.length === 0 ? (
          <p className="text-zinc-400">No tienes notificaciones aún.</p>
        ) : (

          notificaciones.map((n) => (

            <div
              key={n.id}
              onClick={() => toggleSelect(n.id)}
              className={`p-4 rounded-xl border cursor-pointer transition
                ${n.leido
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-zinc-800 border-yellow-500"
                }
                ${seleccionadas.includes(n.id) ? "ring-2 ring-yellow-400" : ""}
              `}
            >

              <p className="text-white font-medium">
                {n.mensaje}
              </p>

              <p className="text-xs text-zinc-400 mt-2">
                {n.fecha?.toDate?.().toLocaleString() || "Sin fecha"}
              </p>

              {n.tipo && (
                <span className="text-xs text-yellow-400">
                  {n.tipo}
                </span>
              )}

              {!n.leido && (
                <span className="text-xs text-red-400 ml-2">
                  NUEVO
                </span>
              )}

            </div>

          ))
        )}

      </div>
    </div>
  );
}

export default Notificaciones;