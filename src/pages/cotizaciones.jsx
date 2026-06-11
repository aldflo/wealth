import { useEffect, useState } from "react";
import { db, auth } from "../firebase.config";

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

import {
  FaFileInvoiceDollar,
  FaCalendarAlt,
} from "react-icons/fa";

function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    let unsubscribeUid = () => {};
    let unsubscribeCorreo = () => {};

    // 🔥 Consulta por UID (nuevas cotizaciones)
    const qUid = query(
      collection(db, "cotizaciones"),
      where("uid", "==", auth.currentUser.uid),
      orderBy("fecha", "desc")
    );

    unsubscribeUid = onSnapshot(
      qUid,
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setCotizaciones(data);
        } else {
          // 🔥 Si no hay por UID busca por correo (cotizaciones antiguas)

          const qCorreo = query(
            collection(db, "cotizaciones"),
            where("usuario", "==", auth.currentUser.email),
            orderBy("fecha", "desc")
          );

          unsubscribeCorreo = onSnapshot(qCorreo, (snap) => {
            const data = snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setCotizaciones(data);
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsubscribeUid();
      unsubscribeCorreo();
    };
  }, []);

  const colorEstado = (estado) => {
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
    <div className="min-h-screen bg-black text-white px-4 py-8 md:px-8">

      {/* HEADER */}

      <div className="mb-10">

        <h1 className="flex items-center gap-3 text-3xl md:text-5xl font-bold">

          <FaFileInvoiceDollar className="text-yellow-500" />

          Mis Cotizaciones

        </h1>

        <p className="text-zinc-400 mt-3 text-sm md:text-base">
          Consulta el estado de todas las solicitudes que has enviado a
          Wealth.
        </p>

      </div>

      {cotizaciones.length === 0 ? (

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center">

          <FaFileInvoiceDollar className="text-6xl text-yellow-500 mx-auto mb-5" />

          <h2 className="text-2xl font-bold">
            Aún no has enviado cotizaciones
          </h2>

          <p className="text-zinc-400 mt-2">
            Cuando solicites una cotización aparecerá aquí y podrás seguir su
            estado en tiempo real.
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {cotizaciones.map((c) => (

            <div
              key={c.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-yellow-500 transition duration-300"
            >

              {/* IMAGEN */}

              <div className="h-56 bg-zinc-800">

                {c.imagen ? (

                  <img
                    src={c.imagen}
                    alt={c.nombre}
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    Sin imagen
                  </div>

                )}

              </div>

              {/* CONTENIDO */}

              <div className="p-6">

                <h2 className="text-2xl font-bold mb-3">
                  {c.nombre}
                </h2>

                <p className="text-zinc-400 text-sm leading-relaxed line-clamp-4">
                  {c.descripcion}
                </p>

                <div className="flex items-center gap-2 mt-5 text-zinc-500 text-sm">

                  <FaCalendarAlt />

                  {c.fecha?.toDate
                    ? c.fecha.toDate().toLocaleDateString()
                    : "Sin fecha"}

                </div>

                <div className="mt-5">

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold ${colorEstado(
                      c.estado
                    )}`}
                  >
                    {c.estado || "pendiente"}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Cotizaciones;