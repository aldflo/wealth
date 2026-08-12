import { useEffect, useState } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";

import { db, auth } from "../firebase.config";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  FaArrowLeft,
  FaFileInvoiceDollar,
  FaMapMarkerAlt,
  FaPhone,
  FaWhatsapp,
  FaImages,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";


const ESTILOS_TEMA_CLARO = `
  .wealth-light-page {
    background-color: #f9fafb !important;
    color: #111827 !important;
  }

  .wealth-light-page .bg-black {
    background-color: #ffffff !important;
  }

  .wealth-light-page .bg-zinc-950 {
    background-color: #ffffff !important;
  }

  .wealth-light-page .bg-zinc-900 {
    background-color: #f9fafb !important;
  }

  .wealth-light-page .bg-zinc-800 {
    background-color: #f3f4f6 !important;
  }

  .wealth-light-page .bg-zinc-700 {
    background-color: #e5e7eb !important;
  }

  .wealth-light-page [class~="bg-zinc-950/70"],
  .wealth-light-page [class~="bg-zinc-950/60"] {
    background-color: rgba(255, 255, 255, 0.92) !important;
  }

  .wealth-light-page [class~="bg-zinc-900/80"],
  .wealth-light-page [class~="bg-zinc-900/60"] {
    background-color: rgba(249, 250, 251, 0.94) !important;
  }

  .wealth-light-page [class~="bg-zinc-800/70"],
  .wealth-light-page [class~="bg-zinc-800/60"],
  .wealth-light-page [class~="bg-zinc-800/40"] {
    background-color: rgba(243, 244, 246, 0.9) !important;
  }

  .wealth-light-page .border-zinc-900,
  .wealth-light-page .border-zinc-800 {
    border-color: #e5e7eb !important;
  }

  .wealth-light-page .border-zinc-700,
  .wealth-light-page .border-zinc-600 {
    border-color: #d1d5db !important;
  }

  .wealth-light-page .text-white {
    color: #111827 !important;
  }

  .wealth-light-page .text-zinc-100,
  .wealth-light-page .text-zinc-200 {
    color: #1f2937 !important;
  }

  .wealth-light-page .text-zinc-300 {
    color: #374151 !important;
  }

  .wealth-light-page .text-zinc-400 {
    color: #4b5563 !important;
  }

  .wealth-light-page .text-zinc-500,
  .wealth-light-page .text-zinc-600 {
    color: #6b7280 !important;
  }

  .wealth-light-page .text-zinc-700 {
    color: #9ca3af !important;
  }

  .wealth-light-page input,
  .wealth-light-page textarea,
  .wealth-light-page select {
    color: #111827;
  }

  .wealth-light-page input::placeholder,
  .wealth-light-page textarea::placeholder {
    color: #9ca3af;
  }

  .wealth-light-page option {
    background: #ffffff;
    color: #111827;
  }

  .wealth-light-page .inputAdmin {
    background: #ffffff !important;
    border-color: #d1d5db !important;
    color: #111827 !important;
  }

  .wealth-light-page .hover\\:bg-zinc-900:hover {
    background-color: #f3f4f6 !important;
  }

  .wealth-light-page .hover\\:bg-zinc-800:hover {
    background-color: #e5e7eb !important;
  }

  .wealth-light-page .hover\\:bg-zinc-700:hover {
    background-color: #d1d5db !important;
  }

  /* Mantener texto blanco en botones/estados de color intenso */
  .wealth-light-page [class*="bg-red-"][class~="text-white"],
  .wealth-light-page [class*="bg-green-"][class~="text-white"],
  .wealth-light-page [class*="bg-emerald-"][class~="text-white"],
  .wealth-light-page [class*="bg-blue-"][class~="text-white"],
  .wealth-light-page [class*="bg-purple-"][class~="text-white"],
  .wealth-light-page [class*="bg-cyan-"][class~="text-white"] {
    color: #ffffff !important;
  }

  /* Overlays fotográficos siguen oscuros */
  .wealth-light-page [class*="bg-black/"][class~="text-white"],
  .wealth-light-page [class*="from-black"][class~="text-white"] {
    color: #ffffff !important;
  }
`;

function DetalleProyecto() {
  const { modoOscuro } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();

  const [proyecto, setProyecto] = useState(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [imagenModal, setImagenModal] = useState("");

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const [
    usuario,
    setUsuario,
  ] = useState(null);

  const [
    esFavorito,
    setEsFavorito,
  ] = useState(false);

  const [
    guardandoFavorito,
    setGuardandoFavorito,
  ] = useState(false);

  const [
    referenciasGaleria,
    setReferenciasGaleria,
  ] = useState([]);

  const [
    cargandoReferencias,
    setCargandoReferencias,
  ] = useState(true);

  const minSwipeDistance = 50;

  // ======================================================
  // CARGAR PROYECTO
  // ======================================================

  useEffect(() => {
    const cargarProyecto = async () => {
      try {
        setLoading(true);

        const ref = doc(
          db,
          "proyectos",
          id
        );

        const snap =
          await getDoc(ref);

        if (snap.exists()) {
          setProyecto({
            id: snap.id,
            ...snap.data(),
          });
        } else {
          setProyecto(null);
        }
      } catch (error) {
        console.error(
          "Error cargando proyecto:",
          error
        );

        setProyecto(null);
      } finally {
        setLoading(false);
      }
    };

    cargarProyecto();
  }, [id]);

  // ======================================================
  // REFERENCIAS DE GALERÍA
  // ======================================================

  const normalizarCategoria =
    (categoria = "") => {
      const texto =
        String(categoria)
          .trim()
          .toLowerCase();

      if (
        texto ===
        "vidrio y aluminio"
      ) {
        return "aluminios y vidrios";
      }

      return texto;
    };

  useEffect(() => {
    const unsub =
      onSnapshot(
        collection(
          db,
          "galeria"
        ),

        (snapshot) => {
          const grupos =
            snapshot.docs.map(
              (documento) => ({
                id:
                  documento.id,

                ...documento.data(),
              })
            );

          const categoriaProyecto =
            normalizarCategoria(
              proyecto?.categoria ||
              ""
            );

          const porCategoria =
            grupos.filter(
              (grupo) =>
                normalizarCategoria(
                  grupo.categoria ||
                  ""
                ) ===
                categoriaProyecto
            );

          const fuente =
            porCategoria.length > 0
              ? porCategoria
              : grupos;

          const fotos = [];

          fuente.forEach(
            (grupo) => {
              const imagenesGrupo =
                Array.isArray(
                  grupo.imagenes
                )
                  ? grupo.imagenes
                  : [];

              imagenesGrupo.forEach(
                (
                  imagen,
                  indice
                ) => {
                  if (
                    !imagen ||
                    fotos.length >= 4
                  ) {
                    return;
                  }

                  fotos.push({
                    id:
                      `${grupo.id}_${indice}`,

                    imagen,

                    categoria:
                      grupo.categoria ||
                      "Wealth",

                    subcategoria:
                      grupo.subcategoria ||
                      grupo.nombre ||
                      "Referencia",
                  });
                }
              );
            }
          );

          setReferenciasGaleria(
            fotos
          );

          setCargandoReferencias(
            false
          );
        },

        (error) => {
          console.error(
            "Error cargando referencias de galería:",
            error
          );

          setReferenciasGaleria(
            []
          );

          setCargandoReferencias(
            false
          );
        }
      );

    return () => unsub();

  }, [
    proyecto?.categoria,
  ]);

  // ======================================================
  // SESIÓN
  // ======================================================

  useEffect(() => {
    const unsub =
      onAuthStateChanged(
        auth,
        (user) => {
          setUsuario(
            user || null
          );

          if (!user) {
            setEsFavorito(
              false
            );
          }
        }
      );

    return () => unsub();
  }, []);

  // ======================================================
  // FAVORITO DEL USUARIO ACTUAL
  // ======================================================

  useEffect(() => {
    if (
      !usuario ||
      !id
    ) {
      setEsFavorito(
        false
      );

      return;
    }

    const q = query(
      collection(
        db,
        "favoritos"
      ),
      where(
        "uid",
        "==",
        usuario.uid
      ),
      where(
        "proyectoId",
        "==",
        id
      )
    );

    const unsub =
      onSnapshot(
        q,
        (snapshot) => {
          setEsFavorito(
            !snapshot.empty
          );
        },
        (error) => {
          console.error(
            "Error verificando favorito:",
            error
          );
        }
      );

    return () => unsub();

  }, [
    usuario,
    id,
  ]);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className={`wealth-theme-page ${!modoOscuro ? "wealth-light-page" : ""} min-h-[70vh] bg-black text-white flex items-center justify-center`}>
        {!modoOscuro && <style>{ESTILOS_TEMA_CLARO}</style>}
        <div className="text-center">
          <div className="w-11 h-11 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin mx-auto" />

          <p className="text-zinc-500 mt-4">
            Cargando proyecto...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // NO ENCONTRADO
  // ======================================================

  if (!proyecto) {
    return (
      <div className={`wealth-theme-page ${!modoOscuro ? "wealth-light-page" : ""} min-h-[70vh] bg-black text-white flex items-center justify-center px-5`}>
        {!modoOscuro && <style>{ESTILOS_TEMA_CLARO}</style>}
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Proyecto no encontrado
          </h1>

          <button
            type="button"
            onClick={() =>
              navigate("/proyectos")
            }
            className="mt-5 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold transition"
          >
            Volver a proyectos
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // IMÁGENES
  // ======================================================

  const imagenes = [
    ...new Set(
      [
        ...(Array.isArray(
          proyecto.imagenes
        )
          ? proyecto.imagenes
          : []),

        proyecto.imagen,
      ].filter(Boolean)
    ),
  ];

  const imagenPrincipal =
    imagenes[index] ||
    null;

  // ======================================================
  // CAMBIAR IMAGEN
  // ======================================================

  const siguienteImagen = () => {
    if (imagenes.length <= 1) {
      return;
    }

    setIndex(
      (prev) =>
        (prev + 1) %
        imagenes.length
    );
  };

  const anteriorImagen = () => {
    if (imagenes.length <= 1) {
      return;
    }

    setIndex((prev) =>
      prev === 0
        ? imagenes.length - 1
        : prev - 1
    );
  };

  // ======================================================
  // SWIPE CELULAR
  // ======================================================

  const onTouchStart = (e) => {
    setTouchEnd(null);

    setTouchStart(
      e.targetTouches[0].clientX
    );
  };

  const onTouchMove = (e) => {
    setTouchEnd(
      e.targetTouches[0].clientX
    );
  };

  const onTouchEnd = () => {
    if (
      touchStart === null ||
      touchEnd === null
    ) {
      return;
    }

    const distance =
      touchStart - touchEnd;

    if (
      distance >
      minSwipeDistance
    ) {
      siguienteImagen();
    }

    if (
      distance <
      -minSwipeDistance
    ) {
      anteriorImagen();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // ======================================================
  // ABRIR FOTO
  // ======================================================

  const abrirImagen = (
    imagen
  ) => {
    if (!imagen) {
      return;
    }

    setImagenModal(imagen);
    setModalAbierto(true);
  };

  // ======================================================
  // FAVORITO
  // ======================================================

  const toggleFavorito =
    async () => {
      if (!usuario) {
        navigate(
          "/login"
        );

        return;
      }

      const documentoId =
        `${usuario.uid}_${proyecto.id}`;

      try {
        setGuardandoFavorito(
          true
        );

        if (esFavorito) {
          await deleteDoc(
            doc(
              db,
              "favoritos",
              documentoId
            )
          );

          return;
        }

        await setDoc(
          doc(
            db,
            "favoritos",
            documentoId
          ),
          {
            uid:
              usuario.uid,

            usuario:
              usuario.email ||
              null,

            proyectoId:
              proyecto.id,

            id:
              proyecto.id,

            titulo:
              proyecto.nombre ||
              "",

            nombre:
              proyecto.nombre ||
              "",

            imagen:
              imagenes[0] ||
              "",

            imagenes,

            categoria:
              proyecto.categoria ||
              "",

            descripcion:
              proyecto.descripcion ||
              "",

            fechaGuardado:
              serverTimestamp(),
          }
        );

      } catch (error) {
        console.error(
          "Error actualizando favorito:",
          error
        );

        alert(
          "No se pudo actualizar el favorito."
        );

      } finally {
        setGuardandoFavorito(
          false
        );
      }
    };

  // ======================================================
  // WHATSAPP
  // ======================================================

  const contactarWhatsApp =
    () => {
      const telefono =
        "529811574778";

      const mensaje =
        `Hola 👋, vi el proyecto "${proyecto.nombre}" en la página de Wealth y me gustaría recibir información.`;

      const url =
        `https://wa.me/${telefono}?text=${encodeURIComponent(
          mensaje
        )}`;

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    };

  // ======================================================
  // COTIZAR ESTE PROYECTO
  // ======================================================
  //
  // CrearCotizacion ya recibe:
  // location.state?.proyecto
  //
  // Por eso enviamos el proyecto COMPLETO.
  // Así conserva:
  // - id
  // - nombre
  // - categoría
  // - descripción
  // - imagen
  // - imagenes[]
  //
  // CrearCotizacion lo utilizará como proyecto de referencia.
  // ======================================================

  const cotizarProyecto =
    () => {
      if (!usuario) {
        navigate(
          "/login",
          {
            state: {
              mensaje:
                "Inicia sesión para cotizar este proyecto.",

              proyectoPendiente: {
                ...proyecto,

                id:
                  proyecto.id,

                proyectoReferenciaId:
                  proyecto.id,

                proyectoReferenciaNombre:
                  proyecto.nombre ||
                  "",

                proyectoReferenciaCategoria:
                  proyecto.categoria ||
                  "",
              },
            },
          }
        );

        return;
      }

      navigate(
        "/crear-cotizacion",
        {
          state: {
            proyecto: {
              ...proyecto,

              // Dejamos explícitamente el ID
              // para que quede guardada la referencia.
              id:
                proyecto.id,

              proyectoReferenciaId:
                proyecto.id,

              proyectoReferenciaNombre:
                proyecto.nombre ||
                "",

              proyectoReferenciaCategoria:
                proyecto.categoria ||
                "",
            },
          },
        }
      );
    };

  // ======================================================
  // MAPS
  // ======================================================

  const abrirUbicacion =
    () => {
      const url =
        "https://www.google.com/maps/search/?api=1&query=Av+Aviacion+89+Heroe+de+Nacozari+Campeche";

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    };

  return (
    <div className={`wealth-theme-page ${!modoOscuro ? "wealth-light-page" : ""} min-h-screen bg-black text-white`}>
      {!modoOscuro && <style>{ESTILOS_TEMA_CLARO}</style>}

      {/* ================================================= */}
      {/* NAV */}
      {/* ================================================= */}

      <div className="flex items-center justify-between gap-4 px-5 md:px-8 py-5 border-b border-white/10">

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
        >
          <FaArrowLeft />
          Volver
        </button>

        <h1 className="font-semibold text-right truncate">
          {proyecto.nombre}
        </h1>

      </div>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">

        {/* ================================================= */}
        {/* IMÁGENES */}
        {/* ================================================= */}

        <div className="space-y-4">

          <div
            className="relative overflow-hidden bg-zinc-950 border border-zinc-800 rounded-3xl min-h-[360px] md:min-h-[520px] flex items-center justify-center"
            onTouchStart={
              onTouchStart
            }
            onTouchMove={
              onTouchMove
            }
            onTouchEnd={
              onTouchEnd
            }
          >

            {imagenPrincipal ? (
              <img
                src={
                  imagenPrincipal
                }
                alt={
                  proyecto.nombre
                }
                onClick={() =>
                  abrirImagen(
                    imagenPrincipal
                  )
                }
                className="w-full h-[420px] md:h-[560px] object-contain p-4 md:p-6 cursor-zoom-in select-none"
                draggable={
                  false
                }
              />
            ) : (
              <div className="text-zinc-600 flex flex-col items-center gap-3">
                <FaImages size={38} />
                <p>
                  Sin imágenes
                </p>
              </div>
            )}

            {/* FLECHA IZQUIERDA */}

            {imagenes.length >
              1 && (
              <button
                type="button"
                onClick={
                  anteriorImagen
                }
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 items-center justify-center text-white text-2xl transition"
              >
                ❮
              </button>
            )}

            {/* FLECHA DERECHA */}

            {imagenes.length >
              1 && (
              <button
                type="button"
                onClick={
                  siguienteImagen
                }
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 items-center justify-center text-white text-2xl transition"
              >
                ❯
              </button>
            )}

            {/* CONTADOR */}

            {imagenes.length >
              1 && (
              <span className="absolute bottom-4 right-4 bg-black/80 border border-white/10 px-3 py-1.5 rounded-full text-xs">
                {index + 1} /{" "}
                {
                  imagenes.length
                }
              </span>
            )}

          </div>

          {/* MINI GALERÍA */}

          {imagenes.length >
            1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">

              {imagenes.map(
                (img, i) => (
                  <button
                    type="button"
                    key={`${img}-${i}`}
                    onClick={() =>
                      setIndex(i)
                    }
                    className="shrink-0"
                  >
                    <img
                      src={img}
                      alt={`${proyecto.nombre} ${
                        i + 1
                      }`}
                      className={`w-24 h-20 object-cover rounded-xl cursor-pointer border-2 transition ${
                        i === index
                          ? "border-yellow-500 opacity-100"
                          : "border-transparent opacity-55 hover:opacity-90"
                      }`}
                    />
                  </button>
                )
              )}

            </div>
          )}

        </div>

        {/* ================================================= */}
        {/* INFORMACIÓN */}
        {/* ================================================= */}

        <div className="space-y-6">

          {proyecto.categoria && (
            <span className="inline-flex bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">
              {
                proyecto.categoria
              }
            </span>
          )}

          <div>

            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              {
                proyecto.nombre
              }
            </h2>

            {proyecto.descripcion && (
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed mt-5 whitespace-pre-line">
                {
                  proyecto.descripcion
                }
              </p>
            )}

          </div>

          {/* =============================================== */}
          {/* ACCIONES */}
          {/* =============================================== */}

          <div className="grid sm:grid-cols-3 gap-3 pt-2">

            {/* COTIZAR */}

            <button
              type="button"
              onClick={
                cotizarProyecto
              }
              className="w-full flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-black py-4 px-5 rounded-2xl font-bold transition"
            >
              <FaFileInvoiceDollar size={20} />

              {usuario
                ? "Cotizar este proyecto"
                : "Inicia sesión para cotizar"}
            </button>

            {/* FAVORITO */}

            <button
              type="button"
              onClick={
                toggleFavorito
              }
              disabled={
                guardandoFavorito
              }
              className={`w-full flex items-center justify-center gap-3 py-4 px-5 rounded-2xl font-bold transition border ${
                esFavorito
                  ? "bg-pink-500/10 border-pink-500/40 text-pink-400 hover:bg-pink-500/20"
                  : "bg-zinc-900 border-zinc-700 text-white hover:border-pink-500/40 hover:text-pink-400"
              } disabled:opacity-50`}
            >
              {esFavorito ? (
                <FaHeart size={20} />
              ) : (
                <FaRegHeart size={20} />
              )}

              {esFavorito
                ? "En favoritos"
                : "Guardar favorito"}
            </button>

            {/* WHATSAPP */}

            <button
              type="button"
              onClick={
                contactarWhatsApp
              }
              className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white py-4 px-5 rounded-2xl font-bold transition"
            >
              <FaWhatsapp size={21} />

              Contactar por WhatsApp
            </button>

          </div>

          {/* EXPLICACIÓN */}

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
            <p className="text-sm text-zinc-300">
              ¿Te interesa este diseño?{" "}
              <strong className="text-yellow-400">
                {usuario
                  ? "Cotizar este proyecto"
                  : "Inicia sesión para cotizar"}
              </strong>{" "}
              {usuario
                ? "abrirá la solicitud de cotización usando este trabajo como referencia."
                : "te llevará al inicio de sesión. Después podrás continuar con la cotización del proyecto."}
            </p>
          </div>

          {/* ================================================= */}
          {/* CONTACTO */}
          {/* ================================================= */}

          <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-5 space-y-4">

            <p className="font-bold text-white">
              Contacto Wealth
            </p>

            <a
              href="tel:+529811574778"
              className="flex items-center gap-3 text-zinc-300 hover:text-yellow-400 transition"
            >
              <FaPhone className="text-yellow-500" />

              <span>
                +52 981 157 4778
              </span>
            </a>

            <button
              type="button"
              onClick={
                contactarWhatsApp
              }
              className="w-full flex items-center gap-3 text-zinc-300 hover:text-green-400 transition text-left"
            >
              <FaWhatsapp className="text-green-500" />

              <span>
                WhatsApp disponible
              </span>
            </button>

            <button
              type="button"
              onClick={
                abrirUbicacion
              }
              className="w-full flex items-center gap-3 text-zinc-300 hover:text-yellow-400 transition text-left"
            >
              <FaMapMarkerAlt className="text-yellow-500" />

              <span>
                Ver ubicación en mapa
              </span>
            </button>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* GALERÍA DE DISEÑOS / REFERENCIAS */}
      {/* ================================================= */}

      <section className="max-w-7xl mx-auto px-5 md:px-8 pb-16">

        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">

          <div>

            <p className="text-xs uppercase tracking-[0.22em] text-yellow-500 font-semibold">
              Más inspiración
            </p>

            <h3 className="text-2xl font-bold mt-1">
              {Array.isArray(
                proyecto.galeria
              ) &&
              proyecto.galeria.length >
                0
                ? "Galería de diseños"
                : "Referencias relacionadas"}
            </h3>

            {!(
              Array.isArray(
                proyecto.galeria
              ) &&
              proyecto.galeria.length >
                0
            ) && (
              <p className="text-zinc-500 text-sm mt-2 max-w-2xl">
                Este proyecto no tiene imágenes de referencia adicionales cargadas. Te mostramos algunas ideas de nuestra galería para que sigas explorando.
              </p>
            )}

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/galeria"
              )
            }
            className="bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-black border border-yellow-500/30 hover:border-yellow-500 px-5 py-3 rounded-xl font-bold transition flex items-center gap-2"
          >
            <FaImages />

            Ver galería completa
          </button>

        </div>

        {Array.isArray(
          proyecto.galeria
        ) &&
        proyecto.galeria.length >
          0 ? (

          <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory">

            {proyecto.galeria
              .slice(
                0,
                4
              )
              .map(
                (img, i) => (
                  <div
                    key={`${img}-${i}`}
                    className="min-w-[280px] md:min-w-[320px] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 flex-shrink-0 snap-start"
                  >
                    <img
                      src={img}
                      alt={`Diseño ${
                        i + 1
                      }`}
                      onClick={() =>
                        abrirImagen(
                          img
                        )
                      }
                      className="w-full h-64 object-cover hover:scale-105 transition duration-300 cursor-zoom-in"
                    />
                  </div>
                )
              )}

          </div>

        ) : cargandoReferencias ? (

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="aspect-[4/3] rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"
                />
              )
            )}

          </div>

        ) : referenciasGaleria.length >
          0 ? (

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {referenciasGaleria.map(
              (referencia) => (
                <button
                  type="button"
                  key={
                    referencia.id
                  }
                  onClick={() =>
                    abrirImagen(
                      referencia.imagen
                    )
                  }
                  className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 transition aspect-[4/3]"
                >

                  <img
                    src={
                      referencia.imagen
                    }
                    alt={
                      referencia.subcategoria
                    }
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  <div className="absolute left-3 right-3 bottom-3 text-left">

                    <p className="text-[10px] uppercase tracking-[0.16em] text-yellow-400">
                      {
                        referencia.categoria
                      }
                    </p>

                    <p className="text-sm font-semibold mt-1 line-clamp-1">
                      {
                        referencia.subcategoria
                      }
                    </p>

                  </div>

                </button>
              )
            )}

          </div>

        ) : (

          <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <p className="font-semibold">
                Explora más ideas en nuestra galería
              </p>

              <p className="text-zinc-500 text-sm mt-1">
                Aún no hay referencias relacionadas disponibles para este proyecto.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/galeria"
                )
              }
              className="shrink-0 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl font-bold transition"
            >
              Ver galería
            </button>

          </div>
        )}

      </section>

      {/* ================================================= */}
      {/* MODAL IMAGEN */}
      {/* ================================================= */}

      {modalAbierto &&
        imagenModal && (
        <div
          onClick={() =>
            setModalAbierto(
              false
            )
          }
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-5 cursor-zoom-out"
        >

          <img
            src={
              imagenModal
            }
            alt="Vista previa"
            onClick={(e) =>
              e.stopPropagation()
            }
            className="max-w-full max-h-[90vh] rounded-2xl object-contain"
          />

          <button
            type="button"
            onClick={() =>
              setModalAbierto(
                false
              )
            }
            className="absolute top-6 right-6 w-12 h-12 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-3xl hover:text-yellow-500 hover:border-yellow-500/50 transition flex items-center justify-center"
          >
            ×
          </button>

        </div>
      )}

    </div>
  );
}

export default DetalleProyecto;