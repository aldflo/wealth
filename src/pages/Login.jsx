import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
  provider,
} from "../firebase.config";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
  FaPhone,
  FaRedo,
  FaShieldAlt,
  FaSms,
  FaUserLock,
} from "react-icons/fa";

/* ======================================================
   CONFIGURACIÓN
====================================================== */

const DOMINIO_INTERNO = "wealth.local";
const SEGUNDOS_REENVIO = 60;

/* ======================================================
   HELPERS TELÉFONO
====================================================== */

const normalizarTelefonoMexico = (valor) => {
  const limpio = String(valor || "")
    .trim()
    .replace(/[\s()-]/g, "");

  if (limpio.startsWith("+")) {
    const numeros = limpio.slice(1).replace(/\D/g, "");

    if (/^\d{10,15}$/.test(numeros)) {
      return `+${numeros}`;
    }

    return null;
  }

  const soloNumeros = limpio.replace(/\D/g, "");

  if (soloNumeros.length === 10) {
    return `+52${soloNumeros}`;
  }

  if (
    soloNumeros.length === 12 &&
    soloNumeros.startsWith("52")
  ) {
    return `+${soloNumeros}`;
  }

  return null;
};

const telefonoAEmailInterno = (telefonoE164) => {
  const numeros = String(telefonoE164 || "")
    .replace(/\D/g, "");

  return `${numeros}@${DOMINIO_INTERNO}`;
};

/* ======================================================
   COMPONENTE
====================================================== */

function Login() {
  const { modoOscuro = false } = useOutletContext() || {};

  const navigate = useNavigate();

  /* ======================================================
     MODOS
  ====================================================== */

  const [modo, setModo] =
    useState("opciones");

  /* ======================================================
     CORREO
  ====================================================== */

  const [correo, setCorreo] =
    useState("");

  const [passwordCorreo, setPasswordCorreo] =
    useState("");

  const [
    mostrarPasswordCorreo,
    setMostrarPasswordCorreo,
  ] = useState(false);

  /* ======================================================
     TELÉFONO + CONTRASEÑA
  ====================================================== */

  const [telefono, setTelefono] =
    useState("");

  const [passwordTelefono, setPasswordTelefono] =
    useState("");

  const [
    mostrarPasswordTelefono,
    setMostrarPasswordTelefono,
  ] = useState(false);

  /* ======================================================
     RECUPERACIÓN TELÉFONO
  ====================================================== */

  const [codigo, setCodigo] =
    useState("");

  const [
    confirmationResult,
    setConfirmationResult,
  ] = useState(null);

  const [
    numeroVerificando,
    setNumeroVerificando,
  ] = useState("");

  const [contador, setContador] =
    useState(0);

  const [
    nuevaPassword,
    setNuevaPassword,
  ] = useState("");

  const [
    confirmarNuevaPassword,
    setConfirmarNuevaPassword,
  ] = useState("");

  const [
    mostrarNuevaPassword,
    setMostrarNuevaPassword,
  ] = useState(false);

  /* ======================================================
     LOADING / MENSAJES
  ====================================================== */

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  /* ======================================================
     RECAPTCHA
  ====================================================== */

  const recaptchaRef =
    useRef(null);

  const recaptchaWidgetIdRef =
    useRef(null);

  /* ======================================================
     TEMPORIZADOR
  ====================================================== */

  useEffect(() => {
    if (contador <= 0) {
      return;
    }

    const timer = setInterval(
      () => {
        setContador(
          (actual) =>
            actual > 0
              ? actual - 1
              : 0
        );
      },
      1000
    );

    return () =>
      clearInterval(timer);
  }, [contador]);

  /* ======================================================
     RECAPTCHA
  ====================================================== */

  const resetearRecaptcha = () => {
    try {
      if (
        typeof window !== "undefined" &&
        window.grecaptcha &&
        recaptchaWidgetIdRef.current !== null
      ) {
        window.grecaptcha.reset(
          recaptchaWidgetIdRef.current
        );
      }
    } catch (resetError) {
      console.warn(
        "No se pudo resetear reCAPTCHA:",
        resetError
      );
    }
  };

  const destruirRecaptcha = () => {
    try {
      recaptchaRef.current?.clear();
    } catch {
      // Ignorar.
    }

    recaptchaRef.current = null;
    recaptchaWidgetIdRef.current = null;
  };

  useEffect(() => {
    return () => {
      destruirRecaptcha();
    };
  }, []);

  const prepararRecaptcha =
    async () => {
      if (
        recaptchaRef.current
      ) {
        return recaptchaRef.current;
      }

      const container =
        document.getElementById(
          "recaptcha-login"
        );

      if (!container) {
        throw new Error(
          "No se encontró el contenedor de reCAPTCHA."
        );
      }

      const verifier =
        new RecaptchaVerifier(
          auth,
          "recaptcha-login",
          {
            size: "invisible",

            callback: () => {},

            "expired-callback":
              () => {
                resetearRecaptcha();
              },
          }
        );

      recaptchaRef.current =
        verifier;

      recaptchaWidgetIdRef.current =
        await verifier.render();

      return verifier;
    };

  /* ======================================================
     PERFIL FIRESTORE
  ====================================================== */

  const obtenerPerfil =
    async (user) => {
      const ref =
        doc(
          db,
          "users",
          user.uid
        );

      const snap =
        await getDoc(ref);

      if (!snap.exists()) {
        return null;
      }

      return {
        id: snap.id,
        ...snap.data(),
      };
    };

  const actualizarUltimoAcceso =
    async (user) => {
      if (!user) return;

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          ultimoAcceso:
            serverTimestamp(),

          fechaActualizacion:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );
    };

  const redirigirSegunRol =
    (perfil) => {
      if (
        perfil?.role ===
        "admin"
      ) {
        navigate(
          "/admin",
          {
            replace: true,
          }
        );

        return;
      }

      navigate(
        "/cliente",
        {
          replace: true,
        }
      );
    };

  /* ======================================================
     ERRORES SMS
  ====================================================== */

  const mensajeErrorSMS =
    (firebaseError) => {
      console.error(
        "Firebase Phone Auth:",
        firebaseError
      );

      switch (
        firebaseError?.code
      ) {
        case "auth/invalid-phone-number":
          return "El número de teléfono no es válido.";

        case "auth/too-many-requests":
          return "Se hicieron demasiados intentos. Espera un momento e inténtalo nuevamente.";

        case "auth/quota-exceeded":
          return "Se alcanzó temporalmente el límite de SMS.";

        case "auth/invalid-verification-id":
          return "La verificación SMS ya no es válida. Solicita un código nuevo.";

        case "auth/app-not-authorized":
          return "Esta aplicación no está autorizada para usar Firebase Authentication.";

        case "auth/billing-not-enabled":
          return "Firebase todavía no tiene habilitada la facturación para SMS reales.";

        case "auth/operation-not-allowed":
          return "El acceso por teléfono no está habilitado en Firebase.";

        case "auth/unauthorized-domain":
          return "Este dominio todavía no está autorizado en Firebase Authentication.";

        case "auth/captcha-check-failed":
        case "auth/invalid-app-credential":
        case "auth/missing-app-credential":
          return "No se pudo validar reCAPTCHA. Inténtalo nuevamente.";

        default:
          return (
            firebaseError?.message ||
            "No se pudo enviar el código."
          );
      }
    };

  /* ======================================================
     GOOGLE
  ====================================================== */

  const loginGoogle =
    async () => {
      setError("");
      setMensaje("");

      try {
        setLoading(true);

        const result =
          await signInWithPopup(
            auth,
            provider
          );

        const user =
          result.user;

        let perfil =
          await obtenerPerfil(
            user
          );

        if (!perfil) {
          await setDoc(
            doc(
              db,
              "users",
              user.uid
            ),
            {
              uid: user.uid,

              nombre:
                user.displayName ||
                "Usuario",

              correo:
                user.email ||
                "",

              telefono:
                user.phoneNumber ||
                "",

              role:
                "cliente",

              proveedor:
                "google",

              proveedores: [
                "google",
              ],

              emailVerificado:
                user.emailVerified ||
                false,

              fechaRegistro:
                serverTimestamp(),

              fechaActualizacion:
                serverTimestamp(),

              ultimoAcceso:
                serverTimestamp(),
            }
          );

          perfil = {
            role:
              "cliente",
          };
        } else {
          await actualizarUltimoAcceso(
            user
          );
        }

        redirigirSegunRol(
          perfil
        );
      } catch (firebaseError) {
        console.error(
          "Error Google:",
          firebaseError
        );

        if (
          firebaseError?.code ===
          "auth/popup-closed-by-user"
        ) {
          setError(
            "La ventana de Google fue cerrada antes de completar el acceso."
          );
        } else if (
          firebaseError?.code ===
          "auth/account-exists-with-different-credential"
        ) {
          setError(
            "Ya existe una cuenta con ese correo usando otro método de acceso."
          );
        } else {
          setError(
            "No se pudo iniciar sesión con Google."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  /* ======================================================
     CORREO + CONTRASEÑA
  ====================================================== */

  const loginCorreo =
    async (e) => {
      e.preventDefault();

      setError("");
      setMensaje("");

      if (!correo.trim()) {
        setError(
          "Escribe tu correo electrónico."
        );

        return;
      }

      if (!passwordCorreo) {
        setError(
          "Escribe tu contraseña."
        );

        return;
      }

      try {
        setLoading(true);

        const result =
          await signInWithEmailAndPassword(
            auth,
            correo
              .trim()
              .toLowerCase(),
            passwordCorreo
          );

        const perfil =
          await obtenerPerfil(
            result.user
          );

        if (!perfil) {
          await signOut(auth);

          setError(
            "No encontramos tu perfil Wealth. Regístrate primero."
          );

          return;
        }

        await actualizarUltimoAcceso(
          result.user
        );

        redirigirSegunRol(
          perfil
        );
      } catch (firebaseError) {
        console.error(
          "Error correo:",
          firebaseError
        );

        if (
          [
            "auth/invalid-credential",
            "auth/wrong-password",
            "auth/user-not-found",
          ].includes(
            firebaseError?.code
          )
        ) {
          setError(
            "Correo o contraseña incorrectos."
          );
        } else if (
          firebaseError?.code ===
          "auth/too-many-requests"
        ) {
          setError(
            "Demasiados intentos. Intenta nuevamente más tarde."
          );
        } else {
          setError(
            "No se pudo iniciar sesión."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  const recuperarCorreo =
    async () => {
      setError("");
      setMensaje("");

      if (!correo.trim()) {
        setError(
          "Escribe primero tu correo electrónico."
        );

        return;
      }

      try {
        setLoading(true);

        await sendPasswordResetEmail(
          auth,
          correo
            .trim()
            .toLowerCase()
        );

        setMensaje(
          `Enviamos un enlace de recuperación a ${correo.trim()}.`
        );
      } catch (firebaseError) {
        console.error(
          "Recuperación correo:",
          firebaseError
        );

        setError(
          "No se pudo enviar el correo de recuperación."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ======================================================
     TELÉFONO + CONTRASEÑA
  ====================================================== */

  const loginTelefono =
    async (e) => {
      e.preventDefault();

      setError("");
      setMensaje("");

      const telefonoE164 =
        normalizarTelefonoMexico(
          telefono
        );

      if (!telefonoE164) {
        setError(
          "Escribe un teléfono válido de México de 10 dígitos."
        );

        return;
      }

      if (!passwordTelefono) {
        setError(
          "Escribe tu contraseña."
        );

        return;
      }

      try {
        setLoading(true);

        const emailInterno =
          telefonoAEmailInterno(
            telefonoE164
          );

        const result =
          await signInWithEmailAndPassword(
            auth,
            emailInterno,
            passwordTelefono
          );

        const perfil =
          await obtenerPerfil(
            result.user
          );

        if (!perfil) {
          await signOut(auth);

          setError(
            "No encontramos tu perfil Wealth."
          );

          return;
        }

        await actualizarUltimoAcceso(
          result.user
        );

        redirigirSegunRol(
          perfil
        );
      } catch (firebaseError) {
        console.error(
          "Error teléfono + contraseña:",
          firebaseError
        );

        if (
          [
            "auth/invalid-credential",
            "auth/wrong-password",
            "auth/user-not-found",
          ].includes(
            firebaseError?.code
          )
        ) {
          setError(
            "Teléfono o contraseña incorrectos."
          );
        } else if (
          firebaseError?.code ===
          "auth/too-many-requests"
        ) {
          setError(
            "Demasiados intentos. Espera un momento."
          );
        } else {
          setError(
            "No se pudo iniciar sesión."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  /* ======================================================
     RECUPERACIÓN POR SMS
  ====================================================== */

  const iniciarRecuperacionTelefono =
    async () => {
      setError("");
      setMensaje("");

      const telefonoE164 =
        normalizarTelefonoMexico(
          telefono
        );

      if (!telefonoE164) {
        setError(
          "Escribe primero el teléfono registrado."
        );

        return;
      }

      try {
        setLoading(true);

        const verifier =
          await prepararRecaptcha();

        resetearRecaptcha();

        const resultado =
          await signInWithPhoneNumber(
            auth,
            telefonoE164,
            verifier
          );

        setConfirmationResult(
          resultado
        );

        setNumeroVerificando(
          telefonoE164
        );

        setCodigo("");

        setContador(
          SEGUNDOS_REENVIO
        );

        setModo(
          "recuperarTelefonoCodigo"
        );

        setMensaje(
          "Enviamos un código de seguridad a tu teléfono."
        );
      } catch (firebaseError) {
        setError(
          mensajeErrorSMS(
            firebaseError
          )
        );

        resetearRecaptcha();
      } finally {
        setLoading(false);
      }
    };

  const verificarCodigoRecuperacion =
    async () => {
      setError("");
      setMensaje("");

      const codigoLimpio =
        codigo
          .replace(/\D/g, "");

      if (
        codigoLimpio.length !==
        6
      ) {
        setError(
          "El código debe tener 6 dígitos."
        );

        return;
      }

      if (!confirmationResult) {
        setError(
          "Solicita un nuevo código."
        );

        return;
      }

      try {
        setLoading(true);

        const result =
          await confirmationResult.confirm(
            codigoLimpio
          );

        const perfil =
          await obtenerPerfil(
            result.user
          );

        if (!perfil) {
          await signOut(auth);

          setError(
            "Este teléfono no tiene un perfil Wealth registrado."
          );

          setModo(
            "telefono"
          );

          return;
        }

        setModo(
          "recuperarTelefonoPassword"
        );

        setMensaje(
          "Teléfono verificado. Ahora crea una nueva contraseña."
        );
      } catch (firebaseError) {
        console.error(
          "Error verificando SMS:",
          firebaseError
        );

        if (
          firebaseError?.code ===
          "auth/invalid-verification-code"
        ) {
          setError(
            "El código es incorrecto."
          );
        } else if (
          [
            "auth/code-expired",
            "auth/session-expired",
          ].includes(
            firebaseError?.code
          )
        ) {
          setError(
            "El código expiró. Solicita uno nuevo."
          );
        } else {
          setError(
            "No se pudo verificar el código."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  const reenviarCodigo =
    async () => {
      if (
        contador > 0 ||
        loading
      ) {
        return;
      }

      setError("");
      setMensaje("");

      try {
        setLoading(true);

        const verifier =
          await prepararRecaptcha();

        resetearRecaptcha();

        const resultado =
          await signInWithPhoneNumber(
            auth,
            numeroVerificando,
            verifier
          );

        setConfirmationResult(
          resultado
        );

        setCodigo("");

        setContador(
          SEGUNDOS_REENVIO
        );

        setMensaje(
          "Enviamos un nuevo código."
        );
      } catch (firebaseError) {
        setError(
          mensajeErrorSMS(
            firebaseError
          )
        );

        resetearRecaptcha();
      } finally {
        setLoading(false);
      }
    };

  const guardarNuevaPassword =
    async () => {
      setError("");
      setMensaje("");

      if (
        nuevaPassword.length <
        8
      ) {
        setError(
          "La contraseña debe tener al menos 8 caracteres."
        );

        return;
      }

      if (
        nuevaPassword !==
        confirmarNuevaPassword
      ) {
        setError(
          "Las contraseñas no coinciden."
        );

        return;
      }

      if (!auth.currentUser) {
        setError(
          "La sesión de recuperación expiró."
        );

        return;
      }

      try {
        setLoading(true);

        await updatePassword(
          auth.currentUser,
          nuevaPassword
        );

        await setDoc(
          doc(
            db,
            "users",
            auth.currentUser.uid
          ),
          {
            fechaCambioPassword:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),

            ultimoAcceso:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        const perfil =
          await obtenerPerfil(
            auth.currentUser
          );

        setMensaje(
          "Contraseña actualizada correctamente."
        );

        setTimeout(
          () => {
            redirigirSegunRol(
              perfil
            );
          },
          700
        );
      } catch (firebaseError) {
        console.error(
          "Error actualizando password:",
          firebaseError
        );

        setError(
          "No se pudo actualizar la contraseña. Solicita un nuevo código."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ======================================================
     VOLVER
  ====================================================== */

  const volverOpciones =
    async () => {
      try {
        if (
          modo.startsWith(
            "recuperarTelefono"
          ) &&
          auth.currentUser
        ) {
          await signOut(auth);
        }
      } catch {
        // Ignorar.
      }

      resetearRecaptcha();

      setModo(
        "opciones"
      );

      setError("");
      setMensaje("");

      setPasswordCorreo("");
      setPasswordTelefono("");

      setCodigo("");
      setConfirmationResult(null);
      setNumeroVerificando("");
      setContador(0);

      setNuevaPassword("");
      setConfirmarNuevaPassword("");
    };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className={`min-h-screen overflow-hidden relative transition-colors duration-300 ${modoOscuro ? "bg-black text-white" : "wealth-light bg-gray-50 text-gray-900"}`}>
      <style>{temaClaroCss}</style>

      {/* FONDO */}

      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1800&auto=format&fit=crop"
          alt="Edificios corporativos"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/50" />
      </div>

      {/* CONTENIDO */}

      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 py-10">
        <div className={`w-full max-w-md backdrop-blur-xl border rounded-[30px] p-6 sm:p-8 shadow-2xl ${modoOscuro ? "bg-zinc-950/95 border-zinc-700" : "bg-white/95 border-gray-200"}`}>

          {/* HEADER */}

          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center mx-auto">
              <FaUserLock size={23} />
            </div>

            <p className="text-yellow-500 uppercase tracking-[0.28em] text-[11px] font-semibold mt-5">
              Wealth
            </p>

            <p className="text-zinc-500 uppercase tracking-[0.25em] text-[10px] mt-1">
              Grupo Empresarial
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-5">
              {modo === "opciones"
                ? "Bienvenido"
                : modo.startsWith("recuperarTelefono")
                ? "Recuperar acceso"
                : "Iniciar sesión"}
            </h1>

            <p className="text-zinc-500 text-sm mt-2">
              {modo === "opciones"
                ? "Elige cómo deseas acceder a Wealth."
                : modo === "telefono"
                ? "Ingresa con tu teléfono y contraseña."
                : modo === "correo"
                ? "Ingresa con tu correo y contraseña."
                : "Verificaremos tu identidad de forma segura."}
            </p>
          </div>

          {/* MENSAJES */}

          {error && (
            <Alerta tipo="error">
              <FaExclamationTriangle />
              <span>{error}</span>
            </Alerta>
          )}

          {mensaje && (
            <Alerta tipo="ok">
              <FaCheckCircle />
              <span>{mensaje}</span>
            </Alerta>
          )}

          {/* OPCIONES */}

          {modo === "opciones" && (
            <div className="space-y-3">

              {/* GOOGLE */}

              <button
                type="button"
                onClick={loginGoogle}
                disabled={loading}
                className="w-full bg-white hover:bg-zinc-100 text-black px-5 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition disabled:opacity-50"
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                  alt="Google"
                  className="w-5 h-5"
                />

                Continuar con Google
              </button>

              {/* TELÉFONO */}

              <button
                type="button"
                onClick={() => {
                  setModo("telefono");
                  setError("");
                  setMensaje("");
                }}
                className="w-full bg-green-500/5 border border-green-500/40 hover:bg-green-500/10 text-green-400 px-5 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition"
              >
                <FaPhone />
                Teléfono + contraseña
                <FaArrowRight />
              </button>

              {/* CORREO */}

              <button
                type="button"
                onClick={() => {
                  setModo("correo");
                  setError("");
                  setMensaje("");
                }}
                className="w-full bg-yellow-500/5 border border-yellow-500/40 hover:bg-yellow-500/10 text-yellow-500 px-5 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition"
              >
                <FaEnvelope />
                Correo + contraseña
                <FaArrowRight />
              </button>
            </div>
          )}

          {/* LOGIN CORREO */}

          {modo === "correo" && (
            <form
              onSubmit={loginCorreo}
              className="space-y-5"
            >
              <Campo
                label="Correo electrónico"
                icon={<FaEnvelope />}
              >
                <input
                  type="email"
                  autoComplete="email"
                  value={correo}
                  onChange={(e) =>
                    setCorreo(
                      e.target.value
                    )
                  }
                  placeholder="correo@ejemplo.com"
                  className={inputClass}
                />
              </Campo>

              <Campo
                label="Contraseña"
                icon={<FaLock />}
              >
                <div className="relative">
                  <input
                    type={
                      mostrarPasswordCorreo
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={passwordCorreo}
                    onChange={(e) =>
                      setPasswordCorreo(
                        e.target.value
                      )
                    }
                    placeholder="Tu contraseña"
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarPasswordCorreo(
                        (actual) =>
                          !actual
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-yellow-500"
                  >
                    {mostrarPasswordCorreo ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </Campo>

              <button
                type="submit"
                disabled={loading}
                className={botonPrincipal}
              >
                <FaUserLock />

                {loading
                  ? "Ingresando..."
                  : "Iniciar sesión"}

                {!loading && (
                  <FaArrowRight />
                )}
              </button>

              <button
                type="button"
                onClick={recuperarCorreo}
                disabled={loading}
                className="w-full py-2 text-sm text-zinc-500 hover:text-yellow-500 flex items-center justify-center gap-2"
              >
                <FaKey />
                ¿Olvidaste tu contraseña?
              </button>

              <button
                type="button"
                onClick={volverOpciones}
                className={botonVolver}
              >
                <FaArrowLeft />
                Volver
              </button>
            </form>
          )}

          {/* LOGIN TELÉFONO */}

          {modo === "telefono" && (
            <form
              onSubmit={loginTelefono}
              className="space-y-5"
            >
              <Campo
                label="Número de teléfono"
                icon={<FaPhone />}
              >
                <div className="flex gap-2">
                  <div className="bg-black border border-zinc-700 rounded-2xl px-4 flex items-center text-zinc-400 font-semibold">
                    +52
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={telefono}
                    onChange={(e) =>
                      setTelefono(
                        e.target.value
                      )
                    }
                    placeholder="981 123 4567"
                    className={inputClass}
                  />
                </div>
              </Campo>

              <Campo
                label="Contraseña"
                icon={<FaLock />}
              >
                <div className="relative">
                  <input
                    type={
                      mostrarPasswordTelefono
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={passwordTelefono}
                    onChange={(e) =>
                      setPasswordTelefono(
                        e.target.value
                      )
                    }
                    placeholder="Tu contraseña"
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarPasswordTelefono(
                        (actual) =>
                          !actual
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-green-400"
                  >
                    {mostrarPasswordTelefono ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </Campo>

              <button
                type="submit"
                disabled={loading}
                className={botonPrincipal}
              >
                <FaPhone />

                {loading
                  ? "Ingresando..."
                  : "Iniciar sesión"}

                {!loading && (
                  <FaArrowRight />
                )}
              </button>

              <button
                type="button"
                onClick={
                  iniciarRecuperacionTelefono
                }
                disabled={loading}
                className="w-full py-2 text-sm text-zinc-500 hover:text-green-400 flex items-center justify-center gap-2"
              >
                <FaKey />
                ¿Olvidaste tu contraseña?
              </button>

              <button
                type="button"
                onClick={volverOpciones}
                className={botonVolver}
              >
                <FaArrowLeft />
                Volver
              </button>
            </form>
          )}

          {/* RECUPERACIÓN TELÉFONO - CÓDIGO */}

          {modo ===
            "recuperarTelefonoCodigo" && (
            <div className="space-y-5">
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">
                <p className="text-green-400 font-semibold">
                  Código enviado
                </p>

                <p className="text-zinc-400 text-sm mt-1">
                  {numeroVerificando}
                </p>
              </div>

              <Campo
                label="Código SMS"
                icon={<FaSms />}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) =>
                    setCodigo(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  placeholder="000000"
                  className={`${inputClass} text-center text-2xl tracking-[0.35em]`}
                />
              </Campo>

              <button
                type="button"
                onClick={
                  verificarCodigoRecuperacion
                }
                disabled={loading}
                className={botonPrincipal}
              >
                <FaCheckCircle />

                {loading
                  ? "Verificando..."
                  : "Verificar código"}
              </button>

              <button
                type="button"
                onClick={reenviarCodigo}
                disabled={
                  contador > 0 ||
                  loading
                }
                className={botonSecundario}
              >
                <FaRedo />

                {contador > 0
                  ? `Reenviar en ${contador}s`
                  : "Reenviar código"}
              </button>

              <button
                type="button"
                onClick={volverOpciones}
                className={botonVolver}
              >
                <FaArrowLeft />
                Cancelar
              </button>
            </div>
          )}

          {/* RECUPERACIÓN TELÉFONO - NUEVA PASSWORD */}

          {modo ===
            "recuperarTelefonoPassword" && (
            <div className="space-y-5">
              <Campo
                label="Nueva contraseña"
                icon={<FaLock />}
              >
                <div className="relative">
                  <input
                    type={
                      mostrarNuevaPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={nuevaPassword}
                    onChange={(e) =>
                      setNuevaPassword(
                        e.target.value
                      )
                    }
                    placeholder="Mínimo 8 caracteres"
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarNuevaPassword(
                        (actual) =>
                          !actual
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-green-400"
                  >
                    {mostrarNuevaPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </Campo>

              <Campo
                label="Confirmar contraseña"
                icon={<FaShieldAlt />}
              >
                <input
                  type="password"
                  autoComplete="new-password"
                  value={
                    confirmarNuevaPassword
                  }
                  onChange={(e) =>
                    setConfirmarNuevaPassword(
                      e.target.value
                    )
                  }
                  placeholder="Repite la contraseña"
                  className={inputClass}
                />
              </Campo>

              <button
                type="button"
                onClick={
                  guardarNuevaPassword
                }
                disabled={loading}
                className={botonPrincipal}
              >
                <FaCheckCircle />

                {loading
                  ? "Guardando..."
                  : "Guardar nueva contraseña"}
              </button>

              <button
                type="button"
                onClick={volverOpciones}
                className={botonVolver}
              >
                <FaArrowLeft />
                Cancelar
              </button>
            </div>
          )}

          {/* RECAPTCHA */}

          <div id="recaptcha-login" />

          {/* REGISTRO */}

          <div className="mt-7 pt-6 border-t border-zinc-800 text-center">
            <p className="text-sm text-zinc-500">
              ¿No tienes cuenta?

              <Link
                to="/register"
                className="text-yellow-500 hover:text-yellow-400 ml-2 font-bold"
              >
                Registrarse
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-600 mt-5">
            <FaShieldAlt />
            Acceso seguro · Wealth
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   COMPONENTES
====================================================== */

function Campo({
  label,
  icon,
  children,
}) {
  return (
    <div>
      <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">
        <span className="text-yellow-500">
          {icon}
        </span>

        {label}
      </label>

      {children}
    </div>
  );
}

function Alerta({
  tipo,
  children,
}) {
  const clase =
    tipo === "error"
      ? "bg-red-500/5 border-red-500/30 text-red-300"
      : "bg-green-500/5 border-green-500/30 text-green-300";

  return (
    <div
      className={`mb-5 border rounded-2xl p-4 text-sm flex items-start gap-3 ${clase}`}
    >
      {children}
    </div>
  );
}

/* ======================================================
   ESTILOS
====================================================== */

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

const botonPrincipal = `
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
  transition
  disabled:opacity-50
  disabled:cursor-not-allowed
`;

const botonSecundario = `
  w-full
  bg-zinc-900
  border
  border-zinc-700
  hover:border-yellow-500/40
  px-5
  py-3.5
  rounded-2xl
  font-semibold
  flex
  items-center
  justify-center
  gap-2
  disabled:opacity-40
`;

const botonVolver = `
  w-full
  py-3
  text-sm
  text-zinc-500
  hover:text-white
  flex
  items-center
  justify-center
  gap-2
`;


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

export default Login;