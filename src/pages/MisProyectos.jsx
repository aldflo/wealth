import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { db, auth } from "../firebase.config";

import {
  collection,
  onSnapshot,
  query,
  where,
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
  FaHistory,
  FaTimes,
  FaBuilding,
} from "react-icons/fa";

function MisProyectos() {
  const { modoOscuro = false } = useOutletContext() || {};

  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

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

  /* ======================================================
     HISTORIAL / LÍNEA DE TIEMPO
  ====================================================== */

  const [historialOpen, setHistorialOpen] =
    useState(false);

  const [proyectoHistorial, setProyectoHistorial] =
    useState(null);

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

        // Filtramos solo por UID para evitar depender de un índice
        // compuesto de Firestore. El orden se hace abajo en el cliente.
        const q = query(
          collection(
            db,
            "proyectosClientes"
          ),
          where(
            "uid",
            "==",
            user.uid
          )
        );

        unsubProyectos = onSnapshot(
          q,
          (snapshot) => {
            const data =
              snapshot.docs
                .map(
                  (documento) => ({
                    id:
                      documento.id,
                    ...documento.data(),
                  })
                )
                .sort((a, b) => {
                  const fechaA =
                    a.fechaFinalizacion?.toMillis?.() ||
                    a.fechaCreacion?.toMillis?.() ||
                    0;

                  const fechaB =
                    b.fechaFinalizacion?.toMillis?.() ||
                    b.fechaCreacion?.toMillis?.() ||
                    0;

                  return fechaB - fechaA;
                });

            setErrorCarga("");
            setProyectos(data);
            setCargando(false);
          },
          (error) => {
            console.error(
              "Error cargando proyectos:",
              error
            );

            setErrorCarga(
              "No se pudieron cargar tus proyectos. Revisa la consola de Firebase si el problema continúa."
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
  // FORMATEAR FECHA Y HORA
  // ======================================================

  const formatearFechaHora = (
    fecha
  ) => {
    if (!fecha) {
      return "Sin fecha";
    }

    try {
      const date =
        fecha?.toDate
          ? fecha.toDate()
          : new Date(fecha);

      if (
        !date ||
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "Sin fecha";
      }

      return date.toLocaleString(
        "es-MX",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      );
    } catch {
      return "Sin fecha";
    }
  };

  // ======================================================
  // PROPUESTA / PRECIO NORMALIZADOS
  // ======================================================

  const obtenerPrecioProyecto = (
    proyecto
  ) => {
    return (
      proyecto?.precioFinal ??
      proyecto?.precioTotal ??
      proyecto?.propuestaActual?.precioTotal ??
      proyecto?.presupuestoAdmin ??
      null
    );
  };

  const obtenerTiempoEstimado = (
    proyecto
  ) => {
    return (
      proyecto?.tiempoEstimado ||
      proyecto?.propuestaActual?.tiempoEstimado ||
      "No especificado"
    );
  };

  const obtenerGarantia = (
    proyecto
  ) => {
    return (
      proyecto?.garantia ||
      proyecto?.propuestaActual?.garantia ||
      "No especificada"
    );
  };

  // ======================================================
  // HISTORIAL
  // ======================================================

  const obtenerMillis = (
    fecha
  ) => {
    if (!fecha) {
      return 0;
    }

    try {
      if (
        typeof fecha.toMillis ===
        "function"
      ) {
        return fecha.toMillis();
      }

      if (
        typeof fecha.toDate ===
        "function"
      ) {
        return fecha
          .toDate()
          .getTime();
      }

      return (
        new Date(
          fecha
        ).getTime() ||
        0
      );
    } catch {
      return 0;
    }
  };

  const obtenerHistorialVisible = (
    proyecto
  ) => {
    const eventos =
      Array.isArray(
        proyecto?.historial
      )
        ? [
            ...proyecto.historial,
          ]
        : [];

    // Compatibilidad con proyectos terminados antes
    // de agregar la línea de tiempo.
    if (
      proyecto?.fechaCreacion &&
      !eventos.some(
        (evento) =>
          evento.tipo ===
          "solicitud_creada"
      )
    ) {
      eventos.push({
        tipo:
          "solicitud_creada",

        titulo:
          "Solicitud creada",

        descripcion:
          "Se creó la solicitud de cotización.",

        actor:
          "cliente",

        fecha:
          proyecto.fechaCreacion,
      });
    }

    if (
      proyecto?.propuestaActual?.fecha &&
      !eventos.some(
        (evento) =>
          [
            "propuesta_enviada",
            "propuesta_modificada",
          ].includes(
            evento.tipo
          )
      )
    ) {
      eventos.push({
        tipo:
          "propuesta_enviada",

        titulo:
          "Propuesta enviada",

        descripcion:
          "Wealth envió la propuesta del proyecto.",

        actor:
          "admin",

        fecha:
          proyecto.propuestaActual.fecha,
      });
    }

    if (
      proyecto?.fechaFinalizacion &&
      !eventos.some(
        (evento) =>
          evento.tipo ===
          "trabajo_finalizado"
      )
    ) {
      eventos.push({
        tipo:
          "trabajo_finalizado",

        titulo:
          "Trabajo finalizado",

        descripcion:
          "Wealth finalizó el trabajo y lo agregó a Mis Proyectos.",

        actor:
          "admin",

        fecha:
          proyecto.fechaFinalizacion,
      });
    }

    return eventos
      .filter(
        (evento) =>
          evento &&
          evento.fecha
      )
      .sort(
        (a, b) =>
          obtenerMillis(
            a.fecha
          ) -
          obtenerMillis(
            b.fecha
          )
      );
  };

  const abrirHistorial = (
    proyecto
  ) => {
    setProyectoHistorial(
      proyecto
    );

    setHistorialOpen(
      true
    );
  };

  // ======================================================
  // OBTENER IMÁGENES
  // ======================================================

  const obtenerFotosFinales = (
    proyecto
  ) => {
    if (
      Array.isArray(
        proyecto.imagenesTrabajoFinal
      ) &&
      proyecto.imagenesTrabajoFinal.length >
        0
    ) {
      return [
        ...new Set(
          proyecto.imagenesTrabajoFinal
        ),
      ];
    }

    return [];
  };

  const obtenerReferencias = (
    proyecto
  ) => {
    const combinadas = [
      ...(
        proyecto.imagenes ||
        []
      ),
      ...(
        proyecto.imagenesProyecto ||
        []
      ),
      ...(
        proyecto.imagenesCliente ||
        []
      ),
    ].filter(Boolean);

    return [
      ...new Set(
        combinadas
      ),
    ];
  };

  const obtenerImagenes = (
    proyecto
  ) => {
    const finales =
      obtenerFotosFinales(
        proyecto
      );

    if (finales.length > 0) {
      return finales;
    }

    const referencias =
      obtenerReferencias(
        proyecto
      );

    if (referencias.length > 0) {
      return referencias;
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
    <div className={`w-full min-h-screen transition-colors duration-300 ${modoOscuro ? "bg-black text-white" : "wealth-light bg-gray-50 text-gray-900"}`}>
      <style>{temaClaroCss}</style>

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

      {errorCarga && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4">
          {errorCarga}
        </div>
      )}

      {/* ================================================= */}
      {/* SIN PROYECTOS */}
      {/* ================================================= */}

      {!errorCarga && proyectos.length ===
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

                  {obtenerPrecioProyecto(
                    proyecto
                  ) !==
                    null &&
                    obtenerPrecioProyecto(
                      proyecto
                    ) !==
                      undefined && (
                      <div className="mt-5 bg-zinc-950 border border-zinc-800 rounded-2xl p-4">

                        <p className="text-xs text-zinc-500">
                          Inversión del proyecto
                        </p>

                        <p className="text-2xl font-bold text-white mt-1">
                          {moneda(
                            obtenerPrecioProyecto(
                              proyecto
                            )
                          )}
                        </p>

                      </div>
                    )}

                  {/* BOTONES */}

                  <div className="grid grid-cols-2 gap-3 mt-5">

                    <button
                      onClick={() =>
                        abrirHistorial(
                          proyecto
                        )
                      }
                      className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition"
                    >

                      <FaHistory className="text-yellow-500" />

                      Historial

                    </button>

                    <button
                      onClick={() =>
                        abrirProyecto(
                          proyecto
                        )
                      }
                      className="bg-yellow-500 hover:bg-yellow-400 text-black py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition"
                    >

                      <FaEye />

                      Ver proyecto

                    </button>

                  </div>

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

                {/* GALERÍA DEL RESULTADO */}

                {obtenerFotosFinales(
                  proyectoActivo
                ).length > 0 && (
                  <section>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                          Resultado final
                        </p>

                        <h3 className="font-bold text-white text-lg mt-1">
                          Fotografías del trabajo realizado
                        </h3>
                      </div>

                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                        <FaImages />
                        {obtenerFotosFinales(
                          proyectoActivo
                        ).length} foto(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {obtenerFotosFinales(
                        proyectoActivo
                      ).map(
                        (
                          imagen,
                          index
                        ) => (
                          <img
                            key={
                              imagen
                            }
                            src={
                              imagen
                            }
                            alt={`Trabajo terminado ${
                              index +
                              1
                            }`}
                            onClick={() =>
                              abrirGaleria(
                                obtenerFotosFinales(
                                  proyectoActivo
                                ),
                                index
                              )
                            }
                            className="w-full aspect-square object-cover rounded-2xl border border-emerald-500/20 cursor-zoom-in hover:border-emerald-500/50 hover:opacity-90 transition"
                          />
                        )
                      )}
                    </div>
                  </section>
                )}

                {/* REFERENCIAS ORIGINALES */}

                {obtenerReferencias(
                  proyectoActivo
                ).length > 0 && (
                  <section>
                    <h3 className="font-bold text-white mb-2">
                      Imágenes de la solicitud
                    </h3>

                    <p className="text-sm text-zinc-500 mb-4">
                      Referencias y fotografías que formaron parte de la cotización original.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {obtenerReferencias(
                        proyectoActivo
                      ).map(
                        (
                          imagen,
                          index
                        ) => (
                          <img
                            key={
                              imagen
                            }
                            src={
                              imagen
                            }
                            alt={`Referencia ${
                              index +
                              1
                            }`}
                            onClick={() =>
                              abrirGaleria(
                                obtenerReferencias(
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
                        obtenerPrecioProyecto(
                          proyectoActivo
                        )
                      )}
                    />

                    <Detalle
                      icon={
                        <FaClock />
                      }
                      titulo="Tiempo estimado"
                      valor={
                        obtenerTiempoEstimado(
                          proyectoActivo
                        )
                      }
                    />

                    {proyectoActivo.fechaInicioInstalacion && (
                      <Detalle
                        icon={
                          <FaCalendarAlt />
                        }
                        titulo="Inicio de instalación"
                        valor={
                          proyectoActivo.fechaInicioInstalacion
                        }
                      />
                    )}

                    {proyectoActivo.fechaFinInstalacion && (
                      <Detalle
                        icon={
                          <FaCalendarAlt />
                        }
                        titulo="Fin de instalación"
                        valor={
                          proyectoActivo.fechaFinInstalacion
                        }
                      />
                    )}

                    <Detalle
                      icon={
                        <FaShieldAlt />
                      }
                      titulo="Garantía"
                      valor={
                        obtenerGarantia(
                          proyectoActivo
                        )
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

                {/* HISTORIAL */}

                <section>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                    <div>

                      <h3 className="font-bold text-white flex items-center gap-2">

                        <FaHistory className="text-yellow-500" />

                        Historial del proyecto

                      </h3>

                      <p className="text-zinc-500 text-sm mt-1">
                        Fechas y movimientos registrados durante el trabajo.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        abrirHistorial(
                          proyectoActivo
                        )
                      }
                      className="px-4 py-2.5 bg-zinc-900 border border-zinc-700 hover:border-yellow-500/40 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    >

                      <FaEye />

                      Ver línea de tiempo

                    </button>

                  </div>

                  {obtenerHistorialVisible(
                    proyectoActivo
                  ).length >
                    0 && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

                      <p className="text-zinc-500 text-xs uppercase tracking-wider">
                        Último movimiento
                      </p>

                      <p className="text-white font-bold mt-2">
                        {
                          obtenerHistorialVisible(
                            proyectoActivo
                          )[
                            obtenerHistorialVisible(
                              proyectoActivo
                            ).length -
                              1
                          ]?.titulo
                        }
                      </p>

                      <p className="text-yellow-500/80 text-sm mt-1">
                        {formatearFechaHora(
                          obtenerHistorialVisible(
                            proyectoActivo
                          )[
                            obtenerHistorialVisible(
                              proyectoActivo
                            ).length -
                              1
                          ]?.fecha
                        )}
                      </p>

                    </div>
                  )}

                </section>

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
      {/* HISTORIAL / LÍNEA DE TIEMPO */}
      {/* ================================================= */}

      {historialOpen &&
        proyectoHistorial && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[65] overflow-y-auto p-4"
          onClick={() =>
            setHistorialOpen(
              false
            )
          }
        >

          <div
            className="w-full max-w-2xl mx-auto my-8 bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <header className="p-6 md:p-8 border-b border-zinc-800 flex items-start justify-between gap-4">

              <div>

                <p className="text-yellow-500 text-xs uppercase tracking-[0.2em] font-bold">
                  Expediente Wealth
                </p>

                <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">
                  Historial del proyecto
                </h2>

                <p className="text-zinc-500 mt-1">
                  {proyectoHistorial.nombre ||
                    "Proyecto"}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setHistorialOpen(
                    false
                  )
                }
                className="w-11 h-11 bg-black border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white"
              >

                <FaTimes />

              </button>

            </header>

            <div className="p-6 md:p-8">

              {obtenerHistorialVisible(
                proyectoHistorial
              ).length ===
              0 ? (
                <div className="bg-black border border-zinc-800 rounded-2xl p-8 text-center">

                  <FaHistory className="text-zinc-700 text-4xl mx-auto" />

                  <p className="text-zinc-500 mt-4">
                    Todavía no hay movimientos registrados para este proyecto.
                  </p>

                </div>
              ) : (
                <div className="relative">

                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-zinc-800" />

                  <div className="space-y-6">

                    {obtenerHistorialVisible(
                      proyectoHistorial
                    ).map(
                      (
                        evento,
                        indice
                      ) => (
                        <div
                          key={`${evento.tipo}-${obtenerMillis(
                            evento.fecha
                          )}-${indice}`}
                          className="relative pl-10"
                        >

                          <div className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full bg-black border-2 border-yellow-500 flex items-center justify-center">

                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />

                          </div>

                          <div className="bg-black border border-zinc-800 rounded-2xl p-4">

                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">

                              <div>

                                <p className="text-white font-bold">
                                  {
                                    evento.titulo
                                  }
                                </p>

                                {evento.descripcion && (
                                  <p className="text-zinc-400 text-sm mt-1">
                                    {
                                      evento.descripcion
                                    }
                                  </p>
                                )}

                              </div>

                              <span className="text-zinc-600 text-xs shrink-0">
                                {evento.actor ===
                                "cliente"
                                  ? "Cliente"
                                  : "Wealth"}
                              </span>

                            </div>

                            <p className="text-yellow-500/80 text-xs mt-3">
                              {formatearFechaHora(
                                evento.fecha
                              )}
                            </p>

                            {evento.fechaInicioInstalacion &&
                              evento.fechaFinInstalacion && (
                                <div className="mt-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3">

                                  <p className="text-cyan-400 text-xs font-bold">
                                    Periodo de instalación
                                  </p>

                                  <p className="text-zinc-300 text-sm mt-1">
                                    {
                                      evento.fechaInicioInstalacion
                                    }{" "}
                                    →{" "}
                                    {
                                      evento.fechaFinInstalacion
                                    }
                                  </p>

                                </div>
                              )}

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

              <div className="mt-8 bg-green-500/5 border border-green-500/20 rounded-2xl p-4">

                <p className="text-green-400 font-bold text-sm">
                  Proyecto finalizado
                </p>

                <p className="text-zinc-400 text-sm mt-1">
                  Finalización registrada:{" "}
                  {formatearFechaHora(
                    proyectoHistorial.fechaFinalizacion
                  )}
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


const temaClaroCss = `
  .wealth-light .bg-black { background-color: #ffffff !important; }
  .wealth-light .bg-zinc-950 { background-color: #ffffff !important; }
  .wealth-light .bg-zinc-900 { background-color: #f9fafb !important; }
  .wealth-light .bg-zinc-800 { background-color: #f3f4f6 !important; }
  .wealth-light .bg-zinc-700 { background-color: #e5e7eb !important; }

  .wealth-light .bg-zinc-950\\/95 { background-color: rgba(255,255,255,.95) !important; }
  .wealth-light .bg-zinc-950\\/70 { background-color: rgba(255,255,255,.92) !important; }
  .wealth-light .bg-zinc-950\\/60 { background-color: rgba(255,255,255,.88) !important; }
  .wealth-light .bg-zinc-900\\/90 { background-color: rgba(249,250,251,.95) !important; }
  .wealth-light .bg-zinc-900\\/70 { background-color: rgba(249,250,251,.90) !important; }
  .wealth-light .bg-zinc-900\\/60 { background-color: rgba(249,250,251,.88) !important; }
  .wealth-light .bg-zinc-800\\/70 { background-color: rgba(243,244,246,.90) !important; }
  .wealth-light .bg-zinc-800\\/40 { background-color: rgba(243,244,246,.75) !important; }

  .wealth-light .text-white { color: #111827 !important; }
  .wealth-light .text-zinc-100 { color: #111827 !important; }
  .wealth-light .text-zinc-200 { color: #1f2937 !important; }
  .wealth-light .text-zinc-300 { color: #374151 !important; }
  .wealth-light .text-zinc-400 { color: #4b5563 !important; }
  .wealth-light .text-zinc-500 { color: #6b7280 !important; }
  .wealth-light .text-zinc-600 { color: #9ca3af !important; }
  .wealth-light .text-zinc-700 { color: #9ca3af !important; }
  .wealth-light .text-zinc-800 { color: #6b7280 !important; }

  .wealth-light .border-zinc-900 { border-color: #e5e7eb !important; }
  .wealth-light .border-zinc-800 { border-color: #e5e7eb !important; }
  .wealth-light .border-zinc-700 { border-color: #d1d5db !important; }
  .wealth-light .border-zinc-600 { border-color: #d1d5db !important; }
  .wealth-light .border-white\\/10 { border-color: rgba(17,24,39,.10) !important; }
  .wealth-light .border-white\\/20 { border-color: rgba(17,24,39,.15) !important; }
  .wealth-light .border-white\\/30 { border-color: rgba(17,24,39,.20) !important; }

  .wealth-light .hover\\:bg-zinc-900:hover { background-color: #f3f4f6 !important; }
  .wealth-light .hover\\:bg-zinc-800:hover { background-color: #e5e7eb !important; }
  .wealth-light .hover\\:bg-zinc-700:hover { background-color: #d1d5db !important; }
  .wealth-light .hover\\:text-white:hover { color: #111827 !important; }
  .wealth-light .hover\\:border-zinc-500:hover { border-color: #9ca3af !important; }
  .wealth-light .hover\\:border-zinc-600:hover { border-color: #9ca3af !important; }

  .wealth-light input,
  .wealth-light textarea,
  .wealth-light select {
    color: #111827;
    color-scheme: light;
  }

  .wealth-light input::placeholder,
  .wealth-light textarea::placeholder {
    color: #9ca3af !important;
  }

  .wealth-light option {
    background-color: #ffffff;
    color: #111827;
  }

  /* Los visores de imágenes y overlays con transparencia se mantienen oscuros
     intencionalmente para conservar contraste sobre fotografías. */
`;

export default MisProyectos;