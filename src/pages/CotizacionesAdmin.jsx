import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase.config";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import {
  FaBell,
  FaBriefcase,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaDollarSign,
  FaEdit,
  FaEye,
  FaFlagCheckered,
  FaImages,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaPhone,
  FaPlay,
  FaSearch,
  FaShieldAlt,
  FaSyncAlt,
  FaTimes,
  FaTools,
  FaTrash,
  FaUndo,
  FaUser,
} from "react-icons/fa";

const ESTADOS_FINALIZADOS = [
  "finalizada",
  "terminada",
  "terminado",
];

const ESTADOS_CON_PROPUESTA = [
  "cotizada",
  "propuesta_enviada",
  "propuesta_modificada",
  "aceptada_cliente",
  "cambios_solicitados",
  "rechazada_cliente",
  "cancelada_cliente",
  "confirmada_admin",
  "anticipo_pendiente",
  "anticipo_pagado",
  "anticipo_recibido",
  "en_proceso",
  "proceso",
  "instalacion_programada",
  "instalacion",
];

function CotizacionesAdmin() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [clienteAbierto, setClienteAbierto] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [modalCotizacion, setModalCotizacion] = useState(false);
  const [cotizacionActiva, setCotizacionActiva] = useState(null);

  const [presupuestoAdmin, setPresupuestoAdmin] = useState("");
  const [porcentajeAnticipo, setPorcentajeAnticipo] = useState("50");
  const [tiempoEstimado, setTiempoEstimado] = useState("");
  const [garantia, setGarantia] = useState("");
  const [observacionesAdmin, setObservacionesAdmin] = useState("");
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const [galeriaOpen, setGaleriaOpen] = useState(false);
  const [imagenesActivas, setImagenesActivas] = useState([]);
  const [indiceImagen, setIndiceImagen] = useState(0);

  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [cotizacionFinalizar, setCotizacionFinalizar] = useState(null);
  const [fotosFinales, setFotosFinales] = useState([]);
  const [previewsFinales, setPreviewsFinales] = useState([]);
  const [errorFinalizar, setErrorFinalizar] = useState("");
  const [subiendoFinales, setSubiendoFinales] = useState(false);

  /* ======================================================
     FIRESTORE - COTIZACIONES
  ====================================================== */

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "cotizaciones"),
      (snapshot) => {
        const data = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

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

        setCotizacionActiva((actual) => {
          if (!actual) return null;
          return data.find((c) => c.id === actual.id) || actual;
        });

        setCargando(false);
      },
      (err) => {
        console.error("Error cargando cotizaciones:", err);
        setCargando(false);
      }
    );

    return () => unsub();
  }, []);

  /* ======================================================
     FIRESTORE - USUARIOS
  ====================================================== */

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setUsuarios(
          snapshot.docs.map((documento) => ({
            id: documento.id,
            ...documento.data(),
          }))
        );
      },
      (err) => {
        console.error("Error cargando usuarios:", err);
      }
    );

    return () => unsub();
  }, []);

  /* ======================================================
     IMPORTANTE:
     NO marcamos todas las notificaciones como vistas al entrar.
     Solo se marcan vistas cuando el administrador ABRE
     el cliente o ABRE la cotización.
  ====================================================== */

  const cotizacionesActivas = useMemo(() => {
    return cotizaciones.filter(
      (c) => !ESTADOS_FINALIZADOS.includes(c.estado)
    );
  }, [cotizaciones]);

  const obtenerUsuarioRegistrado = (cotizacion) => {
    const uid =
      cotizacion.uid ||
      cotizacion.userUid ||
      cotizacion.usuarioId ||
      null;

    const correo =
      cotizacion.correo ||
      cotizacion.email ||
      (typeof cotizacion.usuario === "string" &&
      cotizacion.usuario.includes("@")
        ? cotizacion.usuario
        : "");

    const telefono = String(
      cotizacion.telefono ||
        cotizacion.telefonoCliente ||
        cotizacion.phone ||
        ""
    ).replace(/\D/g, "");

    return usuarios.find((usuario) => {
      if (
        uid &&
        (usuario.id === uid || usuario.uid === uid)
      ) {
        return true;
      }

      const correoUsuario = String(
        usuario.correo || usuario.email || ""
      ).toLowerCase();

      if (
        correo &&
        correoUsuario &&
        correoUsuario === correo.toLowerCase()
      ) {
        return true;
      }

      const telefonoUsuario = String(
        usuario.telefono || usuario.phone || ""
      ).replace(/\D/g, "");

      return (
        telefono &&
        telefonoUsuario &&
        telefonoUsuario === telefono
      );
    });
  };

  const clientes = useMemo(() => {
    const grupos = {};

    cotizacionesActivas.forEach((cotizacion) => {
      const usuarioRegistrado =
        obtenerUsuarioRegistrado(cotizacion);

      const uid =
        cotizacion.uid ||
        cotizacion.userUid ||
        cotizacion.usuarioId ||
        usuarioRegistrado?.id ||
        usuarioRegistrado?.uid ||
        null;

      const correo =
        cotizacion.correo ||
        cotizacion.email ||
        (typeof cotizacion.usuario === "string" &&
        cotizacion.usuario.includes("@")
          ? cotizacion.usuario
          : "") ||
        usuarioRegistrado?.correo ||
        usuarioRegistrado?.email ||
        "";

      const telefono =
        cotizacion.telefono ||
        cotizacion.telefonoCliente ||
        cotizacion.phone ||
        usuarioRegistrado?.telefono ||
        usuarioRegistrado?.phone ||
        "";

      const nombre =
        cotizacion.nombreCliente ||
        cotizacion.clienteNombre ||
        cotizacion.nombreUsuario ||
        usuarioRegistrado?.nombre ||
        usuarioRegistrado?.displayName ||
        usuarioRegistrado?.nombreCompleto ||
        (correo ? correo.split("@")[0] : "Cliente");

      const clave = uid || correo || telefono || cotizacion.id;

      if (!grupos[clave]) {
        grupos[clave] = {
          clave,
          uid,
          nombre,
          correo,
          telefono,
          cotizaciones: [],
        };
      }

      grupos[clave].cotizaciones.push(cotizacion);
    });

    const lista = Object.values(grupos).map((cliente) => {
      const nuevas = cliente.cotizaciones.filter(
        (c) => c.vistoPorAdmin === false
      ).length;

      const ultimaActividad = Math.max(
        0,
        ...cliente.cotizaciones.map(
          (c) =>
            c.fechaActualizacion?.toMillis?.() ||
            c.fecha?.toMillis?.() ||
            0
        )
      );

      const enEjecucion = cliente.cotizaciones.filter((c) =>
        [
          "confirmada_admin",
          "anticipo_pendiente",
          "anticipo_pagado",
          "anticipo_recibido",
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
        enEjecucion,
      };
    });

    lista.sort((a, b) => {
      if (a.nuevas > 0 && b.nuevas === 0) return -1;
      if (b.nuevas > 0 && a.nuevas === 0) return 1;
      return b.ultimaActividad - a.ultimaActividad;
    });

    return lista;
  }, [cotizacionesActivas, usuarios]);

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return clientes;

    return clientes.filter((cliente) => {
      const contenido = [
        cliente.nombre,
        cliente.correo,
        cliente.telefono,
        ...cliente.cotizaciones.map(
          (c) => `${c.nombre || ""} ${c.descripcion || ""}`
        ),
      ]
        .join(" ")
        .toLowerCase();

      return contenido.includes(texto);
    });
  }, [clientes, busqueda]);

  const cantidadNovedadesAdmin = cotizacionesActivas.filter(
    (c) => c.vistoPorAdmin === false
  ).length;

  const montoAnticipo = useMemo(() => {
    const total = Number(presupuestoAdmin);
    const porcentaje = Number(porcentajeAnticipo);

    if (!total || Number.isNaN(total)) return 0;

    return (total * porcentaje) / 100;
  }, [presupuestoAdmin, porcentajeAnticipo]);

  const saldoPendiente = useMemo(() => {
    const total = Number(presupuestoAdmin);
    if (!total || Number.isNaN(total)) return 0;
    return total - montoAnticipo;
  }, [presupuestoAdmin, montoAnticipo]);

  const obtenerPrecio = (cotizacion) => {
    return (
      cotizacion?.propuestaActual?.precioTotal ??
      cotizacion?.precioTotal ??
      cotizacion?.presupuestoAdmin ??
      cotizacion?.total ??
      cotizacion?.precio ??
      null
    );
  };

  const tienePropuesta = (cotizacion) => {
    return (
      obtenerPrecio(cotizacion) !== null ||
      ESTADOS_CON_PROPUESTA.includes(cotizacion?.estado)
    );
  };

  const obtenerImagenes = (cotizacion) => {
    return [
      ...new Set([
        ...(cotizacion?.imagenes || []),
        ...(cotizacion?.imagenesProyecto || []),
        ...(cotizacion?.imagenesCliente || []),
      ]),
    ].filter(Boolean);
  };

  const formatoDinero = (valor) => {
    if (valor === null || valor === undefined || valor === "") {
      return "—";
    }

    return Number(valor).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    });
  };

  const formatearFecha = (fecha) => {
    try {
      const date = fecha?.toDate?.() || new Date(fecha);
      if (!date || Number.isNaN(date.getTime())) return "—";

      return date.toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "—";
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente";
      case "revision":
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
        return "Cambios solicitados";
      case "rechazada_cliente":
        return "Rechazada por cliente";
      case "cancelada_cliente":
        return "Cancelada por cliente";
      case "confirmada_admin":
        return "Trabajo confirmado";
      case "anticipo_pendiente":
        return "Anticipo pendiente";
      case "anticipo_pagado":
      case "anticipo_recibido":
        return "Anticipo recibido";
      case "proceso":
      case "en_proceso":
        return "En proceso";
      case "instalacion":
      case "instalacion_programada":
        return "Instalación";
      default:
        return estado || "Pendiente";
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "revision":
      case "en_revision":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "cotizada":
      case "propuesta_enviada":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "propuesta_modificada":
      case "cambios_solicitados":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "aceptada_cliente":
      case "confirmada_admin":
      case "anticipo_pagado":
      case "anticipo_recibido":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "rechazada_cliente":
      case "cancelada_cliente":
      case "rechazada":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "proceso":
      case "en_proceso":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "instalacion":
      case "instalacion_programada":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  /* ======================================================
     NOTIFICACIONES ADMIN
  ====================================================== */

  const marcarCotizacionesComoVistas = async (lista) => {
    const pendientes = lista.filter(
      (cotizacion) => cotizacion.vistoPorAdmin === false
    );

    if (!pendientes.length) return;

    const batch = writeBatch(db);

    pendientes.forEach((cotizacion) => {
      batch.update(doc(db, "cotizaciones", cotizacion.id), {
        vistoPorAdmin: true,
        fechaVistaAdmin: serverTimestamp(),
      });
    });

    await batch.commit();
  };

  const toggleCliente = async (cliente) => {
    const yaAbierto = clienteAbierto === cliente.clave;

    setClienteAbierto(yaAbierto ? null : cliente.clave);

    if (!yaAbierto) {
      try {
        await marcarCotizacionesComoVistas(cliente.cotizaciones);
      } catch (err) {
        console.error(
          "Error marcando novedades del cliente como vistas:",
          err
        );
      }
    }
  };

  const abrirCotizacion = async (cotizacion) => {
    setCotizacionActiva(cotizacion);

    setPresupuestoAdmin(
      cotizacion.propuestaActual?.precioTotal ??
        cotizacion.precioTotal ??
        cotizacion.presupuestoAdmin ??
        ""
    );

    setPorcentajeAnticipo(
      cotizacion.propuestaActual?.porcentajeAnticipo ??
        cotizacion.porcentajeAnticipo ??
        "50"
    );

    setTiempoEstimado(
      cotizacion.propuestaActual?.tiempoEstimado ??
        cotizacion.tiempoEstimado ??
        ""
    );

    setGarantia(
      cotizacion.propuestaActual?.garantia ??
        cotizacion.garantia ??
        ""
    );

    setObservacionesAdmin(
      cotizacion.propuestaActual?.observaciones ??
        cotizacion.observacionesAdmin ??
        cotizacion.observaciones ??
        ""
    );

    setError("");
    setModalCotizacion(true);

    if (cotizacion.vistoPorAdmin === false) {
      try {
        await updateDoc(doc(db, "cotizaciones", cotizacion.id), {
          vistoPorAdmin: true,
          fechaVistaAdmin: serverTimestamp(),
        });
      } catch (err) {
        console.error("Error marcando cotización como vista:", err);
      }
    }
  };

  const cerrarCotizacion = () => {
    setModalCotizacion(false);
    setCotizacionActiva(null);
    setError("");
  };

  /* ======================================================
     PROPUESTA
  ====================================================== */

  const enviarPropuesta = async () => {
    if (!cotizacionActiva) return;

    setError("");

    const total = Number(presupuestoAdmin);
    const porcentaje = Number(porcentajeAnticipo);

    if (!total || total <= 0) {
      setError("Ingresa un precio válido.");
      return;
    }

    if (
      porcentajeAnticipo === "" ||
      porcentaje < 0 ||
      porcentaje > 100
    ) {
      setError("El anticipo debe estar entre 0 y 100%.");
      return;
    }

    try {
      setProcesando(true);

      const yaTeniaPropuesta = tienePropuesta(cotizacionActiva);

      const versionActual =
        Number(cotizacionActiva.versionPropuesta) ||
        Number(cotizacionActiva.propuestaActual?.version) ||
        (yaTeniaPropuesta ? 1 : 0);

      const nuevaVersion = yaTeniaPropuesta
        ? versionActual + 1
        : 1;

      const propuestaActual = {
        version: nuevaVersion,
        precioTotal: total,
        porcentajeAnticipo: porcentaje,
        anticipo: Number(montoAnticipo),
        saldo: Number(saldoPendiente),
        tiempoEstimado: tiempoEstimado.trim(),
        garantia: garantia.trim(),
        observaciones: observacionesAdmin.trim(),
        fecha: Timestamp.now(),
      };

      const datos = {
        estado: yaTeniaPropuesta
          ? "propuesta_modificada"
          : "propuesta_enviada",

        propuestaActual,

        precioTotal: total,
        presupuestoAdmin: total,

        porcentajeAnticipo: porcentaje,
        anticipo: Number(montoAnticipo),
        montoAnticipo: Number(montoAnticipo),

        saldo: Number(saldoPendiente),
        saldoPendiente: Number(saldoPendiente),

        tiempoEstimado: tiempoEstimado.trim(),
        garantia: garantia.trim(),

        observaciones: observacionesAdmin.trim(),
        observacionesAdmin: observacionesAdmin.trim(),

        versionPropuesta: nuevaVersion,

        respuestaCliente: "sin_respuesta",
        mensajeCliente: "",

        vistoPorAdmin: true,
        vistoPorCliente: false,

        mensajeClienteSistema: yaTeniaPropuesta
          ? "Wealth modificó tu propuesta."
          : "Wealth envió una nueva propuesta.",

        fechaPropuesta: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
      };

      const historialAnterior = Array.isArray(
        cotizacionActiva.historialPropuestas
      )
        ? cotizacionActiva.historialPropuestas
        : [];

      if (cotizacionActiva.propuestaActual && yaTeniaPropuesta) {
        datos.historialPropuestas = [
          ...historialAnterior,
          cotizacionActiva.propuestaActual,
        ];
      }

      await updateDoc(
        doc(db, "cotizaciones", cotizacionActiva.id),
        datos
      );

      cerrarCotizacion();
    } catch (err) {
      console.error(err);
      setError("No se pudo enviar la propuesta.");
    } finally {
      setProcesando(false);
    }
  };

  /* ======================================================
     CAMBIOS DE ESTADO
  ====================================================== */

  const actualizarEstado = async (
    cotizacion,
    estado,
    mensajeClienteSistema
  ) => {
    try {
      await updateDoc(doc(db, "cotizaciones", cotizacion.id), {
        estado,
        vistoPorAdmin: true,
        vistoPorCliente: false,
        mensajeClienteSistema,
        fechaActualizacion: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error actualizando estado:", err);
      window.alert("No se pudo actualizar el estado.");
    }
  };

  const marcarEnRevision = (cotizacion) =>
    actualizarEstado(
      cotizacion,
      "en_revision",
      "Wealth está revisando tu solicitud."
    );

  const confirmarTrabajo = (cotizacion) =>
    actualizarEstado(
      cotizacion,
      "confirmada_admin",
      "Wealth confirmó el trabajo."
    );

  const marcarAnticipoPendiente = (cotizacion) =>
    actualizarEstado(
      cotizacion,
      "anticipo_pendiente",
      "El anticipo está pendiente."
    );

  const marcarAnticipoRecibido = (cotizacion) =>
    actualizarEstado(
      cotizacion,
      "anticipo_recibido",
      "Wealth confirmó la recepción del anticipo."
    );

  const iniciarTrabajo = (cotizacion) =>
    actualizarEstado(
      cotizacion,
      "en_proceso",
      "Tu trabajo ya está en proceso."
    );

  const programarInstalacion = (cotizacion) =>
    actualizarEstado(
      cotizacion,
      "instalacion_programada",
      "La instalación fue programada."
    );

  const rechazarCotizacion = async (cotizacion) => {
    const ok = window.confirm(
      `¿Rechazar la solicitud "${cotizacion.nombre || "Sin nombre"}"?`
    );

    if (!ok) return;

    await actualizarEstado(
      cotizacion,
      "rechazada",
      "Wealth rechazó esta solicitud."
    );
  };

  const resetEstado = async (cotizacion) => {
    const ok = window.confirm(
      "¿Reiniciar esta cotización? Se limpiará la propuesta actual."
    );

    if (!ok) return;

    try {
      await updateDoc(doc(db, "cotizaciones", cotizacion.id), {
        estado: "pendiente",

        propuestaActual: null,
        historialPropuestas: [],

        precioTotal: null,
        presupuestoAdmin: null,

        porcentajeAnticipo: null,
        anticipo: null,
        montoAnticipo: null,

        saldo: null,
        saldoPendiente: null,

        tiempoEstimado: "",
        garantia: "",
        observaciones: "",
        observacionesAdmin: "",

        respuestaCliente: "sin_respuesta",
        mensajeCliente: "",

        vistoPorAdmin: true,
        vistoPorCliente: false,

        versionPropuesta: null,
        mensajeClienteSistema:
          "La cotización fue reiniciada por Wealth.",

        fechaActualizacion: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      window.alert("No se pudo reiniciar.");
    }
  };

  const eliminarCotizacion = async (cotizacion) => {
    const ok = window.confirm(
      `¿Eliminar definitivamente "${cotizacion.nombre || "esta cotización"}"?`
    );

    if (!ok) return;

    try {
      await deleteDoc(doc(db, "cotizaciones", cotizacion.id));
    } catch (err) {
      console.error(err);
      window.alert("No se pudo eliminar.");
    }
  };

  /* ======================================================
     GALERÍA
  ====================================================== */

  const abrirGaleria = (cotizacion) => {
    const imagenes = obtenerImagenes(cotizacion);

    if (!imagenes.length) return;

    setImagenesActivas(imagenes);
    setIndiceImagen(0);
    setGaleriaOpen(true);
  };

  /* ======================================================
     FINALIZAR + CLOUDINARY
  ====================================================== */

  const abrirFinalizacion = (cotizacion) => {
    setCotizacionFinalizar(cotizacion);
    setFotosFinales([]);
    setPreviewsFinales([]);
    setErrorFinalizar("");
    setModalFinalizar(true);
  };

  const seleccionarFotosFinales = (e) => {
    const archivos = Array.from(e.target.files || []);
    e.target.value = "";

    const validos = archivos.filter(
      (archivo) =>
        archivo.type?.startsWith("image/") &&
        archivo.size <= 5 * 1024 * 1024
    );

    if (validos.length !== archivos.length) {
      setErrorFinalizar(
        "Solo se aceptan imágenes de máximo 5 MB."
      );
    } else {
      setErrorFinalizar("");
    }

    const disponibles = Math.max(0, 6 - fotosFinales.length);
    const nuevos = validos.slice(0, disponibles);

    if (validos.length > disponibles) {
      setErrorFinalizar("Máximo 6 fotografías.");
    }

    setFotosFinales((actuales) => [...actuales, ...nuevos]);

    setPreviewsFinales((actuales) => [
      ...actuales,
      ...nuevos.map((archivo) => URL.createObjectURL(archivo)),
    ]);
  };

  const eliminarFotoFinal = (indice) => {
    setPreviewsFinales((actuales) => {
      const url = actuales[indice];

      if (url) {
        URL.revokeObjectURL(url);
      }

      return actuales.filter((_, i) => i !== indice);
    });

    setFotosFinales((actuales) =>
      actuales.filter((_, i) => i !== indice)
    );
  };

  const cerrarFinalizacion = () => {
    previewsFinales.forEach((url) => URL.revokeObjectURL(url));

    setPreviewsFinales([]);
    setFotosFinales([]);
    setCotizacionFinalizar(null);
    setErrorFinalizar("");
    setModalFinalizar(false);
  };

  const subirFotoCloudinary = async (archivo) => {
    const formData = new FormData();

    formData.append("file", archivo);
    formData.append("upload_preset", "wealth");

    const respuesta = await fetch(
      "https://api.cloudinary.com/v1_1/dxj4iczvk/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!respuesta.ok) {
      const detalle = await respuesta.json().catch(() => null);

      throw new Error(
        detalle?.error?.message ||
          "No se pudo subir una fotografía."
      );
    }

    const data = await respuesta.json();

    if (!data.secure_url) {
      throw new Error("Cloudinary no devolvió la URL.");
    }

    return data.secure_url;
  };

  const terminarTrabajo = async () => {
    if (!cotizacionFinalizar) return;

    if (fotosFinales.length === 0) {
      setErrorFinalizar(
        "Agrega por lo menos una fotografía del trabajo terminado."
      );
      return;
    }

    const ok = window.confirm(
      `¿Finalizar "${cotizacionFinalizar.nombre || "este trabajo"}"?`
    );

    if (!ok) return;

    try {
      setSubiendoFinales(true);
      setErrorFinalizar("");

      const fotosTrabajoFinal = await Promise.all(
        fotosFinales.map(subirFotoCloudinary)
      );

      const cotizacion = cotizacionFinalizar;
      const batch = writeBatch(db);

      const proyectoRef = doc(
        db,
        "proyectosClientes",
        cotizacion.id
      );

      batch.set(
        proyectoRef,
        {
          uid:
            cotizacion.uid ||
            cotizacion.userUid ||
            cotizacion.usuarioId ||
            null,

          usuario:
            cotizacion.usuario ||
            cotizacion.correo ||
            cotizacion.email ||
            "",

          cotizacionId: cotizacion.id,

          nombre: cotizacion.nombre || "Proyecto Wealth",
          descripcion: cotizacion.descripcion || "",
          tipo: cotizacion.tipo || "",

          ubicacion: cotizacion.ubicacion || "",
          latitud: cotizacion.latitud ?? null,
          longitud: cotizacion.longitud ?? null,

          medidas: cotizacion.medidas || "",
          fechaDeseada: cotizacion.fechaDeseada || null,

          telefono:
            cotizacion.telefono ||
            cotizacion.telefonoCliente ||
            "",

          imagenes: cotizacion.imagenes || [],
          imagenesProyecto: cotizacion.imagenesProyecto || [],
          imagenesCliente: cotizacion.imagenesCliente || [],

          imagenesTrabajoFinal: fotosTrabajoFinal,

          precioFinal: obtenerPrecio(cotizacion),

          propuestaActual: cotizacion.propuestaActual || null,

          estado: "finalizada",
          fechaFinalizacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
        },
        { merge: true }
      );

      batch.update(doc(db, "cotizaciones", cotizacion.id), {
        estado: "finalizada",

        imagenesTrabajoFinal: fotosTrabajoFinal,

        vistoPorAdmin: true,
        vistoPorCliente: false,

        mensajeClienteSistema:
          "Tu trabajo fue finalizado. Ya puedes verlo en Mis Proyectos.",

        fechaFinalizacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
      });

      await batch.commit();

      cerrarFinalizacion();
    } catch (err) {
      console.error(err);
      setErrorFinalizar(
        err?.message || "No se pudo finalizar el trabajo."
      );
    } finally {
      setSubiendoFinales(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 mt-4">
            Cargando cotizaciones...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-5 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <p className="text-yellow-500 uppercase tracking-[0.25em] text-xs font-bold">
              Administración
            </p>

            <h1 className="text-3xl md:text-5xl font-black mt-2">
              Cotizaciones
            </h1>

            <p className="text-zinc-500 mt-2">
              Solicitudes, propuestas y trabajos activos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-3 rounded-2xl border flex items-center gap-3 ${
                cantidadNovedadesAdmin > 0
                  ? "bg-red-500/10 border-red-500/40 text-red-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}
            >
              <FaBell />

              <span className="font-bold">
                {cantidadNovedadesAdmin}
              </span>

              <span className="text-sm">
                {cantidadNovedadesAdmin === 1
                  ? "novedad"
                  : "novedades"}
              </span>
            </div>

            <div className="px-4 py-3 rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-300">
              {cotizacionesActivas.length} activas
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente, correo, teléfono o proyecto..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-yellow-500/60"
          />
        </div>

        {clientesFiltrados.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-950 rounded-[28px] p-14 text-center">
            <FaBriefcase className="text-4xl text-zinc-700 mx-auto" />

            <h2 className="text-2xl font-bold mt-5">
              No hay cotizaciones activas
            </h2>

            <p className="text-zinc-600 mt-2">
              Si el panel marca novedades y aquí no aparece nada,
              revisa que estés entrando por /admin/cotizaciones.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {clientesFiltrados.map((cliente) => {
              const abierto = clienteAbierto === cliente.clave;

              return (
                <div
                  key={cliente.clave}
                  className={`rounded-[26px] overflow-hidden border bg-zinc-950 ${
                    cliente.nuevas > 0
                      ? "border-yellow-500/70"
                      : "border-zinc-800"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleCliente(cliente)}
                    className="w-full p-5 md:p-6 text-left hover:bg-zinc-900 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="flex items-start gap-4">
                        <div className="relative w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
                          <FaUser className="text-yellow-500 text-xl" />

                          {cliente.nuevas > 0 && (
                            <span className="absolute -top-2 -right-2 min-w-[23px] h-[23px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {cliente.nuevas}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold">
                              {cliente.nombre}
                            </h2>

                            {cliente.nuevas > 0 && (
                              <span className="px-2 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold">
                                NUEVO
                              </span>
                            )}
                          </div>

                          <p className="text-zinc-500 text-sm mt-1">
                            {cliente.correo || "Sin correo"}
                          </p>

                          {cliente.telefono && (
                            <p className="text-zinc-600 text-sm mt-1 flex items-center gap-2">
                              <FaPhone />
                              {cliente.telefono}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-4 py-2 rounded-xl bg-black border border-zinc-800 text-sm">
                          {cliente.cotizaciones.length}{" "}
                          {cliente.cotizaciones.length === 1
                            ? "cotización"
                            : "cotizaciones"}
                        </span>

                        {cliente.enEjecucion > 0 && (
                          <span className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                            {cliente.enEjecucion} en ejecución
                          </span>
                        )}

                        <div className="w-10 h-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center">
                          {abierto ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {abierto && (
                    <div className="border-t border-zinc-800 p-5 md:p-6 space-y-5">
                      {cliente.cotizaciones.map((cotizacion) => {
                        const precio = obtenerPrecio(cotizacion);
                        const imagenes = obtenerImagenes(cotizacion);

                        return (
                          <div
                            key={cotizacion.id}
                            className={`rounded-2xl border p-5 ${
                              cotizacion.vistoPorAdmin === false
                                ? "border-yellow-500/50 bg-yellow-500/[0.03]"
                                : "border-zinc-800 bg-black"
                            }`}
                          >
                            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-lg font-bold">
                                    {cotizacion.nombre ||
                                      "Solicitud sin nombre"}
                                  </h3>

                                  <span
                                    className={`px-3 py-1 rounded-full border text-xs ${getEstadoColor(
                                      cotizacion.estado
                                    )}`}
                                  >
                                    {getEstadoTexto(cotizacion.estado)}
                                  </span>

                                  {cotizacion.vistoPorAdmin === false && (
                                    <span className="px-2 py-1 rounded-full bg-red-500 text-white text-[10px] font-black">
                                      NUEVO
                                    </span>
                                  )}
                                </div>

                                <p className="text-zinc-500 mt-2">
                                  {cotizacion.descripcion ||
                                    "Sin descripción"}
                                </p>

                                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-zinc-500">
                                  {cotizacion.ubicacion && (
                                    <span className="flex items-center gap-2">
                                      <FaMapMarkerAlt />
                                      {cotizacion.ubicacion}
                                    </span>
                                  )}

                                  {precio !== null && (
                                    <span className="flex items-center gap-2 text-green-400">
                                      <FaDollarSign />
                                      {formatoDinero(precio)}
                                    </span>
                                  )}

                                  <span>
                                    {formatearFecha(
                                      cotizacion.fechaActualizacion ||
                                        cotizacion.fecha
                                    )}
                                  </span>
                                </div>

                                {cotizacion.mensajeCliente && (
                                  <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                                    <p className="text-xs uppercase tracking-wide text-orange-400 font-bold">
                                      Mensaje del cliente
                                    </p>

                                    <p className="mt-1 text-zinc-200">
                                      {cotizacion.mensajeCliente}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 xl:max-w-[520px] xl:justify-end">
                                <button
                                  onClick={() =>
                                    abrirCotizacion(cotizacion)
                                  }
                                  className="px-4 py-2.5 rounded-xl bg-yellow-500 text-black font-bold flex items-center gap-2"
                                >
                                  {tienePropuesta(cotizacion) ? (
                                    <FaEdit />
                                  ) : (
                                    <FaPaperPlane />
                                  )}
                                  {tienePropuesta(cotizacion)
                                    ? "Ver / editar propuesta"
                                    : "Cotizar"}
                                </button>

                                {imagenes.length > 0 && (
                                  <button
                                    onClick={() =>
                                      abrirGaleria(cotizacion)
                                    }
                                    className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center gap-2"
                                  >
                                    <FaImages />
                                    Fotos ({imagenes.length})
                                  </button>
                                )}

                                {["pendiente", "revision"].includes(
                                  cotizacion.estado
                                ) && (
                                  <button
                                    onClick={() =>
                                      marcarEnRevision(cotizacion)
                                    }
                                    className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center gap-2"
                                  >
                                    <FaEye />
                                    Revisar
                                  </button>
                                )}

                                {cotizacion.estado ===
                                  "aceptada_cliente" && (
                                  <button
                                    onClick={() =>
                                      confirmarTrabajo(cotizacion)
                                    }
                                    className="px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-2"
                                  >
                                    <FaCheck />
                                    Confirmar
                                  </button>
                                )}

                                {cotizacion.estado ===
                                  "confirmada_admin" && (
                                  <button
                                    onClick={() =>
                                      marcarAnticipoPendiente(
                                        cotizacion
                                      )
                                    }
                                    className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-2"
                                  >
                                    <FaDollarSign />
                                    Pedir anticipo
                                  </button>
                                )}

                                {cotizacion.estado ===
                                  "anticipo_pendiente" && (
                                  <button
                                    onClick={() =>
                                      marcarAnticipoRecibido(
                                        cotizacion
                                      )
                                    }
                                    className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2"
                                  >
                                    <FaCheckCircle />
                                    Anticipo recibido
                                  </button>
                                )}

                                {[
                                  "confirmada_admin",
                                  "anticipo_recibido",
                                  "anticipo_pagado",
                                ].includes(cotizacion.estado) && (
                                  <button
                                    onClick={() =>
                                      iniciarTrabajo(cotizacion)
                                    }
                                    className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center gap-2"
                                  >
                                    <FaPlay />
                                    Iniciar trabajo
                                  </button>
                                )}

                                {[
                                  "proceso",
                                  "en_proceso",
                                ].includes(cotizacion.estado) && (
                                  <button
                                    onClick={() =>
                                      programarInstalacion(
                                        cotizacion
                                      )
                                    }
                                    className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center gap-2"
                                  >
                                    <FaTools />
                                    Instalación
                                  </button>
                                )}

                                {[
                                  "proceso",
                                  "en_proceso",
                                  "instalacion",
                                  "instalacion_programada",
                                ].includes(cotizacion.estado) && (
                                  <button
                                    onClick={() =>
                                      abrirFinalizacion(
                                        cotizacion
                                      )
                                    }
                                    className="px-4 py-2.5 rounded-xl bg-green-600 text-white font-bold flex items-center gap-2"
                                  >
                                    <FaFlagCheckered />
                                    Finalizar
                                  </button>
                                )}

                                <button
                                  onClick={() => resetEstado(cotizacion)}
                                  className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400"
                                  title="Reiniciar"
                                >
                                  <FaUndo />
                                </button>

                                <button
                                  onClick={() =>
                                    rechazarCotizacion(cotizacion)
                                  }
                                  className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
                                  title="Rechazar"
                                >
                                  <FaTimes />
                                </button>

                                <button
                                  onClick={() =>
                                    eliminarCotizacion(cotizacion)
                                  }
                                  className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-500"
                                  title="Eliminar"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =================================================
          MODAL PROPUESTA
      ================================================= */}

      {modalCotizacion && cotizacionActiva && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto my-8 bg-zinc-950 border border-zinc-800 rounded-[28px] overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-start justify-between gap-4">
              <div>
                <p className="text-yellow-500 text-xs uppercase tracking-[0.2em] font-bold">
                  Cotización
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  {cotizacionActiva.nombre || "Proyecto"}
                </h2>
              </div>

              <button
                onClick={cerrarCotizacion}
                className="w-10 h-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {cotizacionActiva.mensajeCliente && (
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                  <p className="text-orange-400 text-sm font-bold">
                    El cliente solicita:
                  </p>

                  <p className="text-white mt-1">
                    {cotizacionActiva.mensajeCliente}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Campo
                  label="Precio total"
                  icon={<FaDollarSign />}
                >
                  <input
                    type="number"
                    value={presupuestoAdmin}
                    onChange={(e) =>
                      setPresupuestoAdmin(e.target.value)
                    }
                    className="inputAdmin"
                    placeholder="Ej. 25000"
                  />
                </Campo>

                <Campo
                  label="% de anticipo"
                  icon={<FaDollarSign />}
                >
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={porcentajeAnticipo}
                    onChange={(e) =>
                      setPorcentajeAnticipo(e.target.value)
                    }
                    className="inputAdmin"
                  />
                </Campo>

                <Campo
                  label="Tiempo estimado"
                  icon={<FaClock />}
                >
                  <input
                    value={tiempoEstimado}
                    onChange={(e) =>
                      setTiempoEstimado(e.target.value)
                    }
                    className="inputAdmin"
                    placeholder="Ej. 15 días"
                  />
                </Campo>

                <Campo
                  label="Garantía"
                  icon={<FaShieldAlt />}
                >
                  <input
                    value={garantia}
                    onChange={(e) => setGarantia(e.target.value)}
                    className="inputAdmin"
                    placeholder="Ej. 12 meses"
                  />
                </Campo>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Resumen
                  titulo="Anticipo"
                  valor={formatoDinero(montoAnticipo)}
                />

                <Resumen
                  titulo="Saldo"
                  valor={formatoDinero(saldoPendiente)}
                />
              </div>

              <Campo
                label="Observaciones"
                icon={<FaEdit />}
              >
                <textarea
                  rows={5}
                  value={observacionesAdmin}
                  onChange={(e) =>
                    setObservacionesAdmin(e.target.value)
                  }
                  className="inputAdmin resize-none"
                  placeholder="Condiciones, materiales, alcances..."
                />
              </Campo>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={enviarPropuesta}
                  disabled={procesando}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-black rounded-xl px-5 py-3.5 flex items-center justify-center gap-2"
                >
                  {procesando ? (
                    <FaSyncAlt className="animate-spin" />
                  ) : (
                    <FaPaperPlane />
                  )}

                  {tienePropuesta(cotizacionActiva)
                    ? "Guardar y enviar modificación"
                    : "Enviar propuesta"}
                </button>

                <button
                  onClick={cerrarCotizacion}
                  className="px-5 py-3.5 rounded-xl bg-black border border-zinc-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          GALERÍA
      ================================================= */}

      {galeriaOpen && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setGaleriaOpen(false)}
            className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center"
          >
            <FaTimes />
          </button>

          <div className="max-w-5xl w-full">
            <img
              src={imagenesActivas[indiceImagen]}
              alt="Proyecto"
              className="w-full max-h-[75vh] object-contain rounded-2xl"
            />

            <div className="flex items-center justify-center gap-3 mt-5">
              {imagenesActivas.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndiceImagen(i)}
                  className={`w-3 h-3 rounded-full ${
                    i === indiceImagen
                      ? "bg-yellow-500"
                      : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          FINALIZAR
      ================================================= */}

      {modalFinalizar && cotizacionFinalizar && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto my-8 bg-zinc-950 border border-zinc-800 rounded-[28px] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-400 text-xs uppercase tracking-[0.2em] font-bold">
                  Trabajo terminado
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  {cotizacionFinalizar.nombre}
                </h2>
              </div>

              <button
                onClick={cerrarFinalizacion}
                className="w-10 h-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>

            <p className="text-zinc-500 mt-4">
              Sube fotografías reales del trabajo terminado. Se
              guardarán en el expediente del cliente.
            </p>

            <label className="mt-6 block border-2 border-dashed border-zinc-700 hover:border-yellow-500/60 rounded-2xl p-7 text-center cursor-pointer">
              <FaImages className="text-3xl text-yellow-500 mx-auto" />

              <p className="font-bold mt-3">
                Agregar fotografías
              </p>

              <p className="text-zinc-600 text-sm mt-1">
                Máximo 6 imágenes, 5 MB cada una
              </p>

              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={seleccionarFotosFinales}
              />
            </label>

            {previewsFinales.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                {previewsFinales.map((url, i) => (
                  <div
                    key={url}
                    className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800"
                  >
                    <img
                      src={url}
                      alt={`Final ${i + 1}`}
                      className="w-full h-full object-cover"
                    />

                    <button
                      onClick={() => eliminarFotoFinal(i)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/80 text-red-400 flex items-center justify-center"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errorFinalizar && (
              <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                {errorFinalizar}
              </div>
            )}

            <button
              onClick={terminarTrabajo}
              disabled={subiendoFinales}
              className="w-full mt-6 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black rounded-xl px-5 py-4 flex items-center justify-center gap-2"
            >
              {subiendoFinales ? (
                <FaSyncAlt className="animate-spin" />
              ) : (
                <FaFlagCheckered />
              )}

              {subiendoFinales
                ? "Subiendo y finalizando..."
                : "Finalizar trabajo"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .inputAdmin {
          width: 100%;
          background: #09090b;
          border: 1px solid #3f3f46;
          border-radius: 12px;
          padding: 12px 14px;
          color: white;
          outline: none;
        }

        .inputAdmin:focus {
          border-color: rgba(234, 179, 8, 0.7);
        }
      `}</style>
    </div>
  );
}

function Campo({ label, icon, children }) {
  return (
    <label className="block">
      <span className="text-sm text-zinc-400 font-medium flex items-center gap-2 mb-2">
        {icon}
        {label}
      </span>

      {children}
    </label>
  );
}

function Resumen({ titulo, valor }) {
  return (
    <div className="rounded-2xl bg-black border border-zinc-800 p-4">
      <p className="text-zinc-600 text-xs uppercase tracking-wide">
        {titulo}
      </p>

      <p className="text-xl font-black mt-1">
        {valor}
      </p>
    </div>
  );
}

export default CotizacionesAdmin;