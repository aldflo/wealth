import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaClock,
  FaStar,
} from "react-icons/fa";

function Contacto() {
  const opiniones = [
    {
      nombre: "Carlos Méndez",
      texto: "Excelente trabajo en cancelería de vidrio, muy profesionales y puntuales.",
      estrellas: 5,
    },
    {
      nombre: "María López",
      texto: "Me gustó mucho el diseño de la puerta de herrería, quedó mejor de lo esperado.",
      estrellas: 5,
    },
    {
      nombre: "José Ramírez",
      texto: "Buen servicio y atención rápida, recomendable.",
      estrellas: 4,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="relative py-28 px-6 border-b border-yellow-600/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-yellow-500 uppercase tracking-[6px] mb-4">
            Contacto Wealth
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Hablemos de tu{" "}
            <span className="text-yellow-500">próximo proyecto</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto">
            Estamos listos para ayudarte en proyectos de construcción,
            aluminio, vidrio arquitectónico y herrería moderna.
          </p>
        </div>
      </section>

      {/* CONTACTO INFO */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-10">

        {/* INFO */}
        <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800">
          <h2 className="text-3xl font-bold text-yellow-500 mb-10">
            Información de Contacto
          </h2>

          <div className="space-y-8">

            <div className="flex items-center gap-5">
              <FaPhoneAlt className="text-yellow-500" size={26} />
              <div>
                <h3 className="font-bold text-lg">Teléfono</h3>
                <p className="text-zinc-400">981 157 4778</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <FaEnvelope className="text-yellow-500" size={26} />
              <div>
                <h3 className="font-bold text-lg">Correo</h3>
                <p className="text-zinc-400">
                  contabilidad_siph@hotmail.com
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <FaMapMarkerAlt className="text-yellow-500" size={26} />
              <div>
                <h3 className="font-bold text-lg">Ubicación</h3>
                <p className="text-zinc-400">Campeche, México</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <FaClock className="text-yellow-500" size={26} />
              <div>
                <h3 className="font-bold text-lg">Horario</h3>
                <p className="text-zinc-400">Lunes a Viernes</p>
                <p className="text-zinc-400">9:00 AM - 6:00 PM</p>
              </div>
            </div>

          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/529811574778"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 flex items-center justify-center gap-3 w-full border border-green-500 text-green-500 py-4 rounded-2xl hover:bg-green-500 hover:text-black transition"
          >
            <FaWhatsapp />
            Contactar por WhatsApp
          </a>
        </div>

        {/* OPINIONES */}
        <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800">
          <h2 className="text-3xl font-bold text-yellow-500 mb-6">
            Opiniones de clientes
          </h2>

          <p className="text-zinc-400 mb-8">
            La experiencia de nuestros clientes habla por nosotros.
          </p>

          <div className="space-y-5">

            {opiniones.map((op, i) => (
              <div
                key={i}
                className="bg-black border border-zinc-800 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{op.nombre}</h3>

                  <div className="flex text-yellow-500 gap-1">
                    {Array.from({ length: op.estrellas }).map((_, idx) => (
                      <FaStar key={idx} size={14} />
                    ))}
                  </div>
                </div>

                <p className="text-zinc-400 text-sm">{op.texto}</p>
              </div>
            ))}

          </div>

          {/* Caja tipo muro */}
          <div className="mt-8 border border-dashed border-zinc-700 rounded-2xl p-6 text-center">
            <h3 className="font-bold text-lg mb-2">
              ¿Qué opinas de nuestro trabajo?
            </h3>
            <p className="text-zinc-500 text-sm">
              Escríbenos por WhatsApp y tu opinión puede aparecer aquí.
            </p>
          </div>

        </div>

      </section>
    </div>
  );
}

export default Contacto;