import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaPhone,
  FaShieldAlt,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";

import {
  auth,
  db,
} from "../firebase.config";

function Register() {
  const navigate = useNavigate();

  // ======================================================
  // FORMULARIO
  // ======================================================

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  // ======================================================
  // VISIBILIDAD PASSWORD
  // ======================================================

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // ======================================================
  // ESTADOS
  // ======================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // ======================================================
  // SEGURIDAD DE CONTRASEÑA
  // ======================================================

  const seguridadPassword = useMemo(() => {
    let puntos = 0;

    if (password.length >= 6) puntos++;
    if (password.length >= 8) puntos++;
    if (/[A-Z]/.test(password)) puntos++;
    if (/[a-z]/.test(password)) puntos++;
    if (/[0-9]/.test(password)) puntos++;
    if (/[^A-Za-z0-9]/.test(password)) puntos++;

    if (!password) {
      return {
        nivel: 0,
        texto: "",
      };
    }

    if (puntos <= 2) {
      return {
        nivel: 1,
        texto: "Débil",
      };
    }

    if (puntos <= 4) {
      return {
        nivel: 2,
        texto: "Buena",
      };
    }

    return {
      nivel: 3,
      texto: "Segura",
    };
  }, [password]);

  // ======================================================
  // VALIDAR
  // ======================================================

  const validarFormulario = () => {
    setError("");

    if (!nombre.trim()) {
      setError("Escribe tu nombre completo.");
      return false;
    }

    if (nombre.trim().length < 3) {
      setError("Escribe un nombre válido.");
      return false;
    }

    if (!correo.trim()) {
      setError("Escribe tu correo electrónico.");
      return false;
    }

    const telefonoLimpio =
      telefono.replace(/\D/g, "");

    if (
      telefonoLimpio &&
      telefonoLimpio.length < 10
    ) {
      setError(
        "Escribe un teléfono válido de al menos 10 dígitos."
      );
      return false;
    }

    if (password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return false;
    }

    if (password !== confirmarPassword) {
      setError(
        "Las contraseñas no coinciden."
      );
      return false;
    }

    return true;
  };

  // ======================================================
  // REGISTRAR
  // ======================================================

  const registerUser = async (e) => {
    e.preventDefault();

    setMensaje("");

    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await createUserWithEmailAndPassword(
          auth,
          correo.trim(),
          password
        );

      const user =
        result.user;

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          uid:
            user.uid,

          nombre:
            nombre.trim(),

          correo:
            correo
              .trim()
              .toLowerCase(),

          telefono:
            telefono.replace(
              /\D/g,
              ""
            ),

          role:
            "cliente",

          proveedor:
            "password",

          emailVerificado:
            false,

          fechaRegistro:
            serverTimestamp(),

          fechaActualizacion:
            serverTimestamp(),
        }
      );

      await sendEmailVerification(
        user
      );

      setMensaje(
        `✅ Cuenta creada correctamente. Enviamos un correo de verificación a ${correo.trim()}. Entrando a tu panel...`
      );

      // Firebase deja al usuario autenticado automáticamente
      // después de createUserWithEmailAndPassword.
      // NO cerramos sesión aquí.
      setTimeout(() => {
        navigate("/cliente", {
          replace: true,
          state: {
            registroExitoso: true,
            correo:
              correo.trim(),
            verificarCorreo: true,
          },
        });
      }, 1200);

    } catch (error) {
      console.error(
        "Error registrando usuario:",
        error
      );

      switch (error.code) {
        case "auth/email-already-in-use":
          setError(
            "Este correo ya tiene una cuenta registrada."
          );
          break;

        case "auth/invalid-email":
          setError(
            "El correo electrónico no es válido."
          );
          break;

        case "auth/weak-password":
          setError(
            "La contraseña es demasiado débil."
          );
          break;

        case "auth/operation-not-allowed":
          setError(
            "El registro con correo y contraseña no está habilitado."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Se realizaron demasiados intentos. Intenta nuevamente más tarde."
          );
          break;

        default:
          setError(
            "No se pudo crear la cuenta. Intenta nuevamente."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ESPACIO PARA HEADER GLOBAL */}
      <div className="h-24 md:h-28" />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-14">

        <div
          className="
            overflow-hidden
            rounded-[32px]
            border
            border-zinc-800
            bg-zinc-950
            shadow-2xl
            grid
            lg:grid-cols-[0.95fr_1.05fr]
          "
        >

          {/* ================================================= */}
          {/* LADO IZQUIERDO / BRANDING */}
          {/* ================================================= */}

          <section
            className="
              relative
              hidden
              lg:flex
              min-h-[720px]
              flex-col
              justify-between
              p-10
              xl:p-12
              overflow-hidden
              border-r
              border-zinc-800
            "
          >
            {/* FONDO ELEGANTE */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-zinc-950 to-black" />

            <div className="absolute -top-32 -left-24 w-80 h-80 rounded-full bg-yellow-500/10 blur-3xl" />

            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-yellow-500/5 blur-3xl" />

            <div className="absolute top-24 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />

            <div className="relative z-10">

              <p className="text-xs uppercase tracking-[0.35em] text-yellow-500 font-semibold">
                Wealth
              </p>

              <h2 className="text-5xl xl:text-6xl font-bold leading-[1.05] mt-5 max-w-md">
                Tu próximo proyecto
                <span className="text-yellow-500">
                  {" "}empieza aquí.
                </span>
              </h2>

              <p className="text-zinc-400 text-lg leading-relaxed mt-6 max-w-lg">
                Crea tu cuenta para solicitar cotizaciones, guardar favoritos,
                consultar avances y conservar el historial de tus proyectos.
              </p>

            </div>

            <div className="relative z-10 space-y-4">

              <Beneficio
                numero="01"
                titulo="Cotizaciones personalizadas"
                texto="Envía medidas, ubicación, fotografías y referencias."
              />

              <Beneficio
                numero="02"
                titulo="Seguimiento del trabajo"
                texto="Consulta propuestas, avances y proyectos finalizados."
              />

              <Beneficio
                numero="03"
                titulo="Todo en un solo lugar"
                texto="Tus favoritos, proyectos y datos de contacto quedan vinculados a tu cuenta."
              />

            </div>

            <div className="relative z-10 pt-8 border-t border-white/10">

              <div className="flex items-center gap-3 text-zinc-500 text-sm">

                <FaShieldAlt className="text-yellow-500" />

                Registro seguro · Wealth Grupo Empresarial

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* FORMULARIO */}
          {/* ================================================= */}

          <section className="p-6 sm:p-8 md:p-10 xl:p-12">

            <div className="max-w-xl mx-auto">

              {/* ENCABEZADO */}

              <div className="mb-8">

                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center">
                  <FaUserPlus />
                </div>

                <p className="text-xs uppercase tracking-[0.28em] text-yellow-500 font-semibold mt-5">
                  Crear cuenta
                </p>

                <h1 className="text-3xl md:text-4xl font-bold mt-2">
                  Bienvenido a Wealth
                </h1>

                <p className="text-zinc-500 mt-2">
                  Completa tus datos para empezar.
                </p>

              </div>

              {/* MENSAJES */}

              {error && (
                <div className="mb-5 bg-red-500/5 border border-red-500/30 rounded-2xl p-4 text-red-300 text-sm flex items-start gap-3">

                  <FaExclamationTriangle className="mt-0.5 shrink-0" />

                  <span>
                    {error}
                  </span>

                </div>
              )}

              {mensaje && (
                <div className="mb-5 bg-green-500/5 border border-green-500/30 rounded-2xl p-4 text-green-300 text-sm flex items-start gap-3">

                  <FaCheckCircle className="mt-0.5 shrink-0" />

                  <span>
                    {mensaje}
                  </span>

                </div>
              )}

              {/* FORM */}

              <form
                onSubmit={registerUser}
                className="space-y-5"
              >

                <div className="grid md:grid-cols-2 gap-4">

                  <Campo
                    titulo="Nombre completo"
                    icon={<FaUser />}
                  >

                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) =>
                        setNombre(
                          e.target.value
                        )
                      }
                      placeholder="Nombre y apellidos"
                      autoComplete="name"
                      className={inputClass}
                    />

                  </Campo>

                  <Campo
                    titulo="Teléfono"
                    icon={<FaPhone />}
                    opcional
                  >

                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) =>
                        setTelefono(
                          e.target.value
                        )
                      }
                      placeholder="981 123 4567"
                      autoComplete="tel"
                      className={inputClass}
                    />

                  </Campo>

                </div>

                <Campo
                  titulo="Correo electrónico"
                  icon={<FaEnvelope />}
                >

                  <input
                    type="email"
                    value={correo}
                    onChange={(e) =>
                      setCorreo(
                        e.target.value
                      )
                    }
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    className={inputClass}
                  />

                </Campo>

                <Campo
                  titulo="Contraseña"
                  icon={<FaLock />}
                >

                  <div className="relative">

                    <input
                      type={
                        mostrarPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Crea una contraseña"
                      autoComplete="new-password"
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarPassword(
                          (actual) =>
                            !actual
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-yellow-500 transition"
                    >
                      {mostrarPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                  {password && (
                    <div className="mt-3">

                      <div className="grid grid-cols-3 gap-2">

                        <BarraSeguridad
                          activa={
                            seguridadPassword.nivel >= 1
                          }
                          clase="bg-red-400"
                        />

                        <BarraSeguridad
                          activa={
                            seguridadPassword.nivel >= 2
                          }
                          clase="bg-yellow-400"
                        />

                        <BarraSeguridad
                          activa={
                            seguridadPassword.nivel >= 3
                          }
                          clase="bg-green-400"
                        />

                      </div>

                      <div className="flex items-center justify-between mt-2">

                        <p className="text-xs text-zinc-600">
                          Mínimo 6 caracteres
                        </p>

                        <p
                          className={`text-xs font-semibold ${
                            seguridadPassword.nivel === 1
                              ? "text-red-400"
                              : seguridadPassword.nivel === 2
                              ? "text-yellow-400"
                              : "text-green-400"
                          }`}
                        >
                          {seguridadPassword.texto}
                        </p>

                      </div>

                    </div>
                  )}

                </Campo>

                <Campo
                  titulo="Confirmar contraseña"
                  icon={<FaShieldAlt />}
                >

                  <div className="relative">

                    <input
                      type={
                        mostrarConfirmacion
                          ? "text"
                          : "password"
                      }
                      value={confirmarPassword}
                      onChange={(e) =>
                        setConfirmarPassword(
                          e.target.value
                        )
                      }
                      placeholder="Repite tu contraseña"
                      autoComplete="new-password"
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarConfirmacion(
                          (actual) =>
                            !actual
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-yellow-500 transition"
                    >
                      {mostrarConfirmacion ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                  {confirmarPassword && (
                    <p
                      className={`text-xs mt-2 ${
                        password === confirmarPassword
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {password === confirmarPassword
                        ? "✓ Las contraseñas coinciden"
                        : "Las contraseñas no coinciden"}
                    </p>
                  )}

                </Campo>

                {/* CTA */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    bg-yellow-500
                    hover:bg-yellow-400
                    text-black
                    px-5
                    py-4
                    rounded-2xl
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-3
                    transition-all
                    duration-200
                    hover:-translate-y-[1px]
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  <FaUserPlus />

                  {loading
                    ? "Creando cuenta..."
                    : "Crear mi cuenta"}

                  {!loading && (
                    <FaArrowRight />
                  )}

                </button>

              </form>

              {/* AVISO */}

              <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">

                <div className="flex items-start gap-3">

                  <FaShieldAlt className="text-yellow-500 mt-0.5 shrink-0" />

                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Te enviaremos un correo de verificación para confirmar tu dirección. Al crear la cuenta entrarás automáticamente a tu panel.
                  </p>

                </div>

              </div>

              {/* LOGIN */}

              <div className="mt-7 pt-6 border-t border-zinc-800 text-center">

                <p className="text-sm text-zinc-500">

                  ¿Ya tienes una cuenta?

                  <Link
                    to="/login"
                    className="text-yellow-500 hover:text-yellow-400 ml-2 font-bold"
                  >
                    Iniciar sesión
                  </Link>

                </p>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

// ======================================================
// COMPONENTES
// ======================================================

function Campo({
  titulo,
  icon,
  opcional = false,
  children,
}) {
  return (
    <div>

      <div className="flex items-center justify-between gap-3 mb-2">

        <label className="text-sm text-zinc-400 flex items-center gap-2">

          <span className="text-yellow-500">
            {icon}
          </span>

          {titulo}

        </label>

        {opcional && (
          <span className="text-[10px] uppercase tracking-wider text-zinc-600">
            Opcional
          </span>
        )}

      </div>

      {children}

    </div>
  );
}

function Beneficio({
  numero,
  titulo,
  texto,
}) {
  return (
    <div className="flex gap-4">

      <div className="text-yellow-500/60 text-sm font-bold pt-1">
        {numero}
      </div>

      <div>

        <p className="font-semibold">
          {titulo}
        </p>

        <p className="text-zinc-500 text-sm mt-1 leading-relaxed">
          {texto}
        </p>

      </div>

    </div>
  );
}

function BarraSeguridad({
  activa,
  clase,
}) {
  return (
    <div
      className={`h-1.5 rounded-full ${
        activa
          ? clase
          : "bg-zinc-800"
      }`}
    />
  );
}

// ======================================================
// ESTILOS
// ======================================================

const inputClass = `
  w-full
  bg-black
  border
  border-zinc-700
  rounded-2xl
  px-4
  py-3.5
  text-white
  placeholder:text-zinc-600
  outline-none
  focus:border-yellow-500/70
  focus:ring-2
  focus:ring-yellow-500/10
  transition
`;

export default Register;