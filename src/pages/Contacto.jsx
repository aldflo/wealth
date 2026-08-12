import {
  useOutletContext,
} from "react-router-dom";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaClock,
  FaStar,
} from "react-icons/fa";


function Contacto() {

  const {
    modoOscuro,
  } = useOutletContext();


  const opiniones = [
    {
      nombre:
        "Carlos Méndez",

      texto:
        "Excelente trabajo en cancelería de vidrio, muy profesionales y puntuales.",

      estrellas:
        5,
    },

    {
      nombre:
        "María López",

      texto:
        "Me gustó mucho el diseño de la puerta de herrería, quedó mejor de lo esperado.",

      estrellas:
        5,
    },

    {
      nombre:
        "José Ramírez",

      texto:
        "Buen servicio y atención rápida, recomendable.",

      estrellas:
        4,
    },
  ];


  return (
    <div
      className={`
        min-h-screen

        transition-colors
        duration-300

        ${
          modoOscuro
            ? "bg-black text-white"
            : "bg-gray-50 text-gray-900"
        }
      `}
    >

      {/* HERO */}

      <section
        className={`
          relative

          py-28
          px-6

          border-b
          border-yellow-600/20

          ${
            modoOscuro
              ? "bg-black"
              : "bg-white"
          }
        `}
      >

        <div className="max-w-7xl mx-auto text-center">

          <p className="text-yellow-500 uppercase tracking-[6px] mb-4">
            Contacto Wealth
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">

            Hablemos de tu{" "}

            <span className="text-yellow-500">
              próximo proyecto
            </span>

          </h1>

          <p
            className={`
              text-lg
              md:text-xl

              max-w-3xl
              mx-auto

              ${
                modoOscuro
                  ? "text-zinc-400"
                  : "text-gray-600"
              }
            `}
          >

            Estamos listos para ayudarte en proyectos de construcción,
            aluminio, vidrio arquitectónico y herrería moderna.

          </p>

        </div>

      </section>


      {/* CONTACTO */}

      <section
        className="
          max-w-7xl
          mx-auto

          px-6
          py-20

          grid
          lg:grid-cols-2

          gap-10
        "
      >

        {/* INFORMACIÓN */}

        <div
          className={`
            rounded-3xl
            p-10

            border

            ${
              modoOscuro
                ? `
                  bg-zinc-900
                  border-zinc-800
                `
                : `
                  bg-white
                  border-gray-200
                  shadow-sm
                `
            }
          `}
        >

          <h2 className="text-3xl font-bold text-yellow-500 mb-10">
            Información de Contacto
          </h2>


          <div className="space-y-8">

            <InfoContacto
              modoOscuro={
                modoOscuro
              }
              icon={
                <FaPhoneAlt />
              }
              titulo="Teléfono"
              texto="981 157 4778"
            />


            <InfoContacto
              modoOscuro={
                modoOscuro
              }
              icon={
                <FaEnvelope />
              }
              titulo="Correo"
              texto="contabilidad_siph@hotmail.com"
            />


            <InfoContacto
              modoOscuro={
                modoOscuro
              }
              icon={
                <FaMapMarkerAlt />
              }
              titulo="Ubicación"
              texto="Campeche, México"
            />


            <div className="flex items-center gap-5">

              <FaClock
                className="text-yellow-500"
                size={26}
              />

              <div>

                <h3 className="font-bold text-lg">
                  Horario
                </h3>

                <p
                  className={
                    modoOscuro
                      ? "text-zinc-400"
                      : "text-gray-600"
                  }
                >
                  Lunes a Viernes
                </p>

                <p
                  className={
                    modoOscuro
                      ? "text-zinc-400"
                      : "text-gray-600"
                  }
                >
                  9:00 AM - 6:00 PM
                </p>

              </div>

            </div>

          </div>


          <a
            href="https://wa.me/529811574778"
            target="_blank"
            rel="noopener noreferrer"
            className="
              mt-10

              flex
              items-center
              justify-center
              gap-3

              w-full

              border
              border-green-500

              text-green-500

              py-4

              rounded-2xl

              hover:bg-green-500
              hover:text-black

              transition
            "
          >

            <FaWhatsapp />

            Contactar por WhatsApp

          </a>

        </div>


        {/* OPINIONES */}

        <div
          className={`
            rounded-3xl
            p-10

            border

            ${
              modoOscuro
                ? `
                  bg-zinc-900
                  border-zinc-800
                `
                : `
                  bg-white
                  border-gray-200
                  shadow-sm
                `
            }
          `}
        >

          <h2 className="text-3xl font-bold text-yellow-500 mb-6">
            Opiniones de clientes
          </h2>

          <p
            className={`
              mb-8

              ${
                modoOscuro
                  ? "text-zinc-400"
                  : "text-gray-600"
              }
            `}
          >
            La experiencia de nuestros clientes habla por nosotros.
          </p>


          <div className="space-y-5">

            {opiniones.map(
              (
                op,
                i
              ) => (

                <div
                  key={i}
                  className={`
                    border

                    rounded-2xl
                    p-5

                    ${
                      modoOscuro
                        ? `
                          bg-black
                          border-zinc-800
                        `
                        : `
                          bg-gray-50
                          border-gray-200
                        `
                    }
                  `}
                >

                  <div className="flex items-center justify-between mb-2">

                    <h3 className="font-bold">
                      {op.nombre}
                    </h3>

                    <div className="flex text-yellow-500 gap-1">

                      {Array.from({
                        length:
                          op.estrellas,
                      }).map(
                        (
                          _,
                          idx
                        ) => (

                          <FaStar
                            key={
                              idx
                            }
                            size={
                              14
                            }
                          />

                        )
                      )}

                    </div>

                  </div>


                  <p
                    className={`
                      text-sm

                      ${
                        modoOscuro
                          ? "text-zinc-400"
                          : "text-gray-600"
                      }
                    `}
                  >
                    {op.texto}
                  </p>

                </div>

              )
            )}

          </div>


          <div
            className={`
              mt-8

              border
              border-dashed

              rounded-2xl

              p-6

              text-center

              ${
                modoOscuro
                  ? "border-zinc-700"
                  : "border-gray-300"
              }
            `}
          >

            <h3 className="font-bold text-lg mb-2">
              ¿Qué opinas de nuestro trabajo?
            </h3>

            <p
              className={`
                text-sm

                ${
                  modoOscuro
                    ? "text-zinc-500"
                    : "text-gray-500"
                }
              `}
            >
              Escríbenos por WhatsApp y tu opinión puede aparecer aquí.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}


function InfoContacto({
  modoOscuro,
  icon,
  titulo,
  texto,
}) {
  return (
    <div className="flex items-center gap-5">

      <div className="text-yellow-500 text-[26px]">
        {icon}
      </div>

      <div>

        <h3 className="font-bold text-lg">
          {titulo}
        </h3>

        <p
          className={
            modoOscuro
              ? "text-zinc-400"
              : "text-gray-600"
          }
        >
          {texto}
        </p>

      </div>

    </div>
  );
}


export default Contacto;