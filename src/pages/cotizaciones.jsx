import { useEffect, useState } from "react";
import { db, auth } from "../firebase.config";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { FaFileInvoiceDollar } from "react-icons/fa";

function Cotizaciones() {

  const [cotizaciones, setCotizaciones] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {

    if (!user) return;

    // 🔥 SOLO COTIZACIONES DEL USUARIO LOGUEADO
    const q = query(
      collection(db, "cotizaciones"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCotizaciones(data);
    });

    return () => unsub();

  }, [user]);

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-4xl font-bold flex items-center gap-3">
          <FaFileInvoiceDollar className="text-yellow-500" />
          Mis Cotizaciones
        </h1>

        <p className="text-zinc-400 mt-2">
          Revisa el estado de tus solicitudes de presupuesto.
        </p>

      </div>

      {/* LISTA */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {cotizaciones.length === 0 ? (

          <div className="text-zinc-500">
            No tienes cotizaciones aún.
          </div>

        ) : (

          cotizaciones.map((c) => (

            <div
              key={c.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-yellow-500 transition"
            >

              {/* PROYECTO */}
              <h2 className="text-xl font-bold mb-2">
                {c.proyecto}
              </h2>

              {/* MENSAJE */}
              <p className="text-zinc-400 text-sm mb-4">
                {c.mensaje}
              </p>

              {/* FOOTER */}
              <div className="flex justify-between items-center">

                <span className="text-xs text-zinc-500">
                  {c.fecha?.toDate?.().toLocaleDateString() || "Sin fecha"}
                </span>

                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  c.estado === "aprobado"
                    ? "bg-green-600"
                    : c.estado === "rechazado"
                    ? "bg-red-600"
                    : "bg-yellow-500 text-black"
                }`}>
                  {c.estado || "pendiente"}
                </span>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default Cotizaciones;