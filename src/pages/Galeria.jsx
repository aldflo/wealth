import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { db } from "../firebase.config";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import {
  FaSearch,
  FaTimes,
  FaImages,
  FaArrowRight,
  FaFileInvoiceDollar,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaLayerGroup,
} from "react-icons/fa";

// ======================================================
// NORMALIZAR NOMBRES ANTIGUOS
// ======================================================

const normalizarCategoria = (
  categoria
) => {
  if (
    categoria ===
    "Vidrio y Aluminio"
  ) {
    return "Aluminios y Vidrios";
  }

  return categoria;
};

// ======================================================
// COMPONENTE
// ======================================================

function Galeria() {
  const navigate =
    useNavigate();

  // ====================================================
  // FIREBASE
  // ====================================================

  const [grupos, setGrupos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ====================================================
  // FILTROS
  // ====================================================

  const [
    filtroCategoria,
    setFiltroCategoria,
  ] = useState("todos");

  const [
    filtroSubcategoria,
    setFiltroSubcategoria,
  ] = useState("todos");

  const [busqueda, setBusqueda] =
    useState("");

  // ====================================================
  // LIGHTBOX
  // ====================================================

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    imagenesActivas,
    setImagenesActivas,
  ] = useState([]);

  const [
    indiceImagen,
    setIndiceImagen,
  ] = useState(0);

  const [
    grupoActivo,
    setGrupoActivo,
  ] = useState(null);

  // ====================================================
  // FIRESTORE TIEMPO REAL
  // ====================================================

  useEffect(() => {
    const unsub =
      onSnapshot(
        collection(
          db,
          "galeria"
        ),

        (snap) => {
          const data =
            snap.docs.map(
              (documento) => {
                const datos =
                  documento.data();

                return {
                  id:
                    documento.id,

                  ...datos,

                  categoria:
                    normalizarCategoria(
                      datos.categoria
                    ),
                };
              }
            );

          data.sort(
            (a, b) => {
              const categoria =
                (
                  a.categoria ||
                  ""
                ).localeCompare(
                  b.categoria ||
                    "",
                  "es"
                );

              if (
                categoria !== 0
              ) {
                return categoria;
              }

              return (
                a.subcategoria ||
                ""
              ).localeCompare(
                b.subcategoria ||
                  "",
                "es"
              );
            }
          );

          setGrupos(data);

          setLoading(false);
        },

        (error) => {
          console.error(
            "Error cargando galería:",
            error
          );

          setLoading(false);
        }
      );

    return () => unsub();
  }, []);

  // ====================================================
  // CATEGORÍAS AUTOMÁTICAS
  // ====================================================

  const categorias =
    useMemo(() => {
      return [
        ...new Set(
          grupos
            .map((g) =>
              normalizarCategoria(
                g.categoria
              )
            )
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        a.localeCompare(
          b,
          "es"
        )
      );
    }, [grupos]);

  // ====================================================
  // SUBCATEGORÍAS AUTOMÁTICAS
  // ====================================================

  const subcategorias =
    useMemo(() => {
      const disponibles =
        grupos
          .filter(
            (g) =>
              filtroCategoria ===
                "todos" ||
              normalizarCategoria(
                g.categoria
              ) ===
                filtroCategoria
          )
          .map(
            (g) =>
              g.subcategoria
          )
          .filter(Boolean);

      return [
        ...new Set(
          disponibles
        ),
      ].sort((a, b) =>
        a.localeCompare(
          b,
          "es"
        )
      );
    }, [
      grupos,
      filtroCategoria,
    ]);

  // ====================================================
  // FILTRO
  // ====================================================

  const gruposFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return grupos.filter(
        (g) => {
          const categoria =
            normalizarCategoria(
              g.categoria
            );

          const catOk =
            filtroCategoria ===
              "todos" ||
            categoria ===
              filtroCategoria;

          const subOk =
            filtroSubcategoria ===
              "todos" ||
            g.subcategoria ===
              filtroSubcategoria;

          const contenido = [
            categoria,
            g.subcategoria,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const busquedaOk =
            !texto ||
            contenido.includes(
              texto
            );

          return (
            catOk &&
            subOk &&
            busquedaOk
          );
        }
      );
    }, [
      grupos,
      filtroCategoria,
      filtroSubcategoria,
      busqueda,
    ]);

  // ====================================================
  // TOTAL IMÁGENES
  // ====================================================

  const totalImagenes =
    useMemo(() => {
      return gruposFiltrados.reduce(
        (total, grupo) =>
          total +
          (Array.isArray(
            grupo.imagenes
          )
            ? grupo.imagenes
                .length
            : 0),

        0
      );
    }, [gruposFiltrados]);

  // ====================================================
  // LIMPIAR FILTROS
  // ====================================================

  const limpiarFiltros = () => {
    setBusqueda("");

    setFiltroCategoria(
      "todos"
    );

    setFiltroSubcategoria(
      "todos"
    );
  };

  // ====================================================
  // ABRIR IMAGEN
  // ====================================================

  const abrirImagen = (
    grupo,
    index
  ) => {
    const imagenes =
      Array.isArray(
        grupo.imagenes
      )
        ? grupo.imagenes
        : [];

    if (!imagenes.length) {
      return;
    }

    setGrupoActivo(
      grupo
    );

    setImagenesActivas(
      imagenes
    );

    setIndiceImagen(
      index
    );

    setModalOpen(true);
  };

  // ====================================================
  // SIGUIENTE
  // ====================================================

  const siguienteImagen =
    () => {
      setIndiceImagen(
        (prev) =>
          prev + 1 >=
          imagenesActivas.length
            ? 0
            : prev + 1
      );
    };

  // ====================================================
  // ANTERIOR
  // ====================================================

  const anteriorImagen =
    () => {
      setIndiceImagen(
        (prev) =>
          prev === 0
            ? imagenesActivas.length -
              1
            : prev - 1
      );
    };

  // ====================================================
  // COTIZAR GRUPO COMPLETO
  // ====================================================

  const cotizarGrupo = (
    grupo
  ) => {
    const imagenes =
      Array.isArray(
        grupo.imagenes
      )
        ? grupo.imagenes
        : [];

    navigate(
      "/crear-cotizacion",
      {
        state: {
          proyecto: {
            id: `galeria_${grupo.id}`,

            nombre:
              grupo.subcategoria,

            descripcion:
              `Me interesa realizar un trabajo similar a los diseños de "${grupo.subcategoria}".`,

            categoria:
              grupo.categoria,

            imagen:
              imagenes[0] ||
              "",

            imagenes,
          },
        },
      }
    );
  };

  // ====================================================
  // USAR UNA FOTO COMO REFERENCIA
  // ====================================================

  const cotizarImagenActual =
    () => {
      if (
        !grupoActivo ||
        !imagenesActivas.length
      ) {
        return;
      }

      const imagen =
        imagenesActivas[
          indiceImagen
        ];

      setModalOpen(false);

      navigate(
        "/crear-cotizacion",
        {
          state: {
            proyecto: {
              id: `galeria_${grupoActivo.id}_${indiceImagen}`,

              nombre:
                grupoActivo.subcategoria,

              descripcion:
                `Me interesa realizar un trabajo similar a esta referencia de "${grupoActivo.subcategoria}".`,

              categoria:
                grupoActivo.categoria,

              imagen,

              imagenes: [
                imagen,
              ],
            },
          },
        }
      );
    };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

     

      {/* ================================================= */}
      {/* CONTENIDO */}
      {/* ================================================= */}

      <main className="max-w-7xl mx-auto px-5 md:px-6 py-10 md:py-14">

        {/* ================================================= */}
        {/* BUSCADOR */}
        {/* ================================================= */}

        <div className="relative mb-4">

          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />

          <input
            type="text"
            value={busqueda}
            onChange={(e) =>
              setBusqueda(
                e.target.value
              )
            }
            placeholder="Buscar protectores, portones, canceles, ventanas..."
            className="
              w-full
              bg-zinc-900
              border
              border-zinc-700
              rounded-2xl
              py-4
              pl-12
              pr-12
              text-white
              placeholder:text-zinc-600
              outline-none
              focus:border-yellow-500/70
              focus:ring-2
              focus:ring-yellow-500/10
              transition
            "
          />

          {busqueda && (
            <button
              type="button"
              onClick={() =>
                setBusqueda("")
              }
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <FaTimes />
            </button>
          )}

        </div>

        {/* ================================================= */}
        {/* FILTROS */}
        {/* ================================================= */}

        <div className="grid md:grid-cols-2 gap-4">

          <select
            value={
              filtroCategoria
            }
            onChange={(e) => {
              setFiltroCategoria(
                e.target.value
              );

              setFiltroSubcategoria(
                "todos"
              );
            }}
            className={selectClass}
          >

            <option value="todos">
              Todas las categorías
            </option>

            {categorias.map(
              (categoria) => (
                <option
                  key={categoria}
                  value={categoria}
                >
                  {categoria}
                </option>
              )
            )}

          </select>

          <select
            value={
              filtroSubcategoria
            }
            onChange={(e) =>
              setFiltroSubcategoria(
                e.target.value
              )
            }
            className={selectClass}
          >

            <option value="todos">
              Todas las subcategorías
            </option>

            {subcategorias.map(
              (subcategoria) => (
                <option
                  key={
                    subcategoria
                  }
                  value={
                    subcategoria
                  }
                >
                  {subcategoria}
                </option>
              )
            )}

          </select>

        </div>

        {/* ================================================= */}
        {/* CONTADOR */}
        {/* ================================================= */}

        {!loading && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6 mb-10">

            <div className="flex flex-wrap gap-3">

              <InfoChip
                icon={
                  <FaImages />
                }
                numero={
                  totalImagenes
                }
                texto={
                  totalImagenes ===
                  1
                    ? "imagen"
                    : "imágenes"
                }
              />

              <InfoChip
                icon={
                  <FaLayerGroup />
                }
                numero={
                  gruposFiltrados.length
                }
                texto={
                  gruposFiltrados.length ===
                  1
                    ? "sección"
                    : "secciones"
                }
              />

            </div>

            {(busqueda ||
              filtroCategoria !==
                "todos" ||
              filtroSubcategoria !==
                "todos") && (
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
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <div className="py-24 text-center">

            <div className="w-11 h-11 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin mx-auto" />

            <p className="text-zinc-500 mt-5">
              Cargando galería...
            </p>

          </div>
        )}

        {/* ================================================= */}
        {/* SIN RESULTADOS */}
        {/* ================================================= */}

        {!loading &&
          gruposFiltrados.length ===
            0 && (
            <div className="bg-zinc-950 border border-zinc-700 rounded-3xl py-20 px-6 text-center">

              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto">

                <FaSearch className="text-zinc-600 text-2xl" />

              </div>

              <h2 className="text-2xl font-bold mt-5">
                No encontramos diseños
              </h2>

              <p className="text-zinc-500 mt-2">
                Prueba otra categoría o término de búsqueda.
              </p>

              <button
                type="button"
                onClick={
                  limpiarFiltros
                }
                className={`${botonBase} mx-auto mt-6 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500`}
              >
                Ver toda la galería
              </button>

            </div>
          )}

        {/* ================================================= */}
        {/* GRUPOS */}
        {/* ================================================= */}

        {!loading && (
          <div className="space-y-16">

            {gruposFiltrados.map(
              (grupo) => {
                const imagenes =
                  Array.isArray(
                    grupo.imagenes
                  )
                    ? grupo.imagenes
                    : [];

                return (
                  <section
                    key={grupo.id}
                  >

                    {/* HEADER GRUPO */}

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">

                      <div>

                        <p className="text-xs uppercase tracking-[0.22em] text-yellow-500 font-semibold">
                          {
                            grupo.categoria
                          }
                        </p>

                        <h2 className="text-2xl md:text-3xl font-bold mt-2">
                          {
                            grupo.subcategoria
                          }
                        </h2>

                        <p className="text-zinc-500 text-sm mt-2">

                          {
                            imagenes.length
                          }{" "}

                          {imagenes.length ===
                          1
                            ? "diseño disponible"
                            : "diseños disponibles"}

                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          cotizarGrupo(
                            grupo
                          )
                        }
                        className={`${botonBase} border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500`}
                      >
                        <FaFileInvoiceDollar />

                        Cotizar algo similar

                        <FaArrowRight />
                      </button>

                    </div>

                    {/* ===================================== */}
                    {/* IMÁGENES */}
                    {/* ===================================== */}

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">

                      {imagenes.map(
                        (
                          img,
                          index
                        ) => (
                          <button
                            type="button"
                            key={`${grupo.id}-${index}`}
                            onClick={() =>
                              abrirImagen(
                                grupo,
                                index
                              )
                            }
                            className="
                              relative
                              group
                              overflow-hidden
                              bg-zinc-900
                              border
                              border-zinc-800
                              hover:border-yellow-500/50
                              rounded-2xl
                              md:rounded-3xl
                              aspect-[4/3]
                              cursor-zoom-in
                              transition-all
                              duration-300
                            "
                          >

                            <img
                              src={img}
                              alt={`${grupo.subcategoria} ${index + 1}`}
                              loading="lazy"
                              className="
                                w-full
                                h-full
                                object-cover
                                transition-transform
                                duration-500
                                group-hover:scale-105
                              "
                            />

                            {/* HOVER */}

                            <div
                              className="
                                absolute
                                inset-0
                                bg-black/0
                                group-hover:bg-black/35
                                transition
                                flex
                                items-center
                                justify-center
                              "
                            >

                              <div
                                className="
                                  opacity-0
                                  group-hover:opacity-100
                                  w-11
                                  h-11
                                  rounded-full
                                  bg-black/80
                                  border
                                  border-white/20
                                  flex
                                  items-center
                                  justify-center
                                  text-white
                                  transition
                                "
                              >

                                <FaExpand />

                              </div>

                            </div>

                          </button>
                        )
                      )}

                    </div>

                  </section>
                );
              }
            )}

          </div>
        )}

      </main>

      {/* ================================================= */}
      {/* LIGHTBOX */}
      {/* ================================================= */}

      {modalOpen &&
        imagenesActivas.length >
          0 && (
          <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 md:p-8"
            onClick={() =>
              setModalOpen(
                false
              )
            }
          >

            {/* CERRAR */}

            <button
              type="button"
              onClick={() =>
                setModalOpen(
                  false
                )
              }
              className="
                absolute
                top-4
                right-4
                md:top-6
                md:right-6
                z-30
                w-11
                h-11
                bg-zinc-900
                border
                border-zinc-700
                hover:border-red-500/70
                hover:text-red-400
                rounded-xl
                flex
                items-center
                justify-center
                transition
              "
            >
              <FaTimes />
            </button>

            {/* ANTERIOR */}

            {imagenesActivas.length >
              1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  anteriorImagen();
                }}
                className="
                  absolute
                  left-2
                  md:left-7
                  z-30
                  w-11
                  h-11
                  md:w-13
                  md:h-13
                  rounded-xl
                  bg-zinc-900/90
                  border
                  border-zinc-700
                  hover:border-yellow-500
                  text-white
                  flex
                  items-center
                  justify-center
                  transition
                "
              >
                <FaChevronLeft />
              </button>
            )}

            {/* CONTENIDO */}

            <div
              className="w-full max-w-6xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="flex items-center justify-center min-h-[55vh] md:min-h-[70vh]">

                <img
                  src={
                    imagenesActivas[
                      indiceImagen
                    ]
                  }
                  alt={
                    grupoActivo?.subcategoria ||
                    "Diseño"
                  }
                  className="max-w-full max-h-[70vh] md:max-h-[76vh] object-contain rounded-2xl"
                />

              </div>

              {/* INFO */}

              <div className="mt-5 bg-zinc-950 border border-zinc-700 rounded-2xl md:rounded-3xl p-4 md:p-5">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div>

                    <p className="text-xs uppercase tracking-wider text-yellow-500">
                      {
                        grupoActivo?.categoria
                      }
                    </p>

                    <h3 className="font-bold text-lg md:text-xl mt-1">
                      {
                        grupoActivo?.subcategoria
                      }
                    </h3>

                    <p className="text-xs text-zinc-500 mt-1">

                      Imagen{" "}

                      {indiceImagen +
                        1}{" "}

                      de{" "}

                      {
                        imagenesActivas.length
                      }

                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      cotizarImagenActual
                    }
                    className={`${botonBase} border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500`}
                  >
                    <FaFileInvoiceDollar />

                    Usar esta imagen como referencia

                    <FaArrowRight />
                  </button>

                </div>

              </div>

            </div>

            {/* SIGUIENTE */}

            {imagenesActivas.length >
              1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  siguienteImagen();
                }}
                className="
                  absolute
                  right-2
                  md:right-7
                  z-30
                  w-11
                  h-11
                  md:w-13
                  md:h-13
                  rounded-xl
                  bg-zinc-900/90
                  border
                  border-zinc-700
                  hover:border-yellow-500
                  text-white
                  flex
                  items-center
                  justify-center
                  transition
                "
              >
                <FaChevronRight />
              </button>
            )}

          </div>
        )}

    </div>
  );
}

// ======================================================
// ESTILOS
// ======================================================

const selectClass = `
  w-full
  bg-zinc-900
  border
  border-zinc-700
  rounded-2xl
  p-4
  text-white
  outline-none
  focus:border-yellow-500/70
  transition
`;

const botonBase = `
  bg-black
  border
  px-5
  py-3.5
  rounded-2xl
  font-semibold
  flex
  items-center
  justify-center
  gap-2
  transition-all
  duration-200
  hover:-translate-y-[1px]
`;

// ======================================================
// CHIP
// ======================================================

function InfoChip({
  icon,
  numero,
  texto,
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 flex items-center gap-2 text-sm">

      <span className="text-yellow-500">
        {icon}
      </span>

      <strong>
        {numero}
      </strong>

      <span className="text-zinc-500">
        {texto}
      </span>

    </div>
  );
}

export default Galeria;