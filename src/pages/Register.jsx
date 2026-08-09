import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase.config";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaArrowRight,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

function Register() {
  const navigate = useNavigate();

  // ======================================================
  // FORMULARIO
  // ======================================================

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
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

      // ================================================
      // CREAR CUENTA AUTH
      // ================================================

      const result =
        await createUserWithEmailAndPassword(
          auth,
          correo.trim(),
          password
        );

      const user = result.user;

      // ================================================
      // GUARDAR EN FIRESTORE
      // ================================================

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          nombre:
            nombre.trim(),

          correo:
            correo.trim().toLowerCase(),

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

      // ================================================
      // ENVIAR VERIFICACIÓN
      // ================================================

      await sendEmailVerification(
        user
      );

      setMensaje(
        `✅ Cuenta creada. Enviamos un correo de verificación a ${correo.trim()}.`
      );

      // ================================================
      // CERRAR SESIÓN HASTA VERIFICAR
      // ================================================

      await signOut(auth);

      // Espera breve para que el usuario vea el mensaje
      setTimeout(() => {
        navigate("/", {
          state: {
            registroExitoso: true,
            correo:
              correo.trim(),
          },
        });
      }, 1800);

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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* ================================================= */}
      {/* FONDO */}
      {/* ================================================= */}

      <div className="absolute inset-0">

        <img
          src="/wealth-banner.jpg"
          alt="Wealth Grupo Empresarial"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/50" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

      </div>

      {/* ================================================= */}
      {/* LÍNEAS DORADAS */}
      {/* ================================================= */}

      <div className="absolute inset-0 hidden md:block overflow-hidden pointer-events-none">

        <div className="absolute w-[170%] h-[3px] bg-[#c89b3c] rotate-[27deg] top-[20%] -left-52 opacity-45" />

        <div className="absolute w-[170%] h-[1px] bg-[#e0b84d] rotate-[27deg] top-[22%] -left-52 opacity-40" />

        <div className="absolute w-[170%] h-[3px] bg-[#c89b3c] rotate-[27deg] bottom-[18%] -left-52 opacity-45" />

        <div className="absolute w-[170%] h-[1px] bg-[#e0b84d] rotate-[27deg] bottom-[20%] -left-52 opacity-40" />

      </div>

      {/* ================================================= */}
      {/* CONTENIDO */}
      {/* ================================================= */}

      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 py-8">

        <div
          className="
            w-full
            max-w-md
            bg-zinc-950/95
            backdrop-blur-xl
            border
            border-zinc-700
            rounded-[28px]
            p-6
            sm:p-8
            shadow-2xl
          "
        >

          {/* ================================================= */}
          {/* ENCABEZADO */}
          {/* ================================================= */}

          <div className="text-center mb-7">

            <div className="w-14 h-14 rounded-2xl bg-[#c89b3c]/10 border border-[#c89b3c]/20 text-[#d6ab4c] flex items-center justify-center mx-auto">

              <FaUserPlus size={23} />

            </div>

            <p className="text-[#c89b3c] uppercase tracking-[0.28em] text-[11px] font-semibold mt-5">
              Wealth
            </p>

            <p className="text-zinc-500 uppercase tracking-[0.25em] text-[10px] mt-1">
              Grupo Empresarial
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-5">
              Crear cuenta
            </h1>

            <p className="text-zinc-500 text-sm mt-2">
              Regístrate para acceder a Wealth
            </p>

          </div>

          {/* ================================================= */}
          {/* MENSAJES */}
          {/* ================================================= */}

          {error && (
            <div className="mb-5 bg-red-500/5 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm flex items-start gap-2">

              <FaExclamationTriangle className="mt-0.5 shrink-0" />

              <span>
                {error}
              </span>

            </div>
          )}

          {mensaje && (
            <div className="mb-5 bg-green-500/5 border border-green-500/30 rounded-xl p-3 text-green-300 text-sm flex items-start gap-2">

              <FaCheckCircle className="mt-0.5 shrink-0" />

              <span>
                {mensaje}
              </span>

            </div>
          )}

          {/* ================================================= */}
          {/* FORMULARIO */}
          {/* ================================================= */}

          <form
            onSubmit={registerUser}
            className="space-y-4"
          >

            {/* NOMBRE */}

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
                placeholder="Tu nombre completo"
                autoComplete="name"
                className={inputClass}
              />

            </Campo>

            {/* CORREO */}

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

            {/* PASSWORD */}

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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#d6ab4c] transition"
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {mostrarPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

              {/* SEGURIDAD */}

              {password && (
                <div className="mt-3">

                  <div className="grid grid-cols-3 gap-1.5">

                    <div
                      className={`h-1.5 rounded-full ${
                        seguridadPassword.nivel >= 1
                          ? "bg-red-400"
                          : "bg-zinc-800"
                      }`}
                    />

                    <div
                      className={`h-1.5 rounded-full ${
                        seguridadPassword.nivel >= 2
                          ? "bg-yellow-400"
                          : "bg-zinc-800"
                      }`}
                    />

                    <div
                      className={`h-1.5 rounded-full ${
                        seguridadPassword.nivel >= 3
                          ? "bg-green-400"
                          : "bg-zinc-800"
                      }`}
                    />

                  </div>

                  <div className="flex justify-between items-center mt-2">

                    <p className="text-xs text-zinc-600">
                      Mínimo 6 caracteres
                    </p>

                    <p
                      className={`text-xs font-medium ${
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

            {/* CONFIRMAR */}

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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#d6ab4c] transition"
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

            {/* ================================================= */}
            {/* BOTÓN */}
            {/* ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className={`
                ${botonBase}
                w-full
                border-[#c89b3c]/60
                text-[#d6ab4c]
                hover:border-[#c89b3c]
                hover:bg-[#c89b3c]/10
                disabled:opacity-50
                disabled:cursor-not-allowed
              `}
            >
              <FaUserPlus />

              {loading
                ? "Creando cuenta..."
                : "Crear cuenta"}

              {!loading && (
                <FaArrowRight />
              )}

            </button>

          </form>

          {/* ================================================= */}
          {/* AVISO SEGURIDAD */}
          {/* ================================================= */}

          <div className="mt-5 bg-[#c89b3c]/5 border border-[#c89b3c]/15 rounded-xl p-3">

            <div className="flex items-start gap-2">

              <FaShieldAlt className="text-[#d6ab4c] mt-0.5 shrink-0" />

              <p className="text-xs text-zinc-500 leading-relaxed">
                Después de crear tu cuenta enviaremos un correo para verificar tu dirección.
              </p>

            </div>

          </div>

          {/* ================================================= */}
          {/* LOGIN */}
          {/* ================================================= */}

          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">

            <p className="text-sm text-zinc-500">

              ¿Ya tienes cuenta?

              <Link
                to="/"
                className="text-[#d6ab4c] hover:text-[#e3bc58] ml-2 font-semibold"
              >
                Iniciar sesión
              </Link>

            </p>

          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-600 mt-5">

            <FaShieldAlt />

            Registro seguro · Wealth

          </div>

        </div>

      </div>

    </div>
  );
}

// ======================================================
// CAMPO
// ======================================================

function Campo({
  titulo,
  icon,
  children,
}) {
  return (
    <div>

      <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">

        <span className="text-[#d6ab4c]">
          {icon}
        </span>

        {titulo}

      </label>

      {children}

    </div>
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
  rounded-xl
  px-4
  py-3.5
  text-white
  placeholder:text-zinc-600
  outline-none
  focus:border-[#c89b3c]/70
  focus:ring-2
  focus:ring-[#c89b3c]/10
  transition
`;

const botonBase = `
  bg-black
  border
  px-5
  py-3.5
  rounded-xl
  font-semibold
  flex
  items-center
  justify-center
  gap-2
  transition-all
  duration-200
  hover:-translate-y-[1px]
  active:translate-y-0
`;

export default Register;