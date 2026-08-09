import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  provider,
  db,
} from "../firebase.config";

import {
  FaUserLock,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaKey,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  // ======================================================
  // ESTADOS
  // ======================================================

  const [mostrarLogin, setMostrarLogin] = useState(false);

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingUsuario, setLoadingUsuario] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // IR SEGÚN ROL
  // ======================================================

  const dirigirUsuario = async (user) => {
    const userRef = doc(
      db,
      "users",
      user.uid
    );

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        nombre:
          user.displayName ||
          "Usuario",

        correo:
          user.email,

        role:
          "cliente",

        fechaRegistro:
          serverTimestamp(),
      });
    }

    const finalSnap = await getDoc(userRef);
    const userData = finalSnap.data();

    if (userData?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/cliente");
    }
  };

  // ======================================================
  // LOGIN GOOGLE
  // ======================================================

  const loginGoogle = async () => {
    try {
      setLoadingGoogle(true);
      setError("");
      setMensaje("");

      const result = await signInWithPopup(
        auth,
        provider
      );

      await dirigirUsuario(
        result.user
      );
    } catch (error) {
      console.error(
        "Error Google:",
        error
      );

      if (
        error.code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "La ventana de Google fue cerrada antes de completar el acceso."
        );
      } else {
        setError(
          "No se pudo iniciar sesión con Google."
        );
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  // ======================================================
  // LOGIN USUARIO
  // ======================================================

  const loginUsuario = async (e) => {
    e.preventDefault();

    if (!correo.trim()) {
      setError(
        "Escribe tu correo electrónico."
      );
      return;
    }

    if (!password) {
      setError(
        "Escribe tu contraseña."
      );
      return;
    }

    try {
      setLoadingUsuario(true);
      setError("");
      setMensaje("");

      const result =
        await signInWithEmailAndPassword(
          auth,
          correo.trim(),
          password
        );

      await dirigirUsuario(
        result.user
      );
    } catch (error) {
      console.error(
        "Error login:",
        error
      );

      if (
        error.code ===
          "auth/invalid-credential" ||
        error.code ===
          "auth/wrong-password" ||
        error.code ===
          "auth/user-not-found"
      ) {
        setError(
          "Correo o contraseña incorrectos."
        );
      } else if (
        error.code ===
        "auth/too-many-requests"
      ) {
        setError(
          "Se realizaron demasiados intentos. Intenta nuevamente más tarde."
        );
      } else {
        setError(
          "No se pudo iniciar sesión. Revisa tus datos."
        );
      }
    } finally {
      setLoadingUsuario(false);
    }
  };

  // ======================================================
  // RECUPERAR CONTRASEÑA
  // ======================================================

  const recuperarPassword = async () => {
    if (!correo.trim()) {
      setMostrarLogin(true);

      setError(
        "Escribe primero tu correo para enviarte la recuperación."
      );

      return;
    }

    const confirmar = window.confirm(
      `¿Enviar correo de recuperación a ${correo.trim()}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setLoadingReset(true);
      setError("");
      setMensaje("");

      await sendPasswordResetEmail(
        auth,
        correo.trim()
      );

      setMensaje(
        `✅ Te enviamos un correo de recuperación a ${correo.trim()}.`
      );
    } catch (error) {
      console.error(
        "Error recuperación:",
        error
      );

      setError(
        "No se pudo enviar el correo de recuperación."
      );
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* ================================================= */}
      {/* FONDO */}
      {/* ================================================= */}

      <div className="absolute inset-0">

        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1800&auto=format&fit=crop"
          alt="Edificios corporativos"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/65" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/45" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/35" />

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

              <FaUserLock size={23} />

            </div>

            <p className="text-[#c89b3c] uppercase tracking-[0.28em] text-[11px] font-semibold mt-5">
              Wealth
            </p>

            <p className="text-zinc-500 uppercase tracking-[0.25em] text-[10px] mt-1">
              Grupo Empresarial
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-5">
              Bienvenido
            </h1>

            <p className="text-zinc-500 text-sm mt-2">
              Accede a tu cuenta Wealth
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
          {/* GOOGLE */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={loginGoogle}
            disabled={loadingGoogle}
            className="
              w-full
              bg-black
              border
              border-zinc-700
              hover:border-zinc-500
              text-white
              px-4
              py-3.5
              rounded-xl
              font-semibold
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

            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google"
              className="w-5 h-5"
            />

            {loadingGoogle
              ? "Conectando..."
              : "Continuar con Google"}

          </button>

          {/* ================================================= */}
          {/* SEPARADOR */}
          {/* ================================================= */}

          <div className="flex items-center gap-3 my-5">

            <div className="h-px bg-zinc-800 flex-1" />

            <span className="text-xs text-zinc-600">
              o
            </span>

            <div className="h-px bg-zinc-800 flex-1" />

          </div>

          {/* ================================================= */}
          {/* BOTÓN MOSTRAR LOGIN */}
          {/* ================================================= */}

          {!mostrarLogin && (
            <button
              type="button"
              onClick={() => {
                setMostrarLogin(true);
                setError("");
              }}
              className={`
                ${botonBase}
                w-full
                border-[#c89b3c]/60
                text-[#d6ab4c]
                hover:bg-[#c89b3c]/10
                hover:border-[#c89b3c]
              `}
            >
              <FaLock />

              Iniciar sesión con usuario

              <FaArrowRight />
            </button>
          )}

          {/* ================================================= */}
          {/* FORMULARIO */}
          {/* ================================================= */}

          {mostrarLogin && (
            <form
              onSubmit={loginUsuario}
              className="space-y-4"
            >

              {/* CORREO */}

              <div>

                <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">

                  <FaEnvelope className="text-[#d6ab4c]" />

                  Correo electrónico

                </label>

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

              </div>

              {/* PASSWORD */}

              <div>

                <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">

                  <FaLock className="text-[#d6ab4c]" />

                  Contraseña

                </label>

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
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
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
                    aria-label={
                      mostrarPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#d6ab4c] transition"
                  >

                    {mostrarPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}

                  </button>

                </div>

              </div>

              {/* RECUPERAR */}

              <div className="flex justify-end">

                <button
                  type="button"
                  onClick={recuperarPassword}
                  disabled={loadingReset}
                  className="text-sm text-zinc-500 hover:text-[#d6ab4c] transition flex items-center gap-2"
                >
                  <FaKey size={12} />

                  {loadingReset
                    ? "Enviando..."
                    : "¿Olvidaste tu contraseña?"}
                </button>

              </div>

              {/* ENTRAR */}

              <button
                type="submit"
                disabled={loadingUsuario}
                className={`
                  ${botonBase}
                  w-full
                  border-[#c89b3c]/60
                  text-[#d6ab4c]
                  hover:bg-[#c89b3c]/10
                  hover:border-[#c89b3c]
                  disabled:opacity-50
                `}
              >

                <FaUserLock />

                {loadingUsuario
                  ? "Ingresando..."
                  : "Entrar al sistema"}

                {!loadingUsuario && (
                  <FaArrowRight />
                )}

              </button>

              {/* VOLVER */}

              <button
                type="button"
                onClick={() => {
                  setMostrarLogin(false);
                  setPassword("");
                  setError("");
                }}
                className="
                  w-full
                  text-zinc-500
                  hover:text-white
                  text-sm
                  py-2
                  transition
                "
              >
                Volver a opciones de acceso
              </button>

            </form>
          )}

          {/* ================================================= */}
          {/* REGISTRO */}
          {/* ================================================= */}

          <div className="mt-7 pt-6 border-t border-zinc-800 text-center">

            <p className="text-sm text-zinc-500">

              ¿No tienes cuenta?

              <Link
                to="/register"
                className="text-[#d6ab4c] hover:text-[#e3bc58] ml-2 font-semibold"
              >
                Registrarse
              </Link>

            </p>

          </div>

          {/* ================================================= */}
          {/* SEGURIDAD */}
          {/* ================================================= */}

          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-600 mt-5">

            <FaShieldAlt />

            Acceso seguro · Wealth

          </div>

        </div>

      </div>

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

export default Login;