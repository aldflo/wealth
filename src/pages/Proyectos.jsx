import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { db, auth } from "../firebase.config";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import {
  FaSearch,
  FaHeart,
  FaRegHeart,
  FaArrowRight,
  FaFileInvoiceDollar,
  FaTimes,
  FaStar,
  FaClock,
  FaLayerGroup,
  FaImages,
} from "react-icons/fa";

function Proyectos() {
  const navigate = useNavigate();

  // ======================================================
  // PROYECTOS
  // ======================================================

  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ======================================================
  // FILTROS
  // ======================================================

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  // ======================================================
  // USUARIO
  // ======================================================

  const [usuario, setUsuario] = useState(null);

  // ======================================================
  // FAVORITOS
  // ======================================================

  const [favoritos, setFavoritos] = useState([]);

  const [guardandoFavorito, setGuardandoFavorito] =
    useState(null);

  // ======================================================
  // MODAL LOGIN
  // ======================================================

  const [mostrarLoginModal, setMostrarLoginModal] =
    useState(false);

  // ======================================================
  // NORMALIZAR IMÁGENES DEL PROYECTO
  // ======================================================

  const obtenerImagenesProyecto = (proyecto) => {
    if (!proyecto) {
      return [];
    }

    const lista = [];

    // ================================================
    // ARRAY imagenes[]
    // ================================================

    if (Array.isArray(proyecto.imagenes)) {
      proyecto.imagenes.forEach((item) => {
        if (typeof item === "string" && item.trim()) {
          lista.push(item.trim());
          return;
        }

        // Compatibilidad si alguna imagen se guardó
        // como objeto.
        if (item && typeof item === "object") {
          const url =
            item.url ||
            item.secure_url ||
            item.src ||
            item.imagen;

          if (url) {
            lista.push(url);
          }
        }
      });
    }

    // ================================================
    // IMAGEN PRINCIPAL
    // ================================================

    if (
      proyecto.imagen &&
      typeof proyecto.imagen === "string"
    ) {
      lista.push(proyecto.imagen);
    }

    // ================================================
    // ELIMINAR DUPLICADOS
    // ================================================

    return [
      ...new Set(
        lista.filter(Boolean)
      ),
    ];
  };

  // ======================================================
  // IMAGEN DE PORTADA
  // ======================================================

  const obtenerPortada = (proyecto) => {
    const imagenes =
      obtenerImagenesProyecto(proyecto);

    return imagenes[0] || "";
  };

  // ======================================================
  // ESCUCHAR LOGIN
  // ======================================================

  useEffect(() => {
    const unsub =
      onAuthStateChanged(
        auth,
        (user) => {
          setUsuario(user || null);
        }
      );

    return () => unsub();
  }, []);

  // ======================================================
  // CARGAR PROYECTOS FIREBASE
  // ======================================================

  useEffect(() => {
    const q = query(
      collection(db, "proyectos"),
      orderBy("fecha", "desc")
    );

    const unsub = onSnapshot(
      q,

      (snap) => {
        const data =
          snap.docs.map(
            (documento) => ({
              id: documento.id,
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

    return () => unsub();
  }, []);

  // ======================================================
  // FAVORITOS FIREBASE
  // ======================================================

  useEffect(() => {
    // Sin sesión no mostramos favoritos de ningún navegador
    // ni reutilizamos información de otra cuenta.
    if (!usuario) {
      setFavoritos([]);
      return;
    }

    const q = query(
      collection(db, "favoritos"),
      where(
        "uid",
        "==",
        usuario.uid
      )
    );

    const unsub = onSnapshot(
      q,

      (snap) => {
        const data =
          snap.docs.map(
            (documento) => ({
              firebaseId:
                documento.id,

              ...documento.data(),
            })
          );

        setFavoritos(data);
      },

      (error) => {
        console.error(
          "Error cargando favoritos:",
          error
        );

        setFavoritos([]);
      }
    );

    return () => unsub();

  }, [usuario]);

  // ======================================================
  // CATEGORÍAS AUTOMÁTICAS
  // ======================================================

  const categorias =
    useMemo(() => {
      const categoriasEncontradas =
        proyectos
          .map((p) => p.categoria)
          .filter(Boolean);

      return [
        "Todos",

        ...Array.from(
          new Set(
            categoriasEncontradas
          )
        ).sort(
          (a, b) =>
            a.localeCompare(
              b,
              "es"
            )
        ),
      ];

    }, [proyectos]);

  // ======================================================
  // BUSCADOR + FILTRO
  // ======================================================

  const filtrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return proyectos.filter(
        (p) => {
          const contenido = [
            p.nombre,
            p.descripcion,
            p.categoria,
            p.tipo,
            p.ubicacion,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const coincideBusqueda =
            !texto ||
            contenido.includes(
              texto
            );

          const coincideCategoria =
            categoria === "Todos" ||
            p.categoria === categoria;

          return (
            coincideBusqueda &&
            coincideCategoria
          );
        }
      );

    }, [
      proyectos,
      busqueda,
      categoria,
    ]);

  // ======================================================
  // FAVORITO
  // ======================================================

  const toggleFavorito =
    async (proyecto) => {
      if (!usuario) {
        setMostrarLoginModal(true);
        return;
      }

      const yaExiste =
        favoritos.some(
          (f) =>
            f.proyectoId ===
              proyecto.id ||
            f.id ===
              proyecto.id
        );

      const documentoId =
        `${usuario.uid}_${proyecto.id}`;

      try {
        setGuardandoFavorito(
          proyecto.id
        );

        if (yaExiste) {
          await deleteDoc(
            doc(
              db,
              "favoritos",
              documentoId
            )
          );

          return;
        }

        const imagenesProyecto =
          obtenerImagenesProyecto(
            proyecto
          );

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
              imagenesProyecto[0] ||
              "",

            imagenes:
              imagenesProyecto,

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
          null
        );
      }
    };

  // ======================================================
  // VER PROYECTO
  // ======================================================

  const verProyecto =
    (proyecto) => {
      navigate(
        `/proyecto/${proyecto.id}`
      );
    };

  // ======================================================
  // SOLICITAR COTIZACIÓN
  // ======================================================

  const solicitarCotizacion = (
    e,
    proyecto
  ) => {
    e.stopPropagation();

    if (!usuario) {
      setMostrarLoginModal(
        true
      );

      return;
    }

    // ================================================
    // OBTENER TODAS LAS IMÁGENES DEL PROYECTO
    // ================================================

    const imagenesProyecto =
      obtenerImagenesProyecto(
        proyecto
      );

    console.log(
      "📸 Imágenes enviadas a cotización:",
      imagenesProyecto
    );

    // ================================================
    // ENVIAR PROYECTO COMPLETO
    // ================================================

    navigate(
      "/crear-cotizacion",
      {
        state: {
          proyecto: {
            ...proyecto,

            id:
              proyecto.id,

            nombre:
              proyecto.nombre ||
              "",

            descripcion:
              proyecto.descripcion ||
              "",

            categoria:
              proyecto.categoria ||
              "",

            ubicacion:
              proyecto.ubicacion ||
              "",

            // PRIMERA IMAGEN
            imagen:
              imagenesProyecto[0] ||
              proyecto.imagen ||
              "",

            // TODAS LAS IMÁGENES
            imagenes:
              imagenesProyecto,
          },
        },
      }
    );
  };

  // ======================================================
  // DETERMINAR SI ES NUEVO
  // ======================================================

  const esNuevo =
    (proyecto) => {
      const fechaBase =
        proyecto.fechaActualizacion?.toDate
          ? proyecto.fechaActualizacion.toDate()
          : proyecto.fecha?.toDate
          ? proyecto.fecha.toDate()
          : null;

      if (!fechaBase) {
        return false;
      }

      const ahora =
        new Date();

      const diferenciaMs =
        ahora.getTime() -
        fechaBase.getTime();

      const VEINTICUATRO_HORAS =
        24 *
        60 *
        60 *
        1000;

      return (
        diferenciaMs >= 0 &&
        diferenciaMs <=
          VEINTICUATRO_HORAS
      );
    };

  // ======================================================
  // LIMPIAR BÚSQUEDA
  // ======================================================

  const limpiarFiltros =
    () => {
      setBusqueda("");
      setCategoria("Todos");
    };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ================================================= */}
      {/* CONTENIDO */}
      {/* ================================================= */}

      <main className="max-w-7xl mx-auto px-5 md:px-6 py-10 md:py-14">

        {/* ================================================= */}
        {/* CONTROLES */}
        {/* ================================================= */}

        <div className="flex flex-col lg:flex-row gap-4 mb-8">

          {/* BUSCADOR */}

          <div className="relative flex-1">

            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />

            <input
              type="text"
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
              placeholder="Buscar por proyecto, categoría, descripción..."
              className="
                w-full
                bg-zinc-900/70
                border
                border-white/10
                rounded-2xl
                pr-12
                py-4
                text-white
                placeholder:text-zinc-600
                outline-none
                focus:border-yellow-500/60
                focus:ring-2
                focus:ring-yellow-500/10
                transition
              "
              style={{
                paddingLeft:
                  "3.2rem",
              }}
            />

            {busqueda && (
              <button
                type="button"
                onClick={() =>
                  setBusqueda("")
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
                aria-label="Limpiar búsqueda"
              >
                <FaTimes />
              </button>
            )}

          </div>

          {/* CATEGORÍAS */}

          <select
            value={categoria}
            onChange={(e) =>
              setCategoria(
                e.target.value
              )
            }
            className="
              min-w-[220px]
              bg-zinc-900/70
              border
              border-white/10
              rounded-2xl
              px-5
              py-4
              text-white
              outline-none
              focus:border-yellow-500/60
              transition
            "
          >

            {categorias.map(
              (cat) => (
                <option
                  key={cat}
                  value={cat}
                >
                  {cat}
                </option>
              )
            )}

          </select>

        </div>

        {/* ================================================= */}
        {/* RESULTADOS */}
        {/* ================================================= */}

        {!cargando &&
          proyectos.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">

              <p className="text-sm text-zinc-500">

                Mostrando{" "}

                <span className="text-white font-medium">
                  {filtrados.length}
                </span>

                {" "}

                {filtrados.length === 1
                  ? "proyecto"
                  : "proyectos"}

                {categoria !==
                  "Todos" && (
                  <>
                    {" "}en{" "}

                    <span className="text-yellow-500">
                      {categoria}
                    </span>
                  </>
                )}

              </p>

              {(busqueda ||
                categoria !==
                  "Todos") && (
                <button
                  type="button"
                  onClick={
                    limpiarFiltros
                  }
                  className="text-sm text-zinc-400 hover:text-yellow-500 transition"
                >
                  Limpiar filtros
                </button>
              )}

            </div>
          )}

        {/* ================================================= */}
        {/* CARGANDO */}
        {/* ================================================= */}

        {cargando && (
          <div className="py-24 text-center">

            <div className="w-11 h-11 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin mx-auto" />

            <p className="text-zinc-500 mt-5">
              Cargando proyectos...
            </p>

          </div>
        )}

        {/* ================================================= */}
        {/* SIN PROYECTOS */}
        {/* ================================================= */}

        {!cargando &&
          proyectos.length ===
            0 && (
            <div className="border border-zinc-800 bg-zinc-950 rounded-3xl py-20 px-6 text-center">

              <FaLayerGroup className="text-zinc-700 text-5xl mx-auto" />

              <h2 className="text-2xl font-semibold mt-5">
                Próximamente
              </h2>

              <p className="text-zinc-500 mt-2">
                Estamos preparando nuestro portafolio de proyectos.
              </p>

            </div>
          )}

        {/* ================================================= */}
        {/* SIN RESULTADOS */}
        {/* ================================================= */}

        {!cargando &&
          proyectos.length >
            0 &&
          filtrados.length ===
            0 && (
            <div className="border border-zinc-800 bg-zinc-950 rounded-3xl py-20 px-6 text-center">

              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto">

                <FaSearch className="text-zinc-600 text-2xl" />

              </div>

              <h2 className="text-2xl font-semibold mt-5">
                No encontramos proyectos
              </h2>

              <p className="text-zinc-500 mt-2 max-w-md mx-auto">
                Prueba con otro término de búsqueda o selecciona una categoría diferente.
              </p>

              <button
                type="button"
                onClick={
                  limpiarFiltros
                }
                className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-xl transition"
              >
                Ver todos los proyectos
              </button>

            </div>
          )}

        {/* ================================================= */}
        {/* GRID */}
        {/* ================================================= */}

        {!cargando &&
          filtrados.length >
            0 && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7 lg:gap-8">

              {filtrados.map(
                (p) => {
                  const isFav =
                    favoritos.some(
                      (f) =>
                        f.proyectoId ===
                          p.id ||
                        f.id === p.id
                    );

                  const nuevo =
                    esNuevo(p);

                  const imagenesProyecto =
                    obtenerImagenesProyecto(
                      p
                    );

                  const portada =
                    obtenerPortada(
                      p
                    );

                  return (
                    <article
                      key={p.id}
                      onClick={() =>
                        verProyecto(
                          p
                        )
                      }
                      className="
                        relative
                        group
                        bg-zinc-950
                        border
                        border-white/10
                        rounded-[28px]
                        overflow-hidden
                        cursor-pointer
                        transition-all
                        duration-300
                        hover:border-yellow-500/30
                        hover:-translate-y-1
                        hover:shadow-2xl
                        hover:shadow-black/40
                      "
                    >

                      {/* ================================= */}
                      {/* IMAGEN */}
                      {/* ================================= */}

                      <div className="relative h-[280px] bg-zinc-900 overflow-hidden">

                        {portada ? (
                          <img
                            src={portada}
                            alt={
                              p.nombre ||
                              "Proyecto Wealth"
                            }
                            loading="lazy"
                            className="
                              w-full
                              h-full
                              object-cover
                              transition-transform
                              duration-500
                              group-hover:scale-[1.04]
                            "
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            Sin imagen
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

                        {/* ETIQUETAS */}

                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">

                          {nuevo && (
                            <span className="bg-yellow-500 text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                              NUEVO
                            </span>
                          )}

                          {p.destacado && (
                            <span className="bg-black/75 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">

                              <FaStar className="text-yellow-500" />

                              Destacado

                            </span>
                          )}

                        </div>

                        {/* NÚMERO DE FOTOS */}

                        {imagenesProyecto.length >
                          1 && (
                          <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md border border-white/15 text-white px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2">

                            <FaImages className="text-yellow-500" />

                            {imagenesProyecto.length} fotos

                          </div>
                        )}

                        {/* FAVORITO */}

                        <button
                          type="button"
                          aria-label={
                            isFav
                              ? "Quitar de favoritos"
                              : "Guardar en favoritos"
                          }
                          onClick={(e) => {
                            e.stopPropagation();

                            toggleFavorito(
                              p
                            );
                          }}
                          disabled={
                            guardandoFavorito ===
                            p.id
                          }
                          className="
                            absolute
                            top-4
                            right-4
                            w-11
                            h-11
                            rounded-full
                            bg-black/70
                            backdrop-blur-md
                            border
                            border-white/15
                            flex
                            items-center
                            justify-center
                            hover:scale-110
                            transition
                            disabled:opacity-50
                          "
                        >

                          {isFav ? (
                            <FaHeart className="text-red-500 text-lg" />
                          ) : (
                            <FaRegHeart className="text-white text-lg" />
                          )}

                        </button>

                      </div>

                      {/* ================================= */}
                      {/* INFORMACIÓN */}
                      {/* ================================= */}

                      <div className="p-6">

                        <div className="flex items-center justify-between gap-3">

                          <p className="text-xs text-yellow-500/90 uppercase tracking-[0.18em] font-medium">
                            {p.categoria ||
                              "Proyecto Wealth"}
                          </p>

                          {p.fecha?.toDate && (
                            <div className="text-[11px] text-zinc-600 flex items-center gap-1.5">

                              <FaClock />

                              {p.fecha
                                .toDate()
                                .toLocaleDateString(
                                  "es-MX",
                                  {
                                    month:
                                      "short",

                                    year:
                                      "numeric",
                                  }
                                )}

                            </div>
                          )}

                        </div>

                        <h2 className="text-xl md:text-2xl font-semibold mt-3 leading-tight group-hover:text-yellow-50 transition">
                          {p.nombre ||
                            "Proyecto Wealth"}
                        </h2>

                        <p className="text-zinc-400 mt-3 text-sm leading-relaxed line-clamp-3 min-h-[63px]">
                          {p.descripcion ||
                            "Conoce los detalles de este proyecto realizado por Wealth."}
                        </p>

                        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-zinc-300 group-hover:text-white transition">

                          Ver proyecto

                          <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />

                        </div>

                        {/* BOTÓN COTIZAR */}

                        <button
                          type="button"
                          onClick={(e) =>
                            solicitarCotizacion(
                              e,
                              p
                            )
                          }
                          className="
                            w-full
                            mt-5
                            bg-white
                            hover:bg-yellow-500
                            text-black
                            font-semibold
                            py-3.5
                            rounded-2xl
                            flex
                            items-center
                            justify-center
                            gap-2
                            transition
                          "
                        >

                          <FaFileInvoiceDollar />

                          Solicitar cotización

                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

      </main>

      {/* ================================================= */}
      {/* CTA INFERIOR */}
      {/* ================================================= */}

      {!cargando &&
        proyectos.length >
          0 && (
          <section className="max-w-7xl mx-auto px-5 md:px-6 pb-16">

            <div className="relative overflow-hidden bg-zinc-950 border border-white/10 rounded-[32px] px-6 py-12 md:px-12 md:py-14">

              <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none" />

              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

                <div>

                  <p className="text-yellow-500 text-xs uppercase tracking-[0.2em] font-semibold">
                    ¿Tienes una idea?
                  </p>

                  <h2 className="text-2xl md:text-4xl font-semibold mt-3">
                    Hagamos realidad tu próximo proyecto.
                  </h2>

                  <p className="text-zinc-400 mt-3 max-w-2xl">
                    Cuéntanos qué necesitas y nuestro equipo podrá preparar una propuesta personalizada.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!usuario) {
                      setMostrarLoginModal(
                        true
                      );

                      return;
                    }

                    navigate(
                      "/crear-cotizacion"
                    );
                  }}
                  className="
                    shrink-0
                    bg-yellow-500
                    hover:bg-yellow-400
                    text-black
                    font-bold
                    px-7
                    py-4
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    gap-2
                    transition
                  "
                >

                  <FaFileInvoiceDollar />

                  Solicitar cotización

                </button>

              </div>

            </div>

          </section>
        )}

      {/* ================================================= */}
      {/* MODAL LOGIN */}
      {/* ================================================= */}

      {mostrarLoginModal && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/85
            backdrop-blur-md
            flex
            items-center
            justify-center
            p-4
          "
          onClick={() =>
            setMostrarLoginModal(
              false
            )
          }
        >

          <div
            className="
              relative
              w-full
              max-w-md
              bg-zinc-950
              border
              border-yellow-500/20
              rounded-3xl
              p-8
              shadow-2xl
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              onClick={() =>
                setMostrarLoginModal(
                  false
                )
              }
              className="absolute top-5 right-5 text-zinc-500 hover:text-white text-xl transition"
            >
              <FaTimes />
            </button>

            <div className="flex justify-center mb-5">

              <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center">

                <FaHeart
                  size={28}
                  className="text-pink-500"
                />

              </div>

            </div>

            <h2 className="text-3xl font-semibold text-center mb-3">
              Accede a Wealth
            </h2>

            <p className="text-zinc-400 text-center mb-8 leading-relaxed">
              Inicia sesión para guardar proyectos y solicitar cotizaciones personalizadas.
            </p>

            <div className="space-y-3">

              <button
                type="button"
                onClick={() => {
                  setMostrarLoginModal(
                    false
                  );

                  navigate(
                    "/login"
                  );
                }}
                className="
                  w-full
                  bg-yellow-500
                  hover:bg-yellow-400
                  text-black
                  font-semibold
                  py-4
                  rounded-2xl
                  transition
                "
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarLoginModal(
                    false
                  );

                  navigate(
                    "/register"
                  );
                }}
                className="
                  w-full
                  bg-zinc-800
                  hover:bg-zinc-700
                  text-white
                  py-4
                  rounded-2xl
                  transition
                "
              >
                Crear cuenta
              </button>

              <button
                type="button"
                onClick={() =>
                  setMostrarLoginModal(
                    false
                  )
                }
                className="
                  w-full
                  py-3
                  text-zinc-500
                  hover:text-white
                  transition
                "
              >
                Continuar explorando
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Proyectos;