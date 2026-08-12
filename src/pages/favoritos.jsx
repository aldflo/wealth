import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import {
  auth,
  db,
} from "../firebase.config";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  FaArrowLeft,
  FaEye,
  FaFileInvoiceDollar,
  FaHeart,
  FaTrash,
  FaWhatsapp,
} from "react-icons/fa";

function Favoritos() {
  const { modoOscuro = false } = useOutletContext() || {};

  const navigate =
    useNavigate();

  const [
    usuario,
    setUsuario,
  ] = useState(null);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    favoritos,
    setFavoritos,
  ] = useState([]);

  const [
    eliminando,
    setEliminando,
  ] = useState(false);

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
            setFavoritos([]);
            setCargando(false);
          }
        }
      );

    return () => unsub();
  }, []);

  // ======================================================
  // FAVORITOS FIRESTORE DEL USUARIO ACTUAL
  // ======================================================

  useEffect(() => {
    if (!usuario) {
      return;
    }

    setCargando(true);

    const q = query(
      collection(
        db,
        "favoritos"
      ),
      where(
        "uid",
        "==",
        usuario.uid
      )
    );

    const unsub =
      onSnapshot(
        q,
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (documento) => ({
                firebaseId:
                  documento.id,

                ...documento.data(),
              })
            );

          setFavoritos(
            data
          );

          setCargando(
            false
          );
        },
        (error) => {
          console.error(
            "Error cargando favoritos:",
            error
          );

          setFavoritos(
            []
          );

          setCargando(
            false
          );
        }
      );

    return () => unsub();

  }, [usuario]);

  // ======================================================
  // HELPERS
  // ======================================================

  const obtenerNombre = (
    proyecto
  ) => {
    return (
      proyecto.nombre ||
      proyecto.titulo ||
      "Proyecto Wealth"
    );
  };

  const obtenerImagen = (
    proyecto
  ) => {
    if (
      Array.isArray(
        proyecto.imagenes
      ) &&
      proyecto.imagenes.length >
        0
    ) {
      return proyecto.imagenes[0];
    }

    return (
      proyecto.imagen ||
      null
    );
  };

  const obtenerProyectoId = (
    proyecto
  ) => {
    return (
      proyecto.proyectoId ||
      proyecto.id ||
      null
    );
  };

  const favoritosNormalizados =
    useMemo(() => {
      return favoritos.map(
        (proyecto) => ({
          ...proyecto,

          id:
            obtenerProyectoId(
              proyecto
            ),

          nombre:
            obtenerNombre(
              proyecto
            ),

          imagen:
            obtenerImagen(
              proyecto
            ),
        })
      );
    }, [
      favoritos,
    ]);

  // ======================================================
  // ELIMINAR FAVORITO
  // ======================================================

  const eliminarFavorito =
    async (
      proyecto
    ) => {
      if (
        !usuario
      ) {
        return;
      }

      const firebaseId =
        proyecto.firebaseId ||
        `${usuario.uid}_${obtenerProyectoId(
          proyecto
        )}`;

      try {
        await deleteDoc(
          doc(
            db,
            "favoritos",
            firebaseId
          )
        );
      } catch (error) {
        console.error(
          "Error eliminando favorito:",
          error
        );

        alert(
          "No se pudo quitar el proyecto de favoritos."
        );
      }
    };

  // ======================================================
  // ELIMINAR TODOS
  // ======================================================

  const eliminarTodos =
    async () => {
      if (
        !usuario ||
        favoritos.length ===
          0
      ) {
        return;
      }

      const confirmar =
        window.confirm(
          "¿Quitar todos los proyectos de Favoritos?"
        );

      if (!confirmar) {
        return;
      }

      try {
        setEliminando(
          true
        );

        const batch =
          writeBatch(db);

        favoritos.forEach(
          (proyecto) => {
            const firebaseId =
              proyecto.firebaseId ||
              `${usuario.uid}_${obtenerProyectoId(
                proyecto
              )}`;

            batch.delete(
              doc(
                db,
                "favoritos",
                firebaseId
              )
            );
          }
        );

        await batch.commit();

      } catch (error) {
        console.error(
          "Error vaciando favoritos:",
          error
        );

        alert(
          "No se pudieron eliminar todos los favoritos."
        );

      } finally {
        setEliminando(
          false
        );
      }
    };

  // ======================================================
  // VER DETALLE
  // ======================================================

  const verProyecto = (
    proyecto
  ) => {
    const id =
      obtenerProyectoId(
        proyecto
      );

    if (!id) {
      return;
    }

    navigate(
      `/proyecto/${id}`
    );
  };

  // ======================================================
  // COTIZAR CON REFERENCIA
  // ======================================================

  const cotizarProyecto = (
    proyecto
  ) => {
    const id =
      obtenerProyectoId(
        proyecto
      );

    navigate(
      "/crear-cotizacion",
      {
        state: {
          proyecto: {
            ...proyecto,

            id,

            nombre:
              obtenerNombre(
                proyecto
              ),

            titulo:
              obtenerNombre(
                proyecto
              ),

            proyectoReferenciaId:
              id,

            proyectoReferenciaNombre:
              obtenerNombre(
                proyecto
              ),

            proyectoReferenciaCategoria:
              proyecto.categoria ||
              proyecto.tipo ||
              "",
          },
        },
      }
    );
  };

  // ======================================================
  // WHATSAPP
  // ======================================================

  const contactarWhatsApp = (
    proyecto
  ) => {
    const telefono =
      "529811574778";

    const nombre =
      obtenerNombre(
        proyecto
      );

    const mensaje =
      `Hola 👋, vi el proyecto "${nombre}" en la página de Wealth y me gustaría recibir información.`;

    window.open(
      `https://wa.me/${telefono}?text=${encodeURIComponent(
        mensaje
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const consultarTodosWhatsApp =
    () => {
      if (
        favoritosNormalizados.length ===
        0
      ) {
        return;
      }

      const telefono =
        "529811574778";

      const lista =
        favoritosNormalizados
          .map(
            (proyecto) =>
              `• ${proyecto.nombre}`
          )
          .join("\n");

      const mensaje =
        `Hola 👋, guardé estos proyectos como favoritos y me gustaría recibir información para compararlos:\n\n${lista}`;

      window.open(
        `https://wa.me/${telefono}?text=${encodeURIComponent(
          mensaje
        )}`,
        "_blank",
        "noopener,noreferrer"
      );
    };

  // ======================================================
  // NO HAY SESIÓN
  // ======================================================

  if (!usuario && !cargando) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-5 transition-colors duration-300 ${modoOscuro ? "bg-black text-white" : "wealth-light bg-gray-50 text-gray-900"}`}>

        <div className={`w-full max-w-lg border rounded-3xl p-8 text-center ${modoOscuro ? "bg-zinc-950 border-zinc-800" : "bg-white border-gray-200 shadow-xl"}`}>

          <div className="w-20 h-20 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto">

            <FaHeart
              size={32}
              className="text-pink-500"
            />

          </div>

          <h1 className="text-3xl font-bold mt-6">
            Tus favoritos son personales
          </h1>

          <p className={modoOscuro ? "text-zinc-500 mt-3 leading-relaxed" : "text-gray-500 mt-3 leading-relaxed"}>
            Inicia sesión para consultar los proyectos guardados en tu cuenta.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/login"
              )
            }
            className="w-full mt-7 bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-2xl font-bold transition"
          >
            Iniciar sesión
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className={`min-h-screen transition-colors duration-300 ${modoOscuro ? "bg-black text-white" : "wealth-light bg-gray-50 text-gray-900"}`}>

      <style>{temaClaroCss}</style>
      <section className="border-b border-white/10 py-14 md:py-20 px-5 md:px-6">

        <div className="max-w-7xl mx-auto">

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="mb-8 flex items-center gap-3 text-zinc-400 hover:text-white transition"
          >
            <FaArrowLeft />
            Volver
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">

            <div>

              <p className="text-xs uppercase tracking-[0.22em] text-yellow-500 font-semibold">
                Mi cuenta
              </p>

              <h1 className="text-4xl md:text-5xl font-bold mt-2">
                Mis favoritos
              </h1>

              <p className="text-zinc-500 mt-3">
                Estos proyectos pertenecen únicamente a tu cuenta.
              </p>

            </div>

            <div className="bg-zinc-900/70 border border-white/10 rounded-3xl p-6 md:p-7 w-full lg:w-auto lg:min-w-[300px]">

              <p className="text-zinc-500 text-xs uppercase tracking-wider">
                Proyectos guardados
              </p>

              <h2 className="text-5xl font-bold mt-2">
                {
                  favoritosNormalizados.length
                }
              </h2>

              {favoritosNormalizados.length >
                0 && (
                <div className="grid gap-3 mt-6">

                  <button
                    type="button"
                    onClick={
                      consultarTodosWhatsApp
                    }
                    className="w-full bg-green-600 hover:bg-green-500 py-3.5 px-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition"
                  >
                    <FaWhatsapp />
                    Consultar todos
                  </button>

                  <button
                    type="button"
                    disabled={
                      eliminando
                    }
                    onClick={
                      eliminarTodos
                    }
                    className="w-full bg-black hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/40 text-zinc-400 hover:text-red-400 py-3.5 px-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition disabled:opacity-50"
                  >
                    <FaTrash />

                    {eliminando
                      ? "Eliminando..."
                      : "Vaciar favoritos"}
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>

      </section>

      <section className="max-w-7xl mx-auto px-5 md:px-6 py-12 md:py-16">

        {cargando ? (

          <div className="py-24 text-center">

            <div className="w-11 h-11 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin mx-auto" />

            <p className="text-zinc-500 mt-4">
              Cargando favoritos...
            </p>

          </div>

        ) : favoritosNormalizados.length ===
        0 ? (

          <div className="text-center py-20 md:py-28">

            <div className="w-24 h-24 md:w-28 md:h-28 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8">

              <FaHeart
                size={40}
                className="text-pink-500"
              />

            </div>

            <h2 className="text-3xl md:text-4xl font-semibold">
              No tienes favoritos
            </h2>

            <p className="text-zinc-500 mt-4 max-w-lg mx-auto">
              Explora nuestros proyectos y guarda los diseños que más te gusten.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/proyectos"
                )
              }
              className="mt-9 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-4 rounded-2xl transition"
            >
              Explorar proyectos
            </button>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">

            {favoritosNormalizados.map(
              (proyecto) => (
              <article
                key={
                  proyecto.firebaseId ||
                  proyecto.id
                }
                className="group bg-zinc-950 border border-zinc-800 hover:border-yellow-500/30 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >

                <div className="relative overflow-hidden bg-black h-72">

                  {proyecto.imagen ? (

                    <img
                      src={
                        proyecto.imagen
                      }
                      alt={
                        proyecto.nombre
                      }
                      onClick={() =>
                        verProyecto(
                          proyecto
                        )
                      }
                      className="h-full w-full object-cover cursor-pointer transition duration-500 group-hover:scale-105"
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      Sin imagen
                    </div>

                  )}

                  <span className="absolute top-4 left-4 bg-black/80 border border-white/10 backdrop-blur px-3 py-2 rounded-full text-xs flex items-center gap-2">

                    <FaHeart className="text-pink-500" />
                    Favorito

                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      eliminarFavorito(
                        proyecto
                      );
                    }}
                    title="Quitar de favoritos"
                    className="absolute top-4 right-4 bg-black/80 hover:bg-red-600 border border-white/10 p-3 rounded-full text-white transition"
                  >
                    <FaTrash />
                  </button>

                </div>

                <div className="p-6">

                  {proyecto.categoria && (
                    <span className="inline-block px-3 py-1.5 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      {
                        proyecto.categoria
                      }
                    </span>
                  )}

                  <h3 className="text-2xl font-semibold mt-4">
                    {
                      proyecto.nombre
                    }
                  </h3>

                  {proyecto.descripcion && (
                    <p className="text-zinc-500 mt-3 line-clamp-3 leading-relaxed">
                      {
                        proyecto.descripcion
                      }
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      verProyecto(
                        proyecto
                      )
                    }
                    className="mt-6 w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-3 transition"
                  >
                    <FaEye />
                    Ver proyecto
                  </button>

                  <div className="grid sm:grid-cols-2 gap-3 mt-3">

                    <button
                      type="button"
                      onClick={() =>
                        cotizarProyecto(
                          proyecto
                        )
                      }
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3.5 px-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition"
                    >
                      <FaFileInvoiceDollar />
                      Cotizar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        contactarWhatsApp(
                          proyecto
                        )
                      }
                      className="w-full bg-green-600 hover:bg-green-500 text-white py-3.5 px-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition"
                    >
                      <FaWhatsapp />
                      WhatsApp
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>

        )}

      </section>

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

export default Favoritos;