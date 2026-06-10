import {
FaPhoneAlt,
FaEnvelope,
FaMapMarkerAlt,
FaWhatsapp,
FaClock
} from "react-icons/fa";

function Contacto() {

return (


<div className="min-h-screen bg-black text-white">

  {/* HERO */}

  <section className="relative py-28 px-6 border-b border-yellow-600/20">

    <div className="max-w-7xl mx-auto text-center">

      <p className="text-yellow-500 uppercase tracking-[6px] mb-4">
        Contacto Wealth
      </p>

      <h1 className="text-6xl font-bold mb-6">
        Hablemos de tu
        <span className="text-yellow-500"> próximo proyecto</span>
      </h1>

      <p className="text-zinc-400 text-xl max-w-3xl mx-auto">
        Estamos listos para ayudarte en proyectos de construcción,
        desarrollo inmobiliario, aluminio y vidrio arquitectónico.
      </p>

    </div>

  </section>

  {/* CONTACTO */}

  <section className="max-w-7xl mx-auto px-6 py-20">

    <div className="grid lg:grid-cols-2 gap-10">

      {/* INFORMACION */}

      <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800">

        <h2 className="text-4xl font-bold text-yellow-500 mb-10">
          Información de Contacto
        </h2>

        <div className="space-y-8">

          <div className="flex items-center gap-5">

            <FaPhoneAlt
              className="text-yellow-500"
              size={28}
            />

            <div>

              <h3 className="font-bold text-xl">
                Teléfono
              </h3>

              <p className="text-zinc-400">
                981 157 4778
              </p>

            </div>

          </div>

          <div className="flex items-center gap-5">

            <FaEnvelope
              className="text-yellow-500"
              size={28}
            />

            <div>

              <h3 className="font-bold text-xl">
                Correo
              </h3>

              <p className="text-zinc-400">
                contabilidad_siph@hotmail.com
              </p>

            </div>

          </div>

          <div className="flex items-center gap-5">

            <FaMapMarkerAlt
              className="text-yellow-500"
              size={28}
            />

            <div>

              <h3 className="font-bold text-xl">
                Ubicación
              </h3>

              <p className="text-zinc-400">
                Campeche, México
              </p>

            </div>

          </div>

          <div className="flex items-center gap-5">

            <FaClock
              className="text-yellow-500"
              size={28}
            />

            <div>

              <h3 className="font-bold text-xl">
                Horario
              </h3>

              <p className="text-zinc-400">
                Lunes a Viernes
              </p>

              <p className="text-zinc-400">
                9:00 AM - 6:00 PM
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* FORMULARIO */}

      <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800">

        <h2 className="text-4xl font-bold text-yellow-500 mb-10">
          Solicita Información
        </h2>

        <form className="space-y-5">

          <input
            type="text"
            placeholder="Nombre completo"
            className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4 outline-none focus:border-yellow-500"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4 outline-none focus:border-yellow-500"
          />

          <input
            type="text"
            placeholder="Teléfono"
            className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4 outline-none focus:border-yellow-500"
          />

          <textarea
            rows="5"
            placeholder="Describe tu proyecto..."
            className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4 outline-none focus:border-yellow-500"
          ></textarea>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-2xl transition"
          >
            Enviar Solicitud
          </button>

          <a
            href="https://wa.me/529811574778"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full border border-green-500 text-green-500 py-4 rounded-2xl hover:bg-green-500 hover:text-black transition"
          >
            <FaWhatsapp />
            Contactar por WhatsApp
          </a>

        </form>

      </div>

    </div>

  </section>

</div>

);

}

export default Contacto;
