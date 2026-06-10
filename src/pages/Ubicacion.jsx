import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaLocationArrow
} from "react-icons/fa";

function Ubicacion() {

  return (

    <div className="min-h-screen bg-black text-white pt-24">

      {/* HERO */}

      <section className="py-20 px-6 border-b border-yellow-600/20">

        <div className="max-w-7xl mx-auto text-center">

          <p className="text-yellow-500 uppercase tracking-[6px] mb-4 font-semibold">
            Wealth Grupo Empresarial
          </p>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">

            Nuestra
            <span className="text-yellow-500">
              {" "}Ubicación
            </span>

          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto">

            Visítanos en nuestras oficinas y conoce más sobre nuestros
            servicios de construcción, inmobiliaria, aluminio y vidrio.

          </p>

        </div>

      </section>

      {/* CONTENIDO */}

      <section className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid lg:grid-cols-2 gap-10">

          {/* INFORMACION */}

          <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800 shadow-2xl">

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-8 mb-10">

              <h2 className="text-3xl font-bold text-yellow-500 mb-3">
                Oficina Principal
              </h2>

              <p className="text-zinc-300 text-lg">
                Wealth Grupo Empresarial
              </p>

            </div>

            <div className="space-y-8">

              {/* DIRECCION */}

              <div className="flex gap-5">

                <FaMapMarkerAlt
                  size={28}
                  className="text-yellow-500 mt-1"
                />

                <div>

                  <h3 className="font-bold text-xl mb-2">
                    Dirección
                  </h3>

                  <p className="text-zinc-400 leading-relaxed">

                    Av Aviación 89,
                    Héroe de Nacozari,
                    24070 San Francisco de Campeche,
                    Campeche, México.

                  </p>

                </div>

              </div>

              {/* TELEFONO */}

              <div className="flex gap-5">

                <FaPhoneAlt
                  size={28}
                  className="text-yellow-500 mt-1"
                />

                <div>

                  <h3 className="font-bold text-xl mb-2">
                    Teléfono
                  </h3>

                  <p className="text-zinc-400">
                    981 157 4778
                  </p>

                </div>

              </div>

              {/* CORREO */}

              <div className="flex gap-5">

                <FaEnvelope
                  size={28}
                  className="text-yellow-500 mt-1"
                />

                <div>

                  <h3 className="font-bold text-xl mb-2">
                    Correo Electrónico
                  </h3>

                  <p className="text-zinc-400">
                    contabilidad_siph@hotmail.com
                  </p>

                </div>

              </div>

            </div>

            {/* BOTON MAPS */}

            <a
              href="https://maps.app.goo.gl/973XtiipZF6YVPPYA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 mt-10 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-4 rounded-2xl transition duration-300"
            >

              <FaLocationArrow />

              Abrir en Google Maps

            </a>

          </div>

          {/* MAPA */}

          <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">

            <iframe
              title="Ubicación Wealth"
              src="https://maps.google.com/maps?q=Av%20Aviacion%2089%20Heroe%20de%20Nacozari%20Campeche&t=&z=17&ie=UTF8&iwloc=&output=embed"
              className="w-full h-[600px]"
              loading="lazy"
            />

          </div>

        </div>

      </section>

      {/* FRASE */}

      <section className="pb-24 px-6">

        <div className="max-w-5xl mx-auto bg-zinc-900 rounded-3xl border border-yellow-600/20 p-12 text-center shadow-2xl">

          <h2 className="text-4xl md:text-5xl font-bold mb-6">

            Construimos más que proyectos,
            <span className="text-yellow-500">
              {" "}creamos confianza.
            </span>

          </h2>

          <p className="text-zinc-400 text-lg leading-relaxed">

            Wealth Grupo Empresarial integra soluciones de construcción,
            desarrollo inmobiliario y aluminio arquitectónico,
            ofreciendo calidad, innovación y profesionalismo en cada proyecto.

          </p>

        </div>

      </section>

    </div>

  );

}

export default Ubicacion;