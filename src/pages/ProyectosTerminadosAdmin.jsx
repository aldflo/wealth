import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase.config";

import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import {
  FaArrowLeft,
  FaBuilding,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaEye,
  FaFileInvoiceDollar,
  FaHistory,
  FaImages,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhone,
  FaRulerCombined,
  FaSave,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaTools,
  FaUser,
  FaWhatsapp,
  FaCheck,
  FaCheckSquare,
  FaSquare,
  FaTrashAlt,
} from "react-icons/fa";

function ProyectosTerminadosAdmin() {
  const navigate = useNavigate();

  const [proyectos, setProyectos] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const [busqueda, setBusqueda] = useState("");

  // ======================================================
  // SELECCIÓN MÚLTIPLE
  // ======================================================

  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);
  const [eliminando, setEliminando] = useState(false);
  const [mensajeGeneral, setMensajeGeneral] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  const [proyectoActivo, setProyectoActivo] = useState(null);
  const [modalProyecto, setModalProyecto] = useState(false);

  const [galeriaOpen, setGaleriaOpen] = useState(false);
  const [imagenesGaleria, setImagenesGaleria] = useState([]);
  const [imagenActual, setImagenActual] = useState(0);

  const [notaPostventa, setNotaPostventa] = useState("");
  const [tipoSeguimiento, setTipoSeguimiento] = useState("Seguimiento");
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [mensajeNota, setMensajeNota] = useState("");
  const [errorNota, setErrorNota] = useState("");

  // ======================================================
  // PROYECTOS TERMINADOS
  // ======================================================

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "proyectosClientes"),
      (snapshot) => {
        const data = snapshot.docs
          .map((documento) => ({
            id: documento.id,
            ...documento.data(),
          }))
          .sort((a, b) => {
            const fa =
              a.fechaFinalizacion?.toMillis?.() ||
              a.fechaCreacion?.toMillis?.() ||
              0;

            const fb =
              b.fechaFinalizacion?.toMillis?.() ||
              b.fechaCreacion?.toMillis?.() ||
              0;

            return fb - fa;
          });

        setProyectos(data);
        setCargando(false);
        setErrorCarga("");

        setProyectoActivo((actual) => {
          if (!actual) return null;

          const actualizado = data.find(
            (proyecto) => proyecto.id === actual.id
          );

          return actualizado || actual;
        });
      },
      (error) => {
        console.error("Error cargando proyectos terminados:", error);
        setErrorCarga(
          "No se pudieron cargar los trabajos terminados. Revisa la consola si el problema continúa."
        );
        setCargando(false);
      }
    );

    return () => unsub();
  }, []);

  // ======================================================
  // COTIZACIONES ORIGINALES
  // Se conservan para completar datos de trabajos antiguos
  // ======================================================

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "cotizaciones"),
      (snapshot) => {
        const data = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        setCotizaciones(data);
      },
      (error) => {
        console.error("Error cargando cotizaciones históricas:", error);
      }
    );

    return () => unsub();
  }, []);

  // ======================================================
  // EXPEDIENTES COMPLETOS
  // ======================================================

  const expedientes = useMemo(() => {
    return proyectos.map((proyecto) => {
      const cotizacion = cotizaciones.find(
        (c) =>
          c.id === proyecto.cotizacionId ||
          c.id === proyecto.id
      );

      return {
        ...(cotizacion || {}),
        ...proyecto,

        id: proyecto.id,
        cotizacionId:
          proyecto.cotizacionId ||
          cotizacion?.id ||
          proyecto.id,

        nombreCliente:
          proyecto.nombreCliente ||
          proyecto.clienteNombre ||
          cotizacion?.nombreCliente ||
          cotizacion?.clienteNombre ||
          "Cliente",

        usuario:
          proyecto.usuario ||
          cotizacion?.usuario ||
          "",

        telefono:
          proyecto.telefono ||
          cotizacion?.telefono ||
          "",

        metodoContacto:
          proyecto.metodoContacto ||
          cotizacion?.metodoContacto ||
          "",

        imagenesTrabajoFinal:
          Array.isArray(proyecto.imagenesTrabajoFinal)
            ? proyecto.imagenesTrabajoFinal
            : Array.isArray(cotizacion?.imagenesTrabajoFinal)
            ? cotizacion.imagenesTrabajoFinal
            : [],

        imagenesProyecto:
          Array.isArray(proyecto.imagenesProyecto)
            ? proyecto.imagenesProyecto
            : Array.isArray(cotizacion?.imagenesProyecto)
            ? cotizacion.imagenesProyecto
            : [],

        imagenesCliente:
          Array.isArray(proyecto.imagenesCliente)
            ? proyecto.imagenesCliente
            : Array.isArray(cotizacion?.imagenesCliente)
            ? cotizacion.imagenesCliente
            : [],

        imagenes:
          Array.isArray(proyecto.imagenes)
            ? proyecto.imagenes
            : Array.isArray(cotizacion?.imagenes)
            ? cotizacion.imagenes
            : [],

        historialPropuestas:
          Array.isArray(proyecto.historialPropuestas)
            ? proyecto.historialPropuestas
            : Array.isArray(cotizacion?.historialPropuestas)
            ? cotizacion.historialPropuestas
            : [],

        seguimientosPostventa:
          Array.isArray(proyecto.seguimientosPostventa)
            ? proyecto.seguimientosPostventa
            : [],
      };
    });
  }, [proyectos, cotizaciones]);

  const expedientesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return expedientes;

    return expedientes.filter((p) => {
      const contenido = [
        p.nombre,
        p.nombreCliente,
        p.usuario,
        p.telefono,
        p.tipo,
        p.descripcion,
        p.ubicacion,
        p.cotizacionId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return contenido.includes(texto);
    });
  }, [expedientes, busqueda]);

  // ======================================================
  // HELPERS
  // ======================================================

  const moneda = (cantidad) => {
    if (
      cantidad === null ||
      cantidad === undefined ||
      cantidad === ""
    ) {
      return "No especificado";
    }

    const numero = Number(cantidad);

    if (Number.isNaN(numero)) {
      return String(cantidad);
    }

    return numero.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    });
  };

  const formatearFecha = (fecha, incluirHora = false) => {
    if (!fecha) return "Sin fecha";

    try {
      const date = fecha?.toDate
        ? fecha.toDate()
        : new Date(fecha);

      return incluirHora
        ? date.toLocaleString("es-MX", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : date.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
    } catch {
      return "Sin fecha";
    }
  };

  const fotosFinales = (proyecto) => {
    const lista = Array.isArray(proyecto.imagenesTrabajoFinal)
      ? proyecto.imagenesTrabajoFinal
      : [];

    return [...new Set(lista.filter(Boolean))];
  };

  const referencias = (proyecto) => {
    const lista = [
      ...(proyecto.imagenesProyecto || []),
      ...(proyecto.imagenesCliente || []),
      ...(proyecto.imagenes || []),
    ].filter(Boolean);

    const finales = new Set(fotosFinales(proyecto));

    return [...new Set(lista)].filter((url) => !finales.has(url));
  };

  const portada = (proyecto) =>
    fotosFinales(proyecto)[0] ||
    proyecto.imagenResultado ||
    proyecto.imagen ||
    referencias(proyecto)[0] ||
    null;

  // ======================================================
  // SELECCIÓN / ELIMINACIÓN
  // ======================================================

  const alternarModoSeleccion = () => {
    setModoSeleccion((actual) => !actual);
    setSeleccionados([]);
    setMensajeGeneral("");
    setErrorGeneral("");
  };

  const alternarSeleccion = (id) => {
    setSeleccionados((actuales) => {
      if (actuales.includes(id)) {
        return actuales.filter((item) => item !== id);
      }

      return [...actuales, id];
    });
  };

  const todosSeleccionados =
    expedientesFiltrados.length > 0 &&
    expedientesFiltrados.every((proyecto) =>
      seleccionados.includes(proyecto.id)
    );

  const seleccionarTodos = () => {
    if (todosSeleccionados) {
      const visibles = new Set(
        expedientesFiltrados.map((proyecto) => proyecto.id)
      );

      setSeleccionados((actuales) =>
        actuales.filter((id) => !visibles.has(id))
      );

      return;
    }

    setSeleccionados((actuales) => [
      ...new Set([
        ...actuales,
        ...expedientesFiltrados.map((proyecto) => proyecto.id),
      ]),
    ]);
  };

  const eliminarSeleccionados = async () => {
    if (seleccionados.length === 0) return;

    const confirmar = window.confirm(
      `¿Eliminar definitivamente ${seleccionados.length} expediente${
        seleccionados.length === 1 ? "" : "s"
      } de trabajos terminados?\n\nEsta acción eliminará los documentos de proyectosClientes y no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      setEliminando(true);
      setMensajeGeneral("");
      setErrorGeneral("");

      const batch = writeBatch(db);

      seleccionados.forEach((id) => {
        batch.delete(
          doc(
            db,
            "proyectosClientes",
            id
          )
        );
      });

      await batch.commit();

      setSeleccionados([]);
      setModoSeleccion(false);

      setMensajeGeneral(
        "✅ Los expedientes seleccionados fueron eliminados correctamente."
      );
    } catch (error) {
      console.error("Error eliminando expedientes:", error);

      setErrorGeneral(
        "No se pudieron eliminar los expedientes seleccionados."
      );
    } finally {
      setEliminando(false);
    }
  };

  // ======================================================
  // MODAL
  // ======================================================

  const abrirProyecto = (proyecto) => {
    setProyectoActivo(proyecto);
    setNotaPostventa("");
    setTipoSeguimiento("Seguimiento");
    setMensajeNota("");
    setErrorNota("");
    setModalProyecto(true);
  };

  const cerrarProyecto = () => {
    setModalProyecto(false);
    setProyectoActivo(null);
    setNotaPostventa("");
    setMensajeNota("");
    setErrorNota("");
  };

  // ======================================================
  // GALERÍA
  // ======================================================

  const abrirGaleria = (imagenes, index = 0) => {
    const lista = Array.isArray(imagenes)
      ? imagenes.filter(Boolean)
      : [];

    if (lista.length === 0) return;

    setImagenesGaleria(lista);
    setImagenActual(index);
    setGaleriaOpen(true);
  };

  const siguiente = () => {
    setImagenActual((actual) =>
      actual + 1 >= imagenesGaleria.length
        ? 0
        : actual + 1
    );
  };

  const anterior = () => {
    setImagenActual((actual) =>
      actual === 0
        ? imagenesGaleria.length - 1
        : actual - 1
    );
  };

  // ======================================================
  // POSTVENTA / GARANTÍA
  // ======================================================

  const guardarSeguimiento = async () => {
    if (!proyectoActivo) return;

    const nota = notaPostventa.trim();

    if (nota.length < 3) {
      setErrorNota("Escribe una nota de seguimiento.");
      return;
    }

    try {
      setGuardandoNota(true);
      setErrorNota("");
      setMensajeNota("");

      const nuevoRegistro = {
        tipo: tipoSeguimiento,
        nota,
        fecha: Timestamp.now(),
      };

      await updateDoc(
        doc(db, "proyectosClientes", proyectoActivo.id),
        {
          seguimientosPostventa: arrayUnion(nuevoRegistro),
          fechaUltimoSeguimiento: Timestamp.now(),
        }
      );

      setNotaPostventa("");
      setMensajeNota("✅ Seguimiento guardado en el expediente.");

      setProyectoActivo((actual) => ({
        ...actual,
        seguimientosPostventa: [
          ...(actual?.seguimientosPostventa || []),
          nuevoRegistro,
        ],
      }));
    } catch (error) {
      console.error("Error guardando seguimiento:", error);
      setErrorNota("No se pudo guardar el seguimiento.");
    } finally {
      setGuardandoNota(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (cargando) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-11 h-11 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 mt-4">
            Cargando trabajos terminados...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-7 py-7">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <header className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="text-zinc-400 hover:text-yellow-500 flex items-center gap-2 text-sm transition"
          >
            <FaArrowLeft />
            Volver al panel
          </button>

          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mt-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-green-400 font-semibold">
                Administración · Archivo de trabajos
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mt-2">
                Proyectos terminados
              </h1>

              <p className="text-zinc-400 mt-2 max-w-3xl">
                Expedientes administrativos de los trabajos entregados.
                Conserva aquí la información necesaria para garantías,
                aclaraciones, reclamos y servicios posteriores.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 xl:items-center">
              <div className="bg-zinc-900 border border-green-500/20 rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                  <FaCheckCircle />
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    {expedientes.length}
                  </p>
                  <p className="text-xs text-zinc-500">
                    trabajos archivados
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={alternarModoSeleccion}
                className={`
                  px-5 py-4 rounded-2xl border font-semibold
                  flex items-center justify-center gap-2 transition
                  ${
                    modoSeleccion
                      ? "bg-yellow-500 border-yellow-500 text-black"
                      : "bg-zinc-900 border-zinc-700 text-white hover:border-yellow-500/50"
                  }
                `}
              >
                {modoSeleccion ? <FaTimes /> : <FaCheckSquare />}
                {modoSeleccion ? "Terminar selección" : "Seleccionar"}
              </button>
            </div>
          </div>
        </header>

        {errorCarga && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4">
            {errorCarga}
          </div>
        )}

        {mensajeGeneral && (
          <div className="mb-5 bg-green-500/10 border border-green-500/30 text-green-300 rounded-2xl p-4">
            {mensajeGeneral}
          </div>
        )}

        {errorGeneral && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4">
            {errorGeneral}
          </div>
        )}

        {modoSeleccion && (
          <div className="mb-5 bg-zinc-900 border border-yellow-500/20 rounded-2xl p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="font-bold">
                  Modo selección
                </p>

                <p className="text-sm text-zinc-500 mt-1">
                  {seleccionados.length} expediente
                  {seleccionados.length === 1 ? "" : "s"} seleccionado
                  {seleccionados.length === 1 ? "" : "s"}.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={seleccionarTodos}
                  className="px-4 py-3 bg-black border border-zinc-700 hover:border-yellow-500/50 rounded-xl flex items-center gap-2 font-semibold text-sm transition"
                >
                  {todosSeleccionados ? <FaCheckSquare className="text-yellow-500" /> : <FaSquare />}
                  {todosSeleccionados
                    ? "Quitar visibles"
                    : "Seleccionar visibles"}
                </button>

                {seleccionados.length > 0 && (
                  <button
                    type="button"
                    disabled={eliminando}
                    onClick={eliminarSeleccionados}
                    className="px-4 py-3 bg-red-600 hover:bg-red-500 rounded-xl flex items-center gap-2 font-bold text-sm disabled:opacity-50 transition"
                  >
                    <FaTrashAlt />
                    {eliminando
                      ? "Eliminando..."
                      : `Eliminar ${seleccionados.length}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BUSCADOR */}

        <div className="relative mb-7">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />

          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente, teléfono, correo, proyecto, ubicación o ID..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl py-4 pl-12 pr-5 outline-none focus:border-yellow-500/60 text-white placeholder:text-zinc-600 transition"
          />
        </div>

        {/* SIN RESULTADOS */}

        {!errorCarga && expedientesFiltrados.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
            <FaBuilding className="text-zinc-700 text-5xl mx-auto" />
            <h2 className="text-xl font-bold mt-5">
              No encontramos trabajos terminados
            </h2>
            <p className="text-zinc-500 mt-2">
              Prueba con otro nombre, teléfono o proyecto.
            </p>
          </div>
        )}

        {/* TARJETAS */}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {expedientesFiltrados.map((proyecto) => {
            const imagen = portada(proyecto);
            const totalFotos = fotosFinales(proyecto).length;

            return (
              <article
                key={proyecto.id}
                onClick={() => {
                  if (modoSeleccion) {
                    alternarSeleccion(proyecto.id);
                  }
                }}
                className={`
                  relative bg-zinc-900 border rounded-3xl overflow-hidden transition
                  ${
                    seleccionados.includes(proyecto.id)
                      ? "border-yellow-500 ring-2 ring-yellow-500/20"
                      : "border-zinc-800 hover:border-green-500/30"
                  }
                  ${modoSeleccion ? "cursor-pointer" : ""}
                `}
              >
                {modoSeleccion && (
                  <div className="absolute top-4 right-4 z-30">
                    <div
                      className={`
                        w-11 h-11 rounded-xl border flex items-center justify-center shadow-xl
                        ${
                          seleccionados.includes(proyecto.id)
                            ? "bg-yellow-500 border-yellow-400 text-black"
                            : "bg-black/85 border-white/30 text-white"
                        }
                      `}
                    >
                      {seleccionados.includes(proyecto.id) ? (
                        <FaCheck />
                      ) : (
                        <FaSquare />
                      )}
                    </div>
                  </div>
                )}

                <div className="relative h-60 bg-black">
                  {imagen ? (
                    <img
                      src={imagen}
                      alt={proyecto.nombre || "Trabajo terminado"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaBuilding className="text-zinc-800 text-5xl" />
                    </div>
                  )}

                  <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                    <FaCheckCircle />
                    TERMINADO
                  </span>

                  {totalFotos > 0 && (
                    <span className="absolute bottom-4 right-4 bg-black/85 border border-white/10 px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
                      <FaImages />
                      {totalFotos} finales
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <p className="text-xs uppercase tracking-widest text-yellow-500">
                    {proyecto.tipo || "Proyecto Wealth"}
                  </p>

                  <h2 className="text-xl font-bold mt-2 capitalize">
                    {proyecto.nombre || "Proyecto terminado"}
                  </h2>

                  <div className="mt-5 space-y-3 text-sm">
                    <DatoCard
                      icon={<FaUser />}
                      texto={proyecto.nombreCliente || "Cliente"}
                    />

                    <DatoCard
                      icon={<FaPhone />}
                      texto={proyecto.telefono || "Sin teléfono registrado"}
                    />

                    <DatoCard
                      icon={<FaCalendarAlt />}
                      texto={`Finalizado: ${formatearFecha(
                        proyecto.fechaFinalizacion
                      )}`}
                    />
                  </div>

                  <div className="mt-5 bg-black border border-zinc-800 rounded-2xl p-4">
                    <p className="text-xs text-zinc-500">
                      Importe del trabajo
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {moneda(proyecto.precioTotal)}
                    </p>
                  </div>

                  {!modoSeleccion && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirProyecto(proyecto);
                      }}
                      className="w-full mt-5 bg-yellow-500 hover:bg-yellow-400 text-black py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition"
                    >
                      <FaEye />
                      Abrir expediente
                    </button>
                  )}

                  {modoSeleccion && (
                    <div
                      className={`
                        w-full mt-5 py-3.5 rounded-2xl border text-center font-semibold
                        ${
                          seleccionados.includes(proyecto.id)
                            ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
                            : "bg-black border-zinc-700 text-zinc-500"
                        }
                      `}
                    >
                      {seleccionados.includes(proyecto.id)
                        ? "✓ Seleccionado"
                        : "Seleccionar"}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ================================================= */}
      {/* EXPEDIENTE */}
      {/* ================================================= */}

      {modalProyecto && proyectoActivo && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm overflow-y-auto p-4 md:p-6"
          onClick={cerrarProyecto}
        >
          <div
            className="max-w-5xl mx-auto bg-zinc-950 border border-zinc-700 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}

            <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 p-6 md:p-8">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-green-400 font-bold flex items-center gap-2">
                    <FaCheckCircle />
                    Expediente de trabajo terminado
                  </p>

                  <h2 className="text-2xl md:text-3xl font-bold mt-2">
                    {proyectoActivo.nombre || "Proyecto"}
                  </h2>

                  <p className="text-zinc-500 text-sm mt-2">
                    ID: {proyectoActivo.cotizacionId || proyectoActivo.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cerrarProyecto}
                  className="w-11 h-11 rounded-xl bg-black border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 flex items-center justify-center"
                >
                  <FaTimes />
                </button>
              </div>
            </header>

            <div className="p-6 md:p-8 space-y-8">

              {/* CLIENTE */}

              <Seccion titulo="Datos del cliente" icon={<FaUser />}>
                <div className="bg-black border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <Detalle
                    titulo="Nombre"
                    valor={proyectoActivo.nombreCliente || "No registrado"}
                    icon={<FaUser />}
                  />
                  <Detalle
                    titulo="Correo"
                    valor={proyectoActivo.usuario || "No registrado"}
                    icon={<FaEnvelope />}
                  />
                  <Detalle
                    titulo="Teléfono"
                    valor={proyectoActivo.telefono || "No registrado"}
                    icon={<FaPhone />}
                  />
                  <Detalle
                    titulo="Medio de contacto"
                    valor={proyectoActivo.metodoContacto || "No registrado"}
                    icon={<FaWhatsapp />}
                  />
                </div>
              </Seccion>

              {/* SOLICITUD ORIGINAL */}

              <Seccion
                titulo="Solicitud y datos del trabajo"
                icon={<FaFileInvoiceDollar />}
              >
                <div className="bg-black border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <Detalle
                    titulo="Tipo"
                    valor={proyectoActivo.tipo || "No especificado"}
                    icon={<FaTools />}
                  />
                  <Detalle
                    titulo="Descripción"
                    valor={proyectoActivo.descripcion || "No especificada"}
                    icon={<FaFileInvoiceDollar />}
                  />
                  <Detalle
                    titulo="Ubicación"
                    valor={proyectoActivo.ubicacion || "No especificada"}
                    icon={<FaMapMarkerAlt />}
                  />
                  <Detalle
                    titulo="Medidas"
                    valor={proyectoActivo.medidas || "No especificadas"}
                    icon={<FaRulerCombined />}
                  />
                  <Detalle
                    titulo="Fecha solicitada"
                    valor={formatearFecha(proyectoActivo.fechaDeseada)}
                    icon={<FaCalendarAlt />}
                  />
                </div>
              </Seccion>

              {/* ECONÓMICO */}

              <Seccion
                titulo="Información económica y condiciones"
                icon={<FaMoneyBillWave />}
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CajaInfo
                    titulo="Precio total"
                    valor={moneda(proyectoActivo.precioTotal)}
                  />
                  <CajaInfo
                    titulo="Anticipo"
                    valor={moneda(
                      proyectoActivo.anticipo ??
                        proyectoActivo.montoAnticipo
                    )}
                  />
                  <CajaInfo
                    titulo="Saldo"
                    valor={moneda(
                      proyectoActivo.saldo ??
                        proyectoActivo.saldoPendiente
                    )}
                  />
                  <CajaInfo
                    titulo="Tiempo estimado"
                    valor={
                      proyectoActivo.tiempoEstimado ||
                      "No especificado"
                    }
                  />
                  <CajaInfo
                    titulo="Garantía"
                    valor={proyectoActivo.garantia || "No especificada"}
                  />
                  <CajaInfo
                    titulo="Versión aceptada"
                    valor={
                      proyectoActivo.versionAceptada ||
                      proyectoActivo.versionPropuesta ||
                      "1"
                    }
                  />
                </div>

                {proyectoActivo.observaciones && (
                  <div className="mt-4 bg-black border border-zinc-800 rounded-2xl p-5">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">
                      Observaciones
                    </p>
                    <p className="text-zinc-300 mt-2 whitespace-pre-wrap">
                      {proyectoActivo.observaciones}
                    </p>
                  </div>
                )}
              </Seccion>

              {/* CRONOLOGÍA */}

              <Seccion titulo="Cronología del trabajo" icon={<FaClock />}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CajaFecha
                    titulo="Solicitud"
                    fecha={formatearFecha(proyectoActivo.fechaSolicitud)}
                  />
                  <CajaFecha
                    titulo="Confirmación"
                    fecha={formatearFecha(
                      proyectoActivo.fechaConfirmacionAdmin
                    )}
                  />
                  <CajaFecha
                    titulo="Inicio"
                    fecha={formatearFecha(
                      proyectoActivo.fechaInicioProyecto
                    )}
                  />
                  <CajaFecha
                    titulo="Instalación"
                    fecha={formatearFecha(proyectoActivo.fechaInstalacion)}
                  />
                  <CajaFecha
                    titulo="Finalización"
                    fecha={formatearFecha(
                      proyectoActivo.fechaFinalizacion
                    )}
                  />
                </div>
              </Seccion>

              {/* FOTOS FINALES */}

              {fotosFinales(proyectoActivo).length > 0 && (
                <Seccion
                  titulo="Fotografías del trabajo realizado"
                  icon={<FaImages />}
                >
                  <p className="text-sm text-zinc-500 mb-4">
                    Evidencia final cargada por Wealth al cerrar el trabajo.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {fotosFinales(proyectoActivo).map((imagen, index) => (
                      <img
                        key={imagen}
                        src={imagen}
                        alt={`Resultado ${index + 1}`}
                        onClick={() =>
                          abrirGaleria(
                            fotosFinales(proyectoActivo),
                            index
                          )
                        }
                        className="w-full aspect-square object-cover rounded-2xl border border-green-500/20 cursor-zoom-in hover:border-green-500/60 transition"
                      />
                    ))}
                  </div>
                </Seccion>
              )}

              {/* REFERENCIAS */}

              {referencias(proyectoActivo).length > 0 && (
                <Seccion
                  titulo="Imágenes originales y referencias"
                  icon={<FaImages />}
                >
                  <p className="text-sm text-zinc-500 mb-4">
                    Fotografías y referencias que formaron parte de la
                    solicitud original.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {referencias(proyectoActivo).map((imagen, index) => (
                      <img
                        key={imagen}
                        src={imagen}
                        alt={`Referencia ${index + 1}`}
                        onClick={() =>
                          abrirGaleria(
                            referencias(proyectoActivo),
                            index
                          )
                        }
                        className="w-full aspect-square object-cover rounded-2xl border border-zinc-800 cursor-zoom-in hover:border-yellow-500/50 transition"
                      />
                    ))}
                  </div>
                </Seccion>
              )}

              {/* HISTORIAL PROPUESTAS */}

              {proyectoActivo.historialPropuestas?.length > 0 && (
                <Seccion
                  titulo="Historial de propuestas"
                  icon={<FaHistory />}
                >
                  <div className="space-y-3">
                    {proyectoActivo.historialPropuestas.map(
                      (propuesta, index) => (
                        <div
                          key={index}
                          className="bg-black border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                          <div>
                            <p className="font-bold">
                              Propuesta #
                              {propuesta.version || index + 1}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {propuesta.estadoAnterior ||
                                "Versión anterior"}{" "}
                              ·{" "}
                              {formatearFecha(propuesta.fecha, true)}
                            </p>
                          </div>

                          <p className="text-yellow-500 font-bold">
                            {moneda(propuesta.precioTotal)}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </Seccion>
              )}

              {/* POSTVENTA */}

              <Seccion
                titulo="Postventa, garantía y reclamos"
                icon={<FaShieldAlt />}
              >
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5">
                  <p className="text-sm text-zinc-400">
                    Registra cualquier llamada, reclamo, visita,
                    reparación, ajuste o seguimiento posterior. Estas
                    notas son administrativas y quedan dentro del
                    expediente del trabajo.
                  </p>

                  {errorNota && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm">
                      {errorNota}
                    </div>
                  )}

                  {mensajeNota && (
                    <div className="mt-4 bg-green-500/10 border border-green-500/30 text-green-300 rounded-xl p-3 text-sm">
                      {mensajeNota}
                    </div>
                  )}

                  <div className="grid md:grid-cols-[220px_1fr] gap-4 mt-5">
                    <select
                      value={tipoSeguimiento}
                      onChange={(e) =>
                        setTipoSeguimiento(e.target.value)
                      }
                      className="bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-yellow-500"
                    >
                      <option>Seguimiento</option>
                      <option>Reclamo</option>
                      <option>Garantía</option>
                      <option>Visita técnica</option>
                      <option>Reparación</option>
                      <option>Ajuste</option>
                      <option>Otro</option>
                    </select>

                    <textarea
                      rows="4"
                      value={notaPostventa}
                      onChange={(e) => setNotaPostventa(e.target.value)}
                      placeholder="Ej: Cliente reporta que una puerta necesita ajuste. Se agenda visita..."
                      className="bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-yellow-500 resize-y"
                    />
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      disabled={guardandoNota}
                      onClick={guardarSeguimiento}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition"
                    >
                      <FaSave />
                      {guardandoNota
                        ? "Guardando..."
                        : "Guardar seguimiento"}
                    </button>
                  </div>
                </div>

                {proyectoActivo.seguimientosPostventa?.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {[...proyectoActivo.seguimientosPostventa]
                      .sort((a, b) => {
                        const fa = a.fecha?.toMillis?.() || 0;
                        const fb = b.fecha?.toMillis?.() || 0;
                        return fb - fa;
                      })
                      .map((registro, index) => (
                        <div
                          key={index}
                          className="bg-black border border-zinc-800 rounded-2xl p-5"
                        >
                          <div className="flex flex-wrap justify-between gap-3">
                            <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                              {registro.tipo || "Seguimiento"}
                            </span>

                            <span className="text-xs text-zinc-500">
                              {formatearFecha(registro.fecha, true)}
                            </span>
                          </div>

                          <p className="text-zinc-300 mt-3 whitespace-pre-wrap">
                            {registro.nota}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </Seccion>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* GALERÍA */}
      {/* ================================================= */}

      {galeriaOpen && imagenesGaleria.length > 0 && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center"
          onClick={() => setGaleriaOpen(false)}
        >
          <button
            type="button"
            onClick={() => setGaleriaOpen(false)}
            className="absolute top-5 right-5 w-12 h-12 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center text-white z-20"
          >
            <FaTimes />
          </button>

          {imagenesGaleria.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                anterior();
              }}
              className="absolute left-4 md:left-8 text-white text-5xl z-20"
            >
              ‹
            </button>
          )}

          <img
            src={imagenesGaleria[imagenActual]}
            alt="Expediente"
            className="max-w-[90%] max-h-[90%] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {imagenesGaleria.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                siguiente();
              }}
              className="absolute right-4 md:right-8 text-white text-5xl z-20"
            >
              ›
            </button>
          )}

          {imagenesGaleria.length > 1 && (
            <div className="absolute bottom-5 bg-zinc-900 border border-zinc-700 text-sm px-4 py-2 rounded-full">
              {imagenActual + 1} / {imagenesGaleria.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ======================================================
// COMPONENTES AUXILIARES
// ======================================================

function DatoCard({ icon, texto }) {
  return (
    <div className="flex items-center gap-2 text-zinc-400">
      <span className="text-yellow-500">{icon}</span>
      <span className="break-all">{texto}</span>
    </div>
  );
}

function Seccion({ titulo, icon, children }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center">
          {icon}
        </span>
        <h3 className="text-xl font-bold">{titulo}</h3>
      </div>

      {children}
    </section>
  );
}

function Detalle({ titulo, valor, icon }) {
  return (
    <div className="grid md:grid-cols-[230px_1fr] gap-2 md:gap-5">
      <div className="text-zinc-500 text-sm flex items-center gap-2">
        <span className="text-yellow-500">{icon}</span>
        {titulo}
      </div>

      <div className="text-zinc-200 text-sm break-words whitespace-pre-wrap">
        {valor}
      </div>
    </div>
  );
}

function CajaInfo({ titulo, valor }) {
  return (
    <div className="bg-black border border-zinc-800 rounded-2xl p-4">
      <p className="text-xs text-zinc-500">{titulo}</p>
      <p className="font-bold mt-1 break-words">{valor}</p>
    </div>
  );
}

function CajaFecha({ titulo, fecha }) {
  return (
    <div className="bg-black border border-zinc-800 rounded-2xl p-4">
      <p className="text-xs text-zinc-500">{titulo}</p>
      <p className="text-sm font-semibold mt-1">{fecha}</p>
    </div>
  );
}

export default ProyectosTerminadosAdmin;