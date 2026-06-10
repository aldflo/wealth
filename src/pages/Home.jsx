import Navbar from "../components/Navbar";
import wealthLogo from "../assets/wealthlogo.jpeg";
import { Link } from "react-router-dom";

function Home() {

  return (

    <div className="w-full min-h-screen bg-[#0a0a0a] overflow-hidden">

      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section className="relative w-full h-[550px] md:h-[650px] overflow-hidden">

        {/* IMAGEN DE FONDO */}
        <img
          src={wealthLogo}
          alt="Wealth"
          className="absolute inset-0 w-full h-full object-contain object-[80%] bg-black scale-95 brightness-110 contrast-125 saturate-125"
        />

        {/* OVERLAY SUAVE */}
        <div className="absolute inset-0 bg-black/25"></div>

        {/* EFECTO DORADO */}
        <div className="absolute inset-0 bg-[#c89b3c]/10 mix-blend-soft-light"></div>

        {/* DEGRADADO */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

        {/* LINEAS DORADAS */}
        <div className="absolute inset-0 overflow-hidden">

          <div className="absolute w-[180%] h-[5px] bg-[#c89b3c] rotate-[27deg] top-[16%] -left-52 opacity-90"></div>

          <div className="absolute w-[180%] h-[2px] bg-[#e0b84d] rotate-[27deg] top-[18%] -left-52 opacity-80"></div>

          <div className="absolute w-[180%] h-[5px] bg-[#c89b3c] rotate-[27deg] bottom-[16%] -left-52 opacity-90"></div>

          <div className="absolute w-[180%] h-[2px] bg-[#e0b84d] rotate-[27deg] bottom-[18%] -left-52 opacity-80"></div>

        </div>

        {/* CONTENIDO */}
        <div className="relative z-20 h-full flex items-center">

          <div className="max-w-7xl mx-auto w-full px-6">

            <div className="max-w-2xl">



              <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-2xl">

                Construcción, innovación
                <span className="text-[#c89b3c]">
                  {" "}y desarrollo integral.
                </span>

              </h1>

              <p className="text-zinc-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">

                En Wealth unimos experiencia en construcción,
                inmobiliaria, aluminio y soluciones arquitectónicas,
                desarrollando proyectos modernos, funcionales
                y de alta calidad para transformar espacios
                y construir el futuro.

              </p>

              <div className="flex flex-wrap gap-5">

                <Link
                  to="/proyectos"
                  className="bg-[#c89b3c] hover:bg-[#d6ab4c] text-black px-8 py-4 rounded-full font-bold transition duration-300 shadow-2xl"
                >
                  Explorar Proyectos
                </Link>

                <a
                  href="https://wa.me/529811574778"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#c89b3c] text-white hover:bg-[#c89b3c] hover:text-black px-8 py-4 rounded-full font-semibold transition duration-300"
                >
                  Solicitar Cotización
                </a>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* SECCION INFO */}
      <section className="bg-[#111111] py-20 px-6">

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">

          {/* CARD 1 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-[#c89b3c] transition duration-300 shadow-xl hover:-translate-y-2">

            <h2 className="text-white text-2xl font-bold mb-4">
              Inmobiliaria
            </h2>

            <p className="text-zinc-400 leading-relaxed">
              Desarrollo y comercialización de propiedades,
              terrenos y proyectos inmobiliarios con visión moderna
              y enfoque en inversión segura.
            </p>

          </div>

          {/* CARD 2 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-[#c89b3c] transition duration-300 shadow-xl hover:-translate-y-2">

            <h2 className="text-white text-2xl font-bold mb-4">
              Construcciones
            </h2>

            <p className="text-zinc-400 leading-relaxed">
              Soluciones integrales en ingeniería, urbanización,
              electrificación, obra civil y proyectos arquitectónicos
              de alta calidad.
            </p>

          </div>

          {/* CARD 3 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-[#c89b3c] transition duration-300 shadow-xl hover:-translate-y-2">

            <h2 className="text-white text-2xl font-bold mb-4">
              Aluminios y Vidrios
            </h2>

            <p className="text-zinc-400 leading-relaxed">
              Fabricación e instalación de cancelería,
              estructuras de aluminio, vidrios templados,
              domos y soluciones modernas para espacios residenciales
              y comerciales.
            </p>

          </div>

        </div>

      </section>

    </div>

  );

}

export default Home;