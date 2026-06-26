import { useEffect, useState } from "react";
import {
  FaHeart,
  FaTrash,
  FaWhatsapp,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const data =
      JSON.parse(localStorage.getItem("favoritos")) || [];

    setFavoritos(data);
  }, []);

  const eliminarFavorito = (id) => {
    const nuevos = favoritos.filter(
      (item) => item.id !== id
    );

    setFavoritos(nuevos);

    localStorage.setItem(
      "favoritos",
      JSON.stringify(nuevos)
    );
  };

  const cotizarProyecto = (proyecto) => {
    const mensaje = encodeURIComponent(
      `Hola, me interesa cotizar el proyecto:\n\n${proyecto.titulo}`
    );

    window.open(
      `https://wa.me/529932111111?text=${mensaje}`,
      "_blank"
    );
  };

  const cotizarTodos = () => {
    if (!favoritos.length) return;

    const lista = favoritos
      .map((p) => `• ${p.titulo}`)
      .join("\n");

    const mensaje = encodeURIComponent(
      `Hola, me interesa cotizar los siguientes proyectos:\n\n${lista}`
    );

    window.open(
      `https://wa.me/529932111111?text=${mensaje}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="border-b border-white/10 py-24 px-6">

        <div className="max-w-7xl mx-auto">

          <button
            onClick={() => navigate(-1)}
            className="mb-10 flex items-center gap-3 text-zinc-400 hover:text-white transition"
          >
            <FaArrowLeft />
            Volver
          </button>

          <div className="flex flex-col lg:flex-row justify-between gap-8">

            <div>
              <p className="uppercase tracking-[0.3em] text-yellow-500 text-sm mb-4">
                Wealth
              </p>

              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
                Mis
                <span className="text-white/60">
                  {" "}Favoritos
                </span>
              </h1>

              <p className="mt-6 text-zinc-400 max-w-2xl text-lg">
                Guarda proyectos de construcción,
                inmobiliaria y aluminio para
                cotizarlos más adelante.
              </p>
            </div>

            <div className="bg-zinc-900/70 border border-white/10 rounded-3xl p-8 min-w-[250px]">

              <p className="text-zinc-500 text-sm">
                PROYECTOS GUARDADOS
              </p>

              <h2 className="text-5xl font-bold mt-2">
                {favoritos.length}
              </h2>

              {favoritos.length > 0 && (
                <button
                  onClick={cotizarTodos}
                  className="
                    mt-6
                    w-full
                    bg-green-600
                    hover:bg-green-700
                    py-4
                    rounded-2xl
                    font-semibold
                    flex
                    items-center
                    justify-center
                    gap-3
                    transition
                  "
                >
                  <FaWhatsapp />
                  Cotizar todos
                </button>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* CONTENIDO */}
      <section className="max-w-7xl mx-auto px-6 py-16">

        {favoritos.length === 0 ? (

          <div className="text-center py-28">

            <div className="w-28 h-28 mx-auto rounded-full bg-zinc-900 flex items-center justify-center mb-8">
              <FaHeart
                size={42}
                className="text-pink-500"
              />
            </div>

            <h2 className="text-4xl font-semibold">
              No tienes favoritos
            </h2>

            <p className="text-zinc-500 mt-4 max-w-lg mx-auto">
              Explora nuestros proyectos y guarda los
              diseños que más te gusten para cotizarlos
              posteriormente.
            </p>

            <button
              onClick={() => navigate("/proyectos")}
              className="
                mt-10
                bg-yellow-500
                hover:bg-yellow-400
                text-black
                font-semibold
                px-8
                py-4
                rounded-2xl
                transition
              "
            >
              Explorar proyectos
            </button>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">

            {favoritos.map((proyecto) => (

<div
  key={proyecto.id}
  onClick={() => navigate(`/proyecto/${proyecto.id}`)}
  className="
    cursor-pointer
    group
    bg-zinc-900/60
    border
    border-white/10
    rounded-[32px]
    overflow-hidden
    hover:border-yellow-500/50
    hover:scale-[1.02]
    transition-all
    duration-300
  "
>

                <div className="relative overflow-hidden">

                  <img
                    src={proyecto.imagen}
                    alt={proyecto.titulo}
                    className="
                      h-72
                      w-full
                      object-cover
                      transition
                      duration-500
                      group-hover:scale-105
                    "
                  />

                  <button
                    onClick={() =>
                      eliminarFavorito(proyecto.id)
                    }
                    className="
                      absolute
                      top-4
                      right-4
                      bg-red-600
                      hover:bg-red-700
                      p-3
                      rounded-full
                      transition
                    "
                  >
                    <FaTrash />
                  </button>

                </div>

                <div className="p-7">

                  <span className="
                    inline-block
                    px-4
                    py-2
                    rounded-full
                    text-xs
                    bg-yellow-500/10
                    text-yellow-400
                    border
                    border-yellow-500/20
                  ">
                    {proyecto.categoria}
                  </span>

                  <h3 className="text-2xl font-semibold mt-5">
                    {proyecto.titulo}
                  </h3>

                  <p className="text-zinc-500 mt-3 line-clamp-2">
                    {proyecto.descripcion}
                  </p>

                  <button
                    onClick={() =>
                      cotizarProyecto(proyecto)
                    }
                    className="
                      mt-8
                      w-full
                      bg-green-600
                      hover:bg-green-700
                      py-4
                      rounded-2xl
                      font-semibold
                      flex
                      items-center
                      justify-center
                      gap-3
                      transition
                    "
                  >
                    <FaWhatsapp />
                    Solicitar cotización
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Favoritos;