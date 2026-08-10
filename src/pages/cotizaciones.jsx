import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  db,
  auth,
} from "../firebase.config";

import {
  collection,
  query,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import {
  FaArrowLeft,
  FaArrowRight,
  FaBell,
  FaBuilding,
  FaCalendarAlt,
  FaCamera,
  FaCheck,
  FaCheckCircle,
  FaCheckSquare,
  FaClock,
  FaCloudUploadAlt,
  FaCrosshairs,
  FaDollarSign,
  FaEdit,
  FaEye,
  FaHistory,
  FaImages,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPen,
  FaPhone,
  FaRulerCombined,
  FaSave,
  FaSearch,
  FaShieldAlt,
  FaSquare,
  FaSyncAlt,
  FaTag,
  FaTimes,
  FaTimesCircle,
  FaTrashAlt,
  FaWhatsapp,
} from "react-icons/fa";

/* ======================================================
   CONFIGURACIÓN LEAFLET
====================================================== */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* ======================================================
   POSICIÓN INICIAL CAMPECHE
====================================================== */

const POSICION_CAMPECHE = {
  lat: 19.8301,
  lng: -90.5349,
};

/* ======================================================
   GEOCODIFICACIÓN INVERSA
====================================================== */

const obtenerDireccion = async (
  lat,
  lng
) => {
  const params =
    new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lng),
      addressdetails: "1",
      zoom: "18",
      "accept-language": "es",
    });

  const response =
    await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`
    );

  if (!response.ok) {
    throw new Error(
      "No se pudo obtener la dirección."
    );
  }

  const data =
    await response.json();

  return (
    data.display_name ||
    ""
  );
};

/* ======================================================
   RECENTRAR MAPA
====================================================== */

function RecentrarMapa({
  posicion,
  zoom = 16,
}) {
  const map = useMap();

  useEffect(() => {
    if (!posicion) {
      return;
    }

    map.setView(
      [
        posicion.lat,
        posicion.lng,
      ],
      zoom,
      {
        animate: true,
      }
    );
  }, [
    posicion,
    map,
    zoom,
  ]);

  return null;
}

/* ======================================================
   SELECTOR DE UBICACIÓN
====================================================== */

function SelectorUbicacionEditar({
  posicion,
  setPosicion,
  setUbicacion,
  setError,
}) {
  const actualizarUbicacion =
    async (
      lat,
      lng
    ) => {
      setError("");

      setPosicion({
        lat,
        lng,
      });

      try {
        const direccion =
          await obtenerDireccion(
            lat,
            lng
          );

        setUbicacion(
          direccion ||
            `${lat.toFixed(
              6
            )}, ${lng.toFixed(
              6
            )}`
        );
      } catch (error) {
        console.error(
          "Error obteniendo dirección:",
          error
        );

        setUbicacion(
          `${lat.toFixed(
            6
          )}, ${lng.toFixed(
            6
          )}`
        );
      }
    };

  useMapEvents({
    click(e) {
      actualizarUbicacion(
        e.latlng.lat,
        e.latlng.lng
      );
    },
  });

  if (!posicion) {
    return null;
  }

  return (
    <Marker
      position={[
        posicion.lat,
        posicion.lng,
      ]}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const nuevaPosicion =
            e.target.getLatLng();

          actualizarUbicacion(
            nuevaPosicion.lat,
            nuevaPosicion.lng
          );
        },
      }}
    >
      <Popup>
        Ubicación seleccionada
      </Popup>
    </Marker>
  );
}

/* ======================================================
   COMPONENTE PRINCIPAL
====================================================== */

function Cotizaciones() {
  /* ======================================================
     COTIZACIONES
  ====================================================== */

  const [
    cotizaciones,
    setCotizaciones,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    procesando,
    setProcesando,
  ] = useState(false);

  const [
    mensajeGeneral,
    setMensajeGeneral,
  ] = useState("");

  const [
    errorGeneral,
    setErrorGeneral,
  ] = useState("");

  /* ======================================================
     SELECCIÓN MÚLTIPLE
  ====================================================== */

  const [
    modoSeleccion,
    setModoSeleccion,
  ] = useState(false);

  const [
    seleccionadas,
    setSeleccionadas,
  ] = useState([]);

  /* ======================================================
     GALERÍA
  ====================================================== */

  const [
    galeriaOpen,
    setGaleriaOpen,
  ] = useState(false);

  const [
    imgs,
    setImgs,
  ] = useState([]);

  const [
    index,
    setIndex,
  ] = useState(0);

  /* ======================================================
     MODAL DETALLES
  ====================================================== */

  const [
    propuestaOpen,
    setPropuestaOpen,
  ] = useState(false);

  const [
    cotizacionSeleccionada,
    setCotizacionSeleccionada,
  ] = useState(null);

  /* ======================================================
     EDICIÓN
  ====================================================== */

  const [
    editarOpen,
    setEditarOpen,
  ] = useState(false);

  const [
    cotizacionEditando,
    setCotizacionEditando,
  ] = useState(null);

  const [
    pasoEditar,
    setPasoEditar,
  ] = useState(1);

  const totalPasosEditar =
    4;

  /* ======================================================
     DATOS EDICIÓN
  ====================================================== */

  const [
    editNombre,
    setEditNombre,
  ] = useState("");

  const [
    editDescripcion,
    setEditDescripcion,
  ] = useState("");

  const [
    editTipo,
    setEditTipo,
  ] = useState(
    "Construcción"
  );

  const [
    editUbicacion,
    setEditUbicacion,
  ] = useState("");

  const [
    editMedidas,
    setEditMedidas,
  ] = useState("");

  const [
    editFechaDeseada,
    setEditFechaDeseada,
  ] = useState("");

  const [
    editPresupuesto,
    setEditPresupuesto,
  ] = useState("");

  const [
    editTelefono,
    setEditTelefono,
  ] = useState("");

  const [
    editMetodoContacto,
    setEditMetodoContacto,
  ] = useState(
    "WhatsApp"
  );

  /* ======================================================
     MAPA EDICIÓN
  ====================================================== */

  const [
    editPosicion,
    setEditPosicion,
  ] = useState(
    POSICION_CAMPECHE
  );

  const [
    buscandoUbicacion,
    setBuscandoUbicacion,
  ] = useState(false);

  const [
    obteniendoGPS,
    setObteniendoGPS,
  ] = useState(false);

  /* ======================================================
     IMÁGENES EDICIÓN
  ====================================================== */

  const [
    imagenesProyectoEdit,
    setImagenesProyectoEdit,
  ] = useState([]);

  const [
    imagenesClienteEdit,
    setImagenesClienteEdit,
  ] = useState([]);

  const [
    nuevasImagenes,
    setNuevasImagenes,
  ] = useState([]);

  /* ======================================================
     PREVIEWS NUEVAS FOTOS
  ====================================================== */

  const previewsNuevos =
    useMemo(() => {
      return nuevasImagenes.map(
        (file) => ({
          file,
          url:
            URL.createObjectURL(
              file
            ),
        })
      );
    }, [
      nuevasImagenes,
    ]);

  useEffect(() => {
    return () => {
      previewsNuevos.forEach(
        (preview) => {
          URL.revokeObjectURL(
            preview.url
          );
        }
      );
    };
  }, [
    previewsNuevos,
  ]);

  /* ======================================================
     FIREBASE EN TIEMPO REAL
  ====================================================== */

  useEffect(() => {
    let unsubCotizaciones =
      null;

    const unsubAuth =
      onAuthStateChanged(
        auth,
        (user) => {
          if (!user) {
            setCotizaciones(
              []
            );

            setCargando(
              false
            );

            return;
          }

          const userEmail =
            user.email;

          const userUid =
            user.uid;

          const q = query(
            collection(
              db,
              "cotizaciones"
            ),
            orderBy(
              "fecha",
              "desc"
            )
          );

          unsubCotizaciones =
            onSnapshot(
              q,

              (snapshot) => {
                const data =
                  snapshot.docs
                    .map(
                      (
                        documento
                      ) => ({
                        id:
                          documento.id,

                        ...documento.data(),
                      })
                    )
                    .filter(
                      (c) => {
                        const pertenece =
                          c.uid ===
                            userUid ||
                          (
                            userEmail &&
                            c.usuario ===
                              userEmail
                          );

                        const visible =
                          c.ocultoPorCliente !==
                          true;

                        return (
                          pertenece &&
                          visible
                        );
                      }
                    );

                setCotizaciones(
                  data
                );

                setSeleccionadas(
                  (actuales) =>
                    actuales.filter(
                      (id) =>
                        data.some(
                          (c) =>
                            c.id ===
                            id
                        )
                    )
                );

                setCotizacionSeleccionada(
                  (actual) => {
                    if (!actual) {
                      return null;
                    }

                    return (
                      data.find(
                        (c) =>
                          c.id ===
                          actual.id
                      ) ||
                      actual
                    );
                  }
                );

                setCargando(
                  false
                );
              },

              (error) => {
                console.error(
                  "Error cargando cotizaciones:",
                  error
                );

                setErrorGeneral(
                  "No se pudieron cargar las cotizaciones."
                );

                setCargando(
                  false
                );
              }
            );
        }
      );

    return () => {
      unsubAuth();

      if (
        unsubCotizaciones
      ) {
        unsubCotizaciones();
      }
    };
  }, []);

  /* ======================================================
     ESTADO
  ====================================================== */

  const obtenerEstado =
    (estado) => {
      switch (estado) {
        case "pendiente":
          return {
            texto:
              "Solicitud enviada",

            color:
              "bg-zinc-700 text-white",
          };

        case "revision":
        case "en_revision":
          return {
            texto:
              "En revisión",

            color:
              "bg-blue-600 text-white",
          };

        case "cotizada":
        case "propuesta_enviada":
          return {
            texto:
              "Propuesta recibida",

            color:
              "bg-yellow-500 text-black",
          };

        case "propuesta_modificada":
          return {
            texto:
              "Propuesta modificada",

            color:
              "bg-orange-500 text-black",
          };

        case "aceptada_cliente":
          return {
            texto:
              "Aceptada",

            color:
              "bg-green-600 text-white",
          };

        case "cambios":
        case "cambios_solicitados":
          return {
            texto:
              "Cambios solicitados",

            color:
              "bg-orange-500 text-black",
          };

        case "rechazada_cliente":
          return {
            texto:
              "Propuesta rechazada",

            color:
              "bg-red-600 text-white",
          };

        case "cancelada_cliente":
          return {
            texto:
              "Solicitud cancelada",

            color:
              "bg-red-700 text-white",
          };

        case "confirmada_admin":
          return {
            texto:
              "Trabajo confirmado",

            color:
              "bg-emerald-600 text-white",
          };

        case "anticipo_pendiente":
          return {
            texto:
              "Anticipo pendiente",

            color:
              "bg-amber-500 text-black",
          };

        case "anticipo_pagado":
          return {
            texto:
              "Anticipo recibido",

            color:
              "bg-green-600 text-white",
          };

        case "proceso":
        case "en_proceso":
          return {
            texto:
              "Trabajo en proceso",

            color:
              "bg-purple-600 text-white",
          };

        case "instalacion":
        case "instalacion_programada":
          return {
            texto:
              "Instalación programada",

            color:
              "bg-cyan-600 text-white",
          };

        case "finalizada":
        case "terminada":
          return {
            texto:
              "Trabajo finalizado",

            color:
              "bg-green-700 text-white",
          };

        default:
          return {
            texto:
              estado ||
              "Pendiente",

            color:
              "bg-zinc-700 text-white",
          };
      }
    };

  /* ======================================================
     PERMISOS
  ====================================================== */

  const puedeEditarSolicitud =
    (cotizacion) => {
      return [
        "pendiente",
        "revision",
        "en_revision",
      ].includes(
        cotizacion.estado
      );
    };

  const puedeCancelarSolicitud =
    (cotizacion) => {
      return [
        "pendiente",
        "revision",
        "en_revision",
      ].includes(
        cotizacion.estado
      );
    };

  /* ======================================================
     NOVEDADES
  ====================================================== */

  const tieneNovedad =
    (cotizacion) => {
      return (
        cotizacion.vistoPorCliente ===
          false &&
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
        ].includes(
          cotizacion.estado
        )
      );
    };

  const cantidadNuevas =
    cotizaciones.filter(
      tieneNovedad
    ).length;

  /* ======================================================
     MENSAJE DE ESTADO
  ====================================================== */

  const obtenerMensajeEstado =
    (cotizacion) => {
      switch (
        cotizacion.estado
      ) {
        case "cotizada":
        case "propuesta_enviada":
          return {
            titulo:
              "Wealth envió una propuesta",

            texto:
              "Revisa el precio y las condiciones.",

            clase:
              "bg-yellow-500/10 border-yellow-500/30",

            icono: (
              <FaBell className="text-yellow-500" />
            ),
          };

        case "propuesta_modificada":
          return {
            titulo:
              "Propuesta modificada",

            texto:
              "Wealth actualizó la propuesta.",

            clase:
              "bg-orange-500/10 border-orange-500/30",

            icono: (
              <FaSyncAlt className="text-orange-400" />
            ),
          };

        case "aceptada_cliente":
          return {
            titulo:
              "Propuesta aceptada",

            texto:
              "Wealth recibió tu aceptación.",

            clase:
              "bg-green-500/10 border-green-500/30",

            icono: (
              <FaCheckCircle className="text-green-500" />
            ),
          };

        case "cancelada_cliente":
          return {
            titulo:
              "Solicitud cancelada",

            texto:
              "Wealth dejará de procesar esta solicitud.",

            clase:
              "bg-red-500/10 border-red-500/30",

            icono: (
              <FaTimesCircle className="text-red-500" />
            ),
          };

        case "confirmada_admin":
          return {
            titulo:
              "Trabajo confirmado por Wealth",

            texto:
              "Nuestro personal se pondrá en contacto contigo.",

            clase:
              "bg-emerald-500/10 border-emerald-500/30",

            icono: (
              <FaBuilding className="text-emerald-500" />
            ),
          };

        default:
          return null;
      }
    };

  /* ======================================================
     SELECCIÓN
  ====================================================== */

  const alternarModoSeleccion =
    () => {
      setModoSeleccion(
        (actual) =>
          !actual
      );

      setSeleccionadas(
        []
      );

      setMensajeGeneral(
        ""
      );

      setErrorGeneral(
        ""
      );
    };

  const seleccionarCotizacion =
    (id) => {
      setSeleccionadas(
        (actuales) => {
          if (
            actuales.includes(
              id
            )
          ) {
            return actuales.filter(
              (item) =>
                item !== id
            );
          }

          return [
            ...actuales,
            id,
          ];
        }
      );
    };

  const todasSeleccionadas =
    cotizaciones.length >
      0 &&
    seleccionadas.length ===
      cotizaciones.length;

  const seleccionarTodas =
    () => {
      if (
        todasSeleccionadas
      ) {
        setSeleccionadas(
          []
        );

        return;
      }

      setSeleccionadas(
        cotizaciones.map(
          (c) =>
            c.id
        )
      );
    };

  /* ======================================================
     ELIMINAR DEL PANEL
  ====================================================== */

  const eliminarSeleccionadas =
    async () => {
      if (
        seleccionadas.length ===
        0
      ) {
        return;
      }

      const confirmar =
        window.confirm(
          `¿Quieres eliminar ${
            seleccionadas.length
          } ${
            seleccionadas.length ===
            1
              ? "cotización"
              : "cotizaciones"
          } de tu panel?\n\nEl registro administrativo de Wealth se conservará.`
        );

      if (!confirmar) {
        return;
      }

      try {
        setProcesando(
          true
        );

        const batch =
          writeBatch(db);

        seleccionadas.forEach(
          (id) => {
            const referencia =
              doc(
                db,
                "cotizaciones",
                id
              );

            batch.update(
              referencia,
              {
                ocultoPorCliente:
                  true,

                fechaOcultadaPorCliente:
                  serverTimestamp(),

                fechaActualizacion:
                  serverTimestamp(),
              }
            );
          }
        );

        await batch.commit();

        setSeleccionadas(
          []
        );

        setModoSeleccion(
          false
        );

        setMensajeGeneral(
          "Cotización eliminada de tu panel correctamente."
        );

      } catch (error) {
        console.error(
          "Error eliminando cotizaciones:",
          error
        );

        setErrorGeneral(
          "No se pudieron eliminar las cotizaciones."
        );

      } finally {
        setProcesando(
          false
        );
      }
    };

  /* ======================================================
     MARCAR VISTA
  ====================================================== */

  const marcarComoVista =
    async (
      cotizacion
    ) => {
      if (
        cotizacion.vistoPorCliente !==
        false
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
            vistoPorCliente:
              true,
          }
        );
      } catch (error) {
        console.error(
          "Error marcando vista:",
          error
        );
      }
    };

  /* ======================================================
     VER DETALLES
  ====================================================== */

  const verPropuesta =
    async (
      cotizacion
    ) => {
      setCotizacionSeleccionada(
        cotizacion
      );

      setPropuestaOpen(
        true
      );

      await marcarComoVista(
        cotizacion
      );
    };

  /* ======================================================
     ABRIR EDICIÓN
  ====================================================== */

  const abrirEdicion =
    (cotizacion) => {
      if (
        !puedeEditarSolicitud(
          cotizacion
        )
      ) {
        window.alert(
          "Esta solicitud ya no puede modificarse."
        );

        return;
      }

      setCotizacionEditando(
        cotizacion
      );

      setPasoEditar(
        1
      );

      setEditNombre(
        cotizacion.nombre ||
        ""
      );

      setEditDescripcion(
        cotizacion.descripcion ||
        ""
      );

      setEditTipo(
        cotizacion.tipo ||
        "Construcción"
      );

      setEditUbicacion(
        cotizacion.ubicacion ||
        ""
      );

      setEditMedidas(
        cotizacion.medidas ||
        ""
      );

      setEditFechaDeseada(
        cotizacion.fechaDeseada ||
        ""
      );

      setEditPresupuesto(
        cotizacion.presupuestoEstimadoCliente ??
          ""
      );

      setEditTelefono(
        cotizacion.telefono ||
        ""
      );

      setEditMetodoContacto(
        cotizacion.metodoContacto ||
        "WhatsApp"
      );

      const lat =
        Number(
          cotizacion.latitud
        );

      const lng =
        Number(
          cotizacion.longitud
        );

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        setEditPosicion({
          lat,
          lng,
        });
      } else {
        setEditPosicion(
          POSICION_CAMPECHE
        );
      }

      const referencias =
        Array.isArray(
          cotizacion.imagenesProyecto
        )
          ? cotizacion.imagenesProyecto.filter(
              Boolean
            )
          : [];

      const cliente =
        Array.isArray(
          cotizacion.imagenesCliente
        )
          ? cotizacion.imagenesCliente.filter(
              Boolean
            )
          : [];

      setImagenesProyectoEdit(
        referencias
      );

      setImagenesClienteEdit(
        cliente
      );

      setNuevasImagenes(
        []
      );

      setErrorGeneral(
        ""
      );

      setEditarOpen(
        true
      );
    };

  /* ======================================================
     CERRAR EDICIÓN
  ====================================================== */

  const cerrarEdicion =
    () => {
      setEditarOpen(
        false
      );

      setCotizacionEditando(
        null
      );

      setNuevasImagenes(
        []
      );

      setErrorGeneral(
        ""
      );
    };

  /* ======================================================
     VALIDACIÓN EDICIÓN
  ====================================================== */

  const validarPasoEditar =
    () => {
      setErrorGeneral("");

      if (
        pasoEditar ===
        1
      ) {
        if (
          !editNombre.trim()
        ) {
          setErrorGeneral(
            "Escribe el nombre del proyecto."
          );

          return false;
        }

        if (
          editDescripcion
            .trim()
            .length <
          10
        ) {
          setErrorGeneral(
            "La descripción debe tener al menos 10 caracteres."
          );

          return false;
        }
      }

      if (
        pasoEditar ===
        2
      ) {
        if (
          !editUbicacion.trim()
        ) {
          setErrorGeneral(
            "Escribe o selecciona una ubicación."
          );

          return false;
        }
      }

      if (
        pasoEditar ===
        4
      ) {
        const numero =
          editTelefono.replace(
            /\D/g,
            ""
          );

        if (
          numero.length <
          10
        ) {
          setErrorGeneral(
            "Escribe un teléfono válido."
          );

          return false;
        }
      }

      return true;
    };

  /* ======================================================
     PASOS EDICIÓN
  ====================================================== */

  const siguienteEditar =
    () => {
      if (
        !validarPasoEditar()
      ) {
        return;
      }

      if (
        pasoEditar <
        totalPasosEditar
      ) {
        setPasoEditar(
          (actual) =>
            actual + 1
        );

        setErrorGeneral(
          ""
        );
      }
    };

  const anteriorEditar =
    () => {
      if (
        pasoEditar >
        1
      ) {
        setPasoEditar(
          (actual) =>
            actual - 1
        );

        setErrorGeneral(
          ""
        );
      }
    };

  /* ======================================================
     BUSCAR DIRECCIÓN
  ====================================================== */

  const buscarDireccionEditar =
    async () => {
      if (
        !editUbicacion.trim()
      ) {
        setErrorGeneral(
          "Escribe una dirección."
        );

        return;
      }

      try {
        setBuscandoUbicacion(
          true
        );

        setErrorGeneral(
          ""
        );

        const params =
          new URLSearchParams({
            q:
              editUbicacion.trim(),

            format:
              "jsonv2",

            addressdetails:
              "1",

            limit:
              "1",

            countrycodes:
              "mx",

            "accept-language":
              "es",
          });

        const response =
          await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`
          );

        if (!response.ok) {
          throw new Error(
            "Error buscando ubicación"
          );
        }

        const resultados =
          await response.json();

        if (
          resultados.length ===
          0
        ) {
          setErrorGeneral(
            "No encontramos esa dirección."
          );

          return;
        }

        const resultado =
          resultados[0];

        setEditPosicion({
          lat:
            Number(
              resultado.lat
            ),

          lng:
            Number(
              resultado.lon
            ),
        });

        setEditUbicacion(
          resultado.display_name ||
          editUbicacion
        );

      } catch (error) {
        console.error(
          "Error buscando:",
          error
        );

        setErrorGeneral(
          "No pudimos buscar esa ubicación."
        );

      } finally {
        setBuscandoUbicacion(
          false
        );
      }
    };

  /* ======================================================
     GPS
  ====================================================== */

  const usarMiUbicacionEditar =
    () => {
      setErrorGeneral("");

      if (
        !navigator.geolocation
      ) {
        setErrorGeneral(
          "Tu navegador no permite obtener tu ubicación."
        );

        return;
      }

      setObteniendoGPS(
        true
      );

      navigator.geolocation.getCurrentPosition(
        async (
          position
        ) => {
          const lat =
            position.coords.latitude;

          const lng =
            position.coords.longitude;

          setEditPosicion({
            lat,
            lng,
          });

          try {
            const direccion =
              await obtenerDireccion(
                lat,
                lng
              );

            setEditUbicacion(
              direccion ||
              `${lat}, ${lng}`
            );
          } catch {
            setEditUbicacion(
              `${lat}, ${lng}`
            );
          } finally {
            setObteniendoGPS(
              false
            );
          }
        },

        () => {
          setObteniendoGPS(
            false
          );

          setErrorGeneral(
            "No pudimos obtener tu ubicación."
          );
        },

        {
          enableHighAccuracy:
            true,

          timeout:
            10000,

          maximumAge:
            0,
        }
      );
    };

  /* ======================================================
     NUEVAS FOTOS
  ====================================================== */

  const handleNuevasImagenes =
    (e) => {
      setErrorGeneral("");

      const archivos =
        Array.from(
          e.target.files ||
          []
        );

      const total =
        imagenesClienteEdit.length +
        nuevasImagenes.length +
        archivos.length;

      if (
        total >
        6
      ) {
        setErrorGeneral(
          "Puedes tener máximo 6 fotografías propias."
        );

        e.target.value =
          "";

        return;
      }

      for (
        const file of archivos
      ) {
        if (
          !file.type.startsWith(
            "image/"
          )
        ) {
          setErrorGeneral(
            "Solo puedes subir imágenes."
          );

          e.target.value =
            "";

          return;
        }

        if (
          file.size >
          5 *
            1024 *
            1024
        ) {
          setErrorGeneral(
            `La imagen "${file.name}" supera los 5 MB.`
          );

          e.target.value =
            "";

          return;
        }
      }

      setNuevasImagenes(
        (actuales) => [
          ...actuales,
          ...archivos,
        ]
      );

      e.target.value =
        "";
    };

  const quitarImagenCliente =
    (indice) => {
      setImagenesClienteEdit(
        (actuales) =>
          actuales.filter(
            (_, i) =>
              i !== indice
          )
      );
    };

  const quitarNuevaImagen =
    (indice) => {
      setNuevasImagenes(
        (actuales) =>
          actuales.filter(
            (_, i) =>
              i !== indice
          )
      );
    };

  /* ======================================================
     SUBIR CLOUDINARY
  ====================================================== */

  const subirImagen =
    async (file) => {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "upload_preset",
        "wealth"
      );

      const response =
        await fetch(
          "https://api.cloudinary.com/v1_1/dxj4iczvk/image/upload",
          {
            method:
              "POST",

            body:
              formData,
          }
        );

      if (!response.ok) {
        throw new Error(
          "No se pudo subir una imagen."
        );
      }

      const data =
        await response.json();

      if (
        !data.secure_url
      ) {
        throw new Error(
          "Cloudinary no devolvió una URL."
        );
      }

      return data.secure_url;
    };

  /* ======================================================
     GUARDAR EDICIÓN
  ====================================================== */

  const guardarCambiosSolicitud =
    async () => {
      if (
        !cotizacionEditando
      ) {
        return;
      }

      if (
        !validarPasoEditar()
      ) {
        return;
      }

      try {
        setProcesando(
          true
        );

        setErrorGeneral(
          ""
        );

        let nuevasUrls =
          [];

        if (
          nuevasImagenes.length >
          0
        ) {
          nuevasUrls =
            await Promise.all(
              nuevasImagenes.map(
                (file) =>
                  subirImagen(
                    file
                  )
              )
            );
        }

        const imagenesClienteFinal =
          [
            ...new Set([
              ...imagenesClienteEdit,
              ...nuevasUrls,
            ]),
          ];

        const todasLasImagenes =
          [
            ...new Set([
              ...imagenesProyectoEdit,
              ...imagenesClienteFinal,
            ]),
          ];

        await updateDoc(
          doc(
            db,
            "cotizaciones",
            cotizacionEditando.id
          ),

          {
            nombre:
              editNombre.trim(),

            descripcion:
              editDescripcion.trim(),

            tipo:
              editTipo,

            ubicacion:
              editUbicacion.trim(),

            latitud:
              editPosicion.lat,

            longitud:
              editPosicion.lng,

            medidas:
              editMedidas.trim(),

            fechaDeseada:
              editFechaDeseada ||
              null,

            presupuestoEstimadoCliente:
              editPresupuesto !==
              ""
                ? Number(
                    editPresupuesto
                  )
                : null,

            telefono:
              editTelefono.trim(),

            metodoContacto:
              editMetodoContacto,

            imagenesProyecto:
              imagenesProyectoEdit,

            imagenesCliente:
              imagenesClienteFinal,

            imagenes:
              todasLasImagenes,

            imagen:
              todasLasImagenes[0] ||
              null,

            solicitudModificadaCliente:
              true,

            fechaModificacionCliente:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),

            vistoPorAdmin:
              false,

            vistoPorCliente:
              true,

            mensajeAdmin:
              "El cliente modificó su solicitud.",
          }
        );

        setEditarOpen(
          false
        );

        setCotizacionEditando(
          null
        );

        setNuevasImagenes(
          []
        );

        setMensajeGeneral(
          "✅ La cotización fue modificada correctamente."
        );

      } catch (error) {
        console.error(
          "Error modificando cotización:",
          error
        );

        setErrorGeneral(
          "No se pudieron guardar los cambios."
        );

      } finally {
        setProcesando(
          false
        );
      }
    };

  /* ======================================================
     CANCELAR SOLICITUD
  ====================================================== */

  const cancelarSolicitud =
    async (
      cotizacion
    ) => {
      if (
        !puedeCancelarSolicitud(
          cotizacion
        )
      ) {
        return;
      }

      const confirmar =
        window.confirm(
          `¿Cancelar la solicitud "${cotizacion.nombre}"?\n\nWealth dejará de procesarla.`
        );

      if (!confirmar) {
        return;
      }

      try {
        setProcesando(
          true
        );

        await updateDoc(
          doc(
            db,
            "cotizaciones",
            cotizacion.id
          ),

          {
            estado:
              "cancelada_cliente",

            respuestaCliente:
              "cancelada",

            fechaCancelacionCliente:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),

            vistoPorAdmin:
              false,

            vistoPorCliente:
              true,

            mensajeAdmin:
              "El cliente canceló la solicitud.",
          }
        );

        setMensajeGeneral(
          "Solicitud cancelada."
        );

      } catch (error) {
        console.error(
          "Error cancelando:",
          error
        );

        setErrorGeneral(
          "No se pudo cancelar la solicitud."
        );

      } finally {
        setProcesando(
          false
        );
      }
    };

  /* ======================================================
     ACEPTAR PROPUESTA
  ====================================================== */

  const confirmarPropuesta =
    async () => {
      if (
        !cotizacionSeleccionada
      ) {
        return;
      }

      const precio =
        cotizacionSeleccionada.precioTotal ??
        cotizacionSeleccionada.total ??
        cotizacionSeleccionada.precio ??
        cotizacionSeleccionada.propuestaPrecio;

      const confirmar =
        window.confirm(
          `¿Aceptar la propuesta${
            precio
              ? ` por ${moneda(
                  precio
                )}`
              : ""
          }?`
        );

      if (!confirmar) {
        return;
      }

      try {
        setProcesando(
          true
        );

        await updateDoc(
          doc(
            db,
            "cotizaciones",
            cotizacionSeleccionada.id
          ),

          {
            estado:
              "aceptada_cliente",

            respuestaCliente:
              "aceptada",

            precioAceptado:
              precio !==
                undefined &&
              precio !==
                null
                ? Number(
                    precio
                  )
                : null,

            versionAceptada:
              cotizacionSeleccionada.versionPropuesta ||
              1,

            fechaRespuestaCliente:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),

            vistoPorAdmin:
              false,

            vistoPorCliente:
              true,

            mensajeAdmin:
              "El cliente aceptó la propuesta.",
          }
        );

        window.alert(
          "✅ Propuesta aceptada."
        );

      } catch (error) {
        console.error(
          "Error aceptando:",
          error
        );

      } finally {
        setProcesando(
          false
        );
      }
    };

  /* ======================================================
     SOLICITAR MODIFICACIÓN PROPUESTA
  ====================================================== */

  const solicitarModificacion =
    async () => {
      if (
        !cotizacionSeleccionada
      ) {
        return;
      }

      const motivo =
        window.prompt(
          "Describe qué deseas modificar:"
        );

      if (
        motivo ===
          null ||
        !motivo.trim()
      ) {
        return;
      }

      try {
        setProcesando(
          true
        );

        await updateDoc(
          doc(
            db,
            "cotizaciones",
            cotizacionSeleccionada.id
          ),

          {
            estado:
              "cambios_solicitados",

            respuestaCliente:
              "solicita_modificacion",

            mensajeCliente:
              motivo.trim(),

            fechaRespuestaCliente:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),

            vistoPorAdmin:
              false,

            vistoPorCliente:
              true,

            mensajeAdmin:
              "El cliente solicitó cambios.",
          }
        );

        window.alert(
          "Solicitud de cambios enviada."
        );

      } catch (error) {
        console.error(
          error
        );

      } finally {
        setProcesando(
          false
        );
      }
    };

  /* ======================================================
     RECHAZAR PROPUESTA
  ====================================================== */

  const rechazarPropuesta =
    async () => {
      if (
        !cotizacionSeleccionada
      ) {
        return;
      }

      const confirmar =
        window.confirm(
          "¿Seguro que deseas rechazar esta propuesta?"
        );

      if (!confirmar) {
        return;
      }

      try {
        setProcesando(
          true
        );

        await updateDoc(
          doc(
            db,
            "cotizaciones",
            cotizacionSeleccionada.id
          ),

          {
            estado:
              "rechazada_cliente",

            respuestaCliente:
              "rechazada",

            fechaRespuestaCliente:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),

            vistoPorAdmin:
              false,

            vistoPorCliente:
              true,
          }
        );

        window.alert(
          "Propuesta rechazada."
        );

      } catch (error) {
        console.error(
          error
        );

      } finally {
        setProcesando(
          false
        );
      }
    };

  /* ======================================================
     GALERÍA
  ====================================================== */

  const abrirGaleria =
    (
      imagenes,
      indiceInicial = 0
    ) => {
      const lista =
        Array.isArray(
          imagenes
        )
          ? imagenes.filter(
              Boolean
            )
          : imagenes
          ? [imagenes]
          : [];

      if (
        lista.length ===
        0
      ) {
        return;
      }

      setImgs(
        lista
      );

      setIndex(
        indiceInicial
      );

      setGaleriaOpen(
        true
      );
    };

  const siguienteImagen =
    () => {
      setIndex(
        (actual) =>
          actual + 1 >=
          imgs.length
            ? 0
            : actual + 1
      );
    };

  const anteriorImagen =
    () => {
      setIndex(
        (actual) =>
          actual === 0
            ? imgs.length -
              1
            : actual - 1
      );
    };

  /* ======================================================
     MONEDA
  ====================================================== */

  const moneda =
    (cantidad) => {
      if (
        cantidad ===
          undefined ||
        cantidad ===
          null ||
        cantidad ===
          ""
      ) {
        return "Pendiente";
      }

      const numero =
        Number(
          cantidad
        );

      if (
        Number.isNaN(
          numero
        )
      ) {
        return String(
          cantidad
        );
      }

      return numero.toLocaleString(
        "es-MX",
        {
          style:
            "currency",

          currency:
            "MXN",

          maximumFractionDigits:
            0,
        }
      );
    };

  /* ======================================================
     FECHA
  ====================================================== */

  const formatearFecha =
    (fecha) => {
      if (!fecha) {
        return "";
      }

      try {
        if (
          fecha.toDate
        ) {
          return fecha
            .toDate()
            .toLocaleString(
              "es-MX"
            );
        }

        return new Date(
          fecha
        ).toLocaleString(
          "es-MX"
        );

      } catch {
        return "";
      }
    };

  /* ======================================================
     PROGRESO
  ====================================================== */

  const porcentajeEditar =
    (
      (pasoEditar - 1) /
      (totalPasosEditar - 1)
    ) *
    100;

  /* ======================================================
     LOADING
  ====================================================== */

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

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-6 py-6">

      {/* =================================================
          BARRA SUPERIOR
      ================================================= */}

      {cotizaciones.length >
        0 && (
        <section className="max-w-7xl mx-auto mb-6">

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>

                <h1 className="text-xl font-bold">
                  Mis cotizaciones
                </h1>

                <p className="text-sm text-zinc-500 mt-1">

                  {modoSeleccion
                    ? `${seleccionadas.length} seleccionada${
                        seleccionadas.length ===
                        1
                          ? ""
                          : "s"
                      }`
                    : `${cotizaciones.length} cotización${
                        cotizaciones.length ===
                        1
                          ? ""
                          : "es"
                      }`}

                </p>

              </div>

              <div className="flex flex-wrap gap-3">

                {modoSeleccion && (
                  <button
                    type="button"
                    onClick={
                      seleccionarTodas
                    }
                    className="
                      px-4
                      py-3

                      bg-zinc-900

                      border
                      border-zinc-700

                      hover:border-yellow-500/50

                      rounded-xl

                      flex
                      items-center
                      gap-2

                      font-semibold
                      text-sm

                      transition
                    "
                  >

                    {todasSeleccionadas ? (
                      <FaCheckSquare className="text-yellow-500" />
                    ) : (
                      <FaSquare />
                    )}

                    {todasSeleccionadas
                      ? "Quitar todas"
                      : "Seleccionar todas"}

                  </button>
                )}

                {modoSeleccion &&
                  seleccionadas.length >
                    0 && (
                  <button
                    type="button"
                    onClick={
                      eliminarSeleccionadas
                    }
                    disabled={
                      procesando
                    }
                    className="
                      px-4
                      py-3

                      bg-red-600
                      hover:bg-red-500

                      rounded-xl

                      flex
                      items-center
                      gap-2

                      font-bold
                      text-sm

                      disabled:opacity-50

                      transition
                    "
                  >

                    <FaTrashAlt />

                    Eliminar seleccionadas

                    <span className="bg-black/20 px-2 py-0.5 rounded-full">
                      {
                        seleccionadas.length
                      }
                    </span>

                  </button>
                )}

                <button
                  type="button"
                  onClick={
                    alternarModoSeleccion
                  }
                  className={`
                    px-5
                    py-3

                    rounded-xl

                    border

                    flex
                    items-center
                    gap-2

                    font-semibold
                    text-sm

                    transition

                    ${
                      modoSeleccion
                        ? `
                          bg-yellow-500
                          border-yellow-500
                          text-black
                        `
                        : `
                          bg-zinc-900
                          border-zinc-700
                          text-white

                          hover:border-yellow-500/50
                        `
                    }
                  `}
                >

                  {modoSeleccion ? (
                    <FaTimes />
                  ) : (
                    <FaCheckSquare />
                  )}

                  {modoSeleccion
                    ? "Terminar selección"
                    : "Seleccionar"}

                </button>

              </div>

            </div>

            {modoSeleccion && (
              <div className="mt-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">

                <p className="text-xs text-zinc-400">
                  Selecciona las cotizaciones que quieras quitar de tu panel. El registro seguirá disponible para Wealth.
                </p>

              </div>
            )}

          </div>

        </section>
      )}

      {/* =================================================
          MENSAJES
      ================================================= */}

      <div className="max-w-7xl mx-auto">

        {mensajeGeneral && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-300 rounded-2xl p-4 flex items-center gap-3">

            <FaCheckCircle />

            {
              mensajeGeneral
            }

          </div>
        )}

        {errorGeneral &&
          !editarOpen && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4">

            {
              errorGeneral
            }

          </div>
        )}

        {cantidadNuevas >
          0 &&
          !modoSeleccion && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5">

            <div className="flex items-center gap-4">

              <FaBell className="text-yellow-500 text-2xl" />

              <div>

                <p className="font-bold">

                  {cantidadNuevas ===
                  1
                    ? "Tienes una actualización"
                    : `Tienes ${cantidadNuevas} actualizaciones`}

                </p>

                <p className="text-zinc-400 text-sm mt-1">
                  Wealth realizó cambios en tus cotizaciones.
                </p>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* =================================================
          SIN COTIZACIONES
      ================================================= */}

      {cotizaciones.length ===
        0 && (
        <div className="max-w-7xl mx-auto">

          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center">

            <FaMoneyBillWave className="mx-auto text-zinc-700 text-5xl" />

            <h2 className="text-2xl font-bold mt-5">
              Aún no tienes cotizaciones
            </h2>

            <p className="text-zinc-500 mt-2">
              Tus solicitudes aparecerán aquí.
            </p>

          </div>

        </div>
      )}

      {/* =================================================
          TARJETAS
      ================================================= */}

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {cotizaciones.map(
          (cotizacion) => {
            const imagenes =
              Array.isArray(
                cotizacion.imagenes
              ) &&
              cotizacion.imagenes.length >
                0
                ? cotizacion.imagenes
                : cotizacion.imagen
                ? [
                    cotizacion.imagen,
                  ]
                : [];

            const estado =
              obtenerEstado(
                cotizacion.estado
              );

            const mensajeEstado =
              obtenerMensajeEstado(
                cotizacion
              );

            const seleccionada =
              seleccionadas.includes(
                cotizacion.id
              );

            const editable =
              puedeEditarSolicitud(
                cotizacion
              );

            const cancelable =
              puedeCancelarSolicitud(
                cotizacion
              );

            const precio =
              cotizacion.precioTotal ??
              cotizacion.total ??
              cotizacion.precio ??
              cotizacion.propuestaPrecio;

            return (
              <article
                key={
                  cotizacion.id
                }
                onClick={() => {
                  if (
                    modoSeleccion
                  ) {
                    seleccionarCotizacion(
                      cotizacion.id
                    );
                  }
                }}
                className={`
                  relative
                  overflow-hidden

                  bg-zinc-950

                  rounded-3xl

                  border

                  transition-all
                  duration-300

                  ${
                    modoSeleccion
                      ? "cursor-pointer"
                      : ""
                  }

                  ${
                    seleccionada
                      ? `
                        border-yellow-500
                        ring-2
                        ring-yellow-500/20
                      `
                      : `
                        border-zinc-800
                      `
                  }

                  ${
                    cotizacion.estado ===
                    "cancelada_cliente"
                      ? "opacity-75"
                      : ""
                  }
                `}
              >

                {/* CHECK */}

                {modoSeleccion && (
                  <div className="absolute top-4 left-4 z-20">

                    <div
                      className={`
                        w-12
                        h-12

                        rounded-xl

                        border

                        flex
                        items-center
                        justify-center

                        shadow-xl

                        ${
                          seleccionada
                            ? `
                              bg-yellow-500
                              border-yellow-400
                              text-black
                            `
                            : `
                              bg-black/85
                              border-white/30
                              text-white
                            `
                        }
                      `}
                    >

                      {seleccionada ? (
                        <FaCheck />
                      ) : (
                        <FaSquare />
                      )}

                    </div>

                  </div>
                )}

                {/* IMAGEN */}

                <div className="relative h-64 bg-black">

                  {imagenes.length >
                  0 ? (
                    <img
                      src={
                        imagenes[0]
                      }
                      alt={
                        cotizacion.nombre ||
                        "Cotización Wealth"
                      }
                      onClick={(e) => {
                        e.stopPropagation();

                        if (
                          modoSeleccion
                        ) {
                          seleccionarCotizacion(
                            cotizacion.id
                          );

                          return;
                        }

                        abrirGaleria(
                          imagenes
                        );
                      }}
                      className="
                        w-full
                        h-full
                        object-contain

                        cursor-pointer
                      "
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">

                      Sin imagen

                    </div>
                  )}

                  {imagenes.length >
                    1 && (
                    <span className="absolute bottom-3 right-3 bg-black/80 border border-white/10 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-2">

                      <FaImages />

                      {
                        imagenes.length
                      } fotos

                    </span>
                  )}

                </div>

                {/* CONTENIDO */}

                <div className="p-6">

                  <div className="flex justify-between items-start gap-4">

                    <h2 className="text-xl font-bold capitalize">
                      {cotizacion.nombre ||
                        "Cotización"}
                    </h2>

                    <span
                      className={`
                        px-3
                        py-1.5

                        rounded-full

                        text-xs
                        font-bold

                        shrink-0

                        ${estado.color}
                      `}
                    >

                      {
                        estado.texto
                      }

                    </span>

                  </div>

                  {cotizacion.descripcion && (
                    <p className="text-zinc-400 text-sm leading-relaxed mt-4 line-clamp-4">

                      {
                        cotizacion.descripcion
                      }

                    </p>
                  )}

                  <div className="flex items-center gap-2 text-zinc-500 text-sm mt-5">

                    <FaCalendarAlt />

                    {cotizacion.fecha?.toDate
                      ? cotizacion.fecha
                          .toDate()
                          .toLocaleDateString(
                            "es-MX"
                          )
                      : "Sin fecha"}

                  </div>

                  {mensajeEstado &&
                    !modoSeleccion && (
                    <div
                      className={`
                        mt-5

                        border

                        rounded-2xl

                        p-4

                        ${mensajeEstado.clase}
                      `}
                    >

                      <div className="flex items-start gap-3">

                        <span className="text-xl mt-0.5">
                          {
                            mensajeEstado.icono
                          }
                        </span>

                        <div>

                          <p className="font-bold text-sm">
                            {
                              mensajeEstado.titulo
                            }
                          </p>

                          <p className="text-zinc-400 text-xs mt-1">
                            {
                              mensajeEstado.texto
                            }
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  {precio !==
                    undefined &&
                    precio !==
                      null &&
                    !modoSeleccion && (
                    <div className="mt-5 bg-black border border-zinc-800 rounded-2xl p-4">

                      <p className="text-yellow-500 text-xs uppercase tracking-wider font-bold">
                        Propuesta actual
                      </p>

                      <p className="text-2xl font-bold mt-2">

                        {
                          moneda(
                            precio
                          )
                        }

                      </p>

                    </div>
                  )}

                  {/* BOTONES */}

                  {!modoSeleccion &&
                    (editable ||
                      cancelable) && (
                    <div className="grid grid-cols-2 gap-3 mt-5">

                      {editable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            abrirEdicion(
                              cotizacion
                            );
                          }}
                          className="
                            py-3

                            bg-blue-500/10
                            hover:bg-blue-600

                            border
                            border-blue-500/30

                            text-blue-400
                            hover:text-white

                            rounded-xl

                            font-semibold

                            flex
                            items-center
                            justify-center
                            gap-2

                            transition
                          "
                        >

                          <FaEdit />

                          Modificar

                        </button>
                      )}

                      {cancelable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            cancelarSolicitud(
                              cotizacion
                            );
                          }}
                          className="
                            py-3

                            bg-red-500/10
                            hover:bg-red-600

                            border
                            border-red-500/30

                            text-red-400
                            hover:text-white

                            rounded-xl

                            font-semibold

                            flex
                            items-center
                            justify-center
                            gap-2

                            transition
                          "
                        >

                          <FaTimesCircle />

                          Cancelar

                        </button>
                      )}

                    </div>
                  )}

                  {!modoSeleccion && (
                    <button
                      type="button"
                      onClick={() =>
                        verPropuesta(
                          cotizacion
                        )
                      }
                      className="
                        w-full

                        mt-4

                        py-3.5

                        bg-yellow-500
                        hover:bg-yellow-400

                        text-black

                        rounded-xl

                        font-bold

                        flex
                        items-center
                        justify-center
                        gap-2

                        transition
                      "
                    >

                      <FaEye />

                      Ver detalles

                    </button>
                  )}

                  {modoSeleccion && (
                    <div
                      className={`
                        mt-5

                        py-3

                        text-center

                        rounded-xl

                        border

                        text-sm
                        font-semibold

                        ${
                          seleccionada
                            ? `
                              bg-yellow-500/10
                              border-yellow-500/40
                              text-yellow-400
                            `
                            : `
                              bg-zinc-900
                              border-zinc-800
                              text-zinc-500
                            `
                        }
                      `}
                    >

                      {seleccionada
                        ? "✓ Seleccionada"
                        : "Seleccionar"}

                    </div>
                  )}

                </div>

              </article>
            );
          }
        )}

      </div>

      {/* =================================================
          MODAL EDITAR
      ================================================= */}

      {editarOpen &&
        cotizacionEditando && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md overflow-y-auto">

          <div className="min-h-full px-3 md:px-6 py-6">

            <div className="max-w-5xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">

              {/* HEADER */}

              <header className="relative p-6 sm:p-8 md:p-10 border-b border-zinc-800">

                <button
                  type="button"
                  onClick={
                    cerrarEdicion
                  }
                  className="
                    absolute
                    right-6
                    top-6

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
                  "
                >
                  <FaTimes />
                </button>

                <p className="text-yellow-500 text-xs uppercase tracking-[0.25em] font-semibold">
                  Wealth
                </p>

                <h1 className="text-3xl md:text-4xl font-bold mt-3 pr-14">
                  Modificar cotización
                </h1>

                <p className="text-zinc-400 mt-3 max-w-2xl">
                  Actualiza la información de tu solicitud manteniendo el mismo formato utilizado al crearla.
                </p>

                {/* PROGRESO */}

                <div className="mt-8">

                  <div className="flex justify-between text-xs sm:text-sm mb-3">

                    <span
                      className={
                        pasoEditar >=
                        1
                          ? "text-yellow-500"
                          : "text-zinc-500"
                      }
                    >
                      Proyecto
                    </span>

                    <span
                      className={
                        pasoEditar >=
                        2
                          ? "text-yellow-500"
                          : "text-zinc-500"
                      }
                    >
                      Detalles
                    </span>

                    <span
                      className={
                        pasoEditar >=
                        3
                          ? "text-yellow-500"
                          : "text-zinc-500"
                      }
                    >
                      Imágenes
                    </span>

                    <span
                      className={
                        pasoEditar >=
                        4
                          ? "text-yellow-500"
                          : "text-zinc-500"
                      }
                    >
                      Confirmar
                    </span>

                  </div>

                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                      style={{
                        width:
                          `${porcentajeEditar}%`,
                      }}
                    />

                  </div>

                  <p className="text-zinc-500 text-xs mt-2">
                    Paso {pasoEditar} de {totalPasosEditar}
                  </p>

                </div>

              </header>

              {/* CUERPO */}

              <div className="p-6 sm:p-8 md:p-10">

                {errorGeneral && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4">

                    {
                      errorGeneral
                    }

                  </div>
                )}

                {/* =======================================
                    PASO 1
                ======================================= */}

                {pasoEditar ===
                  1 && (
                  <div className="space-y-6">

                    <div>

                      <h2 className="text-2xl font-semibold">
                        Actualiza tu proyecto
                      </h2>

                      <p className="text-zinc-400 mt-1">
                        Puedes modificar la información principal.
                      </p>

                    </div>

                    {imagenesProyectoEdit.length >
                      0 && (
                      <div>

                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">

                          <FaImages className="text-yellow-500" />

                          Proyecto de referencia

                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

                          {imagenesProyectoEdit.map(
                            (
                              imagen,
                              indice
                            ) => (
                              <div
                                key={`${imagen}-${indice}`}
                                className="aspect-square rounded-2xl overflow-hidden bg-black border border-yellow-500/20"
                              >

                                <img
                                  src={
                                    imagen
                                  }
                                  alt={`Referencia ${
                                    indice +
                                    1
                                  }`}
                                  className="w-full h-full object-cover"
                                />

                              </div>
                            )
                          )}

                        </div>

                      </div>
                    )}

                    <Campo>

                      <Label
                        icon={
                          <FaPen />
                        }
                      >
                        Nombre del proyecto
                      </Label>

                      <input
                        type="text"
                        value={
                          editNombre
                        }
                        onChange={(e) =>
                          setEditNombre(
                            e.target.value
                          )
                        }
                        className={
                          inputClass
                        }
                      />

                    </Campo>

                    <Campo>

                      <Label
                        icon={
                          <FaTag />
                        }
                      >
                        Tipo de proyecto
                      </Label>

                      <select
                        value={
                          editTipo
                        }
                        onChange={(e) =>
                          setEditTipo(
                            e.target.value
                          )
                        }
                        className={
                          inputClass
                        }
                      >
                        <option>
                          Construcción
                        </option>

                        <option>
                          Vidrio
                        </option>

                        <option>
                          Aluminio
                        </option>

                        <option>
                          Vidrio y aluminio
                        </option>

                        <option>
                          Remodelación
                        </option>

                        <option>
                          Inmobiliario
                        </option>

                        <option>
                          Otro
                        </option>
                      </select>

                    </Campo>

                    <Campo>

                      <Label
                        icon={
                          <FaPen />
                        }
                      >
                        ¿Qué necesitas realizar?
                      </Label>

                      <textarea
                        rows={6}
                        value={
                          editDescripcion
                        }
                        onChange={(e) =>
                          setEditDescripcion(
                            e.target.value
                          )
                        }
                        maxLength={
                          1000
                        }
                        className={
                          inputClass
                        }
                      />

                      <p className="text-xs text-zinc-600 text-right mt-2">
                        {
                          editDescripcion.length
                        }
                        /1000
                      </p>

                    </Campo>

                  </div>
                )}

                {/* =======================================
                    PASO 2
                ======================================= */}

                {pasoEditar ===
                  2 && (
                  <div className="space-y-7">

                    <div>

                      <h2 className="text-2xl font-semibold">
                        Detalles de tu espacio
                      </h2>

                      <p className="text-zinc-400 mt-1">
                        Actualiza ubicación, medidas, fecha o presupuesto.
                      </p>

                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">

                      <div className="space-y-4">

                        <Campo>

                          <Label
                            icon={
                              <FaMapMarkerAlt />
                            }
                          >
                            Dirección o referencia
                          </Label>

                          <div className="flex gap-2">

                            <input
                              value={
                                editUbicacion
                              }
                              onChange={(e) =>
                                setEditUbicacion(
                                  e.target.value
                                )
                              }
                              className={
                                inputClass
                              }
                            />

                            <button
                              type="button"
                              onClick={
                                buscarDireccionEditar
                              }
                              disabled={
                                buscandoUbicacion
                              }
                              className="
                                px-5

                                bg-yellow-500
                                hover:bg-yellow-400

                                text-black

                                rounded-2xl

                                flex
                                items-center
                                justify-center

                                disabled:opacity-50
                              "
                            >

                              <FaSearch />

                            </button>

                          </div>

                        </Campo>

                        <button
                          type="button"
                          onClick={
                            usarMiUbicacionEditar
                          }
                          disabled={
                            obteniendoGPS
                          }
                          className="
                            w-full

                            bg-zinc-800
                            hover:bg-zinc-700

                            border
                            border-zinc-700

                            rounded-2xl

                            px-4
                            py-3

                            flex
                            items-center
                            justify-center
                            gap-2
                          "
                        >

                          <FaCrosshairs className="text-yellow-500" />

                          {obteniendoGPS
                            ? "Obteniendo ubicación..."
                            : "Usar mi ubicación actual"}

                        </button>

                        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">

                          <p className="text-zinc-500 text-xs uppercase tracking-wider">
                            Coordenadas
                          </p>

                          <div className="grid grid-cols-2 gap-4 mt-3">

                            <div>

                              <p className="text-xs text-zinc-600">
                                Latitud
                              </p>

                              <p className="text-sm">
                                {editPosicion.lat.toFixed(
                                  6
                                )}
                              </p>

                            </div>

                            <div>

                              <p className="text-xs text-zinc-600">
                                Longitud
                              </p>

                              <p className="text-sm">
                                {editPosicion.lng.toFixed(
                                  6
                                )}
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                      <div className="rounded-3xl overflow-hidden border border-zinc-700">

                        <MapContainer
                          center={[
                            editPosicion.lat,
                            editPosicion.lng,
                          ]}
                          zoom={15}
                          scrollWheelZoom
                          style={{
                            height:
                              "390px",

                            width:
                              "100%",
                          }}
                        >

                          <TileLayer
                            attribution="&copy; OpenStreetMap contributors"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />

                          <RecentrarMapa
                            posicion={
                              editPosicion
                            }
                          />

                          <SelectorUbicacionEditar
                            posicion={
                              editPosicion
                            }
                            setPosicion={
                              setEditPosicion
                            }
                            setUbicacion={
                              setEditUbicacion
                            }
                            setError={
                              setErrorGeneral
                            }
                          />

                        </MapContainer>

                      </div>

                    </div>

                    <div className="grid md:grid-cols-2 gap-5">

                      <Campo>

                        <Label
                          icon={
                            <FaRulerCombined />
                          }
                        >
                          Medidas aproximadas
                        </Label>

                        <input
                          value={
                            editMedidas
                          }
                          onChange={(e) =>
                            setEditMedidas(
                              e.target.value
                            )
                          }
                          placeholder="Ej: 1.20 x 2 m"
                          className={
                            inputClass
                          }
                        />

                      </Campo>

                      <Campo>

                        <Label
                          icon={
                            <FaCalendarAlt />
                          }
                        >
                          Fecha deseada
                        </Label>

                        <input
                          type="date"
                          value={
                            editFechaDeseada
                          }
                          onChange={(e) =>
                            setEditFechaDeseada(
                              e.target.value
                            )
                          }
                          className={
                            inputClass
                          }
                        />

                      </Campo>

                    </div>

                    <Campo>

                      <Label
                        icon={
                          <FaDollarSign />
                        }
                      >
                        Presupuesto aproximado
                      </Label>

                      <input
                        type="number"
                        min={0}
                        value={
                          editPresupuesto
                        }
                        onChange={(e) =>
                          setEditPresupuesto(
                            e.target.value
                          )
                        }
                        className={
                          inputClass
                        }
                      />

                    </Campo>

                  </div>
                )}

                {/* =======================================
                    PASO 3
                ======================================= */}

                {pasoEditar ===
                  3 && (
                  <div className="space-y-8">

                    <div>

                      <h2 className="text-2xl font-semibold">
                        Imágenes
                      </h2>

                      <p className="text-zinc-400 mt-1">
                        Conserva, elimina o agrega fotografías de tu espacio.
                      </p>

                    </div>

                    {imagenesProyectoEdit.length >
                      0 && (
                      <section>

                        <div className="flex items-center gap-2">

                          <FaImages className="text-yellow-500" />

                          <h3 className="font-bold">
                            Proyecto de referencia
                          </h3>

                        </div>

                        <p className="text-zinc-500 text-xs mt-1">
                          Estas imágenes pertenecen al proyecto original y se conservan.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">

                          {imagenesProyectoEdit.map(
                            (
                              imagen,
                              indice
                            ) => (
                              <div
                                key={`${imagen}-${indice}`}
                                className="aspect-square rounded-2xl overflow-hidden border border-yellow-500/20"
                              >

                                <img
                                  src={
                                    imagen
                                  }
                                  alt="Referencia"
                                  className="w-full h-full object-cover"
                                />

                              </div>
                            )
                          )}

                        </div>

                      </section>
                    )}

                    {imagenesClienteEdit.length >
                      0 && (
                      <section>

                        <div className="flex items-center gap-2">

                          <FaCamera className="text-blue-400" />

                          <h3 className="font-bold">
                            Fotografías de tu espacio
                          </h3>

                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">

                          {imagenesClienteEdit.map(
                            (
                              imagen,
                              indice
                            ) => (
                              <div
                                key={`${imagen}-${indice}`}
                                className="relative aspect-square rounded-2xl overflow-hidden border border-blue-500/20"
                              >

                                <img
                                  src={
                                    imagen
                                  }
                                  alt="Cliente"
                                  className="w-full h-full object-cover"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    quitarImagenCliente(
                                      indice
                                    )
                                  }
                                  className="absolute top-2 right-2 w-9 h-9 bg-black/80 hover:bg-red-600 rounded-full flex items-center justify-center"
                                >

                                  <FaTimes />

                                </button>

                              </div>
                            )
                          )}

                        </div>

                      </section>
                    )}

                    <label
                      htmlFor="nuevasFotosCotizacion"
                      className="
                        block

                        border-2
                        border-dashed
                        border-zinc-700

                        hover:border-yellow-500/60

                        rounded-3xl

                        p-10

                        text-center

                        cursor-pointer

                        transition
                      "
                    >

                      <FaCloudUploadAlt className="text-yellow-500 text-4xl mx-auto" />

                      <p className="font-semibold mt-3">
                        Agregar fotografías
                      </p>

                      <p className="text-zinc-500 text-sm mt-2">
                        Máximo 6 fotografías propias.
                      </p>

                      <input
                        id="nuevasFotosCotizacion"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={
                          handleNuevasImagenes
                        }
                        className="hidden"
                      />

                    </label>

                    {previewsNuevos.length >
                      0 && (
                      <div>

                        <h3 className="text-sm text-zinc-400 mb-3">
                          Nuevas fotografías
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                          {previewsNuevos.map(
                            (
                              preview,
                              indice
                            ) => (
                              <div
                                key={`${preview.file.name}-${indice}`}
                                className="relative aspect-square rounded-2xl overflow-hidden border border-green-500/20"
                              >

                                <img
                                  src={
                                    preview.url
                                  }
                                  alt="Nueva"
                                  className="w-full h-full object-cover"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    quitarNuevaImagen(
                                      indice
                                    )
                                  }
                                  className="absolute top-2 right-2 w-9 h-9 bg-black/80 hover:bg-red-600 rounded-full flex items-center justify-center"
                                >

                                  <FaTimes />

                                </button>

                              </div>
                            )
                          )}

                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* =======================================
                    PASO 4
                ======================================= */}

                {pasoEditar ===
                  4 && (
                  <div className="space-y-7">

                    <div>

                      <h2 className="text-2xl font-semibold">
                        Confirma los cambios
                      </h2>

                      <p className="text-zinc-400 mt-1">
                        Revisa la información antes de guardar.
                      </p>

                    </div>

                    <div className="grid md:grid-cols-2 gap-5">

                      <Campo>

                        <Label
                          icon={
                            <FaPhone />
                          }
                        >
                          Teléfono
                        </Label>

                        <input
                          type="tel"
                          value={
                            editTelefono
                          }
                          onChange={(e) =>
                            setEditTelefono(
                              e.target.value
                            )
                          }
                          className={
                            inputClass
                          }
                        />

                      </Campo>

                      <Campo>

                        <Label
                          icon={
                            <FaWhatsapp />
                          }
                        >
                          Medio de contacto
                        </Label>

                        <select
                          value={
                            editMetodoContacto
                          }
                          onChange={(e) =>
                            setEditMetodoContacto(
                              e.target.value
                            )
                          }
                          className={
                            inputClass
                          }
                        >

                          <option>
                            WhatsApp
                          </option>

                          <option>
                            Teléfono
                          </option>

                          <option>
                            Correo electrónico
                          </option>

                        </select>

                      </Campo>

                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">

                      <p className="text-yellow-500 text-xs uppercase tracking-widest font-semibold">
                        Resumen actualizado
                      </p>

                      <h3 className="text-xl font-bold mt-2">
                        {
                          editNombre
                        }
                      </h3>

                      <div className="space-y-4 mt-6">

                        <ResumenItem
                          titulo="Tipo"
                          valor={
                            editTipo
                          }
                        />

                        <ResumenItem
                          titulo="Descripción"
                          valor={
                            editDescripcion
                          }
                        />

                        <ResumenItem
                          titulo="Ubicación"
                          valor={
                            editUbicacion
                          }
                        />

                        <ResumenItem
                          titulo="Medidas"
                          valor={
                            editMedidas ||
                            "No especificadas"
                          }
                        />

                        <ResumenItem
                          titulo="Fecha"
                          valor={
                            editFechaDeseada ||
                            "Sin fecha"
                          }
                        />

                        <ResumenItem
                          titulo="Presupuesto"
                          valor={
                            editPresupuesto
                              ? `$${Number(
                                  editPresupuesto
                                ).toLocaleString(
                                  "es-MX"
                                )} MXN`
                              : "No especificado"
                          }
                        />

                        <ResumenItem
                          titulo="Imágenes de referencia"
                          valor={
                            imagenesProyectoEdit.length
                          }
                        />

                        <ResumenItem
                          titulo="Fotos propias"
                          valor={
                            imagenesClienteEdit.length +
                            nuevasImagenes.length
                          }
                        />

                        <ResumenItem
                          titulo="Contacto"
                          valor={`${editTelefono} · ${editMetodoContacto}`}
                        />

                      </div>

                    </div>

                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">

                      <p className="text-zinc-300 text-sm">
                        Wealth recibirá una notificación indicando que modificaste esta solicitud.
                      </p>

                    </div>

                  </div>
                )}

                {/* NAVEGACIÓN */}

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-10 pt-6 border-t border-zinc-800">

                  {pasoEditar >
                  1 ? (
                    <button
                      type="button"
                      onClick={
                        anteriorEditar
                      }
                      disabled={
                        procesando
                      }
                      className="
                        px-6
                        py-4

                        border
                        border-zinc-700

                        hover:bg-zinc-800

                        rounded-2xl

                        flex
                        items-center
                        justify-center
                        gap-2
                      "
                    >

                      <FaArrowLeft />

                      Anterior

                    </button>
                  ) : (
                    <div />
                  )}

                  {pasoEditar <
                    totalPasosEditar && (
                    <button
                      type="button"
                      onClick={
                        siguienteEditar
                      }
                      className="
                        px-8
                        py-4

                        bg-yellow-500
                        hover:bg-yellow-400

                        text-black

                        rounded-2xl

                        font-bold

                        flex
                        items-center
                        justify-center
                        gap-2
                      "
                    >

                      Continuar

                      <FaArrowRight />

                    </button>
                  )}

                  {pasoEditar ===
                    totalPasosEditar && (
                    <button
                      type="button"
                      onClick={
                        guardarCambiosSolicitud
                      }
                      disabled={
                        procesando
                      }
                      className="
                        px-8
                        py-4

                        bg-yellow-500
                        hover:bg-yellow-400

                        text-black

                        rounded-2xl

                        font-bold

                        flex
                        items-center
                        justify-center
                        gap-2

                        disabled:opacity-50
                      "
                    >

                      <FaSave />

                      {procesando
                        ? "Guardando..."
                        : "Guardar cambios"}

                    </button>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          MODAL DETALLES
      ================================================= */}

      {propuestaOpen &&
        cotizacionSeleccionada && (
        <div
          className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() =>
            setPropuestaOpen(
              false
            )
          }
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-700 rounded-3xl"
          >

            {(() => {
              const c =
                cotizacionSeleccionada;

              const estado =
                obtenerEstado(
                  c.estado
                );

              const precio =
                c.precioTotal ??
                c.total ??
                c.precio ??
                c.propuestaPrecio;

              const puedeResponder =
                [
                  "cotizada",
                  "propuesta_enviada",
                  "propuesta_modificada",
                ].includes(
                  c.estado
                );

              return (
                <>

                  <header className="p-6 md:p-8 border-b border-zinc-800 flex justify-between gap-4">

                    <div>

                      <p className="text-yellow-500 text-xs uppercase tracking-widest font-bold">
                        Cotización Wealth
                      </p>

                      <h2 className="text-3xl font-bold mt-2">
                        {
                          c.nombre
                        }
                      </h2>

                      <span
                        className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${estado.color}`}
                      >

                        {
                          estado.texto
                        }

                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPropuestaOpen(
                          false
                        )
                      }
                      className="text-zinc-400 hover:text-white text-3xl"
                    >
                      ×
                    </button>

                  </header>

                  <div className="p-6 md:p-8">

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

                      <p className="text-xs text-zinc-500 uppercase tracking-wider">
                        Tu solicitud
                      </p>

                      <p className="text-zinc-300 mt-3 whitespace-pre-line">
                        {
                          c.descripcion
                        }
                      </p>

                    </div>

                    {puedeEditarSolicitud(
                      c
                    ) && (
                      <div className="grid md:grid-cols-2 gap-3 mt-5">

                        <button
                          type="button"
                          onClick={() => {
                            setPropuestaOpen(
                              false
                            );

                            abrirEdicion(
                              c
                            );
                          }}
                          className="bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                        >

                          <FaEdit />

                          Modificar solicitud

                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            cancelarSolicitud(
                              c
                            )
                          }
                          className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                        >

                          <FaTimesCircle />

                          Cancelar solicitud

                        </button>

                      </div>
                    )}

                    {precio !==
                      undefined &&
                      precio !==
                        null && (
                      <div className="mt-6 bg-black border border-zinc-800 rounded-2xl p-5">

                        <p className="text-zinc-500 text-sm">
                          Precio total
                        </p>

                        <p className="text-3xl font-bold mt-1">
                          {
                            moneda(
                              precio
                            )
                          }
                        </p>

                      </div>
                    )}

                    {puedeResponder && (
                      <div className="mt-8 pt-6 border-t border-zinc-800">

                        <h3 className="text-xl font-bold">
                          ¿Qué deseas hacer?
                        </h3>

                        <button
                          type="button"
                          onClick={
                            confirmarPropuesta
                          }
                          disabled={
                            procesando
                          }
                          className="w-full bg-green-600 hover:bg-green-500 mt-5 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                        >

                          <FaCheckCircle />

                          Aceptar propuesta

                        </button>

                        <div className="grid md:grid-cols-2 gap-3 mt-3">

                          <button
                            type="button"
                            onClick={
                              solicitarModificacion
                            }
                            className="bg-orange-500/10 border border-orange-500/40 text-orange-400 py-4 rounded-2xl font-semibold"
                          >
                            Solicitar modificación
                          </button>

                          <button
                            type="button"
                            onClick={
                              rechazarPropuesta
                            }
                            className="bg-red-500/10 border border-red-500/40 text-red-400 py-4 rounded-2xl font-semibold"
                          >
                            Rechazar propuesta
                          </button>

                        </div>

                      </div>
                    )}

                    {Array.isArray(
                      c.historialPropuestas
                    ) &&
                      c.historialPropuestas.length >
                        0 && (
                        <div className="mt-8 pt-6 border-t border-zinc-800">

                          <div className="flex items-center gap-2">

                            <FaHistory className="text-yellow-500" />

                            <h3 className="font-bold">
                              Historial de propuestas
                            </h3>

                          </div>

                          <div className="space-y-3 mt-4">

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

                                  <p className="font-semibold">
                                    Propuesta #
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

      {/* =================================================
          GALERÍA GRANDE
      ================================================= */}

      {galeriaOpen &&
        imgs.length >
          0 && (
        <div
          className="fixed inset-0 z-[130] bg-black/95 flex items-center justify-center"
          onClick={() =>
            setGaleriaOpen(
              false
            )
          }
        >

          {imgs.length >
            1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                anteriorImagen();
              }}
              className="absolute left-5 text-white text-5xl z-10"
            >
              ❮
            </button>
          )}

          <img
            src={
              imgs[index]
            }
            alt="Cotización"
            className="max-w-[90%] max-h-[90%] object-contain rounded-xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          />

          {imgs.length >
            1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                siguienteImagen();
              }}
              className="absolute right-5 text-white text-5xl z-10"
            >
              ❯
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setGaleriaOpen(
                false
              )
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

/* ======================================================
   COMPONENTES AUXILIARES
====================================================== */

function Campo({
  children,
}) {
  return (
    <div>
      {children}
    </div>
  );
}

function Label({
  children,
  icon,
}) {
  return (
    <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">

      <span className="text-yellow-500">
        {icon}
      </span>

      {children}

    </label>
  );
}

function ResumenItem({
  titulo,
  valor,
}) {
  return (
    <div className="grid sm:grid-cols-[190px_1fr] gap-1 sm:gap-4 text-sm">

      <span className="text-zinc-500">
        {titulo}
      </span>

      <span className="text-zinc-200 break-words">
        {valor}
      </span>

    </div>
  );
}

/* ======================================================
   ESTILO INPUT
====================================================== */

const inputClass = `
  w-full

  p-4

  rounded-2xl

  bg-zinc-800

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

export default Cotizaciones;