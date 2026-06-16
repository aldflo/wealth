import { useEffect, useState } from "react";
import { db, auth } from "../firebase.config";

import {
  collection,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

import {
  FaFileInvoiceDollar,
  FaCalendarAlt,
} from "react-icons/fa";

function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);

  // 🔥 MODAL GALERÍA
  const [open, setOpen] = useState(false);
  const [imgs, setImgs] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userEmail = auth.currentUser.email;
    const userUid = auth.currentUser.uid;

    const q = query(
      collection(db, "cotizaciones"),
      orderBy("fecha", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((c) => c.uid === userUid || c.usuario === userEmail);

      setCotizaciones(data);
    });

    return () => unsub();
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

  // 🔥 abrir galería
  const openGallery = (imagenes, i = 0) => {
    const list = Array.isArray(imagenes) ? imagenes : [imagenes];
    setImgs(list);
    setIndex(i);
    setOpen(true);
  };

  const next = () => {
    setIndex((p) => (p + 1 >= imgs.length ? 0 : p + 1));
  };

  const prev = () => {
    setIndex((p) => (p === 0 ? imgs.length - 1 : p - 1));
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 md:px-8">

      <div className="mb-10">
        <h1 className="flex items-center gap-3 text-3xl md:text-5xl font-bold">
          <FaFileInvoiceDollar className="text-yellow-500" />
          Mis Cotizaciones
        </h1>
      </div>

      {/* GALERÍA */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {cotizaciones.map((c) => {

          const imagenes = c.imagenes?.length
            ? c.imagenes
            : c.imagen
            ? [c.imagen]
            : [];

          return (
            <div
              key={c.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden"
            >

              {/* IMAGEN PRINCIPAL */}
              <div className="relative h-64 bg-black">

                {imagenes.length > 0 ? (
                  <img
                    src={imagenes[0]}
                    onClick={() => openGallery(imagenes, 0)}
                    className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500">
                    Sin imagen
                  </div>
                )}

                {/* indicador si hay más */}
                {imagenes.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                    +{imagenes.length - 1} más
                  </div>
                )}

              </div>

              {/* INFO */}
              <div className="p-6">

                <h2 className="text-xl font-bold">{c.nombre}</h2>

                <p className="text-zinc-400 text-sm mt-2">
                  {c.descripcion}
                </p>

                <div className="flex items-center gap-2 mt-4 text-zinc-500 text-sm">
                  <FaCalendarAlt />
                  {c.fecha?.toDate
                    ? c.fecha.toDate().toLocaleDateString()
                    : "Sin fecha"}
                </div>

                <div className="mt-4">
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
          );
        })}

      </div>

      {/* 🔥 MODAL PRO */}
      {open && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >

          {/* izquierda */}
          {imgs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-5 text-white text-5xl"
            >
              ❮
            </button>
          )}

          {/* imagen grande */}
          <img
            src={imgs[index]}
            className="max-w-[90%] max-h-[90%] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* derecha */}
          {imgs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-5 text-white text-5xl"
            >
              ❯
            </button>
          )}

          {/* cerrar */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 text-white text-5xl hover:text-yellow-500"
          >
            ×
          </button>

        </div>
      )}

    </div>
  );
}

export default Cotizaciones;