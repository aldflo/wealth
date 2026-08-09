import { useEffect, useState } from "react";
import { db, auth } from "../firebase.config";

import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import {
  FaCheckCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaMoneyBillWave,
  FaShieldAlt,
  FaClock,
  FaImages,
  FaEye,
  FaTimes,
  FaBuilding,
} from "react-icons/fa";

function MisProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [proyectoActivo, setProyectoActivo] =
    useState(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [galeriaOpen, setGaleriaOpen] =
    useState(false);

  const [imagenesGaleria, setImagenesGaleria] =
    useState([]);

  const [imagenActual, setImagenActual] =
    useState(0);

  // ======================================================
  // PROYECTOS DEL CLIENTE
  // ======================================================

  useEffect(() => {
    let unsubProyectos = null;

    const unsubAuth = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          setProyectos([]);
          setCargando(false);
          return;
        }

        const q = query(
          collection(
            db,
            "proyectosClientes"
          ),
          where(
            "uid",
            "==",
            user.uid
          ),
          orderBy(
            "fechaFinalizacion",
            "desc"
          )
        );

        unsubProyectos = onSnapshot(
          q,
          (snapshot) => {
            const data =
              snapshot.docs.map(
                (documento) => ({
                  id:
                    documento.id,
                  ...documento.data(),
                })
              );

            setProyectos(data);
            setCargando(false);
          },
          (error) => {
            console.error(
              "Error cargando proyectos:",
              error
            );

            setCargando(false);
          }
        );
      }
    );

    return () => {
      unsubAuth();

      if (unsubProyectos) {
        unsubProyectos();
      }
    };
  }, []);

  // ======================================================
  // FORMATEAR MONEDA
  // ======================================================

  const moneda = (cantidad) => {
    if (
      cantidad === null ||
      cantidad === undefined ||
      cantidad === ""
    ) {
      return "No especificado";
    }

    const numero =
      Number(cantidad);

    if (
      Number.isNaN(numero)
    ) {
      return cantidad;
    }

    return numero.toLocaleString(
      "es-MX",
      {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
      }
    );
  };

  // ======================================================
  // FORMATEAR FECHA
  // ======================================================

  const formatearFecha = (
    fecha
  ) => {
    if (!fecha) {
      return "Sin fecha";
    }

    try {
      if (fecha?.toDate) {
        return fecha
          .toDate()
          .toLocaleDateString(
            "es-MX",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          );
      }

      return new Date(
        fecha
      ).toLocaleDateString(
        "es-MX"
      );
    } catch {
      return "Sin fecha";
    }
  };

  // ======================================================
  // OBTENER IMÁGENES
  // ======================================================

  const obtenerImagenes = (
    proyecto
  ) => {
    if (
      Array.isArray(
        proyecto.imagenes
      ) &&
      proyecto.imagenes.length >
        0
    ) {
      return proyecto.imagenes;
    }

    const combinadas = [
      ...(
        proyecto.imagenesProyecto ||
        []
      ),
      ...(
        proyecto.imagenesCliente ||
        []
      ),
    ];

    if (
      combinadas.length > 0
    ) {
      return [
        ...new Set(
          combinadas
        ),
      ];
    }

    if (proyecto.imagen) {
      return [
        proyecto.imagen,
      ];
    }

    return [];
  };

  // ======================================================
  // VER PROYECTO
  // ======================================================

  const abrirProyecto = (
    proyecto
  ) => {
    setProyectoActivo(
      proyecto
    );

    setModalOpen(true);
  };

  // ======================================================
  // GALERÍA
  // ======================================================

  const abrirGaleria = (
    imagenes,
    index = 0
  ) => {
    setImagenesGaleria(
      imagenes
    );

    setImagenActual(
      index
    );

    setGaleriaOpen(true);
  };

  const siguienteImagen =
    () => {
      setImagenActual(
        (prev) =>
          prev + 1 >=
          imagenesGaleria.length
            ? 0
            : prev + 1
      );
    };

  const anteriorImagen =
    () => {
      setImagenActual(
        (prev) =>
          prev === 0
            ? imagenesGaleria.length -
              1
            : prev - 1
      );
    };

  // ======================================================
  // CARGANDO
  // ======================================================

  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="text-center">

          <div className="w-11 h-11 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin mx-auto" />

          <p className="text-zinc-500 mt-4">
            Cargando tus proyectos...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="w-full">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-8">

        <p className="text-xs uppercase tracking-[0.25em] text-yellow-500 font-semibold">
          Wealth
        </p>

        <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">
          Mis Proyectos
        </h1>

        <p className="text-zinc-400 mt-2 max-w-2xl">
          Aquí encontrarás los trabajos realizados y finalizados por Wealth.
        </p>

      </div>

      {/* ================================================= */}
      {/* SIN PROYECTOS */}
      {/* ================================================= */}

      {proyectos.length ===
        0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">

          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">

            <FaBuilding className="text-zinc-600 text-2xl" />

          </div>

          <h2 className="text-2xl font-semibold text-white mt-5">
            Aún no tienes proyectos finalizados
          </h2>

          <p className="text-zinc-500 mt-2 max-w-md mx-auto">
            Cuando Wealth complete uno de tus trabajos, aparecerá automáticamente en esta sección.
          </p>

        </div>
      )}

      {/* ================================================= */}
      {/* GRID */}
      {/* ================================================= */}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

        {proyectos.map(
          (proyecto) => {
            const imagenes =
              obtenerImagenes(
                proyecto
              );

            return (
              <article
                key={
                  proyecto.id
                }
                className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 transition"
              >

                {/* IMAGEN */}

                <div className="relative h-64 bg-black">

                  {imagenes.length >
                  0 ? (
                    <img
                      src={
                        imagenes[0]
                      }
                      alt={
                        proyecto.nombre
                      }
                      onClick={() =>
                        abrirGaleria(
                          imagenes,
                          0
                        )
                      }
                      className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">

                      <FaBuilding className="text-zinc-800 text-5xl" />

                    </div>
                  )}

                  {/* TERMINADO */}

                  <div className="absolute top-4 left-4">

                    <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">

                      <FaCheckCircle />

                      TRABAJO TERMINADO

                    </span>

                  </div>

                  {imagenes.length >
                    1 && (
                    <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white flex items-center gap-2">

                      <FaImages />

                      {
                        imagenes.length
                      }

                    </div>
                  )}

                </div>

                {/* INFORMACIÓN */}

                <div className="p-6">

                  <p className="text-xs uppercase tracking-widest text-yellow-500">
                    {proyecto.tipo ||
                      "Proyecto Wealth"}
                  </p>

                  <h2 className="text-xl font-bold text-white mt-2 capitalize">
                    {proyecto.nombre ||
                      "Proyecto"}
                  </h2>

                  {proyecto.descripcion && (
                    <p className="text-zinc-400 text-sm mt-3 line-clamp-3">
                      {
                        proyecto.descripcion
                      }
                    </p>
                  )}

                  {/* FECHA */}

                  <div className="flex items-center gap-2 text-sm text-zinc-500 mt-5">

                    <FaCalendarAlt className="text-yellow-500" />

                    Finalizado el{" "}

                    {formatearFecha(
                      proyecto.fechaFinalizacion
                    )}

                  </div>

                  {/* PRECIO */}

                  {proyecto.precioTotal !==
                    null &&
                    proyecto.precioTotal !==
                      undefined && (
                      <div className="mt-5 bg-zinc-950 border border-zinc-800 rounded-2xl p-4">

                        <p className="text-xs text-zinc-500">
                          Inversión del proyecto
                        </p>

                        <p className="text-2xl font-bold text-white mt-1">
                          {moneda(
                            proyecto.precioTotal
                          )}
                        </p>

                      </div>
                    )}

                  {/* BOTÓN */}

                  <button
                    onClick={() =>
                      abrirProyecto(
                        proyecto
                      )
                    }
                    className="w-full mt-5 bg-yellow-500 hover:bg-yellow-400 text-black py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition"
                  >

                    <FaEye />

                    Ver proyecto

                  </button>

                </div>

              </article>
            );
          }
        )}

      </div>

      {/* ================================================= */}
      {/* MODAL PROYECTO */}
      {/* ================================================= */}

      {modalOpen &&
        proyectoActivo && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() =>
              setModalOpen(false)
            }
          >

            <div
              className="bg-zinc-950 border border-zinc-700 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* HEADER */}

              <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 p-6 md:p-8">

                <div className="flex justify-between gap-4">

                  <div>

                    <p className="text-xs uppercase tracking-widest text-green-500 font-bold flex items-center gap-2">

                      <FaCheckCircle />

                      Trabajo terminado

                    </p>

                    <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">
                      {
                        proyectoActivo.nombre
                      }
                    </h2>

                  </div>

                  <button
                    onClick={() =>
                      setModalOpen(
                        false
                      )
                    }
                    className="text-zinc-500 hover:text-white text-3xl"
                  >
                    ×
                  </button>

                </div>

              </div>

              <div className="p-6 md:p-8 space-y-7">

                {/* GALERÍA */}

                {obtenerImagenes(
                  proyectoActivo
                ).length > 0 && (
                  <section>

                    <h3 className="font-bold text-white mb-4">
                      Imágenes del proyecto
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                      {obtenerImagenes(
                        proyectoActivo
                      ).map(
                        (
                          imagen,
                          index
                        ) => (
                          <img
                            key={
                              index
                            }
                            src={
                              imagen
                            }
                            alt={`Proyecto ${
                              index +
                              1
                            }`}
                            onClick={() =>
                              abrirGaleria(
                                obtenerImagenes(
                                  proyectoActivo
                                ),
                                index
                              )
                            }
                            className="w-full aspect-square object-cover rounded-2xl border border-zinc-800 cursor-zoom-in hover:opacity-80 transition"
                          />
                        )
                      )}

                    </div>

                  </section>
                )}

                {/* DETALLES */}

                <section>

                  <h3 className="font-bold text-white mb-4">
                    Información del proyecto
                  </h3>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">

                    <Detalle
                      icon={
                        <FaCalendarAlt />
                      }
                      titulo="Fecha de finalización"
                      valor={formatearFecha(
                        proyectoActivo.fechaFinalizacion
                      )}
                    />

                    <Detalle
                      icon={
                        <FaMapMarkerAlt />
                      }
                      titulo="Ubicación"
                      valor={
                        proyectoActivo.ubicacion ||
                        "No especificada"
                      }
                    />

                    <Detalle
                      icon={
                        <FaRulerCombined />
                      }
                      titulo="Medidas"
                      valor={
                        proyectoActivo.medidas ||
                        "No especificadas"
                      }
                    />

                    <Detalle
                      icon={
                        <FaMoneyBillWave />
                      }
                      titulo="Precio total"
                      valor={moneda(
                        proyectoActivo.precioTotal
                      )}
                    />

                    <Detalle
                      icon={
                        <FaClock />
                      }
                      titulo="Tiempo estimado"
                      valor={
                        proyectoActivo.tiempoEstimado ||
                        "No especificado"
                      }
                    />

                    <Detalle
                      icon={
                        <FaShieldAlt />
                      }
                      titulo="Garantía"
                      valor={
                        proyectoActivo.garantia ||
                        "No especificada"
                      }
                    />

                  </div>

                </section>

                {/* DESCRIPCIÓN */}

                {proyectoActivo.descripcion && (
                  <section>

                    <h3 className="font-bold text-white mb-3">
                      Descripción
                    </h3>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

                      <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {
                          proyectoActivo.descripcion
                        }
                      </p>

                    </div>

                  </section>
                )}

                {/* MENSAJE */}

                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">

                  <p className="font-bold text-green-400">
                    Proyecto completado por Wealth
                  </p>

                  <p className="text-sm text-zinc-400 mt-2">
                    Este proyecto ha sido finalizado. Conserva esta información como referencia del trabajo realizado y de las condiciones de garantía correspondientes.
                  </p>

                </div>

              </div>

            </div>

          </div>
        )}

      {/* ================================================= */}
      {/* GALERÍA */}
      {/* ================================================= */}

      {galeriaOpen &&
        imagenesGaleria.length >
          0 && (
          <div
            className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center"
            onClick={() =>
              setGaleriaOpen(
                false
              )
            }
          >

            <button
              onClick={() =>
                setGaleriaOpen(
                  false
                )
              }
              className="absolute top-5 right-5 text-white text-3xl z-20"
            >
              <FaTimes />
            </button>

            {imagenesGaleria.length >
              1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  anteriorImagen();
                }}
                className="absolute left-4 md:left-8 text-white text-5xl"
              >
                ‹
              </button>
            )}

            <img
              src={
                imagenesGaleria[
                  imagenActual
                ]
              }
              alt="Proyecto"
              className="max-w-[90%] max-h-[90%] object-contain rounded-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            />

            {imagenesGaleria.length >
              1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  siguienteImagen();
                }}
                className="absolute right-4 md:right-8 text-white text-5xl"
              >
                ›
              </button>
            )}

            {imagenesGaleria.length >
              1 && (
              <div className="absolute bottom-5 bg-black/80 border border-white/10 px-4 py-2 rounded-full text-sm text-white">

                {imagenActual + 1} /{" "}
                {
                  imagenesGaleria.length
                }

              </div>
            )}

          </div>
        )}

    </div>
  );
}

// ======================================================
// DETALLE
// ======================================================

function Detalle({
  icon,
  titulo,
  valor,
}) {
  return (
    <div className="grid sm:grid-cols-[220px_1fr] gap-2 sm:gap-5">

      <div className="text-zinc-500 text-sm flex items-center gap-2">

        <span className="text-yellow-500">
          {icon}
        </span>

        {titulo}

      </div>

      <div className="text-zinc-200 text-sm break-words">
        {valor}
      </div>

    </div>
  );
}

export default MisProyectos;