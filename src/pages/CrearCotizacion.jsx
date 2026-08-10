import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  db,
  auth,
} from "../firebase.config";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaCheck,
  FaCloudUploadAlt,
  FaCrosshairs,
  FaDollarSign,
  FaImage,
  FaImages,
  FaMapMarkerAlt,
  FaPen,
  FaPhone,
  FaRulerCombined,
  FaSearch,
  FaTag,
  FaTimes,
  FaWhatsapp,
  FaLink,
  FaCamera,
} from "react-icons/fa";

// ======================================================
// CONFIGURACIÓN LEAFLET
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ======================================================
// CAMPECHE
// ======================================================

const POSICION_CAMPECHE = {
  lat: 19.8301,
  lng: -90.5349,
};

// ======================================================
// CATEGORÍA → TIPO
// ======================================================

const convertirCategoriaATipo =
  (categoria) => {
    if (!categoria) {
      return "Construcción";
    }

    const valor =
      categoria.toLowerCase();

    if (
      valor.includes(
        "constru"
      )
    ) {
      return "Construcción";
    }

    if (
      valor.includes(
        "alumin"
      ) &&
      valor.includes(
        "vidrio"
      )
    ) {
      return "Vidrio y aluminio";
    }

    if (
      valor.includes(
        "alumin"
      )
    ) {
      return "Aluminio";
    }

    if (
      valor.includes(
        "vidrio"
      )
    ) {
      return "Vidrio";
    }

    if (
      valor.includes(
        "remodel"
      )
    ) {
      return "Remodelación";
    }

    if (
      valor.includes(
        "inmobil"
      )
    ) {
      return "Inmobiliario";
    }

    return "Otro";
  };

// ======================================================
// NORMALIZAR IMÁGENES DE PROYECTO
// ======================================================

const obtenerImagenesProyecto =
  (proyecto) => {
    if (!proyecto) {
      return [];
    }

    const lista = [];

    // ================================================
    // IMAGENES[]
    // ================================================

    if (
      Array.isArray(
        proyecto.imagenes
      )
    ) {
      proyecto.imagenes.forEach(
        (item) => {
          if (
            typeof item ===
              "string" &&
            item.trim()
          ) {
            lista.push(
              item.trim()
            );

            return;
          }

          if (
            item &&
            typeof item ===
              "object"
          ) {
            const url =
              item.url ||
              item.secure_url ||
              item.src ||
              item.imagen;

            if (url) {
              lista.push(
                url
              );
            }
          }
        }
      );
    }

    // ================================================
    // IMAGEN PRINCIPAL
    // ================================================

    if (
      proyecto.imagen &&
      typeof proyecto.imagen ===
        "string"
    ) {
      lista.push(
        proyecto.imagen
      );
    }

    return [
      ...new Set(
        lista.filter(Boolean)
      ),
    ];
  };

// ======================================================
// GEOCODIFICACIÓN INVERSA
// ======================================================

const obtenerDireccion =
  async (lat, lng) => {
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

// ======================================================
// RECENTRAR MAPA
// ======================================================

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

// ======================================================
// SELECTOR UBICACIÓN
// ======================================================

function SelectorUbicacion({
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

        if (direccion) {
          setUbicacion(
            direccion
          );
        } else {
          setUbicacion(
            `${lat.toFixed(
              6
            )}, ${lng.toFixed(
              6
            )}`
          );
        }

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

        setError(
          "Seleccionamos el punto, pero no pudimos obtener la dirección automáticamente."
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
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker =
            e.target;

          const nuevaPosicion =
            marker.getLatLng();

          actualizarUbicacion(
            nuevaPosicion.lat,
            nuevaPosicion.lng
          );
        },
      }}
    >

      <Popup>
        Ubicación seleccionada del proyecto
      </Popup>

    </Marker>
  );
}

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

function CrearCotizacion() {
  const location =
    useLocation();

  // ====================================================
  // PROYECTO SELECCIONADO
  // ====================================================

  const proyectoReferencia =
    location.state?.proyecto ||
    null;

  // ====================================================
  // TODAS LAS IMÁGENES DEL PROYECTO
  // ====================================================

  const imagenesProyecto =
    useMemo(() => {
      return obtenerImagenesProyecto(
        proyectoReferencia
      );

    }, [
      proyectoReferencia,
    ]);

  // ====================================================
  // PASOS
  // ====================================================

  const [paso, setPaso] =
    useState(1);

  const totalPasos = 4;

  // ====================================================
  // INFORMACIÓN
  // ====================================================

  const [nombre, setNombre] =
    useState(
      proyectoReferencia
        ?.nombre ||
        ""
    );

  const [
    descripcion,
    setDescripcion,
  ] = useState(
    proyectoReferencia
      ? `Me interesa realizar un trabajo similar al proyecto "${proyectoReferencia.nombre}". ${
          proyectoReferencia.descripcion ||
          ""
        }`
      : ""
  );

  const [tipo, setTipo] =
    useState(
      proyectoReferencia
        ? convertirCategoriaATipo(
            proyectoReferencia.categoria
          )
        : "Construcción"
    );

  // ====================================================
  // DETALLES
  // ====================================================

  const [
    ubicacion,
    setUbicacion,
  ] = useState("");

  const [
    medidas,
    setMedidas,
  ] = useState("");

  const [
    fechaDeseada,
    setFechaDeseada,
  ] = useState("");

  const [
    presupuestoEstimado,
    setPresupuestoEstimado,
  ] = useState("");

  // ====================================================
  // MAPA
  // ====================================================

  const [
    posicion,
    setPosicion,
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

  // ====================================================
  // CONTACTO
  // ====================================================

  const [
    telefono,
    setTelefono,
  ] = useState("");

  const [
    metodoContacto,
    setMetodoContacto,
  ] = useState(
    "WhatsApp"
  );

  // ====================================================
  // IMÁGENES CLIENTE
  // ====================================================

  const [
    imagenes,
    setImagenes,
  ] = useState([]);

  // ====================================================
  // ESTADOS
  // ====================================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    mensaje,
    setMensaje,
  ] = useState("");

  // ====================================================
  // PREVIEWS
  // ====================================================

  const previews =
    useMemo(() => {
      return imagenes.map(
        (file) => ({
          file,

          url:
            URL.createObjectURL(
              file
            ),
        })
      );

    }, [imagenes]);

  useEffect(() => {
    return () => {
      previews.forEach(
        (preview) => {
          URL.revokeObjectURL(
            preview.url
          );
        }
      );
    };

  }, [previews]);

  // ====================================================
  // CLOUDINARY
  // ====================================================

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

      const res =
        await fetch(
          "https://api.cloudinary.com/v1_1/dxj4iczvk/image/upload",
          {
            method:
              "POST",

            body:
              formData,
          }
        );

      if (!res.ok) {
        throw new Error(
          "No se pudo subir una de las imágenes."
        );
      }

      const data =
        await res.json();

      if (
        !data.secure_url
      ) {
        throw new Error(
          "Cloudinary no devolvió la URL de la imagen."
        );
      }

      return data.secure_url;
    };

  // ====================================================
  // IMÁGENES CLIENTE
  // ====================================================

  const handleImagenes =
    (e) => {
      setError("");

      const nuevosArchivos =
        Array.from(
          e.target.files ||
            []
        );

      if (
        nuevosArchivos.length ===
        0
      ) {
        return;
      }

      if (
        imagenes.length +
          nuevosArchivos.length >
        6
      ) {
        setError(
          "Puedes subir un máximo de 6 imágenes propias."
        );

        e.target.value =
          "";

        return;
      }

      for (
        const file of
        nuevosArchivos
      ) {
        if (
          !file.type.startsWith(
            "image/"
          )
        ) {
          setError(
            "Solo puedes subir archivos de imagen."
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
          setError(
            `La imagen "${file.name}" supera el límite de 5 MB.`
          );

          e.target.value =
            "";

          return;
        }
      }

      setImagenes(
        (prev) => [
          ...prev,
          ...nuevosArchivos,
        ]
      );

      e.target.value = "";
    };

  // ====================================================
  // ELIMINAR FOTO CLIENTE
  // ====================================================

  const eliminarImagen =
    (index) => {
      setImagenes(
        (prev) =>
          prev.filter(
            (_, i) =>
              i !== index
          )
      );
    };

  // ====================================================
  // BUSCAR DIRECCIÓN
  // ====================================================

  const buscarDireccion =
    async () => {
      if (
        !ubicacion.trim()
      ) {
        setError(
          "Escribe una dirección o referencia para buscar."
        );

        return;
      }

      try {
        setBuscandoUbicacion(
          true
        );

        setError("");

        const params =
          new URLSearchParams({
            q:
              ubicacion.trim(),

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
            "No se pudo buscar la ubicación."
          );
        }

        const resultados =
          await response.json();

        if (
          !resultados.length
        ) {
          setError(
            "No encontramos esa dirección. Prueba agregando colonia, ciudad y estado."
          );

          return;
        }

        const resultado =
          resultados[0];

        const lat =
          Number(
            resultado.lat
          );

        const lng =
          Number(
            resultado.lon
          );

        setPosicion({
          lat,
          lng,
        });

        setUbicacion(
          resultado.display_name ||
            ubicacion
        );

      } catch (error) {
        console.error(
          "Error buscando dirección:",
          error
        );

        setError(
          "No pudimos buscar esa dirección en este momento."
        );

      } finally {
        setBuscandoUbicacion(
          false
        );
      }
    };

  // ====================================================
  // UBICACIÓN ACTUAL
  // ====================================================

  const usarMiUbicacion =
    () => {
      setError("");

      if (
        !navigator.geolocation
      ) {
        setError(
          "Tu navegador no permite obtener la ubicación."
        );

        return;
      }

      setObteniendoGPS(
        true
      );

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat =
            position.coords
              .latitude;

          const lng =
            position.coords
              .longitude;

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

            if (direccion) {
              setUbicacion(
                direccion
              );
            } else {
              setUbicacion(
                `${lat.toFixed(
                  6
                )}, ${lng.toFixed(
                  6
                )}`
              );
            }

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

          setError(
            "No se pudo obtener tu ubicación. Puedes seleccionar el punto manualmente en el mapa."
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

  // ====================================================
  // VALIDACIONES
  // ====================================================

  const validarPaso =
    () => {
      setError("");

      if (
        paso === 1
      ) {
        if (
          !nombre.trim()
        ) {
          setError(
            "Escribe un nombre para el proyecto."
          );

          return false;
        }

        if (
          !descripcion.trim()
        ) {
          setError(
            "Describe el trabajo que necesitas."
          );

          return false;
        }

        if (
          descripcion
            .trim()
            .length < 10
        ) {
          setError(
            "La descripción debe contener al menos 10 caracteres."
          );

          return false;
        }
      }

      if (
        paso === 2
      ) {
        if (
          !ubicacion.trim()
        ) {
          setError(
            "Selecciona o escribe la ubicación del proyecto."
          );

          return false;
        }

        if (!posicion) {
          setError(
            "Selecciona la ubicación del proyecto en el mapa."
          );

          return false;
        }
      }

      if (
        paso === 4
      ) {
        if (
          !telefono.trim()
        ) {
          setError(
            "Ingresa un número de teléfono."
          );

          return false;
        }

        const telefonoLimpio =
          telefono.replace(
            /\D/g,
            ""
          );

        if (
          telefonoLimpio.length <
          10
        ) {
          setError(
            "Ingresa un número de teléfono válido de al menos 10 dígitos."
          );

          return false;
        }
      }

      return true;
    };

  // ====================================================
  // NAVEGACIÓN
  // ====================================================

  const siguientePaso =
    () => {
      if (
        !validarPaso()
      ) {
        return;
      }

      if (
        paso <
        totalPasos
      ) {
        setPaso(
          (prev) =>
            prev + 1
        );

        setError("");
        setMensaje("");
      }
    };

  const pasoAnterior =
    () => {
      if (
        paso > 1
      ) {
        setPaso(
          (prev) =>
            prev - 1
        );

        setError("");
      }
    };

  // ====================================================
  // RESET
  // ====================================================

  const resetFormulario =
    () => {
      setNombre("");
      setDescripcion("");

      setTipo(
        "Construcción"
      );

      setUbicacion("");
      setMedidas("");
      setFechaDeseada("");

      setPresupuestoEstimado(
        ""
      );

      setTelefono("");

      setMetodoContacto(
        "WhatsApp"
      );

      setImagenes([]);

      setPosicion(
        POSICION_CAMPECHE
      );

      setPaso(1);
    };

  // ====================================================
  // ENVIAR COTIZACIÓN
  // ====================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");
      setMensaje("");

      if (
        !validarPaso()
      ) {
        return;
      }

      if (
        !auth.currentUser
      ) {
        setError(
          "Debes iniciar sesión para enviar una cotización."
        );

        return;
      }

      try {
        setLoading(true);

        // ==============================================
        // FOTOS DEL CLIENTE
        // ==============================================

        let imagenesClienteUrls =
          [];

        if (
          imagenes.length >
          0
        ) {
          imagenesClienteUrls =
            await Promise.all(
              imagenes.map(
                (img) =>
                  subirImagen(
                    img
                  )
              )
            );
        }

        // ==============================================
        // TODAS LAS IMÁGENES
        // ==============================================

        const todasLasImagenes =
          [
            ...new Set([
              ...imagenesProyecto,
              ...imagenesClienteUrls,
            ]),
          ];

        // ==============================================
        // FIRESTORE
        // ==============================================

        await addDoc(
          collection(
            db,
            "cotizaciones"
          ),
          {
            // ==========================================
            // ORIGEN
            // ==========================================

            origenCotizacion:
              proyectoReferencia
                ? "proyecto_catalogo"
                : "solicitud_directa",

            // ==========================================
            // REFERENCIA
            // ==========================================

            proyectoReferenciaId:
              proyectoReferencia
                ?.id ||
              null,

            proyectoReferenciaNombre:
              proyectoReferencia
                ?.nombre ||
              null,

            proyectoReferenciaCategoria:
              proyectoReferencia
                ?.categoria ||
              null,

            proyectoReferenciaDescripcion:
              proyectoReferencia
                ?.descripcion ||
              null,

            // ==========================================
            // TODAS LAS FOTOS DE REFERENCIA
            // ==========================================

            imagenesProyecto:
              imagenesProyecto,

            // ==========================================
            // DATOS DEL CLIENTE
            // ==========================================

            nombre:
              nombre.trim(),

            descripcion:
              descripcion.trim(),

            tipo,

            // ==========================================
            // UBICACIÓN
            // ==========================================

            ubicacion:
              ubicacion.trim(),

            latitud:
              posicion?.lat ??
              null,

            longitud:
              posicion?.lng ??
              null,

            // ==========================================
            // DETALLES
            // ==========================================

            medidas:
              medidas.trim(),

            fechaDeseada:
              fechaDeseada ||
              null,

            presupuestoEstimadoCliente:
              presupuestoEstimado !==
              ""
                ? Number(
                    presupuestoEstimado
                  )
                : null,

            // ==========================================
            // CONTACTO
            // ==========================================

            telefono:
              telefono.trim(),

            metodoContacto,

            // ==========================================
            // FOTOS SUBIDAS POR CLIENTE
            // ==========================================

            imagenesCliente:
              imagenesClienteUrls,

            // ==========================================
            // TODAS JUNTAS
            // ==========================================

            imagenes:
              todasLasImagenes,

            // Primera foto para compatibilidad
            imagen:
              todasLasImagenes[0] ||
              null,

            // ==========================================
            // USUARIO
            // ==========================================

            usuario:
              auth.currentUser
                .email ||
              auth.currentUser
                .phoneNumber ||
              "",

            uid:
              auth.currentUser.uid,

            // ==========================================
            // ESTADO
            // ==========================================

            estado:
              "pendiente",

            leido:
              false,

            vistoPorAdmin:
              false,

            vistoPorCliente:
              true,

            // ==========================================
            // PROPUESTA ADMIN
            // ==========================================

            precioTotal:
              null,

            anticipo:
              null,

            saldo:
              null,

            versionPropuesta:
              0,

            historialPropuestas:
              [],

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

            // ==========================================
            // RESPUESTA CLIENTE
            // ==========================================

            respuestaCliente:
              "sin_respuesta",

            mensajeCliente:
              "",

            fechaRespuestaCliente:
              null,

            precioAceptado:
              null,

            versionAceptada:
              null,

            // ==========================================
            // PAGOS
            // ==========================================

            estadoPago:
              "sin_pago",

            comprobantePago:
              null,

            // ==========================================
            // FECHAS
            // ==========================================

            fecha:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),
          }
        );

        setMensaje(
          "¡Solicitud enviada correctamente! Nuestro equipo revisará la información y preparará tu propuesta."
        );

        resetFormulario();

      } catch (error) {
        console.error(
          "Error al enviar cotización:",
          error
        );

        setError(
          "Ocurrió un error al enviar la cotización. Intenta nuevamente."
        );

      } finally {
        setLoading(false);
      }
    };

  // ====================================================
  // PROGRESO
  // ====================================================

  const porcentaje =
    (
      (paso - 1) /
      (totalPasos - 1)
    ) *
    100;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">

        {/* ============================================== */}
        {/* HEADER */}
        {/* ============================================== */}

        <div className="p-6 sm:p-8 md:p-10 border-b border-zinc-800">

          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-yellow-500 mb-3">
            Wealth
          </span>

          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {proyectoReferencia
              ? "Cotizar proyecto"
              : "Solicitar cotización"}
          </h1>

          <p className="text-zinc-400 mt-3 max-w-2xl">
            {proyectoReferencia
              ? "Ya tomamos como referencia el proyecto que seleccionaste. Todas sus imágenes estarán incluidas en la solicitud."
              : "Cuéntanos qué necesitas. Entre más información proporciones, más precisa podrá ser nuestra propuesta."}
          </p>

          {/* ========================================== */}
          {/* PROYECTO SELECCIONADO */}
          {/* ========================================== */}

          {proyectoReferencia && (
            <div className="mt-6 bg-yellow-500/5 border border-yellow-500/20 rounded-3xl p-5">

              <div className="flex flex-col sm:flex-row gap-5">

                {imagenesProyecto.length >
                  0 && (
                  <img
                    src={
                      imagenesProyecto[0]
                    }
                    alt={
                      proyectoReferencia.nombre
                    }
                    className="w-full sm:w-28 h-28 rounded-2xl object-cover border border-zinc-700 shrink-0"
                  />
                )}

                <div className="min-w-0 flex-1">

                  <p className="text-xs uppercase tracking-wider text-yellow-500 font-semibold flex items-center gap-2">

                    <FaLink />

                    Proyecto de referencia

                  </p>

                  <p className="text-white text-xl font-bold mt-2">
                    {
                      proyectoReferencia.nombre
                    }
                  </p>

                  {proyectoReferencia.categoria && (
                    <p className="text-zinc-500 text-sm mt-1">
                      {
                        proyectoReferencia.categoria
                      }
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">

                    <FaImages className="text-yellow-500" />

                    <span>
                      {imagenesProyecto.length}{" "}
                      {imagenesProyecto.length ===
                      1
                        ? "imagen incluida"
                        : "imágenes incluidas"}
                    </span>

                  </div>

                </div>

              </div>

              {/* TODAS LAS MINIATURAS */}

              {imagenesProyecto.length >
                0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-5">

                  {imagenesProyecto.map(
                    (
                      imagen,
                      index
                    ) => (
                      <div
                        key={`${imagen}-${index}`}
                        className="aspect-square rounded-xl overflow-hidden border border-zinc-700 bg-black"
                      >

                        <img
                          src={imagen}
                          alt={`Referencia ${
                            index + 1
                          }`}
                          className="w-full h-full object-cover"
                        />

                      </div>
                    )
                  )}

                </div>
              )}

            </div>
          )}

          {/* PROGRESO */}

          <div className="mt-8">

            <div className="flex justify-between text-xs sm:text-sm mb-3">

              <span
                className={
                  paso >= 1
                    ? "text-yellow-500"
                    : "text-zinc-500"
                }
              >
                Proyecto
              </span>

              <span
                className={
                  paso >= 2
                    ? "text-yellow-500"
                    : "text-zinc-500"
                }
              >
                Detalles
              </span>

              <span
                className={
                  paso >= 3
                    ? "text-yellow-500"
                    : "text-zinc-500"
                }
              >
                Imágenes
              </span>

              <span
                className={
                  paso >= 4
                    ? "text-yellow-500"
                    : "text-zinc-500"
                }
              >
                Confirmar
              </span>

            </div>

            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">

              <div
                className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                style={{
                  width:
                    `${porcentaje}%`,
                }}
              />

            </div>

            <p className="text-zinc-500 text-xs mt-2">
              Paso {paso} de {totalPasos}
            </p>

          </div>

        </div>

        {/* ============================================== */}
        {/* FORM */}
        {/* ============================================== */}

        <form
          onSubmit={
            handleSubmit
          }
          className="p-6 sm:p-8 md:p-10"
        >

          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="mb-6 border border-green-500/30 bg-green-500/10 text-green-300 px-4 py-4 rounded-2xl flex gap-3 items-start">

              <FaCheck className="mt-1 shrink-0" />

              <span>
                {mensaje}
              </span>

            </div>
          )}

          {/* ============================================ */}
          {/* PASO 1 */}
          {/* ============================================ */}

          {paso === 1 && (
            <div className="space-y-6">

              <div>

                <h2 className="text-2xl font-semibold text-white">
                  {proyectoReferencia
                    ? "Personaliza tu proyecto"
                    : "Cuéntanos sobre tu proyecto"}
                </h2>

                <p className="text-zinc-400 mt-1">
                  {proyectoReferencia
                    ? "Puedes modificar la descripción y explicar exactamente cómo deseas adaptar este proyecto."
                    : "Empecemos con la información principal."}
                </p>

              </div>

              {/* TODAS LAS IMÁGENES DEL PROYECTO */}

              {proyectoReferencia &&
                imagenesProyecto.length >
                  0 && (
                  <div>

                    <p className="text-sm text-zinc-400 mb-3 flex items-center gap-2">

                      <FaImages className="text-yellow-500" />

                      Todas las imágenes del proyecto seleccionado

                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

                      {imagenesProyecto.map(
                        (
                          imagen,
                          indice
                        ) => (
                          <div
                            key={`${imagen}-${indice}`}
                            className="relative aspect-square rounded-2xl overflow-hidden border border-yellow-500/20 bg-black"
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

                            <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg">

                              {indice +
                                1}

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

              <Campo>

                <Label
                  icon={<FaPen />}
                >
                  Nombre del proyecto
                </Label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(
                      e.target.value
                    )
                  }
                  placeholder="Ej: Ventanales para casa residencial"
                  className={inputClass}
                  maxLength={100}
                />

              </Campo>

              <Campo>

                <Label
                  icon={<FaTag />}
                >
                  Tipo de proyecto
                </Label>

                <select
                  value={tipo}
                  onChange={(e) =>
                    setTipo(
                      e.target.value
                    )
                  }
                  className={inputClass}
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
                  icon={<FaPen />}
                >
                  ¿Qué necesitas realizar?
                </Label>

                <textarea
                  rows="6"
                  value={descripcion}
                  onChange={(e) =>
                    setDescripcion(
                      e.target.value
                    )
                  }
                  placeholder="Describe cómo deseas adaptar el proyecto..."
                  className={inputClass}
                  maxLength={1000}
                />

                <div className="flex justify-between gap-4 mt-2">

                  <span className="text-xs text-zinc-500">
                    {proyectoReferencia
                      ? "Puedes explicar qué deseas conservar o modificar respecto al proyecto de referencia."
                      : "Describe materiales, acabados o cualquier detalle importante."}
                  </span>

                  <span className="text-xs text-zinc-600 whitespace-nowrap">
                    {descripcion.length}/1000
                  </span>

                </div>

              </Campo>

            </div>
          )}

          {/* ============================================ */}
          {/* PASO 2 */}
          {/* ============================================ */}

          {paso === 2 && (
            <div className="space-y-7">

              <div>

                <h2 className="text-2xl font-semibold text-white">
                  Detalles de tu espacio
                </h2>

                <p className="text-zinc-400 mt-1">
                  Ahora necesitamos conocer dónde deseas realizar el trabajo y sus medidas aproximadas.
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

                    <div className="flex flex-col sm:flex-row gap-2">

                      <input
                        type="text"
                        value={ubicacion}
                        onChange={(e) =>
                          setUbicacion(
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key ===
                            "Enter"
                          ) {
                            e.preventDefault();

                            buscarDireccion();
                          }
                        }}
                        placeholder="Ej: Concordia, San Francisco de Campeche"
                        className={inputClass}
                      />

                      <button
                        type="button"
                        onClick={
                          buscarDireccion
                        }
                        disabled={
                          buscandoUbicacion
                        }
                        className="sm:w-auto px-5 py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                      >

                        <FaSearch />

                        {buscandoUbicacion
                          ? "Buscando..."
                          : "Buscar"}

                      </button>

                    </div>

                  </Campo>

                  <button
                    type="button"
                    onClick={
                      usarMiUbicacion
                    }
                    disabled={
                      obteniendoGPS
                    }
                    className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >

                    <FaCrosshairs className="text-yellow-500" />

                    {obteniendoGPS
                      ? "Obteniendo ubicación..."
                      : "Usar mi ubicación actual"}

                  </button>

                  <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4">

                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Coordenadas seleccionadas
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-3">

                      <div>

                        <p className="text-xs text-zinc-600">
                          Latitud
                        </p>

                        <p className="text-sm text-zinc-300">
                          {posicion.lat.toFixed(
                            6
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-zinc-600">
                          Longitud
                        </p>

                        <p className="text-sm text-zinc-300">
                          {posicion.lng.toFixed(
                            6
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                <div className="rounded-3xl overflow-hidden border border-zinc-700 bg-zinc-800 min-h-[390px]">

                  <MapContainer
                    center={[
                      posicion.lat,
                      posicion.lng,
                    ]}
                    zoom={14}
                    scrollWheelZoom={
                      true
                    }
                    style={{
                      width:
                        "100%",

                      height:
                        "390px",
                    }}
                  >

                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <RecentrarMapa
                      posicion={posicion}
                      zoom={16}
                    />

                    <SelectorUbicacion
                      posicion={posicion}
                      setPosicion={
                        setPosicion
                      }
                      setUbicacion={
                        setUbicacion
                      }
                      setError={
                        setError
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
                    Medidas aproximadas de tu espacio
                  </Label>

                  <input
                    type="text"
                    value={medidas}
                    onChange={(e) =>
                      setMedidas(
                        e.target.value
                      )
                    }
                    placeholder="Ej: 2 m de ancho x 2.50 m de alto"
                    className={inputClass}
                  />

                  <p className="text-xs text-zinc-500 mt-2">
                    No tienen que ser exactas. Nuestro personal podrá verificarlas posteriormente.
                  </p>

                </Campo>

                <Campo>

                  <Label
                    icon={
                      <FaCalendarAlt />
                    }
                  >
                    ¿Para cuándo lo necesitas?
                  </Label>

                  <input
                    type="date"
                    value={fechaDeseada}
                    onChange={(e) =>
                      setFechaDeseada(
                        e.target.value
                      )
                    }
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    className={inputClass}
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

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    $
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      presupuestoEstimado
                    }
                    onChange={(e) =>
                      setPresupuestoEstimado(
                        e.target.value
                      )
                    }
                    placeholder="Ej: 10000"
                    className={`${inputClass} pl-9`}
                  />

                </div>

                <p className="text-xs text-zinc-500 mt-2">
                  Opcional. Este monto solo sirve como referencia y no representa el precio final.
                </p>

              </Campo>

            </div>
          )}

          {/* ============================================ */}
          {/* PASO 3 */}
          {/* ============================================ */}

          {paso === 3 && (
            <div className="space-y-8">

              <div>

                <h2 className="text-2xl font-semibold text-white">
                  Imágenes
                </h2>

                <p className="text-zinc-400 mt-1">
                  Aquí puedes revisar todas las imágenes del proyecto seleccionado y agregar fotografías de tu propio espacio.
                </p>

              </div>

              {/* TODAS LAS FOTOS DEL PROYECTO */}

              {proyectoReferencia &&
                imagenesProyecto.length >
                  0 && (
                  <section>

                    <div className="flex items-center justify-between gap-4 mb-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">

                          <FaImages className="text-yellow-500" />

                        </div>

                        <div>

                          <h3 className="font-bold text-white">
                            Proyecto de referencia
                          </h3>

                          <p className="text-xs text-zinc-500">
                            Todas estas imágenes formarán parte de la cotización.
                          </p>

                        </div>

                      </div>

                      <span className="shrink-0 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full text-xs font-semibold">
                        {imagenesProyecto.length} fotos
                      </span>

                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                      {imagenesProyecto.map(
                        (
                          imagen,
                          indice
                        ) => (
                          <div
                            key={`${imagen}-${indice}`}
                            className="relative bg-zinc-800 border border-yellow-500/20 rounded-2xl overflow-hidden aspect-square group"
                          >

                            <img
                              src={imagen}
                              alt={`Proyecto referencia ${
                                indice + 1
                              }`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm px-2.5 py-1.5 rounded-lg">

                              <span className="text-xs text-white">
                                {indice + 1} / {imagenesProyecto.length}
                              </span>

                            </div>

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-10 pb-3 px-3">

                              <p className="text-xs text-yellow-400 font-semibold">
                                Referencia Wealth
                              </p>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </section>
                )}

              {/* FOTOS CLIENTE */}

              <section>

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">

                    <FaCamera className="text-blue-400" />

                  </div>

                  <div>

                    <h3 className="font-bold text-white">
                      Fotografías de tu espacio
                    </h3>

                    <p className="text-xs text-zinc-500">
                      Sube fotos del lugar donde deseas realizar el trabajo.
                    </p>

                  </div>

                </div>

                <label
                  htmlFor="imagenCotizacion"
                  className="block border-2 border-dashed border-zinc-700 hover:border-yellow-500/60 bg-zinc-800/40 hover:bg-zinc-800/70 transition rounded-3xl p-10 cursor-pointer text-center"
                >

                  <FaCloudUploadAlt className="text-yellow-500 text-4xl mx-auto mb-4" />

                  <p className="text-white font-semibold">
                    Agregar fotos de mi espacio
                  </p>

                  <p className="text-sm text-zinc-500 mt-2">
                    JPG, PNG o WEBP · Máximo 5 MB · Hasta 6 imágenes propias
                  </p>

                  <input
                    id="imagenCotizacion"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={
                      handleImagenes
                    }
                    className="hidden"
                  />

                </label>

              </section>

              {previews.length >
                0 && (
                <div>

                  <div className="flex justify-between items-center mb-4">

                    <p className="text-sm text-zinc-400 flex items-center gap-2">

                      <FaCamera className="text-blue-400" />

                      {imagenes.length}{" "}

                      {imagenes.length ===
                      1
                        ? "foto de tu espacio"
                        : "fotos de tu espacio"}

                    </p>

                    <span className="text-xs text-zinc-500">
                      {imagenes.length}/6
                    </span>

                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                    {previews.map(
                      (
                        preview,
                        index
                      ) => (
                        <div
                          key={`${preview.file.name}-${index}`}
                          className="relative group rounded-2xl overflow-hidden bg-zinc-800 border border-blue-500/20 aspect-square"
                        >

                          <img
                            src={
                              preview.url
                            }
                            alt={`Foto cliente ${
                              index + 1
                            }`}
                            className="w-full h-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              eliminarImagen(
                                index
                              )
                            }
                            className="absolute top-2 right-2 bg-black/70 hover:bg-red-500 text-white w-9 h-9 rounded-full flex items-center justify-center transition"
                          >
                            <FaTimes />
                          </button>

                          <div className="absolute bottom-0 left-0 right-0 bg-black/75 px-3 py-2">

                            <p className="text-blue-300 text-xs font-medium">
                              Foto del cliente
                            </p>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

              {imagenes.length ===
                0 && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">

                  <p className="text-sm text-zinc-400">
                    📷 Las fotografías de tu espacio son opcionales, pero pueden ayudarnos a preparar una propuesta más precisa.
                  </p>

                </div>
              )}

            </div>
          )}

          {/* ============================================ */}
          {/* PASO 4 */}
          {/* ============================================ */}

          {paso === 4 && (
            <div className="space-y-7">

              <div>

                <h2 className="text-2xl font-semibold text-white">
                  Confirma tu solicitud
                </h2>

                <p className="text-zinc-400 mt-1">
                  Revisa los datos antes de enviar la cotización.
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
                    value={telefono}
                    onChange={(e) =>
                      setTelefono(
                        e.target.value
                      )
                    }
                    placeholder="Ej: 981 123 4567"
                    className={inputClass}
                  />

                </Campo>

                <Campo>

                  <Label
                    icon={
                      <FaWhatsapp />
                    }
                  >
                    Medio de contacto preferido
                  </Label>

                  <select
                    value={
                      metodoContacto
                    }
                    onChange={(e) =>
                      setMetodoContacto(
                        e.target.value
                      )
                    }
                    className={inputClass}
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

              {/* RESUMEN */}

              <div className="bg-zinc-950/70 border border-zinc-800 rounded-3xl p-6">

                <div className="flex justify-between gap-4 mb-6">

                  <div>

                    <p className="text-xs uppercase tracking-widest text-yellow-500 font-semibold">
                      Resumen
                    </p>

                    <h3 className="text-xl font-bold text-white mt-1">
                      {nombre}
                    </h3>

                  </div>

                  <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs px-3 py-2 rounded-full self-start">
                    {tipo}
                  </span>

                </div>

                {/* PROYECTO REFERENCIA */}

                {proyectoReferencia && (
                  <div className="mb-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">

                    <p className="text-xs uppercase tracking-wider text-yellow-500 font-semibold">
                      Basado en proyecto
                    </p>

                    <p className="font-bold text-white mt-1">
                      {
                        proyectoReferencia.nombre
                      }
                    </p>

                    <p className="text-xs text-zinc-500 mt-1">
                      {imagenesProyecto.length}{" "}

                      {imagenesProyecto.length ===
                      1
                        ? "imagen de referencia"
                        : "imágenes de referencia"}
                    </p>

                    {/* MINI GALERÍA RESUMEN */}

                    {imagenesProyecto.length >
                      0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">

                        {imagenesProyecto.map(
                          (
                            imagen,
                            index
                          ) => (
                            <div
                              key={`${imagen}-${index}`}
                              className="aspect-square rounded-xl overflow-hidden border border-zinc-700"
                            >

                              <img
                                src={imagen}
                                alt={`Referencia ${
                                  index + 1
                                }`}
                                className="w-full h-full object-cover"
                              />

                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>
                )}

                <div className="space-y-4 text-sm">

                  <ResumenItem
                    titulo="Descripción"
                    valor={
                      descripcion
                    }
                  />

                  <ResumenItem
                    titulo="Ubicación"
                    valor={
                      ubicacion
                    }
                  />

                  <ResumenItem
                    titulo="Coordenadas"
                    valor={`${posicion.lat.toFixed(
                      6
                    )}, ${posicion.lng.toFixed(
                      6
                    )}`}
                  />

                  <ResumenItem
                    titulo="Medidas"
                    valor={
                      medidas ||
                      "No especificadas"
                    }
                  />

                  <ResumenItem
                    titulo="Fecha deseada"
                    valor={
                      fechaDeseada ||
                      "Sin fecha específica"
                    }
                  />

                  <ResumenItem
                    titulo="Presupuesto aproximado"
                    valor={
                      presupuestoEstimado
                        ? `$${Number(
                            presupuestoEstimado
                          ).toLocaleString(
                            "es-MX"
                          )} MXN`
                        : "No especificado"
                    }
                  />

                  <ResumenItem
                    titulo="Imágenes del proyecto"
                    valor={
                      proyectoReferencia
                        ? `${imagenesProyecto.length} ${
                            imagenesProyecto.length ===
                            1
                              ? "imagen"
                              : "imágenes"
                          }`
                        : "No aplica"
                    }
                  />

                  <ResumenItem
                    titulo="Fotos de tu espacio"
                    valor={`${imagenes.length} ${
                      imagenes.length ===
                      1
                        ? "imagen"
                        : "imágenes"
                    }`}
                  />

                  <ResumenItem
                    titulo="Contacto"
                    valor={`${telefono} · ${metodoContacto}`}
                  />

                </div>

              </div>

              <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-2xl p-4">

                <p className="text-sm text-zinc-300">

                  Al enviar esta solicitud todavía{" "}

                  <strong className="text-white">
                    no estás realizando ningún pago
                  </strong>

                  . Wealth revisará las medidas, fotografías y demás información antes de enviarte una propuesta económica.

                </p>

              </div>

            </div>
          )}

          {/* ============================================ */}
          {/* NAVEGACIÓN */}
          {/* ============================================ */}

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-10 pt-6 border-t border-zinc-800">

            {paso > 1 ? (
              <button
                type="button"
                onClick={
                  pasoAnterior
                }
                disabled={
                  loading
                }
                className="px-6 py-4 rounded-2xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >

                <FaArrowLeft />

                Anterior

              </button>
            ) : (
              <div />
            )}

            {paso <
              totalPasos && (
              <button
                type="button"
                onClick={
                  siguientePaso
                }
                className="px-8 py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition flex items-center justify-center gap-2"
              >

                Continuar

                <FaArrowRight />

              </button>
            )}

            {paso ===
              totalPasos && (
              <button
                type="submit"
                disabled={
                  loading
                }
                className="px-8 py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >

                <FaCloudUploadAlt />

                {loading
                  ? "Enviando solicitud..."
                  : "Enviar cotización"}

              </button>
            )}

          </div>

        </form>

      </div>

    </div>
  );
}

// ======================================================
// ESTILOS
// ======================================================

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

// ======================================================
// COMPONENTES
// ======================================================

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
    <div className="grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">

      <span className="text-zinc-500">
        {titulo}
      </span>

      <span className="text-zinc-200 break-words">
        {valor}
      </span>

    </div>
  );
}

export default CrearCotizacion;