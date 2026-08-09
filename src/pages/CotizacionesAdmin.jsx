import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase.config";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

import {
  FaCheck,
  FaTimes,
  FaTrash,
  FaUser,
  FaEdit,
  FaPhone,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaCalendarAlt,
  FaDollarSign,
  FaClock,
  FaShieldAlt,
  FaEye,
  FaPaperPlane,
  FaUndo,
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaBriefcase,
  FaPlay,
  FaTools,
  FaFlagCheckered,
  FaImages,
  FaImage,
} from "react-icons/fa";

function CotizacionesAdmin() {
  // ======================================================
  // COTIZACIONES
  // ======================================================

  const [cotizaciones, setCotizaciones] = useState([]);

  // ======================================================
  // CLIENTES
  // ======================================================

  const [clienteAbierto, setClienteAbierto] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");

  // ======================================================
  // MODAL IMÁGENES
  // ======================================================

  const [modalOpen, setModalOpen] = useState(false);
  const [imagenesActivas, setImagenesActivas] = useState([]);
  const [index, setIndex] = useState(0);

  // ======================================================
  // MODAL COTIZACIÓN
  // ======================================================

  const [cotizacionActiva, setCotizacionActiva] =
    useState(null);

  const [modalCotizacion, setModalCotizacion] =
    useState(false);

  // ======================================================
  // PROPUESTA ADMIN
  // ======================================================

  const [presupuestoAdmin, setPresupuestoAdmin] =
    useState("");

  const [
    porcentajeAnticipo,
    setPorcentajeAnticipo,
  ] = useState("50");

  const [tiempoEstimado, setTiempoEstimado] =
    useState("");

  const [garantia, setGarantia] =
    useState("");

  const [
    observacionesAdmin,
    setObservacionesAdmin,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ======================================================
  // FIRESTORE
  // ======================================================

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "cotizaciones"),

      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Última actividad primero
        data.sort((a, b) => {
          const fechaA =
            a.fechaActualizacion?.toMillis?.() ||
            a.fecha?.toMillis?.() ||
            0;

          const fechaB =
            b.fechaActualizacion?.toMillis?.() ||
            b.fecha?.toMillis?.() ||
            0;

          return fechaB - fechaA;
        });

        setCotizaciones(data);

        // Mantiene actualizado el modal
        setCotizacionActiva((actual) => {
          if (!actual) return null;

          const nueva = data.find(
            (c) => c.id === actual.id
          );

          return nueva || actual;
        });
      },

      (error) => {
        console.error(
          "Error cargando cotizaciones:",
          error
        );
      }
    );

    return () => unsub();
  }, []);

  // ======================================================
  // COTIZACIONES ACTIVAS
  // ======================================================

  const cotizacionesActivas =
    useMemo(() => {
      return cotizaciones.filter(
        (c) =>
          ![
            "finalizada",
            "terminado",
            "terminada",
          ].includes(c.estado)
      );
    }, [cotizaciones]);

  // ======================================================
  // AGRUPAR POR CLIENTE
  // ======================================================

  const clientes = useMemo(() => {
    const grupos = {};

    cotizacionesActivas.forEach(
      (cotizacion) => {
        const clave =
          cotizacion.uid ||
          cotizacion.usuario ||
          "sin_usuario";

        if (!grupos[clave]) {
          grupos[clave] = {
            clave,

            uid:
              cotizacion.uid ||
              null,

            usuario:
              cotizacion.usuario ||
              "Sin correo",

            nombre:
              cotizacion.nombreCliente ||
              cotizacion.clienteNombre ||
              cotizacion.usuario ||
              "Cliente",

            telefono:
              cotizacion.telefono ||
              "",

            cotizaciones: [],
          };
        }

        grupos[
          clave
        ].cotizaciones.push(
          cotizacion
        );

        if (
          !grupos[clave].telefono &&
          cotizacion.telefono
        ) {
          grupos[
            clave
          ].telefono =
            cotizacion.telefono;
        }
      }
    );

    const lista =
      Object.values(grupos).map(
        (cliente) => {
          const nuevas =
            cliente.cotizaciones.filter(
              (c) =>
                c.vistoPorAdmin ===
                false
            ).length;

          const ultimaActividad =
            Math.max(
              ...cliente.cotizaciones.map(
                (c) =>
                  c.fechaActualizacion?.toMillis?.() ||
                  c.fecha?.toMillis?.() ||
                  0
              )
            );

          const confirmados =
            cliente.cotizaciones.filter(
              (c) =>
                [
                  "confirmada_admin",
                  "en_proceso",
                  "proceso",
                  "instalacion_programada",
                  "instalacion",
                ].includes(c.estado)
            ).length;

          return {
            ...cliente,
            nuevas,
            ultimaActividad,
            confirmados,
          };
        }
      );

    // Novedades primero
    lista.sort((a, b) => {
      if (
        a.nuevas > 0 &&
        b.nuevas === 0
      ) {
        return -1;
      }

      if (
        b.nuevas > 0 &&
        a.nuevas === 0
      ) {
        return 1;
      }

      return (
        b.ultimaActividad -
        a.ultimaActividad
      );
    });

    return lista;
  }, [cotizacionesActivas]);

  // ======================================================
  // BUSCADOR
  // ======================================================

  const clientesFiltrados =
    useMemo(() => {
      const texto =
        busquedaCliente
          .trim()
          .toLowerCase();

      if (!texto) {
        return clientes;
      }

      return clientes.filter(
        (cliente) => {
          const contenido = [
            cliente.nombre,
            cliente.usuario,
            cliente.telefono,

            ...cliente.cotizaciones.map(
              (c) =>
                `${c.nombre || ""} ${
                  c.descripcion || ""
                }`
            ),
          ]
            .join(" ")
            .toLowerCase();

          return contenido.includes(
            texto
          );
        }
      );
    }, [
      clientes,
      busquedaCliente,
    ]);

  // ======================================================
  // NOVEDADES
  // ======================================================

  const cantidadNovedadesAdmin =
    cotizacionesActivas.filter(
      (c) =>
        c.vistoPorAdmin === false
    ).length;

  // ======================================================
  // CÁLCULOS
  // ======================================================

  const montoAnticipo =
    useMemo(() => {
      const total =
        Number(presupuestoAdmin);

      const porcentaje =
        Number(
          porcentajeAnticipo
        );

      if (!total) return 0;

      return (
        (total * porcentaje) /
        100
      );
    }, [
      presupuestoAdmin,
      porcentajeAnticipo,
    ]);

  const saldoPendiente =
    useMemo(() => {
      const total =
        Number(presupuestoAdmin);

      if (!total) return 0;

      return total - montoAnticipo;
    }, [
      presupuestoAdmin,
      montoAnticipo,
    ]);

  // ======================================================
  // PRECIO ACTUAL
  // ======================================================

  const obtenerPrecio = (c) => {
    return (
      c?.precioTotal ??
      c?.presupuestoAdmin ??
      c?.total ??
      c?.precio ??
      c?.propuestaPrecio ??
      null
    );
  };

  // ======================================================
  // TIENE PROPUESTA
  // ======================================================

  const tienePropuesta = (c) => {
    return (
      obtenerPrecio(c) !== null ||
      [
        "cotizada",
        "propuesta_enviada",
        "propuesta_modificada",
        "aceptada_cliente",
        "cambios_solicitados",
        "rechazada_cliente",
        "confirmada_admin",
        "en_proceso",
        "proceso",
        "instalacion_programada",
        "instalacion",
      ].includes(c?.estado)
    );
  };

  // ======================================================
  // ABRIR / CERRAR CLIENTE
  // ======================================================

  const toggleCliente = (clave) => {
    setClienteAbierto(
      (actual) =>
        actual === clave
          ? null
          : clave
    );
  };

  // ======================================================
  // ABRIR COTIZACIÓN
  // ======================================================

  const abrirCotizacion =
    async (cotizacion) => {
      setCotizacionActiva(
        cotizacion
      );

      setPresupuestoAdmin(
        cotizacion.presupuestoAdmin ??
          cotizacion.precioTotal ??
          cotizacion.total ??
          cotizacion.precio ??
          ""
      );

      setPorcentajeAnticipo(
        cotizacion.porcentajeAnticipo ??
          "50"
      );

      setTiempoEstimado(
        cotizacion.tiempoEstimado ??
          cotizacion.tiempo ??
          ""
      );

      setGarantia(
        cotizacion.garantia ??
          cotizacion["garantía"] ??
          ""
      );

      setObservacionesAdmin(
        cotizacion.observacionesAdmin ??
          cotizacion.observaciones ??
          cotizacion.observacion ??
          ""
      );

      setError("");

      setModalCotizacion(true);

      // Marcar respuesta como vista
      if (
        cotizacion.vistoPorAdmin ===
        false
      ) {
        try {
          await updateDoc(
            doc(
              db,
              "cotizaciones",
              cotizacion.id
            ),
            {
              vistoPorAdmin: true,
            }
          );
        } catch (error) {
          console.error(
            "Error marcando como visto:",
            error
          );
        }
      }
    };

  // ======================================================
  // ENVIAR / ACTUALIZAR PROPUESTA
  // ======================================================

  const enviarPropuesta =
    async () => {
      if (!cotizacionActiva) {
        return;
      }

      setError("");

      const total =
        Number(
          presupuestoAdmin
        );

      const porcentaje =
        Number(
          porcentajeAnticipo
        );

      if (
        !total ||
        total <= 0
      ) {
        setError(
          "Ingresa un precio válido."
        );

        return;
      }

      if (
        porcentajeAnticipo ===
          "" ||
        porcentaje < 0 ||
        porcentaje > 100
      ) {
        setError(
          "El porcentaje de anticipo debe estar entre 0 y 100."
        );

        return;
      }

      try {
        setLoading(true);

        const yaTeniaPropuesta =
          tienePropuesta(
            cotizacionActiva
          );

        const versionActual =
          Number(
            cotizacionActiva.versionPropuesta
          ) ||
          (yaTeniaPropuesta
            ? 1
            : 0);

        const nuevaVersion =
          yaTeniaPropuesta
            ? versionActual + 1
            : 1;

        const datosActualizados = {
          estado:
            yaTeniaPropuesta
              ? "propuesta_modificada"
              : "propuesta_enviada",

          precioTotal: total,

          anticipo:
            Number(
              montoAnticipo
            ),

          saldo:
            Number(
              saldoPendiente
            ),

          tiempoEstimado:
            tiempoEstimado.trim(),

          garantia:
            garantia.trim(),

          observaciones:
            observacionesAdmin.trim(),

          // Compatibilidad
          presupuestoAdmin:
            total,

          porcentajeAnticipo:
            porcentaje,

          montoAnticipo:
            Number(
              montoAnticipo
            ),

          saldoPendiente:
            Number(
              saldoPendiente
            ),

          observacionesAdmin:
            observacionesAdmin.trim(),

          versionPropuesta:
            nuevaVersion,

          respuestaCliente:
            "sin_respuesta",

          mensajeCliente: "",

          vistoPorCliente:
            false,

          vistoPorAdmin:
            true,

          mensajeClienteSistema:
            yaTeniaPropuesta
              ? "Wealth modificó tu propuesta."
              : "Wealth envió una nueva propuesta.",

          fechaPropuesta:
            serverTimestamp(),

          fechaActualizacion:
            serverTimestamp(),
        };

        // ================================================
        // HISTORIAL
        // ================================================

        if (
          yaTeniaPropuesta
        ) {
          const precioAnterior =
            obtenerPrecio(
              cotizacionActiva
            );

          const anticipoAnterior =
            cotizacionActiva.anticipo ??
            cotizacionActiva.montoAnticipo ??
            null;

          const saldoAnterior =
            cotizacionActiva.saldo ??
            cotizacionActiva.saldoPendiente ??
            null;

          const versionAnterior = {
            version:
              versionActual,

            precioTotal:
              precioAnterior !==
              null
                ? Number(
                    precioAnterior
                  )
                : null,

            porcentajeAnticipo:
              Number(
                cotizacionActiva.porcentajeAnticipo ??
                  50
              ),

            anticipo:
              anticipoAnterior !==
              null
                ? Number(
                    anticipoAnterior
                  )
                : null,

            saldo:
              saldoAnterior !==
              null
                ? Number(
                    saldoAnterior
                  )
                : null,

            tiempoEstimado:
              cotizacionActiva.tiempoEstimado ??
              "",

            garantia:
              cotizacionActiva.garantia ??
              "",

            observaciones:
              cotizacionActiva.observaciones ??
              cotizacionActiva.observacionesAdmin ??
              "",

            estadoAnterior:
              cotizacionActiva.estado ??
              "cotizada",

            respuestaCliente:
              cotizacionActiva.respuestaCliente ??
              "sin_respuesta",

            versionAceptada:
              cotizacionActiva.versionAceptada ??
              null,

            precioAceptado:
              cotizacionActiva.precioAceptado ??
              null,

            fecha:
              cotizacionActiva.fechaActualizacion ??
              Timestamp.now(),
          };

          datosActualizados.historialPropuestas =
            arrayUnion(
              versionAnterior
            );

          datosActualizados.versionAceptada =
            null;

          datosActualizados.precioAceptado =
            null;
        }

        await updateDoc(
          doc(
            db,
            "cotizaciones",
            cotizacionActiva.id
          ),

          datosActualizados
        );

        setModalCotizacion(
          false
        );

        setCotizacionActiva(
          null
        );
      } catch (error) {
        console.error(error);

        setError(
          "No se pudo enviar la propuesta."
        );
      } finally {
        setLoading(false);
      }
    };

  // ======================================================
  // CONFIRMAR TRABAJO
  // ======================================================

  const confirmarTrabajo =
    async (cotizacion) => {
      const precio =
        obtenerPrecio(
          cotizacion
        );

      const ok =
        window.confirm(
          `¿Confirmar el trabajo "${cotizacion.nombre}"${
            precio
              ? ` por $${Number(
                  precio
                ).toLocaleString(
                  "es-MX"
                )} MXN`
              : ""
          }?\n\nEl cliente recibirá la confirmación.`
        );

      if (!ok) return;

      try {
        await updateDoc(
          doc(
            db,
            "cotizaciones",
            cotizacion.id
          ),
          {
            estado:
              "confirmada_admin",

            vistoPorCliente:
              false,

            vistoPorAdmin:
              true,

            mensajeClienteSistema:
              "Trabajo confirmado por Wealth.",

            fechaConfirmacionAdmin:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),
          }
        );
      } catch (error) {
        console.error(error);

        alert(
          "No se pudo confirmar el trabajo."
        );
      }
    };

  // ======================================================
  // INICIAR TRABAJO
  // ======================================================

  const iniciarTrabajo =
    async (cotizacion) => {
      const ok =
        window.confirm(
          `¿Marcar "${cotizacion.nombre}" como trabajo en proceso?`
        );

      if (!ok) return;

      try {
        await updateDoc(
          doc(
            db,
            "cotizaciones",
            cotizacion.id
          ),
          {
            estado:
              "en_proceso",

            vistoPorCliente:
              false,

            vistoPorAdmin:
              true,

            mensajeClienteSistema:
              "Nuestro equipo ha iniciado los trabajos correspondientes a tu proyecto.",

            fechaInicioProyecto:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),
          }
        );
      } catch (error) {
        console.error(error);

        alert(
          "No se pudo iniciar el trabajo."
        );
      }
    };

  // ======================================================
  // PROGRAMAR INSTALACIÓN
  // ======================================================

  const programarInstalacion =
    async (cotizacion) => {
      const ok =
        window.confirm(
          `¿Marcar "${cotizacion.nombre}" como instalación programada?`
        );

      if (!ok) return;

      try {
        await updateDoc(
          doc(
            db,
            "cotizaciones",
            cotizacion.id
          ),
          {
            estado:
              "instalacion_programada",

            vistoPorCliente:
              false,

            vistoPorAdmin:
              true,

            mensajeClienteSistema:
              "La instalación de tu proyecto ha sido programada. Nuestro personal se pondrá en contacto contigo para coordinar los detalles.",

            fechaInstalacion:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),
          }
        );
      } catch (error) {
        console.error(error);

        alert(
          "No se pudo actualizar la instalación."
        );
      }
    };

  // ======================================================
  // TRABAJO TERMINADO
  // ======================================================

  const terminarTrabajo =
    async (cotizacion) => {
      const precio =
        obtenerPrecio(
          cotizacion
        );

      const ok =
        window.confirm(
          `¿Confirmar que el trabajo "${cotizacion.nombre}" está completamente terminado?\n\nAl continuar dejará de aparecer en Cotizaciones activas y pasará automáticamente a Mis Proyectos del cliente.`
        );

      if (!ok) return;

      try {
        setLoading(true);

        const batch =
          writeBatch(db);

        // ================================================
        // PROYECTO CLIENTE
        // ================================================

        const proyectoRef =
          doc(
            db,
            "proyectosClientes",
            cotizacion.id
          );

        batch.set(
          proyectoRef,
          {
            uid:
              cotizacion.uid ||
              null,

            usuario:
              cotizacion.usuario ||
              "",

            cotizacionId:
              cotizacion.id,

            nombre:
              cotizacion.nombre ||
              "Proyecto Wealth",

            descripcion:
              cotizacion.descripcion ||
              "",

            tipo:
              cotizacion.tipo ||
              "",

            proyectoReferenciaId:
              cotizacion.proyectoReferenciaId ||
              null,

            proyectoReferenciaNombre:
              cotizacion.proyectoReferenciaNombre ||
              null,

            proyectoReferenciaCategoria:
              cotizacion.proyectoReferenciaCategoria ||
              null,

            ubicacion:
              cotizacion.ubicacion ||
              "",

            latitud:
              cotizacion.latitud ??
              null,

            longitud:
              cotizacion.longitud ??
              null,

            medidas:
              cotizacion.medidas ||
              "",

            fechaDeseada:
              cotizacion.fechaDeseada ||
              null,

            imagenes:
              cotizacion.imagenes ||
              [],

            imagenesProyecto:
              cotizacion.imagenesProyecto ||
              [],

            imagenesCliente:
              cotizacion.imagenesCliente ||
              [],

            imagen:
              cotizacion.imagen ||
              cotizacion.imagenes?.[0] ||
              null,

            precioTotal:
              precio !== null
                ? Number(precio)
                : null,

            anticipo:
              cotizacion.anticipo ??
              cotizacion.montoAnticipo ??
              null,

            saldo:
              cotizacion.saldo ??
              cotizacion.saldoPendiente ??
              null,

            porcentajeAnticipo:
              cotizacion.porcentajeAnticipo ??
              null,

            tiempoEstimado:
              cotizacion.tiempoEstimado ||
              "",

            garantia:
              cotizacion.garantia ||
              "",

            observaciones:
              cotizacion.observaciones ??
              cotizacion.observacionesAdmin ??
              "",

            versionPropuesta:
              cotizacion.versionPropuesta ||
              1,

            versionAceptada:
              cotizacion.versionAceptada ||
              null,

            precioAceptado:
              cotizacion.precioAceptado ??
              precio ??
              null,

            historialPropuestas:
              cotizacion.historialPropuestas ||
              [],

            estado:
              "terminado",

            fechaSolicitud:
              cotizacion.fecha ||
              null,

            fechaConfirmacionAdmin:
              cotizacion.fechaConfirmacionAdmin ||
              null,

            fechaInicioProyecto:
              cotizacion.fechaInicioProyecto ||
              null,

            fechaInstalacion:
              cotizacion.fechaInstalacion ||
              null,

            fechaFinalizacion:
              serverTimestamp(),

            fechaCreacion:
              serverTimestamp(),
          },

          {
            merge: true,
          }
        );

        // ================================================
        // ARCHIVAR COTIZACIÓN
        // ================================================

        const cotizacionRef =
          doc(
            db,
            "cotizaciones",
            cotizacion.id
          );

        batch.update(
          cotizacionRef,
          {
            estado:
              "finalizada",

            vistoPorCliente:
              false,

            vistoPorAdmin:
              true,

            mensajeClienteSistema:
              "Tu proyecto ha sido finalizado por Wealth. Ya puedes consultarlo en la sección Mis Proyectos.",

            fechaFinalizacion:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),
          }
        );

        await batch.commit();

        setModalCotizacion(
          false
        );

        setCotizacionActiva(
          null
        );

        alert(
          "✅ Trabajo terminado.\n\nEl proyecto ya fue enviado a Mis Proyectos del cliente."
        );
      } catch (error) {
        console.error(
          "Error terminando proyecto:",
          error
        );

        alert(
          "No se pudo finalizar el proyecto."
        );
      } finally {
        setLoading(false);
      }
    };

  // ======================================================
  // RECHAZAR
  // ======================================================

  const rechazarCotizacion =
    async (cotizacion) => {
      if (
        !window.confirm(
          `¿Seguro que deseas rechazar "${cotizacion.nombre}"?`
        )
      ) {
        return;
      }

      try {
        await updateDoc(
          doc(
            db,
            "cotizaciones",
            cotizacion.id
          ),
          {
            estado:
              "rechazada",

            vistoPorCliente:
              false,

            vistoPorAdmin:
              true,

            mensajeClienteSistema:
              "Wealth rechazó la solicitud.",

            fechaActualizacion:
              serverTimestamp(),
          }
        );
      } catch (error) {
        console.error(error);
      }
    };

  // ======================================================
  // EN REVISIÓN
  // ======================================================

  const marcarEnRevision =
    async (cotizacion) => {
      try {
        await updateDoc(
          doc(
            db,
            "cotizaciones",
            cotizacion.id
          ),
          {
            estado:
              "en_revision",

            vistoPorCliente:
              false,

            vistoPorAdmin:
              true,

            mensajeClienteSistema:
              "Wealth está revisando tu solicitud.",

            fechaActualizacion:
              serverTimestamp(),
          }
        );
      } catch (error) {
        console.error(error);
      }
    };

  // ======================================================
  // ELIMINAR
  // ======================================================

  const eliminar =
    async (id) => {
      if (
        !window.confirm(
          "¿Eliminar esta cotización definitivamente?"
        )
      ) {
        return;
      }

      try {
        await deleteDoc(
          doc(
            db,
            "cotizaciones",
            id
          )
        );
      } catch (error) {
        console.error(error);
      }
    };

  // ======================================================
  // REINICIAR
  // ======================================================

  const resetEstado =
    async (id) => {
      if (
        !window.confirm(
          "¿Reiniciar esta cotización? Se limpiará la propuesta actual."
        )
      ) {
        return;
      }

      try {
        await updateDoc(
          doc(
            db,
            "cotizaciones",
            id
          ),
          {
            estado:
              "pendiente",

            precioTotal:
              null,

            anticipo:
              null,

            saldo:
              null,

            presupuestoAdmin:
              null,

            porcentajeAnticipo:
              null,

            montoAnticipo:
              null,

            saldoPendiente:
              null,

            tiempoEstimado:
              "",

            garantia:
              "",

            observaciones:
              "",

            observacionesAdmin:
              "",

            respuestaCliente:
              "sin_respuesta",

            mensajeCliente:
              "",

            estadoPago:
              "sin_pago",

            vistoPorCliente:
              false,

            vistoPorAdmin:
              true,

            versionAceptada:
              null,

            precioAceptado:
              null,

            fechaActualizacion:
              serverTimestamp(),
          }
        );
      } catch (error) {
        console.error(error);
      }
    };

  // ======================================================
  // ESTADO COLOR
  // ======================================================

  const getEstadoColor =
    (estado) => {
      switch (estado) {
        case "en_revision":
          return "bg-blue-500/10 text-blue-400 border border-blue-500/30";

        case "cotizada":
        case "propuesta_enviada":
          return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30";

        case "propuesta_modificada":
          return "bg-orange-500/10 text-orange-400 border border-orange-500/30";

        case "aceptada_cliente":
          return "bg-green-500/10 text-green-400 border border-green-500/30";

        case "cambios_solicitados":
          return "bg-orange-500/10 text-orange-400 border border-orange-500/30";

        case "rechazada_cliente":
        case "cancelada_cliente":
        case "rechazada":
          return "bg-red-500/10 text-red-400 border border-red-500/30";

        case "confirmada_admin":
          return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";

        case "anticipo_pendiente":
          return "bg-amber-500/10 text-amber-400 border border-amber-500/30";

        case "anticipo_recibido":
        case "anticipo_pagado":
          return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";

        case "en_proceso":
        case "proceso":
          return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30";

        case "instalacion_programada":
        case "instalacion":
          return "bg-purple-500/10 text-purple-400 border border-purple-500/30";

        default:
          return "bg-zinc-800 text-zinc-300 border border-zinc-700";
      }
    };

  // ======================================================
  // ESTADO TEXTO
  // ======================================================

  const getEstadoTexto =
    (estado) => {
      switch (estado) {
        case "en_revision":
          return "En revisión";

        case "cotizada":
        case "propuesta_enviada":
          return "Propuesta enviada";

        case "propuesta_modificada":
          return "Propuesta modificada";

        case "aceptada_cliente":
          return "Aceptada por cliente";

        case "cambios_solicitados":
          return "Cliente pidió cambios";

        case "rechazada_cliente":
        case "cancelada_cliente":
          return "Rechazada por cliente";

        case "confirmada_admin":
          return "Trabajo confirmado";

        case "anticipo_pendiente":
          return "Anticipo pendiente";

        case "anticipo_recibido":
        case "anticipo_pagado":
          return "Anticipo recibido";

        case "en_proceso":
        case "proceso":
          return "Trabajo en proceso";

        case "instalacion_programada":
        case "instalacion":
          return "Instalación programada";

        case "rechazada":
          return "Rechazada";

        default:
          return "Pendiente";
      }
    };

  // ======================================================
  // RESPUESTA CLIENTE
  // ======================================================

  const getRespuestaCliente =
    (c) => {
      if (
        c.estado ===
        "aceptada_cliente"
      ) {
        return {
          titulo:
            "El cliente aceptó la propuesta",

          texto:
            "Puedes confirmar el trabajo para continuar con el proyecto.",

          color:
            "bg-green-500/5 border-green-500/30",

          icono: (
            <FaCheckCircle className="text-green-500" />
          ),
        };
      }

      if (
        c.estado ===
        "cambios_solicitados"
      ) {
        return {
          titulo:
            "El cliente solicitó modificaciones",

          texto:
            c.mensajeCliente ||
            "El cliente desea modificar la propuesta.",

          color:
            "bg-orange-500/5 border-orange-500/30",

          icono: (
            <FaExclamationTriangle className="text-orange-400" />
          ),
        };
      }

      if (
        c.estado ===
          "rechazada_cliente" ||
        c.estado ===
          "cancelada_cliente"
      ) {
        return {
          titulo:
            "El cliente rechazó la propuesta",

          texto:
            "Puedes editarla y enviar una nueva versión si deseas continuar.",

          color:
            "bg-red-500/5 border-red-500/30",

          icono: (
            <FaTimes className="text-red-500" />
          ),
        };
      }

      return null;
    };

  // ======================================================
  // GALERÍA
  // ======================================================

  const openModal = (
    imagenes,
    i = 0
  ) => {
    if (!imagenes) return;

    const imgs =
      Array.isArray(imagenes)
        ? imagenes
        : [imagenes];

    setImagenesActivas(
      imgs
    );

    setIndex(i);

    setModalOpen(true);
  };

  const next = () => {
    setIndex((prev) =>
      prev + 1 >=
      imagenesActivas.length
        ? 0
        : prev + 1
    );
  };

  const prev = () => {
    setIndex((prev) =>
      prev === 0
        ? imagenesActivas.length -
          1
        : prev - 1
    );
  };

  // ======================================================
  // FECHAS
  // ======================================================

  const formatearFecha =
    (fecha) => {
      if (!fecha) {
        return "No especificada";
      }

      if (fecha?.toDate) {
        return fecha
          .toDate()
          .toLocaleDateString(
            "es-MX"
          );
      }

      if (
        typeof fecha ===
        "string"
      ) {
        return fecha;
      }

      return "No especificada";
    };

  const formatearActividad =
    (timestamp) => {
      if (!timestamp) {
        return "Sin fecha";
      }

      try {
        return new Date(
          timestamp
        ).toLocaleString(
          "es-MX",
          {
            dateStyle:
              "medium",

            timeStyle:
              "short",
          }
        );
      } catch {
        return "Sin fecha";
      }
    };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="w-full min-h-screen bg-black text-white p-4 md:p-7">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-8">

        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">

          <div>

            <p className="text-xs uppercase tracking-[0.22em] text-yellow-500 font-semibold mb-2">
              Administración
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Clientes y cotizaciones
            </h1>

            <p className="text-zinc-400 mt-2">
              Administra las solicitudes agrupadas por cliente y da seguimiento a cada trabajo.
            </p>

          </div>

          {cantidadNovedadesAdmin >
            0 && (
            <div className="bg-zinc-900 border border-red-500/40 rounded-2xl px-5 py-4 flex items-center gap-4">

              <div className="relative w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">

                <FaBell className="text-yellow-500" />

                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center font-bold">
                  {
                    cantidadNovedadesAdmin
                  }
                </span>

              </div>

              <div>

                <p className="font-bold text-white">
                  {cantidadNovedadesAdmin ===
                  1
                    ? "Tienes una novedad"
                    : `Tienes ${cantidadNovedadesAdmin} novedades`}
                </p>

                <p className="text-xs text-zinc-500">
                  Los clientes con actividad nueva aparecen primero.
                </p>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* RESUMEN */}
      {/* ================================================= */}

      <div className="grid sm:grid-cols-3 gap-5 mb-8">

        <CajaResumen
          titulo="Clientes activos"
          valor={clientes.length}
          icon={<FaUser />}
        />

        <CajaResumen
          titulo="Cotizaciones activas"
          valor={
            cotizacionesActivas.length
          }
          icon={<FaBriefcase />}
        />

        <CajaResumen
          titulo="Novedades"
          valor={
            cantidadNovedadesAdmin
          }
          icon={<FaBell />}
        />

      </div>

      {/* ================================================= */}
      {/* BUSCADOR */}
      {/* ================================================= */}

      <div className="relative mb-8">

        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />

        <input
          type="text"
          value={
            busquedaCliente
          }
          onChange={(e) =>
            setBusquedaCliente(
              e.target.value
            )
          }
          placeholder="Buscar cliente, correo, teléfono o proyecto..."
          className="
            w-full
            bg-zinc-900
            border
            border-zinc-700
            rounded-2xl
            py-4
            pl-12
            pr-5
            text-white
            placeholder:text-zinc-600
            outline-none
            focus:border-yellow-500/70
            transition
          "
        />

      </div>

      {/* ================================================= */}
      {/* SIN CLIENTES */}
      {/* ================================================= */}

      {clientesFiltrados.length ===
        0 && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-12 text-center">

          <FaUser className="text-zinc-600 text-4xl mx-auto" />

          <p className="text-zinc-400 mt-4">
            No hay clientes con cotizaciones activas.
          </p>

        </div>
      )}

      {/* ================================================= */}
      {/* CLIENTES */}
      {/* ================================================= */}

      <div className="space-y-8">

        {clientesFiltrados.map(
          (cliente) => {
            const abierto =
              clienteAbierto ===
              cliente.clave;

            return (
              <div
                key={
                  cliente.clave
                }
                className={`
                  relative
                  rounded-[28px]
                  overflow-hidden
                  border
                  bg-zinc-900
                  shadow-[0_10px_35px_rgba(0,0,0,0.40)]
                  transition-all
                  duration-300
                  ${
                    cliente.nuevas > 0
                      ? "border-yellow-500/80 shadow-[0_0_22px_rgba(234,179,8,0.08)]"
                      : "border-zinc-600 hover:border-yellow-500/40"
                  }
                `}
              >

                {/* PEQUEÑA LÍNEA LATERAL */}

                <div
                  className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                    cliente.nuevas >
                    0
                      ? "bg-yellow-500"
                      : "bg-zinc-600"
                  }`}
                />

                {/* ======================================= */}
                {/* CABECERA CLIENTE */}
                {/* ======================================= */}

                <button
                  type="button"
                  onClick={() =>
                    toggleCliente(
                      cliente.clave
                    )
                  }
                  className="
                    w-full
                    text-left
                    p-6
                    md:p-7
                    bg-zinc-900
                    hover:bg-zinc-800/70
                    transition-all
                    duration-300
                  "
                >

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                    <div className="flex items-start gap-4">

                      <div className="relative w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">

                        <FaUser className="text-yellow-500 text-xl" />

                        {cliente.nuevas >
                          0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center">
                            {
                              cliente.nuevas
                            }
                          </span>
                        )}

                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="text-xl font-bold text-white break-all">
                            {
                              cliente.nombre
                            }
                          </h2>

                          {cliente.nuevas >
                            0 && (
                            <span className="bg-red-500/10 border border-red-500/40 text-red-400 text-[10px] px-2.5 py-1 rounded-full font-bold">
                              NUEVO
                            </span>
                          )}

                        </div>

                        <p className="text-sm text-zinc-400 mt-1 break-all">
                          {
                            cliente.usuario
                          }
                        </p>

                        {cliente.telefono && (
                          <p className="text-sm text-zinc-500 mt-1.5 flex items-center gap-2">

                            <FaPhone />

                            {
                              cliente.telefono
                            }

                          </p>
                        )}

                      </div>

                    </div>

                    <div className="flex flex-wrap md:justify-end items-center gap-3">

                      {/* COTIZACIONES */}

                      <span className="bg-black border border-zinc-700 rounded-xl px-4 py-2 text-sm">

                        <strong className="text-white">
                          {
                            cliente
                              .cotizaciones
                              .length
                          }
                        </strong>

                        <span className="text-zinc-500">
                          {" "}
                          {cliente
                            .cotizaciones
                            .length ===
                          1
                            ? "cotización"
                            : "cotizaciones"}
                        </span>

                      </span>

                      {/* EN EJECUCIÓN */}

                      {cliente.confirmados >
                        0 && (
                        <span className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-2 text-sm font-medium">
                          {
                            cliente.confirmados
                          }{" "}
                          en ejecución
                        </span>
                      )}

                      <span className="text-zinc-500 text-xs hidden lg:block">
                        Última actividad:{" "}
                        {formatearActividad(
                          cliente.ultimaActividad
                        )}
                      </span>

                      {/* FLECHA */}

                      <div className="w-11 h-11 rounded-xl bg-black border border-zinc-700 flex items-center justify-center text-zinc-300">

                        {abierto ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}

                      </div>

                    </div>

                  </div>

                </button>

                {/* ======================================= */}
                {/* COTIZACIONES CLIENTE */}
                {/* ======================================= */}

                {abierto && (
                  <div className="border-t border-zinc-600 bg-black p-5 md:p-7">

                    <div className="mb-6">

                      <p className="font-bold text-white text-lg">
                        Cotizaciones activas
                      </p>

                      <p className="text-sm text-zinc-500 mt-1">
                        Selecciona una para revisar o actualizar su estado.
                      </p>

                    </div>

                    <div className="space-y-6">

                      {cliente.cotizaciones.map(
                        (c) => {
                          const respuesta =
                            getRespuestaCliente(
                              c
                            );

                          const precioActual =
                            obtenerPrecio(
                              c
                            );

                          return (
                            <article
                              key={
                                c.id
                              }
                              className={`
                                relative
                                bg-zinc-950
                                border
                                rounded-3xl
                                p-5
                                md:p-6
                                transition-all
                                duration-300
                                ${
                                  c.vistoPorAdmin ===
                                  false
                                    ? "border-yellow-500/60"
                                    : "border-zinc-700 hover:border-zinc-500"
                                }
                              `}
                            >

                              {c.vistoPorAdmin ===
                                false && (
                                <span className="absolute top-4 right-4 bg-red-500/10 border border-red-500/40 text-red-400 text-[10px] font-bold px-3 py-1 rounded-full">
                                  NUEVO
                                </span>
                              )}

                              <div className="flex flex-col xl:flex-row gap-6">

                                {/* INFORMACIÓN */}

                                <div className="flex-1">

                                  <div className="flex flex-wrap items-center gap-3 pr-16">

                                    <h3 className="text-xl font-bold text-white">
                                      {
                                        c.nombre
                                      }
                                    </h3>

                                    <span
                                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${getEstadoColor(
                                        c.estado
                                      )}`}
                                    >
                                      {getEstadoTexto(
                                        c.estado
                                      )}
                                    </span>

                                    {c.versionPropuesta && (
                                      <span className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full text-xs text-zinc-300">
                                        v
                                        {
                                          c.versionPropuesta
                                        }
                                      </span>
                                    )}

                                  </div>

                                  <p className="text-zinc-400 text-sm mt-3 line-clamp-2">
                                    {
                                      c.descripcion
                                    }
                                  </p>

                                  {/* RESPUESTA */}

                                  {respuesta && (
                                    <div
                                      className={`mt-4 border rounded-2xl p-4 ${respuesta.color}`}
                                    >

                                      <div className="flex gap-3">

                                        <div className="mt-1">
                                          {
                                            respuesta.icono
                                          }
                                        </div>

                                        <div>

                                          <p className="font-bold text-white text-sm">
                                            {
                                              respuesta.titulo
                                            }
                                          </p>

                                          <p className="text-zinc-400 text-sm mt-1">
                                            {
                                              respuesta.texto
                                            }
                                          </p>

                                        </div>

                                      </div>

                                    </div>
                                  )}

                                  {/* DATOS */}

                                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">

                                    <DatoRapido
                                      icon={
                                        <FaMapMarkerAlt />
                                      }
                                      titulo="Ubicación"
                                      valor={
                                        c.ubicacion ||
                                        "No especificada"
                                      }
                                    />

                                    <DatoRapido
                                      icon={
                                        <FaRulerCombined />
                                      }
                                      titulo="Medidas"
                                      valor={
                                        c.medidas ||
                                        "No especificadas"
                                      }
                                    />

                                    <DatoRapido
                                      icon={
                                        <FaCalendarAlt />
                                      }
                                      titulo="Fecha deseada"
                                      valor={formatearFecha(
                                        c.fechaDeseada
                                      )}
                                    />

                                  </div>

                                  {/* PRECIO */}

                                  {precioActual !==
                                    null && (
                                    <div className="grid sm:grid-cols-3 gap-3 mt-5">

                                      <InfoPrecioCaja
                                        titulo="Total"
                                        valor={`$${Number(
                                          precioActual
                                        ).toLocaleString(
                                          "es-MX"
                                        )} MXN`}
                                      />

                                      <InfoPrecioCaja
                                        titulo="Anticipo"
                                        valor={`$${Number(
                                          c.anticipo ??
                                            c.montoAnticipo ??
                                            0
                                        ).toLocaleString(
                                          "es-MX"
                                        )} MXN`}
                                      />

                                      <InfoPrecioCaja
                                        titulo="Saldo"
                                        valor={`$${Number(
                                          c.saldo ??
                                            c.saldoPendiente ??
                                            0
                                        ).toLocaleString(
                                          "es-MX"
                                        )} MXN`}
                                      />

                                    </div>
                                  )}

                                </div>

                                {/* IMÁGENES */}

                                <div className="xl:w-[240px]">

                                  {c.imagenes?.length >
                                  0 ? (
                                    <div>

                                      <p className="text-xs text-zinc-500 mb-2 flex items-center gap-2">

                                        <FaImages />

                                        Imágenes

                                      </p>

                                      <div className="grid grid-cols-3 gap-2">

                                        {c.imagenes
                                          .slice(
                                            0,
                                            6
                                          )
                                          .map(
                                            (
                                              img,
                                              i
                                            ) => (
                                              <img
                                                key={
                                                  i
                                                }
                                                src={
                                                  img
                                                }
                                                alt="Referencia"
                                                onClick={() =>
                                                  openModal(
                                                    c.imagenes,
                                                    i
                                                  )
                                                }
                                                className="w-full aspect-square object-cover rounded-xl border border-zinc-700 cursor-zoom-in hover:border-yellow-500/60 transition"
                                              />
                                            )
                                          )}

                                      </div>

                                    </div>
                                  ) : (
                                    <div className="border border-dashed border-zinc-700 rounded-2xl h-24 flex items-center justify-center text-zinc-600 text-xs">
                                      Sin imágenes
                                    </div>
                                  )}

                                </div>

                              </div>

                              {/* ================================= */}
                              {/* BOTONES */}
                              {/* ================================= */}

                              <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-zinc-800">

                                {/* VER / EDITAR */}

                                <button
                                  onClick={() =>
                                    abrirCotizacion(
                                      c
                                    )
                                  }
                                  className={`${botonBase} border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500`}
                                >

                                  {tienePropuesta(
                                    c
                                  ) ? (
                                    <FaEdit />
                                  ) : (
                                    <FaEye />
                                  )}

                                  {tienePropuesta(
                                    c
                                  )
                                    ? "Ver / editar"
                                    : "Revisar"}

                                </button>

                                {/* EN REVISIÓN */}

                                {(!c.estado ||
                                  c.estado ===
                                    "pendiente") && (
                                  <button
                                    onClick={() =>
                                      marcarEnRevision(
                                        c
                                      )
                                    }
                                    className={`${botonBase} border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500`}
                                  >
                                    <FaEdit />
                                    En revisión
                                  </button>
                                )}

                                {/* CONFIRMAR */}

                                {c.estado ===
                                  "aceptada_cliente" && (
                                  <button
                                    onClick={() =>
                                      confirmarTrabajo(
                                        c
                                      )
                                    }
                                    className={`${botonBase} border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-500`}
                                  >
                                    <FaCheckCircle />
                                    Confirmar trabajo
                                  </button>
                                )}

                                {/* INICIAR */}

                                {c.estado ===
                                  "confirmada_admin" && (
                                  <button
                                    onClick={() =>
                                      iniciarTrabajo(
                                        c
                                      )
                                    }
                                    className={`${botonBase} border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500`}
                                  >
                                    <FaPlay />
                                    Iniciar trabajo
                                  </button>
                                )}

                                {/* PROCESO */}

                                {[
                                  "en_proceso",
                                  "proceso",
                                ].includes(
                                  c.estado
                                ) && (
                                  <>
                                    <button
                                      onClick={() =>
                                        programarInstalacion(
                                          c
                                        )
                                      }
                                      className={`${botonBase} border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500`}
                                    >
                                      <FaTools />
                                      Programar instalación
                                    </button>

                                    <button
                                      onClick={() =>
                                        terminarTrabajo(
                                          c
                                        )
                                      }
                                      className={`${botonBase} border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500`}
                                    >
                                      <FaFlagCheckered />
                                      Trabajo terminado
                                    </button>
                                  </>
                                )}

                                {/* INSTALACIÓN */}

                                {[
                                  "instalacion_programada",
                                  "instalacion",
                                ].includes(
                                  c.estado
                                ) && (
                                  <button
                                    onClick={() =>
                                      terminarTrabajo(
                                        c
                                      )
                                    }
                                    className={`${botonBase} border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500`}
                                  >
                                    <FaFlagCheckered />
                                    Trabajo terminado
                                  </button>
                                )}

                                {/* RECHAZAR */}

                                {![
                                  "rechazada",
                                  "confirmada_admin",
                                  "en_proceso",
                                  "proceso",
                                  "instalacion_programada",
                                  "instalacion",
                                ].includes(
                                  c.estado
                                ) && (
                                  <button
                                    onClick={() =>
                                      rechazarCotizacion(
                                        c
                                      )
                                    }
                                    className={`${botonBase} border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500`}
                                  >
                                    <FaTimes />
                                    Rechazar
                                  </button>
                                )}

                                {/* REINICIAR */}

                                {c.estado &&
                                  c.estado !==
                                    "pendiente" &&
                                  ![
                                    "confirmada_admin",
                                    "en_proceso",
                                    "proceso",
                                    "instalacion_programada",
                                    "instalacion",
                                  ].includes(
                                    c.estado
                                  ) && (
                                    <button
                                      onClick={() =>
                                        resetEstado(
                                          c.id
                                        )
                                      }
                                      className={`${botonBase} border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500`}
                                    >
                                      <FaUndo />
                                      Reiniciar
                                    </button>
                                  )}

                                {/* ELIMINAR */}

                                <button
                                  onClick={() =>
                                    eliminar(
                                      c.id
                                    )
                                  }
                                  className={`${botonBase} border-red-500/30 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/60 ml-auto`}
                                >
                                  <FaTrash />
                                  Eliminar
                                </button>

                              </div>

                            </article>
                          );
                        }
                      )}

                    </div>

                  </div>
                )}

              </div>
            );
          }
        )}

      </div>

      {/* ================================================= */}
      {/* MODAL COTIZACIÓN */}
      {/* ================================================= */}

      {modalCotizacion &&
        cotizacionActiva && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() =>
              setModalCotizacion(
                false
              )
            }
          >

            <div
              className="bg-zinc-900 border border-zinc-600 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* HEADER */}

              <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-700 p-6 md:p-8 z-10">

                <div className="flex justify-between gap-4">

                  <div>

                    <p className="text-xs uppercase tracking-widest text-yellow-500 font-semibold">
                      Cotización
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-1">
                      {
                        cotizacionActiva.nombre
                      }
                    </h2>

                    <div className="flex flex-wrap gap-2 mt-3">

                      <span
                        className={`px-3 py-1.5 rounded-full text-xs ${getEstadoColor(
                          cotizacionActiva.estado
                        )}`}
                      >
                        {getEstadoTexto(
                          cotizacionActiva.estado
                        )}
                      </span>

                      {cotizacionActiva.versionPropuesta && (
                        <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-full text-xs">
                          Versión{" "}
                          {
                            cotizacionActiva.versionPropuesta
                          }
                        </span>
                      )}

                    </div>

                    <p className="text-zinc-500 text-sm mt-2">
                      {
                        cotizacionActiva.usuario
                      }
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setModalCotizacion(
                        false
                      )
                    }
                    className="
                      w-11
                      h-11
                      bg-black
                      border
                      border-zinc-700
                      hover:border-zinc-500
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      text-zinc-400
                      hover:text-white
                      transition
                    "
                  >
                    <FaTimes />
                  </button>

                </div>

              </div>

              <div className="p-6 md:p-8 space-y-8">

                {/* RESPUESTA */}

                {getRespuestaCliente(
                  cotizacionActiva
                ) && (
                  <section
                    className={`border rounded-2xl p-5 ${
                      getRespuestaCliente(
                        cotizacionActiva
                      ).color
                    }`}
                  >

                    <div className="flex gap-3">

                      <div className="mt-1">

                        {
                          getRespuestaCliente(
                            cotizacionActiva
                          ).icono
                        }

                      </div>

                      <div>

                        <p className="font-bold text-white">
                          {
                            getRespuestaCliente(
                              cotizacionActiva
                            ).titulo
                          }
                        </p>

                        <p className="text-zinc-400 text-sm mt-1">
                          {
                            getRespuestaCliente(
                              cotizacionActiva
                            ).texto
                          }
                        </p>

                      </div>

                    </div>

                  </section>
                )}

                {/* INFORMACIÓN */}

                <section>

                  <h3 className="font-semibold text-lg text-white mb-4">
                    Información enviada por el cliente
                  </h3>

                  <div className="bg-black border border-zinc-700 rounded-2xl p-5 space-y-4">

                    <Detalle
                      titulo="Descripción"
                      valor={
                        cotizacionActiva.descripcion
                      }
                    />

                    <Detalle
                      titulo="Tipo"
                      valor={
                        cotizacionActiva.tipo
                      }
                    />

                    <Detalle
                      titulo="Ubicación"
                      valor={
                        cotizacionActiva.ubicacion ||
                        "No especificada"
                      }
                    />

                    <Detalle
                      titulo="Medidas"
                      valor={
                        cotizacionActiva.medidas ||
                        "No especificadas"
                      }
                    />

                    <Detalle
                      titulo="Fecha deseada"
                      valor={formatearFecha(
                        cotizacionActiva.fechaDeseada
                      )}
                    />

                    <Detalle
                      titulo="Contacto"
                      valor={`${
                        cotizacionActiva.telefono ||
                        "No registrado"
                      } · ${
                        cotizacionActiva.metodoContacto ||
                        "Sin preferencia"
                      }`}
                    />

                  </div>

                </section>

                {/* IMÁGENES SEPARADAS */}

                {(cotizacionActiva.imagenesProyecto?.length >
                  0 ||
                  cotizacionActiva.imagenesCliente?.length >
                    0) && (
                  <section>

                    <h3 className="font-semibold text-lg text-white mb-4">
                      Imágenes
                    </h3>

                    {cotizacionActiva.imagenesProyecto?.length >
                      0 && (
                      <BloqueImagenes
                        titulo="Proyecto de referencia"
                        imagenes={
                          cotizacionActiva.imagenesProyecto
                        }
                        openModal={
                          openModal
                        }
                      />
                    )}

                    {cotizacionActiva.imagenesCliente?.length >
                      0 && (
                      <div className="mt-6">

                        <BloqueImagenes
                          titulo="Fotos del espacio del cliente"
                          imagenes={
                            cotizacionActiva.imagenesCliente
                          }
                          openModal={
                            openModal
                          }
                        />

                      </div>
                    )}

                  </section>
                )}

                {/* PROPUESTA */}

                <section>

                  <div className="mb-5">

                    <h3 className="font-semibold text-xl text-white">
                      {tienePropuesta(
                        cotizacionActiva
                      )
                        ? "Editar propuesta económica"
                        : "Preparar propuesta económica"}
                    </h3>

                    <p className="text-zinc-400 text-sm mt-2">
                      {tienePropuesta(
                        cotizacionActiva
                      )
                        ? "Si modificas la propuesta se creará una nueva versión y el cliente deberá aceptarla nuevamente."
                        : "Prepara la propuesta económica que recibirá el cliente."}
                    </p>

                  </div>

                  {error && (
                    <div className="mb-5 bg-red-500/5 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl">
                      {error}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-5">

                    <CampoAdmin
                      icon={
                        <FaDollarSign />
                      }
                      titulo="Precio total"
                    >

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          presupuestoAdmin
                        }
                        onChange={(e) =>
                          setPresupuestoAdmin(
                            e.target.value
                          )
                        }
                        placeholder="Ej: 18500"
                        className={
                          inputClass
                        }
                      />

                    </CampoAdmin>

                    <CampoAdmin
                      icon={
                        <FaDollarSign />
                      }
                      titulo="Anticipo requerido (%)"
                    >

                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={
                          porcentajeAnticipo
                        }
                        onChange={(e) =>
                          setPorcentajeAnticipo(
                            e.target.value
                          )
                        }
                        placeholder="50"
                        className={
                          inputClass
                        }
                      />

                    </CampoAdmin>

                  </div>

                  {/* CÁLCULOS */}

                  <div className="grid sm:grid-cols-3 gap-4 mt-5">

                    <CajaCalculo
                      titulo="Precio total"
                      valor={`$${Number(
                        presupuestoAdmin ||
                          0
                      ).toLocaleString(
                        "es-MX"
                      )} MXN`}
                    />

                    <CajaCalculo
                      titulo={`Anticipo ${
                        porcentajeAnticipo ||
                        0
                      }%`}
                      valor={`$${Number(
                        montoAnticipo
                      ).toLocaleString(
                        "es-MX"
                      )} MXN`}
                    />

                    <CajaCalculo
                      titulo="Saldo"
                      valor={`$${Number(
                        saldoPendiente
                      ).toLocaleString(
                        "es-MX"
                      )} MXN`}
                    />

                  </div>

                  <div className="grid md:grid-cols-2 gap-5 mt-6">

                    <CampoAdmin
                      icon={
                        <FaClock />
                      }
                      titulo="Tiempo estimado"
                    >

                      <input
                        value={
                          tiempoEstimado
                        }
                        onChange={(e) =>
                          setTiempoEstimado(
                            e.target.value
                          )
                        }
                        placeholder="Ej: 7 a 15 días"
                        className={
                          inputClass
                        }
                      />

                    </CampoAdmin>

                    <CampoAdmin
                      icon={
                        <FaShieldAlt />
                      }
                      titulo="Garantía"
                    >

                      <input
                        value={
                          garantia
                        }
                        onChange={(e) =>
                          setGarantia(
                            e.target.value
                          )
                        }
                        placeholder="Ej: 3 meses"
                        className={
                          inputClass
                        }
                      />

                    </CampoAdmin>

                  </div>

                  <div className="mt-5">

                    <CampoAdmin
                      icon={
                        <FaEdit />
                      }
                      titulo="Observaciones para el cliente"
                    >

                      <textarea
                        rows="5"
                        value={
                          observacionesAdmin
                        }
                        onChange={(e) =>
                          setObservacionesAdmin(
                            e.target.value
                          )
                        }
                        placeholder="Detalles de la propuesta..."
                        className={
                          inputClass
                        }
                      />

                    </CampoAdmin>

                  </div>

                </section>

                {/* HISTORIAL */}

                {Array.isArray(
                  cotizacionActiva.historialPropuestas
                ) &&
                  cotizacionActiva
                    .historialPropuestas
                    .length >
                    0 && (
                    <section>

                      <h3 className="font-bold text-white mb-4">
                        Historial de propuestas
                      </h3>

                      <div className="space-y-3">

                        {cotizacionActiva.historialPropuestas.map(
                          (
                            propuesta,
                            indice
                          ) => (
                            <div
                              key={
                                indice
                              }
                              className="bg-black border border-zinc-700 rounded-2xl p-4 flex justify-between gap-4"
                            >

                              <div>

                                <p className="font-bold">
                                  Propuesta #
                                  {propuesta.version ||
                                    indice +
                                      1}
                                </p>

                                <p className="text-xs text-zinc-500 mt-1">
                                  {
                                    propuesta.estadoAnterior
                                  }
                                </p>

                              </div>

                              <p className="text-yellow-500 font-bold">
                                $
                                {Number(
                                  propuesta.precioTotal ||
                                    0
                                ).toLocaleString(
                                  "es-MX"
                                )}{" "}
                                MXN
                              </p>

                            </div>
                          )
                        )}

                      </div>

                    </section>
                  )}

                {/* ======================================= */}
                {/* BOTONES MODAL - MISMO ESTILO */}
                {/* ======================================= */}

                <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-700 pt-6">

                  {/* CERRAR */}

                  <button
                    type="button"
                    onClick={() =>
                      setModalCotizacion(
                        false
                      )
                    }
                    className={`${botonBase} border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500`}
                  >
                    <FaTimes />
                    Cerrar
                  </button>

                  {/* CONFIRMAR */}

                  {cotizacionActiva.estado ===
                    "aceptada_cliente" && (
                    <button
                      type="button"
                      onClick={() =>
                        confirmarTrabajo(
                          cotizacionActiva
                        )
                      }
                      className={`${botonBase} border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-500`}
                    >
                      <FaCheckCircle />
                      Confirmar trabajo
                    </button>
                  )}

                  {/* INICIAR */}

                  {cotizacionActiva.estado ===
                    "confirmada_admin" && (
                    <button
                      type="button"
                      onClick={() =>
                        iniciarTrabajo(
                          cotizacionActiva
                        )
                      }
                      className={`${botonBase} border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500`}
                    >
                      <FaPlay />
                      Iniciar trabajo
                    </button>
                  )}

                  {/* INSTALACIÓN */}

                  {[
                    "en_proceso",
                    "proceso",
                  ].includes(
                    cotizacionActiva.estado
                  ) && (
                    <button
                      type="button"
                      onClick={() =>
                        programarInstalacion(
                          cotizacionActiva
                        )
                      }
                      className={`${botonBase} border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500`}
                    >
                      <FaTools />
                      Programar instalación
                    </button>
                  )}

                  {/* TERMINAR */}

                  {[
                    "en_proceso",
                    "proceso",
                    "instalacion_programada",
                    "instalacion",
                  ].includes(
                    cotizacionActiva.estado
                  ) && (
                    <button
                      type="button"
                      onClick={() =>
                        terminarTrabajo(
                          cotizacionActiva
                        )
                      }
                      disabled={
                        loading
                      }
                      className={`${botonBase} border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 disabled:opacity-50`}
                    >
                      <FaFlagCheckered />

                      {loading
                        ? "Finalizando..."
                        : "Trabajo terminado"}
                    </button>
                  )}

                  {/* PROPUESTA */}

                  {![
                    "confirmada_admin",
                    "en_proceso",
                    "proceso",
                    "instalacion_programada",
                    "instalacion",
                  ].includes(
                    cotizacionActiva.estado
                  ) && (
                    <button
                      type="button"
                      onClick={
                        enviarPropuesta
                      }
                      disabled={
                        loading
                      }
                      className={`${botonBase} border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500 disabled:opacity-50`}
                    >

                      {tienePropuesta(
                        cotizacionActiva
                      ) ? (
                        <FaSyncAlt />
                      ) : (
                        <FaPaperPlane />
                      )}

                      {loading
                        ? "Guardando..."
                        : tienePropuesta(
                            cotizacionActiva
                          )
                        ? "Guardar nueva versión"
                        : "Enviar propuesta"}

                    </button>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      {/* ================================================= */}
      {/* GALERÍA */}
      {/* ================================================= */}

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60]"
          onClick={() =>
            setModalOpen(
              false
            )
          }
        >

          {imagenesActivas.length >
            1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();

                prev();
              }}
              className="absolute left-5 w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-600 hover:border-yellow-500 text-white flex items-center justify-center text-2xl transition"
            >
              ❮
            </button>
          )}

          <img
            src={
              imagenesActivas[
                index
              ]
            }
            alt="Vista ampliada"
            className="max-w-[90%] max-h-[90%] rounded-2xl object-contain"
            onClick={(e) =>
              e.stopPropagation()
            }
          />

          {imagenesActivas.length >
            1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();

                next();
              }}
              className="absolute right-5 w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-600 hover:border-yellow-500 text-white flex items-center justify-center text-2xl transition"
            >
              ❯
            </button>
          )}

          <button
            onClick={() =>
              setModalOpen(
                false
              )
            }
            className="absolute top-6 right-6 w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-600 hover:border-red-500 text-zinc-300 hover:text-red-400 flex items-center justify-center transition"
          >
            <FaTimes />
          </button>

          {imagenesActivas.length >
            1 && (
            <div className="absolute bottom-6 bg-zinc-900 border border-zinc-700 text-white text-sm px-4 py-2 rounded-xl">
              {index + 1} /{" "}
              {
                imagenesActivas.length
              }
            </div>
          )}

        </div>
      )}

    </div>
  );
}

// ======================================================
// ESTILOS GENERALES
// ======================================================

const inputClass = `
  w-full
  p-4
  rounded-2xl
  bg-black
  border
  border-zinc-700
  text-white
  placeholder:text-zinc-600
  outline-none
  focus:border-yellow-500
  focus:ring-2
  focus:ring-yellow-500/10
  transition
`;

// ======================================================
// NUEVO ESTILO ÚNICO PARA BOTONES
// ======================================================

const botonBase = `
  bg-black
  border
  px-4
  py-2.5
  rounded-xl
  font-medium
  flex
  items-center
  justify-center
  gap-2
  transition-all
  duration-200
  hover:-translate-y-[1px]
  active:translate-y-0
`;

// ======================================================
// COMPONENTES
// ======================================================

function CajaResumen({
  titulo,
  valor,
  icon,
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5">

      <div className="flex items-center gap-3">

        <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center">
          {icon}
        </div>

        <div>

          <p className="text-xs text-zinc-500">
            {titulo}
          </p>

          <p className="text-2xl font-bold text-white">
            {valor}
          </p>

        </div>

      </div>

    </div>
  );
}

function DatoRapido({
  icon,
  titulo,
  valor,
}) {
  return (
    <div className="bg-black border border-zinc-800 rounded-xl p-3">

      <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">

        <span className="text-yellow-500">
          {icon}
        </span>

        {titulo}

      </div>

      <p className="text-zinc-300 text-sm break-words">
        {valor}
      </p>

    </div>
  );
}

function InfoPrecioCaja({
  titulo,
  valor,
}) {
  return (
    <div className="bg-black border border-zinc-700 rounded-xl p-3">

      <p className="text-xs text-zinc-500">
        {titulo}
      </p>

      <p className="text-white font-semibold mt-1">
        {valor}
      </p>

    </div>
  );
}

function Detalle({
  titulo,
  valor,
}) {
  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-1 md:gap-4">

      <span className="text-zinc-500 text-sm">
        {titulo}
      </span>

      <span className="text-zinc-200 text-sm break-words">
        {valor ||
          "No especificado"}
      </span>

    </div>
  );
}

function CampoAdmin({
  icon,
  titulo,
  children,
}) {
  return (
    <div>

      <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">

        <span className="text-yellow-500">
          {icon}
        </span>

        {titulo}

      </label>

      {children}

    </div>
  );
}

function CajaCalculo({
  titulo,
  valor,
}) {
  return (
    <div className="bg-black border border-zinc-700 rounded-2xl p-4">

      <p className="text-xs text-zinc-500">
        {titulo}
      </p>

      <p className="text-lg text-white font-bold mt-1">
        {valor}
      </p>

    </div>
  );
}

function BloqueImagenes({
  titulo,
  imagenes,
  openModal,
}) {
  return (
    <div>

      <p className="text-sm text-zinc-400 mb-3 flex items-center gap-2">

        <FaImage className="text-yellow-500" />

        {titulo}

      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

        {imagenes.map(
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
              alt={
                titulo
              }
              onClick={() =>
                openModal(
                  imagenes,
                  index
                )
              }
              className="
                w-full
                aspect-square
                object-cover
                rounded-2xl
                border
                border-zinc-700
                cursor-zoom-in
                hover:border-yellow-500/60
                hover:opacity-90
                transition
              "
            />
          )
        )}

      </div>

    </div>
  );
}

export default CotizacionesAdmin;