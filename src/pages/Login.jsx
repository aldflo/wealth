import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
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
  FaPhone,
  FaSms,
  FaRedo,
} from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  // ======================================================
  // MODOS
  // ======================================================

  const [modo, setModo] = useState("opciones");

  // ======================================================
  // CORREO
  // ======================================================

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // ======================================================
  // TELÉFONO
  // ======================================================

  const [telefono, setTelefono] = useState("");
  const [codigo, setCodigo] = useState("");

  const [confirmationResult, setConfirmationResult] =
    useState(null);

  const [codigoEnviado, setCodigoEnviado] =
    useState(false);

  const [numeroEnviado, setNumeroEnviado] =
    useState("");

  const [contador, setContador] = useState(0);

  // ======================================================
  // LOADING
  // ======================================================

  const [loadingGoogle, setLoadingGoogle] =
    useState(false);

  const [loadingUsuario, setLoadingUsuario] =
    useState(false);

  const [loadingTelefono, setLoadingTelefono] =
    useState(false);

  const [loadingCodigo, setLoadingCodigo] =
    useState(false);

  const [loadingReset, setLoadingReset] =
    useState(false);

  // ======================================================
  // MENSAJES
  // ======================================================

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // RECAPTCHA
  // ======================================================

  const recaptchaRef = useRef(null);

  // ======================================================
  // TEMPORIZADOR
  // ======================================================

  useEffect(() => {
    if (contador <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setContador((actual) =>
        actual > 0
          ? actual - 1
          : 0
      );
    }, 1000);

    return () =>
      clearInterval(interval);
  }, [contador]);

  // ======================================================
  // LIMPIAR RECAPTCHA
  // ======================================================

  const limpiarRecaptcha = () => {
    try {
      recaptchaRef.current?.clear();
    } catch (error) {
      console.warn(
        "No se pudo limpiar reCAPTCHA:",
        error
      );
    }

    recaptchaRef.current = null;

    const container =
      document.getElementById(
        "recaptcha-container"
      );

    if (container) {
      container.innerHTML = "";
    }
  };

  useEffect(() => {
    return () => {
      try {
        recaptchaRef.current?.clear();
      } catch {
        // ignorar
      }
    };
  }, []);

  // ======================================================
  // NORMALIZAR TELÉFONO MÉXICO
  // ======================================================

  const normalizarTelefono = () => {
    const limpio = telefono
      .trim()
      .replace(/[\s()-]/g, "");

    if (limpio.startsWith("+")) {
      const numeros =
        limpio.slice(1);

      if (/^\d{10,15}$/.test(numeros)) {
        return `+${numeros}`;
      }

      return null;
    }

    const soloNumeros =
      limpio.replace(/\D/g, "");

    // México - 10 dígitos
    if (soloNumeros.length === 10) {
      return `+52${soloNumeros}`;
    }

    // Ya escribió 52
    if (
      soloNumeros.length === 12 &&
      soloNumeros.startsWith("52")
    ) {
      return `+${soloNumeros}`;
    }

    return null;
  };

  // ======================================================
  // PREPARAR RECAPTCHA
  // ======================================================

  const prepararRecaptcha = async () => {
    if (recaptchaRef.current) {
      return recaptchaRef.current;
    }

    const container =
      document.getElementById(
        "recaptcha-container"
      );

    if (!container) {
      throw new Error(
        "No se encontró el contenedor de reCAPTCHA."
      );
    }

    recaptchaRef.current =
      new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",

          callback: () => {
            console.log(
              "✅ reCAPTCHA aprobado"
            );
          },

          "expired-callback": () => {
            console.warn(
              "⚠️ reCAPTCHA expiró"
            );

            limpiarRecaptcha();
          },
        }
      );

    await recaptchaRef.current.render();

    return recaptchaRef.current;
  };

  // ======================================================
  // MENSAJES ERROR TELÉFONO
  // ======================================================

  const obtenerMensajeErrorSMS = (
    firebaseError
  ) => {
    const codigoError =
      firebaseError?.code ||
      "error-desconocido";

    console.error(
      "❌ ERROR PHONE AUTH:",
      firebaseError
    );

    switch (codigoError) {
      case "auth/invalid-phone-number":
        return "El número de teléfono no es válido.";

      case "auth/missing-phone-number":
        return "Escribe tu número de teléfono.";

      case "auth/quota-exceeded":
        return "Se alcanzó el límite de SMS de Firebase.";

      case "auth/too-many-requests":
        return "Demasiados intentos. Espera un momento e intenta nuevamente.";

      case "auth/operation-not-allowed":
        return "El acceso por teléfono no está habilitado en Firebase.";

      case "auth/unauthorized-domain":
        return "Este dominio no está autorizado en Firebase.";

      case "auth/captcha-check-failed":
        return "La verificación reCAPTCHA falló. Intenta nuevamente.";

      case "auth/missing-app-credential":
        return "Firebase no pudo validar reCAPTCHA.";

      case "auth/invalid-app-credential":
        return "La validación de reCAPTCHA no fue aceptada.";

      case "auth/billing-not-enabled":
        return "Firebase requiere facturación para enviar SMS reales. Puedes usar los números de prueba configurados en Firebase.";

      default:
        return `${codigoError}: ${
          firebaseError?.message ||
          "No se pudo enviar el código."
        }`;
    }
  };

  // ======================================================
  // LEER USUARIO FIRESTORE
  // ======================================================

  const obtenerUsuarioFirestore = async (
    user
  ) => {
    const userRef = doc(
      db,
      "users",
      user.uid
    );

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return {
      id: userSnap.id,
      ...userSnap.data(),
    };
  };

  // ======================================================
  // ACTUALIZAR USUARIO EXISTENTE
  // ======================================================

  const actualizarUsuario = async (
    user,
    proveedorAcceso
  ) => {
    const userRef = doc(
      db,
      "users",
      user.uid
    );

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const datosActuales =
      userSnap.data();

    const cambios = {
      fechaActualizacion:
        serverTimestamp(),
    };

    if (user.email) {
      cambios.correo =
        user.email;
    }

    if (user.phoneNumber) {
      cambios.telefono =
        user.phoneNumber;

      cambios.telefonoVerificado =
        true;
    }

    if (!datosActuales.proveedor) {
      cambios.proveedor =
        proveedorAcceso;
    }

    await setDoc(
      userRef,
      cambios,
      {
        merge: true,
      }
    );

    return datosActuales;
  };

  // ======================================================
  // REDIRECCIÓN
  // ======================================================

  const redirigirSegunRol = (
    datosUsuario
  ) => {
    if (
      datosUsuario?.role ===
      "admin"
    ) {
      navigate("/admin");
      return;
    }

    navigate("/cliente");
  };

  // ======================================================
  // GOOGLE
  // ======================================================

  const loginGoogle = async () => {
    try {
      setLoadingGoogle(true);

      setError("");
      setMensaje("");

      const result =
        await signInWithPopup(
          auth,
          provider
        );

      const user =
        result.user;

      let datosUsuario =
        await obtenerUsuarioFirestore(
          user
        );

      /*
       * Conservamos el comportamiento que ya tenías:
       * Google sí puede crear automáticamente
       * el perfil cliente si es primera vez.
       */

      if (!datosUsuario) {
        const userRef =
          doc(
            db,
            "users",
            user.uid
          );

        await setDoc(
          userRef,
          {
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

            emailVerificado:
              user.emailVerified ||
              false,

            fechaRegistro:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),
          }
        );

        datosUsuario = {
          role: "cliente",
        };
      } else {
        await actualizarUsuario(
          user,
          "google"
        );
      }

      redirigirSegunRol(
        datosUsuario
      );

    } catch (firebaseError) {
      console.error(
        "Error Google:",
        firebaseError
      );

      if (
        firebaseError.code ===
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
  // LOGIN CORREO
  // ======================================================

  const loginUsuario = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setMensaje("");

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

      const result =
        await signInWithEmailAndPassword(
          auth,
          correo
            .trim()
            .toLowerCase(),
          password
        );

      const datosUsuario =
        await obtenerUsuarioFirestore(
          result.user
        );

      if (!datosUsuario) {
        await signOut(auth);

        setError(
          "No encontramos tu perfil Wealth. Regístrate primero."
        );

        return;
      }

      await actualizarUsuario(
        result.user,
        "password"
      );

      redirigirSegunRol(
        datosUsuario
      );

    } catch (firebaseError) {
      console.error(
        "Error login:",
        firebaseError
      );

      if (
        firebaseError.code ===
          "auth/invalid-credential" ||
        firebaseError.code ===
          "auth/wrong-password" ||
        firebaseError.code ===
          "auth/user-not-found"
      ) {
        setError(
          "Correo o contraseña incorrectos."
        );
      } else if (
        firebaseError.code ===
        "auth/too-many-requests"
      ) {
        setError(
          "Se realizaron demasiados intentos. Intenta nuevamente más tarde."
        );
      } else {
        setError(
          firebaseError.message ||
          "No se pudo iniciar sesión."
        );
      }

    } finally {
      setLoadingUsuario(false);
    }
  };

  // ======================================================
  // ENVIAR SMS LOGIN
  // ======================================================

  const enviarCodigo = async () => {
    setError("");
    setMensaje("");

    const numero =
      normalizarTelefono();

    if (!numero) {
      setError(
        "Escribe un número válido de México de 10 dígitos."
      );

      return;
    }

    try {
      setLoadingTelefono(true);

      limpiarRecaptcha();

      const verifier =
        await prepararRecaptcha();

      const resultado =
        await signInWithPhoneNumber(
          auth,
          numero,
          verifier
        );

      setConfirmationResult(
        resultado
      );

      setNumeroEnviado(
        numero
      );

      setCodigoEnviado(true);

      setCodigo("");

      setContador(60);

      setMensaje(
        "Código de verificación preparado correctamente."
      );

    } catch (firebaseError) {
      setError(
        obtenerMensajeErrorSMS(
          firebaseError
        )
      );

      limpiarRecaptcha();

    } finally {
      setLoadingTelefono(false);
    }
  };

  // ======================================================
  // VERIFICAR TELÉFONO LOGIN
  // ======================================================

  const verificarCodigo = async () => {
    setError("");
    setMensaje("");

    if (!confirmationResult) {
      setError(
        "Primero solicita un código."
      );

      return;
    }

    const codigoLimpio =
      codigo
        .trim()
        .replace(/\D/g, "");

    if (
      codigoLimpio.length !== 6
    ) {
      setError(
        "El código debe tener 6 dígitos."
      );

      return;
    }

    try {
      setLoadingCodigo(true);

      const result =
        await confirmationResult.confirm(
          codigoLimpio
        );

      const user =
        result.user;

      // ================================================
      // IMPORTANTE
      // LOGIN NO CREA PERFIL EN FIRESTORE
      // ================================================

      const datosUsuario =
        await obtenerUsuarioFirestore(
          user
        );

      if (!datosUsuario) {
        await signOut(auth);

        setError(
          "Este teléfono todavía no tiene una cuenta Wealth registrada."
        );

        setMensaje(
          "Ve a Registrarse para crear tu cuenta con este número."
        );

        return;
      }

      await actualizarUsuario(
        user,
        "telefono"
      );

      redirigirSegunRol(
        datosUsuario
      );

    } catch (firebaseError) {
      console.error(
        "Error verificando código:",
        firebaseError
      );

      if (
        firebaseError.code ===
        "auth/invalid-verification-code"
      ) {
        setError(
          "El código es incorrecto."
        );
      } else if (
        firebaseError.code ===
        "auth/code-expired"
      ) {
        setError(
          "El código expiró. Solicita uno nuevo."
        );
      } else if (
        firebaseError.code ===
        "auth/session-expired"
      ) {
        setError(
          "La sesión de verificación expiró. Solicita otro código."
        );
      } else {
        setError(
          firebaseError.message ||
          "No se pudo verificar el código."
        );
      }

    } finally {
      setLoadingCodigo(false);
    }
  };

  // ======================================================
  // REENVIAR
  // ======================================================

  const reenviarCodigo = async () => {
    if (
      contador > 0 ||
      loadingTelefono
    ) {
      return;
    }

    setConfirmationResult(null);
    setCodigoEnviado(false);
    setCodigo("");

    limpiarRecaptcha();

    await enviarCodigo();
  };

  // ======================================================
  // CAMBIAR NUMERO
  // ======================================================

  const cambiarNumero = () => {
    setConfirmationResult(null);
    setCodigoEnviado(false);
    setCodigo("");
    setNumeroEnviado("");
    setContador(0);

    setError("");
    setMensaje("");

    limpiarRecaptcha();
  };

  // ======================================================
  // RECUPERAR PASSWORD
  // ======================================================

  const recuperarPassword =
    async () => {
      if (!correo.trim()) {
        setError(
          "Escribe primero tu correo electrónico."
        );

        return;
      }

      const confirmar =
        window.confirm(
          `¿Enviar recuperación a ${correo.trim()}?`
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
          correo
            .trim()
            .toLowerCase()
        );

        setMensaje(
          `Te enviamos un correo de recuperación a ${correo.trim()}.`
        );

      } catch (firebaseError) {
        console.error(
          "Error recuperación:",
          firebaseError
        );

        setError(
          "No se pudo enviar el correo de recuperación."
        );

      } finally {
        setLoadingReset(false);
      }
    };

  // ======================================================
  // VOLVER
  // ======================================================

  const volver = () => {
    limpiarRecaptcha();

    setModo("opciones");

    setError("");
    setMensaje("");

    setPassword("");

    setCodigo("");
    setCodigoEnviado(false);
    setConfirmationResult(null);
    setNumeroEnviado("");
    setContador(0);
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* FONDO */}

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

      {/* LÍNEAS */}

      <div className="absolute inset-0 hidden md:block overflow-hidden pointer-events-none">

        <div className="absolute w-[170%] h-[3px] bg-[#c89b3c] rotate-[27deg] top-[20%] -left-52 opacity-45" />

        <div className="absolute w-[170%] h-[1px] bg-[#e0b84d] rotate-[27deg] top-[22%] -left-52 opacity-40" />

        <div className="absolute w-[170%] h-[3px] bg-[#c89b3c] rotate-[27deg] bottom-[18%] -left-52 opacity-45" />

      </div>

      {/* CONTENIDO */}

      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-md bg-zinc-950/95 backdrop-blur-xl border border-zinc-700 rounded-[28px] p-6 sm:p-8 shadow-2xl">

          {/* HEADER */}

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

          {/* ERROR */}

          {error && (
            <div className="mb-5 bg-red-500/5 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm flex items-start gap-3">

              <FaExclamationTriangle className="mt-0.5 shrink-0" />

              <span>
                {error}
              </span>

            </div>
          )}

          {/* MENSAJE */}

          {mensaje && (
            <div className="mb-5 bg-green-500/5 border border-green-500/30 rounded-xl p-4 text-green-300 text-sm flex items-start gap-3">

              <FaCheckCircle className="mt-0.5 shrink-0" />

              <span>
                {mensaje}
              </span>

            </div>
          )}

          {/* OPCIONES */}

          {modo === "opciones" && (
            <div>

              {/* GOOGLE */}

              <button
                type="button"
                onClick={loginGoogle}
                disabled={loadingGoogle}
                className="w-full bg-black border border-zinc-700 hover:border-zinc-500 text-white px-4 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 transition disabled:opacity-50"
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

              {/* TELEFONO */}

              <button
                type="button"
                onClick={() => {
                  setModo("telefono");
                  setError("");
                  setMensaje("");
                }}
                className={`${botonBase} w-full mt-3 border-green-500/40 text-green-400 hover:bg-green-500/10`}
              >

                <FaPhone />

                Iniciar sesión con teléfono

                <FaArrowRight />

              </button>

              <div className="flex items-center gap-3 my-5">

                <div className="h-px bg-zinc-800 flex-1" />

                <span className="text-xs text-zinc-600">
                  o
                </span>

                <div className="h-px bg-zinc-800 flex-1" />

              </div>

              {/* CORREO */}

              <button
                type="button"
                onClick={() => {
                  setModo("correo");
                  setError("");
                  setMensaje("");
                }}
                className={`${botonBase} w-full border-[#c89b3c]/60 text-[#d6ab4c] hover:bg-[#c89b3c]/10`}
              >

                <FaLock />

                Iniciar sesión con correo

                <FaArrowRight />

              </button>

            </div>
          )}

          {/* LOGIN CORREO */}

          {modo === "correo" && (
            <form
              onSubmit={loginUsuario}
              className="space-y-4"
            >

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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#d6ab4c]"
                  >

                    {mostrarPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}

                  </button>

                </div>

              </div>

              <div className="flex justify-end">

                <button
                  type="button"
                  onClick={recuperarPassword}
                  disabled={loadingReset}
                  className="text-sm text-zinc-500 hover:text-[#d6ab4c] flex items-center gap-2"
                >

                  <FaKey size={12} />

                  {loadingReset
                    ? "Enviando..."
                    : "¿Olvidaste tu contraseña?"}

                </button>

              </div>

              <button
                type="submit"
                disabled={loadingUsuario}
                className={`${botonBase} w-full border-[#c89b3c]/60 text-[#d6ab4c] hover:bg-[#c89b3c]/10`}
              >

                <FaUserLock />

                {loadingUsuario
                  ? "Ingresando..."
                  : "Entrar al sistema"}

                {!loadingUsuario && (
                  <FaArrowRight />
                )}

              </button>

              <button
                type="button"
                onClick={volver}
                className="w-full text-zinc-500 hover:text-white text-sm py-2"
              >
                Volver a opciones
              </button>

            </form>
          )}

          {/* LOGIN TELEFONO */}

          {modo === "telefono" && (
            <div className="space-y-4">

              {!codigoEnviado ? (
                <>

                  <div>

                    <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">

                      <FaPhone className="text-green-400" />

                      Número registrado

                    </label>

                    <div className="flex gap-2">

                      <div className="bg-black border border-zinc-700 rounded-xl px-4 flex items-center text-zinc-400 font-semibold">
                        +52
                      </div>

                      <input
                        type="tel"
                        inputMode="numeric"
                        value={telefono}
                        onChange={(e) =>
                          setTelefono(
                            e.target.value
                          )
                        }
                        placeholder="5517237904"
                        autoComplete="tel"
                        className={inputClass}
                      />

                    </div>

                    <p className="text-xs text-zinc-600 mt-2">
                      Escribe los 10 dígitos del teléfono con el que te registraste.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={enviarCodigo}
                    disabled={loadingTelefono}
                    className={`${botonBase} w-full border-green-500/40 text-green-400 hover:bg-green-500/10 disabled:opacity-50`}
                  >

                    <FaSms />

                    {loadingTelefono
                      ? "Preparando código..."
                      : "Continuar con teléfono"}

                  </button>

                </>
              ) : (
                <>

                  <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">

                    <div className="flex gap-3">

                      <FaCheckCircle className="text-green-400 mt-1" />

                      <div>

                        <p className="font-semibold text-green-300">
                          Verificación
                        </p>

                        <p className="text-sm text-zinc-400 mt-1">
                          {numeroEnviado}
                        </p>

                      </div>

                    </div>

                  </div>

                  <div>

                    <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">

                      <FaSms className="text-green-400" />

                      Código de verificación

                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={codigo}
                      onChange={(e) =>
                        setCodigo(
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                      maxLength={6}
                      placeholder="000000"
                      autoComplete="one-time-code"
                      className={`${inputClass} text-center text-2xl tracking-[0.35em]`}
                    />

                  </div>

                  <button
                    type="button"
                    onClick={verificarCodigo}
                    disabled={loadingCodigo}
                    className={`${botonBase} w-full border-green-500/40 text-green-400 hover:bg-green-500/10 disabled:opacity-50`}
                  >

                    <FaCheckCircle />

                    {loadingCodigo
                      ? "Verificando..."
                      : "Verificar e iniciar sesión"}

                  </button>

                  <button
                    type="button"
                    onClick={reenviarCodigo}
                    disabled={
                      contador > 0 ||
                      loadingTelefono
                    }
                    className={`${botonBase} w-full border-zinc-700 text-zinc-400 disabled:opacity-40`}
                  >

                    <FaRedo />

                    {contador > 0
                      ? `Reenviar en ${contador}s`
                      : "Reenviar código"}

                  </button>

                  <button
                    type="button"
                    onClick={cambiarNumero}
                    className="w-full text-sm text-zinc-500 hover:text-white"
                  >
                    Cambiar número
                  </button>

                </>
              )}

              <button
                type="button"
                onClick={volver}
                className="w-full text-zinc-500 hover:text-white text-sm py-2"
              >
                Volver a opciones
              </button>

            </div>
          )}

          {/* RECAPTCHA */}

          <div id="recaptcha-container" />

          {/* REGISTRO */}

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

          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-600 mt-5">

            <FaShieldAlt />

            Acceso seguro · Wealth

          </div>

        </div>

      </div>

    </div>
  );
}

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
`;

export default Login;