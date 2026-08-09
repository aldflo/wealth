import { useEffect, useState } from "react";
import { db, auth } from "../firebase.config";

import {
  collection,
  query,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import {
  FaCalendarAlt,
  FaClock,
  FaShieldAlt,
  FaEye,
  FaMoneyBillWave,
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaPen,
  FaHistory,
  FaBuilding,
  FaSyncAlt,
} from "react-icons/fa";

function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // GALERÍA
  const [open, setOpen] = useState(false);
  const [imgs, setImgs] = useState([]);
  const [index, setIndex] = useState(0);

  // MODAL PROPUESTA
  const [propuestaOpen, setPropuestaOpen] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] =
    useState(null);

  const [procesando, setProcesando] = useState(false);

  // ============================================
  // FIREBASE TIEMPO REAL
  // ============================================

  useEffect(() => {
    let unsubCotizaciones = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCotizaciones([]);
        setCargando(false);
        return;
      }

      const userEmail = user.email;
      const userUid = user.uid;

      const q = query(
        collection(db, "cotizaciones"),
        orderBy("fecha", "desc")
      );

      unsubCotizaciones = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs
            .map((documento) => ({
              id: documento.id,
              ...documento.data(),
            }))
            .filter(
              (c) =>
                c.uid === userUid ||
                c.usuario === userEmail
            );

          setCotizaciones(data);

          // Mantener modal actualizado en tiempo real
          setCotizacionSeleccionada((actual) => {
            if (!actual) return null;

            const actualizada = data.find(
              (c) => c.id === actual.id
            );

            return actualizada || actual;
          });

          setCargando(false);
        },
        (error) => {
          console.error(
            "Error cargando cotizaciones:",
            error
          );

          setCargando(false);
        }
      );
    });

    return () => {
      unsubAuth();

      if (unsubCotizaciones) {
        unsubCotizaciones();
      }
    };
  }, []);

  // ============================================
  // ESTADOS
  // ============================================

  const obtenerEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return {
          texto: "Solicitud enviada",
          color: "bg-zinc-700 text-white",
        };

      case "revision":
      case "en_revision":
        return {
          texto: "En revisión",
          color: "bg-blue-600 text-white",
        };

      case "cotizada":
      case "propuesta_enviada":
        return {
          texto: "Propuesta recibida",
          color: "bg-yellow-500 text-black",
        };

      // NUEVO
      case "propuesta_modificada":
        return {
          texto: "Propuesta modificada",
          color: "bg-orange-500 text-black",
        };

      case "aceptada_cliente":
        return {
          texto: "Aceptada por ti",
          color: "bg-green-600 text-white",
        };

      case "cambios":
      case "cambios_solicitados":
        return {
          texto: "Modificación solicitada",
          color: "bg-orange-500 text-black",
        };

      case "rechazada_cliente":
      case "cancelada_cliente":
        return {
          texto: "Propuesta rechazada",
          color: "bg-red-600 text-white",
        };

      case "confirmada_admin":
        return {
          texto: "Trabajo confirmado",
          color: "bg-emerald-600 text-white",
        };

      case "anticipo_pendiente":
        return {
          texto: "Anticipo pendiente",
          color: "bg-amber-500 text-black",
        };

      case "anticipo_pagado":
        return {
          texto: "Anticipo recibido",
          color: "bg-green-600 text-white",
        };

      case "proceso":
      case "en_proceso":
        return {
          texto: "Trabajo en proceso",
          color: "bg-purple-600 text-white",
        };

      case "instalacion":
      case "instalacion_programada":
        return {
          texto: "Instalación programada",
          color: "bg-cyan-600 text-white",
        };

      case "finalizada":
      case "terminada":
        return {
          texto: "Trabajo finalizado",
          color: "bg-green-700 text-white",
        };

      default:
        return {
          texto: estado || "Pendiente",
          color: "bg-zinc-700 text-white",
        };
    }
  };

  // ============================================
  // NUEVAS ACTUALIZACIONES
  // ============================================

  const tieneNovedad = (c) => {
    return (
      c.vistoPorCliente === false &&
      [
        "cotizada",
        "propuesta_enviada",
        "propuesta_modificada",
        "confirmada_admin",
        "anticipo_pendiente",
        "anticipo_pagado",
        "proceso",
        "en_proceso",
        "instalacion",
        "instalacion_programada",
        "finalizada",
        "terminada",
      ].includes(c.estado)
    );
  };

  const cantidadNuevas =
    cotizaciones.filter(tieneNovedad).length;

  // ============================================
  // MENSAJE DE ESTADO
  // ============================================

  const obtenerMensajeEstado = (c) => {
    switch (c.estado) {
      case "cotizada":
      case "propuesta_enviada":
        return {
          titulo: "Wealth envió una propuesta",
          texto:
            "Revisa el precio y las condiciones para aceptar, solicitar cambios o rechazar.",
          estilo:
            "bg-yellow-500/10 border-yellow-500/30",
          icono: (
            <FaBell className="text-yellow-500 text-xl" />
          ),
        };

      case "propuesta_modificada":
        return {
          titulo: "Wealth modificó la propuesta",
          texto:
            "Hay cambios en tu cotización. Revisa la nueva versión antes de continuar.",
          estilo:
            "bg-orange-500/10 border-orange-500/40",
          icono: (
            <FaSyncAlt className="text-orange-400 text-xl" />
          ),
        };

      case "aceptada_cliente":
        return {
          titulo: "Propuesta aceptada",
          texto:
            "Wealth recibió tu aceptación. Estamos esperando la confirmación de la empresa.",
          estilo:
            "bg-green-500/10 border-green-500/30",
          icono: (
            <FaCheckCircle className="text-green-500 text-xl" />
          ),
        };

      case "cambios_solicitados":
      case "cambios":
        return {
          titulo: "Modificación solicitada",
          texto:
            "Wealth recibió tu solicitud y podrá enviarte una propuesta modificada.",
          estilo:
            "bg-orange-500/10 border-orange-500/30",
          icono: (
            <FaPen className="text-orange-400 text-xl" />
          ),
        };

      case "rechazada_cliente":
      case "cancelada_cliente":
        return {
          titulo: "Propuesta rechazada",
          texto:
            "Wealth recibió tu decisión.",
          estilo:
            "bg-red-500/10 border-red-500/30",
          icono: (
            <FaTimesCircle className="text-red-500 text-xl" />
          ),
        };

      case "confirmada_admin":
        return {
          titulo: "Trabajo confirmado por Wealth",
          texto:
            "Nuestro personal se pondrá en contacto contigo vía WhatsApp para coordinar la visita a tus instalaciones, confirmar los detalles del proyecto y programar el inicio de los trabajos.",
          estilo:
            "bg-emerald-500/10 border-emerald-500/30",
          icono: (
            <FaBuilding className="text-emerald-500 text-xl" />
          ),
        };

      default:
        return null;
    }
  };

  // ============================================
  // MARCAR COMO VISTA
  // ============================================

  const marcarComoVista = async (cotizacion) => {
    if (cotizacion.vistoPorCliente !== false) return;

    try {
      await updateDoc(
        doc(db, "cotizaciones", cotizacion.id),
        {
          vistoPorCliente: true,
        }
      );
    } catch (error) {
      console.error(
        "Error marcando como vista:",
        error
      );
    }
  };

  // ============================================
  // VER PROPUESTA
  // ============================================

  const verPropuesta = async (cotizacion) => {
    setCotizacionSeleccionada(cotizacion);
    setPropuestaOpen(true);

    await marcarComoVista(cotizacion);
  };

  // ============================================
  // ACEPTAR PROPUESTA
  // ============================================

  const confirmarPropuesta = async () => {
    if (!cotizacionSeleccionada) return;

    const precio =
      cotizacionSeleccionada.precioTotal ??
      cotizacionSeleccionada.total ??
      cotizacionSeleccionada.precio ??
      cotizacionSeleccionada.propuestaPrecio;

    const confirmar = window.confirm(
      `¿Aceptar la propuesta${
        precio ? ` por ${moneda(precio)}` : ""
      }?\n\nWealth recibirá tu aceptación.`
    );

    if (!confirmar) return;

    try {
      setProcesando(true);

      await updateDoc(
        doc(
          db,
          "cotizaciones",
          cotizacionSeleccionada.id
        ),
        {
          estado: "aceptada_cliente",

          respuestaCliente: "aceptada",

          // Guardamos qué versión aceptó
          versionAceptada:
            cotizacionSeleccionada.versionPropuesta || 1,

          precioAceptado:
            precio !== undefined && precio !== null
              ? Number(precio)
              : null,

          fechaRespuestaCliente:
            serverTimestamp(),

          fechaActualizacion:
            serverTimestamp(),

          vistoPorAdmin: false,
          vistoPorCliente: true,

          mensajeAdmin:
            "El cliente aceptó la propuesta.",
        }
      );

      window.alert(
        "✅ Propuesta aceptada.\n\nWealth recibió tu respuesta."
      );
    } catch (error) {
      console.error(
        "Error aceptando propuesta:",
        error
      );

      window.alert(
        "No se pudo aceptar la propuesta."
      );
    } finally {
      setProcesando(false);
    }
  };

  // ============================================
  // SOLICITAR CAMBIOS
  // ============================================

  const solicitarModificacion = async () => {
    if (!cotizacionSeleccionada) return;

    const motivo = window.prompt(
      "Describe qué deseas modificar:"
    );

    if (motivo === null) return;

    if (!motivo.trim()) {
      window.alert(
        "Escribe qué deseas modificar."
      );
      return;
    }

    try {
      setProcesando(true);

      await updateDoc(
        doc(
          db,
          "cotizaciones",
          cotizacionSeleccionada.id
        ),
        {
          estado: "cambios_solicitados",

          respuestaCliente:
            "solicita_modificacion",

          mensajeCliente: motivo.trim(),

          fechaRespuestaCliente:
            serverTimestamp(),

          fechaActualizacion:
            serverTimestamp(),

          vistoPorAdmin: false,
          vistoPorCliente: true,

          mensajeAdmin:
            "El cliente solicitó cambios en la propuesta.",
        }
      );

      window.alert(
        "✏️ Solicitud enviada a Wealth."
      );
    } catch (error) {
      console.error(
        "Error solicitando cambios:",
        error
      );

      window.alert(
        "No se pudo enviar la solicitud."
      );
    } finally {
      setProcesando(false);
    }
  };

  // ============================================
  // RECHAZAR
  // ============================================

  const rechazarPropuesta = async () => {
    if (!cotizacionSeleccionada) return;

    const confirmar = window.confirm(
      "¿Seguro que deseas rechazar esta propuesta?"
    );

    if (!confirmar) return;

    try {
      setProcesando(true);

      await updateDoc(
        doc(
          db,
          "cotizaciones",
          cotizacionSeleccionada.id
        ),
        {
          estado: "rechazada_cliente",

          respuestaCliente: "rechazada",

          fechaRespuestaCliente:
            serverTimestamp(),

          fechaActualizacion:
            serverTimestamp(),

          vistoPorAdmin: false,
          vistoPorCliente: true,

          mensajeAdmin:
            "El cliente rechazó la propuesta.",
        }
      );

      window.alert(
        "La propuesta fue rechazada."
      );
    } catch (error) {
      console.error(
        "Error rechazando propuesta:",
        error
      );

      window.alert(
        "No se pudo rechazar la propuesta."
      );
    } finally {
      setProcesando(false);
    }
  };

  // ============================================
  // GALERÍA
  // ============================================

  const openGallery = (imagenes, i = 0) => {
    const list = Array.isArray(imagenes)
      ? imagenes
      : [imagenes];

    setImgs(list);
    setIndex(i);
    setOpen(true);
  };

  const next = () => {
    setIndex((p) =>
      p + 1 >= imgs.length ? 0 : p + 1
    );
  };

  const prev = () => {
    setIndex((p) =>
      p === 0 ? imgs.length - 1 : p - 1
    );
  };

  // ============================================
  // MONEDA
  // ============================================

  const moneda = (cantidad) => {
    if (
      cantidad === undefined ||
      cantidad === null ||
      cantidad === ""
    ) {
      return "Pendiente";
    }

    const numero = Number(cantidad);

    if (Number.isNaN(numero)) {
      return cantidad;
    }

    return numero.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    });
  };

  // ============================================
  // FECHA
  // ============================================

  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    try {
      if (fecha?.toDate) {
        return fecha.toDate().toLocaleString(
          "es-MX",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        );
      }

      return new Date(fecha).toLocaleString(
        "es-MX"
      );
    } catch {
      return "";
    }
  };

  // ============================================
  // CARGANDO
  // ============================================

  if (cargando) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-zinc-700 border-t-yellow-500 rounded-full animate-spin mx-auto" />

          <p className="text-zinc-400 mt-4">
            Cargando cotizaciones...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">

      {/* ============================== */}
      {/* AVISO GENERAL */}
      {/* ============================== */}

      {cantidadNuevas > 0 && (
        <div className="mb-6">

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5">

            <div className="flex items-center gap-4">

              <div className="relative">

                <FaBell className="text-yellow-500 text-2xl" />

                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
                  {cantidadNuevas}
                </span>

              </div>

              <div>

                <p className="font-bold">
                  {cantidadNuevas === 1
                    ? "Tienes una actualización"
                    : `Tienes ${cantidadNuevas} actualizaciones`}
                </p>

                <p className="text-sm text-zinc-400 mt-1">
                  Wealth realizó cambios en tus cotizaciones.
                </p>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* SIN COTIZACIONES */}
      {cotizaciones.length === 0 && (
        <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-10 text-center">

          <FaMoneyBillWave className="text-zinc-700 text-5xl mx-auto" />

          <p className="text-xl font-bold mt-5">
            Aún no tienes cotizaciones
          </p>

          <p className="text-zinc-500 mt-2">
            Tus solicitudes aparecerán aquí.
          </p>

        </div>
      )}

      {/* ============================== */}
      {/* TARJETAS */}
      {/* ============================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {cotizaciones.map((c) => {
          const imagenes = c.imagenes?.length
            ? c.imagenes
            : c.imagen
            ? [c.imagen]
            : [];

          const estado = obtenerEstado(c.estado);
          const nueva = tieneNovedad(c);
          const mensajeEstado =
            obtenerMensajeEstado(c);

          const precio =
            c.precioTotal ??
            c.total ??
            c.precio ??
            c.propuestaPrecio;

          const anticipo =
            c.anticipo ??
            c.anticipo50 ??
            (precio !== undefined &&
            precio !== null
              ? Number(precio) / 2
              : null);

          const saldo =
            c.saldo ??
            c.saldoPendiente ??
            (precio !== undefined &&
            precio !== null &&
            anticipo !== null
              ? Number(precio) -
                Number(anticipo)
              : null);

          const tiempo =
            c.tiempoEstimado ??
            c.tiempo ??
            c.entrega;

          const garantia =
            c.garantia ??
            c["garantía"];

          return (
            <div
              key={c.id}
              className={`
                relative
                bg-zinc-950
                rounded-3xl
                overflow-hidden
                border
                transition
                duration-300
                hover:-translate-y-1
                hover:shadow-2xl
                ${
                  nueva
                    ? "border-yellow-500/70"
                    : "border-zinc-800"
                }
              `}
            >

              {nueva && (
                <div className="absolute left-0 top-0 h-full w-1 bg-yellow-500 z-20" />
              )}

              {/* IMAGEN */}
              <div className="relative h-64 bg-black">

                {imagenes.length > 0 ? (
                  <img
                    src={imagenes[0]}
                    alt={c.nombre || "Cotización"}
                    onClick={() =>
                      openGallery(imagenes, 0)
                    }
                    className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-600">
                    Sin imagen
                  </div>
                )}

                {nueva && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    NUEVO
                  </span>
                )}

                {c.estado ===
                  "propuesta_modificada" && (
                  <span className="absolute top-4 right-4 bg-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    MODIFICADA
                  </span>
                )}

                {imagenes.length > 1 && (
                  <span className="absolute bottom-3 right-3 bg-black/80 text-xs px-3 py-1 rounded-xl">
                    +{imagenes.length - 1} más
                  </span>
                )}

              </div>

              {/* INFO */}
              <div className="p-6">

                <div className="flex justify-between items-start gap-3">

                  <h2 className="text-xl font-bold capitalize">
                    {c.nombre || "Cotización"}
                  </h2>

                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${estado.color}`}
                  >
                    {estado.texto}
                  </span>

                </div>

                {c.descripcion && (
                  <p className="text-zinc-400 text-sm mt-3">
                    {c.descripcion}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-4 text-zinc-500 text-sm">
                  <FaCalendarAlt />

                  {c.fecha?.toDate
                    ? c.fecha
                        .toDate()
                        .toLocaleDateString("es-MX")
                    : "Sin fecha"}
                </div>

                {/* MENSAJE */}
                {mensajeEstado && (
                  <div
                    className={`mt-5 border rounded-2xl p-4 ${mensajeEstado.estilo}`}
                  >

                    <div className="flex gap-3">

                      {mensajeEstado.icono}

                      <div>

                        <p className="font-bold text-sm">
                          {mensajeEstado.titulo}
                        </p>

                        <p className="text-xs text-zinc-400 mt-1">
                          {mensajeEstado.texto}
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* PRECIO */}
                {precio !== undefined &&
                  precio !== null && (
                    <div className="mt-5 bg-black border border-zinc-800 rounded-2xl p-4">

                      <p className="text-xs uppercase text-yellow-500 font-bold">
                        Propuesta actual
                      </p>

                      <div className="flex items-center gap-2 mt-2">

                        <FaMoneyBillWave className="text-green-500" />

                        <span className="text-2xl font-bold">
                          {moneda(precio)}
                        </span>

                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">

                        <div>
                          <p className="text-xs text-zinc-500">
                            Anticipo
                          </p>

                          <p className="font-semibold">
                            {moneda(anticipo)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500">
                            Saldo
                          </p>

                          <p className="font-semibold">
                            {moneda(saldo)}
                          </p>
                        </div>

                      </div>

                    </div>
                  )}

                {(tiempo || garantia) && (
                  <div className="grid grid-cols-2 gap-3 mt-4">

                    {tiempo && (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                        <FaClock className="text-yellow-500" />

                        <p className="text-xs text-zinc-500 mt-2">
                          Tiempo
                        </p>

                        <p className="text-sm">
                          {tiempo}
                        </p>
                      </div>
                    )}

                    {garantia && (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                        <FaShieldAlt className="text-yellow-500" />

                        <p className="text-xs text-zinc-500 mt-2">
                          Garantía
                        </p>

                        <p className="text-sm">
                          {garantia}
                        </p>
                      </div>
                    )}

                  </div>
                )}

                <button
                  onClick={() =>
                    verPropuesta(c)
                  }
                  className="w-full mt-5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <FaEye />
                  Ver detalles
                </button>

              </div>

            </div>
          );
        })}

      </div>

      {/* ============================== */}
      {/* MODAL */}
      {/* ============================== */}

      {propuestaOpen &&
        cotizacionSeleccionada && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() =>
              setPropuestaOpen(false)
            }
          >

            <div
              onClick={(e) =>
                e.stopPropagation()
              }
              className="bg-zinc-950 border border-zinc-700 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >

              {(() => {
                const c =
                  cotizacionSeleccionada;

                const estado =
                  obtenerEstado(c.estado);

                const precio =
                  c.precioTotal ??
                  c.total ??
                  c.precio ??
                  c.propuestaPrecio;

                const anticipo =
                  c.anticipo ??
                  c.anticipo50 ??
                  (precio !== undefined &&
                  precio !== null
                    ? Number(precio) / 2
                    : null);

                const saldo =
                  c.saldo ??
                  c.saldoPendiente ??
                  (precio !== undefined &&
                  precio !== null &&
                  anticipo !== null
                    ? Number(precio) -
                      Number(anticipo)
                    : null);

                const tiempo =
                  c.tiempoEstimado ??
                  c.tiempo ??
                  c.entrega;

                const garantia =
                  c.garantia ??
                  c["garantía"];

                const observaciones =
                  c.observaciones ??
                  c.observacion ??
                  c.detallesPropuesta;

                // IMPORTANTE:
                // una propuesta modificada debe
                // volver a ser aceptada
                const puedeResponder =
                  [
                    "cotizada",
                    "propuesta_enviada",
                    "propuesta_modificada",
                  ].includes(c.estado);

                return (
                  <>

                    {/* HEADER */}
                    <div className="p-6 md:p-8 border-b border-zinc-800">

                      <div className="flex justify-between items-start">

                        <div>

                          <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest">
                            Propuesta Wealth
                          </p>

                          <h2 className="text-3xl font-bold mt-1 capitalize">
                            {c.nombre}
                          </h2>

                          <div className="flex flex-wrap gap-2 mt-3">

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${estado.color}`}
                            >
                              {estado.texto}
                            </span>

                            {c.versionPropuesta && (
                              <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs">
                                Versión{" "}
                                {c.versionPropuesta}
                              </span>
                            )}

                          </div>

                        </div>

                        <button
                          onClick={() =>
                            setPropuestaOpen(false)
                          }
                          className="text-3xl text-zinc-400 hover:text-white"
                        >
                          ×
                        </button>

                      </div>

                    </div>

                    <div className="p-6 md:p-8">

                      {/* MODIFICADA */}
                      {c.estado ===
                        "propuesta_modificada" && (
                        <div className="mb-6 bg-orange-500/10 border border-orange-500/40 rounded-2xl p-5">

                          <div className="flex gap-3">

                            <FaSyncAlt className="text-orange-400 text-2xl" />

                            <div>
                              <p className="font-bold text-orange-400">
                                La propuesta fue modificada
                              </p>

                              <p className="text-sm text-zinc-400 mt-1">
                                Revisa nuevamente el
                                precio y las condiciones.
                                Esta versión requiere tu
                                aprobación.
                              </p>
                            </div>

                          </div>

                        </div>
                      )}

                      {/* PRECIOS */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="bg-black border border-zinc-800 rounded-2xl p-5">
                          <p className="text-sm text-zinc-500">
                            Precio total
                          </p>

                          <p className="text-2xl font-bold mt-1">
                            {moneda(precio)}
                          </p>
                        </div>

                        <div className="bg-black border border-zinc-800 rounded-2xl p-5">
                          <p className="text-sm text-zinc-500">
                            Anticipo
                          </p>

                          <p className="text-xl font-bold mt-1">
                            {moneda(anticipo)}
                          </p>
                        </div>

                        <div className="bg-black border border-zinc-800 rounded-2xl p-5">
                          <p className="text-sm text-zinc-500">
                            Saldo
                          </p>

                          <p className="text-xl font-bold mt-1">
                            {moneda(saldo)}
                          </p>
                        </div>

                      </div>

                      {/* TIEMPO / GARANTÍA */}
                      {(tiempo ||
                        garantia) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

                          {tiempo && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                              <FaClock className="text-yellow-500" />

                              <p className="text-zinc-400 mt-2">
                                Tiempo estimado
                              </p>

                              <p className="font-bold mt-1">
                                {tiempo}
                              </p>
                            </div>
                          )}

                          {garantia && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                              <FaShieldAlt className="text-yellow-500" />

                              <p className="text-zinc-400 mt-2">
                                Garantía
                              </p>

                              <p className="font-bold mt-1">
                                {garantia}
                              </p>
                            </div>
                          )}

                        </div>
                      )}

                      {/* OBSERVACIONES */}
                      {observaciones && (
                        <div className="mt-5">

                          <p className="text-sm text-zinc-400 mb-2">
                            Observaciones
                          </p>

                          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                            {observaciones}
                          </div>

                        </div>
                      )}

                      {/* BOTONES CLIENTE */}
                      {puedeResponder && (
                        <div className="mt-8 pt-6 border-t border-zinc-800">

                          <h3 className="text-xl font-bold">
                            ¿Qué deseas hacer?
                          </h3>

                          <p className="text-sm text-zinc-400 mt-1">
                            Wealth recibirá tu respuesta
                            inmediatamente.
                          </p>

                          <button
                            onClick={
                              confirmarPropuesta
                            }
                            disabled={
                              procesando
                            }
                            className="w-full mt-5 bg-green-600 hover:bg-green-500 disabled:opacity-50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                          >
                            <FaCheckCircle />

                            {procesando
                              ? "Procesando..."
                              : c.estado ===
                                "propuesta_modificada"
                              ? "Aceptar nueva propuesta"
                              : "Aceptar propuesta"}
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">

                            <button
                              onClick={
                                solicitarModificacion
                              }
                              disabled={
                                procesando
                              }
                              className="bg-orange-500/10 border border-orange-500/40 text-orange-400 hover:bg-orange-500 hover:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                            >
                              <FaPen />
                              Solicitar modificación
                            </button>

                            <button
                              onClick={
                                rechazarPropuesta
                              }
                              disabled={
                                procesando
                              }
                              className="bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                            >
                              <FaTimesCircle />
                              Rechazar propuesta
                            </button>

                          </div>

                        </div>
                      )}

                      {/* ACEPTADA */}
                      {c.estado ===
                        "aceptada_cliente" && (
                        <div className="mt-7 bg-green-500/10 border border-green-500/40 rounded-2xl p-5">

                          <div className="flex gap-3">

                            <FaCheckCircle className="text-green-500 text-2xl" />

                            <div>
                              <p className="font-bold text-green-400">
                                Propuesta aceptada
                              </p>

                              <p className="text-sm text-zinc-400 mt-1">
                                Wealth recibió tu
                                aceptación.
                              </p>

                              {c.precioAceptado && (
                                <p className="text-sm mt-2">
                                  Precio aceptado:{" "}
                                  <strong>
                                    {moneda(
                                      c.precioAceptado
                                    )}
                                  </strong>
                                </p>
                              )}

                            </div>

                          </div>

                        </div>
                      )}

                      {/* CAMBIOS */}
                      {c.estado ===
                        "cambios_solicitados" && (
                        <div className="mt-7 bg-orange-500/10 border border-orange-500/40 rounded-2xl p-5">

                          <p className="font-bold text-orange-400">
                            Cambios solicitados
                          </p>

                          {c.mensajeCliente && (
                            <p className="text-zinc-300 mt-2">
                              “{c.mensajeCliente}”
                            </p>
                          )}

                        </div>
                      )}

                      {/* RECHAZADA */}
                      {c.estado ===
                        "rechazada_cliente" && (
                        <div className="mt-7 bg-red-500/10 border border-red-500/40 rounded-2xl p-5">

                          <p className="font-bold text-red-400">
                            Propuesta rechazada
                          </p>

                          <p className="text-sm text-zinc-400 mt-1">
                            Wealth recibió tu respuesta.
                          </p>

                        </div>
                      )}

                      {/* ========================== */}
                      {/* VERSIONES */}
                      {/* ========================== */}

                      {Array.isArray(
                        c.historialPropuestas
                      ) &&
                        c.historialPropuestas
                          .length > 0 && (
                          <div className="mt-8 pt-6 border-t border-zinc-800">

                            <div className="flex items-center gap-2 mb-5">

                              <FaHistory className="text-yellow-500" />

                              <h3 className="text-lg font-bold">
                                Historial de propuestas
                              </h3>

                            </div>

                            <div className="space-y-3">

                              {c.historialPropuestas.map(
                                (
                                  propuesta,
                                  indice
                                ) => (
                                  <div
                                    key={
                                      indice
                                    }
                                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
                                  >

                                    <div className="flex justify-between gap-4">

                                      <div>

                                        <p className="font-bold">
                                          Propuesta{" "}
                                          #
                                          {propuesta.version ??
                                            indice +
                                              1}
                                        </p>

                                        {propuesta.fecha && (
                                          <p className="text-xs text-zinc-500 mt-1">
                                            {formatearFecha(
                                              propuesta.fecha
                                            )}
                                          </p>
                                        )}

                                      </div>

                                      <p className="font-bold text-yellow-500">
                                        {moneda(
                                          propuesta.precioTotal ??
                                            propuesta.total ??
                                            propuesta.precio
                                        )}
                                      </p>

                                    </div>

                                    {propuesta.observaciones && (
                                      <p className="text-sm text-zinc-400 mt-3">
                                        {
                                          propuesta.observaciones
                                        }
                                      </p>
                                    )}

                                  </div>
                                )
                              )}

                            </div>

                          </div>
                        )}

                    </div>

                  </>
                );
              })()}

            </div>

          </div>
        )}

      {/* ============================== */}
      {/* GALERÍA */}
      {/* ============================== */}

      {open && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60]"
          onClick={() =>
            setOpen(false)
          }
        >

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

          <img
            src={imgs[index]}
            alt="Imagen"
            className="max-w-[90%] max-h-[90%] object-contain rounded-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          />

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

          <button
            onClick={() =>
              setOpen(false)
            }
            className="absolute top-5 right-5 text-white text-5xl"
          >
            ×
          </button>

        </div>
      )}

    </div>
  );
}

export default Cotizaciones;