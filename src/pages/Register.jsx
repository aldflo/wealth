import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  RecaptchaVerifier,
  sendEmailVerification,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  updateProfile,
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
  FaLock,
  FaPhone,
  FaRedo,
  FaShieldAlt,
  FaSms,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";

/* ======================================================
   CONFIGURACIÓN
====================================================== */

const DOMINIO_INTERNO =
  "wealth.local";

const SEGUNDOS_REENVIO =
  60;

/* ======================================================
   HELPERS TELÉFONO
====================================================== */

const normalizarTelefonoMexico =
  (valor) => {
    const limpio =
      String(
        valor || ""
      )
        .trim()
        .replace(
          /[\s()-]/g,
          ""
        );

    if (
      limpio.startsWith("+")
    ) {
      const numeros =
        limpio
          .slice(1)
          .replace(
            /\D/g,
            ""
          );

      if (
        /^\d{10,15}$/.test(
          numeros
        )
      ) {
        return `+${numeros}`;
      }

      return null;
    }

    const soloNumeros =
      limpio.replace(
        /\D/g,
        ""
      );

    if (
      soloNumeros.length ===
      10
    ) {
      return `+52${soloNumeros}`;
    }

    if (
      soloNumeros.length ===
        12 &&
      soloNumeros.startsWith(
        "52"
      )
    ) {
      return `+${soloNumeros}`;
    }

    return null;
  };

const telefonoAEmailInterno =
  (telefonoE164) => {
    const numeros =
      String(
        telefonoE164 || ""
      ).replace(
        /\D/g,
        ""
      );

    return `${numeros}@${DOMINIO_INTERNO}`;
  };

/* ======================================================
   COMPONENTE
====================================================== */

function Register() {
  const navigate =
    useNavigate();

  /* ======================================================
     MODO DE REGISTRO
  ====================================================== */

  const [modo, setModo] =
    useState("opciones");

  /* ======================================================
     DATOS GENERALES
  ====================================================== */

  const [nombre, setNombre] =
    useState("");

  /* ======================================================
     CORREO
  ====================================================== */

  const [correo, setCorreo] =
    useState("");

  const [
    passwordCorreo,
    setPasswordCorreo,
  ] = useState("");

  const [
    confirmarPasswordCorreo,
    setConfirmarPasswordCorreo,
  ] = useState("");

  const [
    mostrarPasswordCorreo,
    setMostrarPasswordCorreo,
  ] = useState(false);

  const [
    mostrarConfirmacionCorreo,
    setMostrarConfirmacionCorreo,
  ] = useState(false);

  /* ======================================================
     TELÉFONO
  ====================================================== */

  const [
    pasoTelefono,
    setPasoTelefono,
  ] = useState(1);

  const [telefono, setTelefono] =
    useState("");

  const [
    telefonoVerificado,
    setTelefonoVerificado,
  ] = useState("");

  const [codigo, setCodigo] =
    useState("");

  const [
    confirmationResult,
    setConfirmationResult,
  ] = useState(null);

  const [contador, setContador] =
    useState(0);

  const [
    passwordTelefono,
    setPasswordTelefono,
  ] = useState("");

  const [
    confirmarPasswordTelefono,
    setConfirmarPasswordTelefono,
  ] = useState("");

  const [
    mostrarPasswordTelefono,
    setMostrarPasswordTelefono,
  ] = useState(false);

  const [
    mostrarConfirmacionTelefono,
    setMostrarConfirmacionTelefono,
  ] = useState(false);

  /* ======================================================
     ESTADOS
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
     SEGURIDAD CONTRASEÑA
  ====================================================== */

  const calcularSeguridad =
    (password) => {
      let puntos = 0;

      if (
        password.length >=
        8
      ) {
        puntos++;
      }

      if (
        password.length >=
        10
      ) {
        puntos++;
      }

      if (
        /[A-Z]/.test(
          password
        )
      ) {
        puntos++;
      }

      if (
        /[a-z]/.test(
          password
        )
      ) {
        puntos++;
      }

      if (
        /[0-9]/.test(
          password
        )
      ) {
        puntos++;
      }

      if (
        /[^A-Za-z0-9]/.test(
          password
        )
      ) {
        puntos++;
      }

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
    };

  const seguridadCorreo =
    useMemo(
      () =>
        calcularSeguridad(
          passwordCorreo
        ),
      [passwordCorreo]
    );

  const seguridadTelefono =
    useMemo(
      () =>
        calcularSeguridad(
          passwordTelefono
        ),
      [passwordTelefono]
    );

  /* ======================================================
     TEMPORIZADOR
  ====================================================== */

  useEffect(() => {
    if (contador <= 0) {
      return;
    }

    const timer =
      setInterval(
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

  const resetearRecaptcha =
    () => {
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

  const destruirRecaptcha =
    () => {
      try {
        recaptchaRef.current?.clear();
      } catch {
        // Ignorar.
      }

      recaptchaRef.current =
        null;

      recaptchaWidgetIdRef.current =
        null;
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
          "recaptcha-register"
        );

      if (!container) {
        throw new Error(
          "No se encontró el contenedor de reCAPTCHA."
        );
      }

      const verifier =
        new RecaptchaVerifier(
          auth,
          "recaptcha-register",
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
          return "El registro por teléfono no está habilitado en Firebase.";

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

  const registrarGoogle =
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

        const ref =
          doc(
            db,
            "users",
            user.uid
          );

        const snap =
          await getDoc(ref);

        if (!snap.exists()) {
          await setDoc(
            ref,
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

              telefonoVerificado:
                Boolean(
                  user.phoneNumber
                ),

              fechaRegistro:
                serverTimestamp(),

              fechaActualizacion:
                serverTimestamp(),

              ultimoAcceso:
                serverTimestamp(),
            }
          );
        } else {
          await setDoc(
            ref,
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
        }

        navigate(
          "/cliente",
          {
            replace: true,
            state: {
              registroExitoso:
                true,
            },
          }
        );
      } catch (firebaseError) {
        console.error(
          "Registro Google:",
          firebaseError
        );

        if (
          firebaseError?.code ===
          "auth/popup-closed-by-user"
        ) {
          setError(
            "La ventana de Google fue cerrada antes de completar el registro."
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
            "No se pudo continuar con Google."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  /* ======================================================
     CORREO + CONTRASEÑA
  ====================================================== */

  const registrarCorreo =
    async (e) => {
      e.preventDefault();

      setError("");
      setMensaje("");

      if (
        nombre.trim().length <
        3
      ) {
        setError(
          "Escribe tu nombre completo."
        );

        return;
      }

      if (!correo.trim()) {
        setError(
          "Escribe tu correo electrónico."
        );

        return;
      }

      if (
        passwordCorreo.length <
        8
      ) {
        setError(
          "La contraseña debe tener al menos 8 caracteres."
        );

        return;
      }

      if (
        passwordCorreo !==
        confirmarPasswordCorreo
      ) {
        setError(
          "Las contraseñas no coinciden."
        );

        return;
      }

      try {
        setLoading(true);

        const result =
          await createUserWithEmailAndPassword(
            auth,
            correo
              .trim()
              .toLowerCase(),
            passwordCorreo
          );

        const user =
          result.user;

        await updateProfile(
          user,
          {
            displayName:
              nombre.trim(),
          }
        );

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
              "",

            role:
              "cliente",

            proveedor:
              "password",

            proveedores: [
              "password",
            ],

            emailVerificado:
              false,

            telefonoVerificado:
              false,

            fechaRegistro:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),

            ultimoAcceso:
              serverTimestamp(),
          }
        );

        await sendEmailVerification(
          user
        );

        setMensaje(
          "✅ Cuenta creada. Te enviamos un correo de verificación."
        );

        setTimeout(
          () => {
            navigate(
              "/cliente",
              {
                replace: true,
                state: {
                  registroExitoso:
                    true,

                  verificarCorreo:
                    true,

                  correo:
                    correo.trim(),
                },
              }
            );
          },
          900
        );
      } catch (firebaseError) {
        console.error(
          "Registro correo:",
          firebaseError
        );

        switch (
          firebaseError?.code
        ) {
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

          default:
            setError(
              "No se pudo crear la cuenta."
            );
        }
      } finally {
        setLoading(false);
      }
    };

  /* ======================================================
     TELÉFONO - PASO 1
  ====================================================== */

  const enviarCodigo =
    async () => {
      setError("");
      setMensaje("");

      if (
        nombre.trim().length <
        3
      ) {
        setError(
          "Escribe tu nombre completo."
        );

        return;
      }

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

        setTelefonoVerificado(
          telefonoE164
        );

        setCodigo("");

        setContador(
          SEGUNDOS_REENVIO
        );

        setPasoTelefono(2);

        setMensaje(
          "Enviamos un código de verificación a tu teléfono."
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

  /* ======================================================
     TELÉFONO - PASO 2
  ====================================================== */

  const verificarCodigo =
    async () => {
      setError("");
      setMensaje("");

      const codigoLimpio =
        codigo.replace(
          /\D/g,
          ""
        );

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

        const perfilRef =
          doc(
            db,
            "users",
            result.user.uid
          );

        const perfilSnap =
          await getDoc(
            perfilRef
          );

        if (
          perfilSnap.exists()
        ) {
          await signOut(auth);

          setError(
            "Este teléfono ya tiene una cuenta Wealth. Inicia sesión."
          );

          setPasoTelefono(1);

          return;
        }

        setTelefonoVerificado(
          result.user.phoneNumber ||
          telefonoVerificado
        );

        setPasoTelefono(3);

        setMensaje(
          "Teléfono verificado. Ahora crea tu contraseña."
        );
      } catch (firebaseError) {
        console.error(
          "Verificar SMS:",
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
            telefonoVerificado,
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

  /* ======================================================
     TELÉFONO - PASO 3
  ====================================================== */

  const crearCuentaTelefono =
    async () => {
      setError("");
      setMensaje("");

      if (!auth.currentUser) {
        setError(
          "La verificación expiró. Comienza nuevamente."
        );

        setPasoTelefono(1);

        return;
      }

      if (
        passwordTelefono.length <
        8
      ) {
        setError(
          "La contraseña debe tener al menos 8 caracteres."
        );

        return;
      }

      if (
        passwordTelefono !==
        confirmarPasswordTelefono
      ) {
        setError(
          "Las contraseñas no coinciden."
        );

        return;
      }

      try {
        setLoading(true);

        const telefonoFinal =
          auth.currentUser.phoneNumber ||
          telefonoVerificado;

        const emailInterno =
          telefonoAEmailInterno(
            telefonoFinal
          );

        const credential =
          EmailAuthProvider.credential(
            emailInterno,
            passwordTelefono
          );

        await linkWithCredential(
          auth.currentUser,
          credential
        );

        await updateProfile(
          auth.currentUser,
          {
            displayName:
              nombre.trim(),
          }
        );

        await setDoc(
          doc(
            db,
            "users",
            auth.currentUser.uid
          ),
          {
            uid:
              auth.currentUser.uid,

            nombre:
              nombre.trim(),

            telefono:
              telefonoFinal,

            telefonoNacional:
              telefonoFinal.replace(
                /^\+52/,
                ""
              ),

            telefonoVerificado:
              true,

            // Uso interno para que Firebase permita
            // el inicio con teléfono + contraseña.
            correoInterno:
              emailInterno,

            role:
              "cliente",

            proveedor:
              "telefono_password",

            proveedores: [
              "phone",
              "password",
            ],

            emailVerificado:
              false,

            fechaRegistro:
              serverTimestamp(),

            fechaActualizacion:
              serverTimestamp(),

            ultimoAcceso:
              serverTimestamp(),
          }
        );

        setMensaje(
          "✅ Cuenta creada correctamente. Entrando a tu panel..."
        );

        setTimeout(
          () => {
            navigate(
              "/cliente",
              {
                replace: true,
                state: {
                  registroExitoso:
                    true,
                },
              }
            );
          },
          900
        );
      } catch (firebaseError) {
        console.error(
          "Crear cuenta teléfono:",
          firebaseError
        );

        switch (
          firebaseError?.code
        ) {
          case "auth/email-already-in-use":
          case "auth/credential-already-in-use":
            setError(
              "Este teléfono ya está vinculado a una cuenta Wealth."
            );
            break;

          case "auth/provider-already-linked":
            setError(
              "Esta cuenta ya tiene contraseña configurada. Inicia sesión."
            );
            break;

          case "auth/weak-password":
            setError(
              "La contraseña es demasiado débil."
            );
            break;

          default:
            setError(
              "No se pudo completar el registro."
            );
        }
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
          modo === "telefono" &&
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

      setPasoTelefono(1);

      setError("");
      setMensaje("");

      setCodigo("");
      setConfirmationResult(null);
      setTelefonoVerificado("");
      setContador(0);

      setPasswordTelefono("");
      setConfirmarPasswordTelefono("");
    };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ESPACIO HEADER GLOBAL */}

      <div className="h-24 md:h-28" />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-14">
        <div className="overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-950 shadow-2xl grid lg:grid-cols-[0.95fr_1.05fr]">

          {/* BRANDING */}

          <section className="relative hidden lg:flex min-h-[720px] flex-col justify-between p-10 xl:p-12 overflow-hidden border-r border-zinc-800">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-zinc-950 to-black" />

            <div className="absolute -top-32 -left-24 w-80 h-80 rounded-full bg-yellow-500/10 blur-3xl" />

            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-yellow-500/5 blur-3xl" />

            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.35em] text-yellow-500 font-semibold">
                Wealth
              </p>

              <h2 className="text-5xl xl:text-6xl font-bold leading-[1.05] mt-5 max-w-md">
                Crea tu cuenta
                <span className="text-yellow-500">
                  {" "}a tu manera.
                </span>
              </h2>

              <p className="text-zinc-400 text-lg leading-relaxed mt-6 max-w-lg">
                Puedes registrarte con Google, con correo y contraseña, o verificar tu teléfono por SMS y después usar teléfono + contraseña.
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              <Beneficio
                numero="01"
                titulo="Google"
                texto="La forma más rápida de crear tu cuenta."
              />

              <Beneficio
                numero="02"
                titulo="Correo"
                texto="Cuenta tradicional con correo y contraseña."
              />

              <Beneficio
                numero="03"
                titulo="Teléfono"
                texto="Verificación por SMS una sola vez y acceso posterior con contraseña."
              />
            </div>

            <div className="relative z-10 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 text-zinc-500 text-sm">
                <FaShieldAlt className="text-yellow-500" />
                Registro seguro · Wealth Grupo Empresarial
              </div>
            </div>
          </section>

          {/* PANEL */}

          <section className="p-6 sm:p-8 md:p-10 xl:p-12">
            <div className="max-w-xl mx-auto">

              {/* HEADER */}

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
                  {modo === "opciones"
                    ? "Elige cómo deseas registrarte."
                    : modo === "correo"
                    ? "Registro con correo y contraseña."
                    : `Registro con teléfono · Paso ${pasoTelefono} de 3`}
                </p>

                {modo ===
                  "telefono" && (
                  <div className="grid grid-cols-3 gap-2 mt-5">
                    {[1, 2, 3].map(
                      (item) => (
                        <div
                          key={item}
                          className={`h-1.5 rounded-full ${
                            pasoTelefono >= item
                              ? "bg-yellow-500"
                              : "bg-zinc-800"
                          }`}
                        />
                      )
                    )}
                  </div>
                )}
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

              {modo ===
                "opciones" && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={
                      registrarGoogle
                    }
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

                  <button
                    type="button"
                    onClick={() => {
                      setModo(
                        "telefono"
                      );

                      setError("");
                      setMensaje("");
                    }}
                    className="w-full bg-green-500/5 border border-green-500/40 hover:bg-green-500/10 text-green-400 px-5 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition"
                  >
                    <FaPhone />
                    Registrarme con teléfono
                    <FaArrowRight />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModo(
                        "correo"
                      );

                      setError("");
                      setMensaje("");
                    }}
                    className="w-full bg-yellow-500/5 border border-yellow-500/40 hover:bg-yellow-500/10 text-yellow-500 px-5 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition"
                  >
                    <FaEnvelope />
                    Registrarme con correo
                    <FaArrowRight />
                  </button>
                </div>
              )}

              {/* REGISTRO CORREO */}

              {modo === "correo" && (
                <form
                  onSubmit={
                    registrarCorreo
                  }
                  className="space-y-5"
                >
                  <Campo
                    label="Nombre completo"
                    icon={<FaUser />}
                  >
                    <input
                      type="text"
                      autoComplete="name"
                      value={nombre}
                      onChange={(e) =>
                        setNombre(
                          e.target.value
                        )
                      }
                      placeholder="Nombre y apellidos"
                      className={inputClass}
                    />
                  </Campo>

                  <Campo
                    label="Correo electrónico"
                    icon={
                      <FaEnvelope />
                    }
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
                        autoComplete="new-password"
                        value={
                          passwordCorreo
                        }
                        onChange={(e) =>
                          setPasswordCorreo(
                            e.target.value
                          )
                        }
                        placeholder="Mínimo 8 caracteres"
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

                    <SeguridadPassword
                      seguridad={
                        seguridadCorreo
                      }
                    />
                  </Campo>

                  <Campo
                    label="Confirmar contraseña"
                    icon={
                      <FaShieldAlt />
                    }
                  >
                    <div className="relative">
                      <input
                        type={
                          mostrarConfirmacionCorreo
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        value={
                          confirmarPasswordCorreo
                        }
                        onChange={(e) =>
                          setConfirmarPasswordCorreo(
                            e.target.value
                          )
                        }
                        placeholder="Repite la contraseña"
                        className={`${inputClass} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setMostrarConfirmacionCorreo(
                            (actual) =>
                              !actual
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-yellow-500"
                      >
                        {mostrarConfirmacionCorreo ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                    </div>

                    {confirmarPasswordCorreo && (
                      <p
                        className={`text-xs mt-2 ${
                          passwordCorreo ===
                          confirmarPasswordCorreo
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {passwordCorreo ===
                        confirmarPasswordCorreo
                          ? "✓ Las contraseñas coinciden"
                          : "Las contraseñas no coinciden"}
                      </p>
                    )}
                  </Campo>

                  <button
                    type="submit"
                    disabled={loading}
                    className={
                      botonPrincipal
                    }
                  >
                    <FaUserPlus />

                    {loading
                      ? "Creando cuenta..."
                      : "Crear cuenta"}

                    {!loading && (
                      <FaArrowRight />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={
                      volverOpciones
                    }
                    className={
                      botonVolver
                    }
                  >
                    <FaArrowLeft />
                    Volver
                  </button>
                </form>
              )}

              {/* REGISTRO TELÉFONO */}

              {modo ===
                "telefono" && (
                <div className="space-y-5">

                  {/* PASO 1 */}

                  {pasoTelefono ===
                    1 && (
                    <>
                      <Campo
                        label="Nombre completo"
                        icon={
                          <FaUser />
                        }
                      >
                        <input
                          type="text"
                          autoComplete="name"
                          value={nombre}
                          onChange={(e) =>
                            setNombre(
                              e.target.value
                            )
                          }
                          placeholder="Nombre y apellidos"
                          className={inputClass}
                        />
                      </Campo>

                      <Campo
                        label="Número de teléfono"
                        icon={
                          <FaPhone />
                        }
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

                        <p className="text-xs text-zinc-600 mt-2">
                          Recibirás un código SMS para comprobar que el número te pertenece.
                        </p>
                      </Campo>

                      <button
                        type="button"
                        onClick={
                          enviarCodigo
                        }
                        disabled={loading}
                        className={
                          botonPrincipal
                        }
                      >
                        <FaSms />

                        {loading
                          ? "Enviando código..."
                          : "Enviar código"}

                        {!loading && (
                          <FaArrowRight />
                        )}
                      </button>
                    </>
                  )}

                  {/* PASO 2 */}

                  {pasoTelefono ===
                    2 && (
                    <>
                      <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">
                        <p className="text-green-400 font-semibold">
                          Código enviado
                        </p>

                        <p className="text-zinc-400 text-sm mt-1">
                          {telefonoVerificado}
                        </p>
                      </div>

                      <Campo
                        label="Código de verificación"
                        icon={
                          <FaSms />
                        }
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
                                .replace(
                                  /\D/g,
                                  ""
                                )
                                .slice(
                                  0,
                                  6
                                )
                            )
                          }
                          placeholder="000000"
                          className={`${inputClass} text-center text-2xl tracking-[0.35em]`}
                        />
                      </Campo>

                      <button
                        type="button"
                        onClick={
                          verificarCodigo
                        }
                        disabled={loading}
                        className={
                          botonPrincipal
                        }
                      >
                        <FaCheckCircle />

                        {loading
                          ? "Verificando..."
                          : "Verificar teléfono"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          reenviarCodigo
                        }
                        disabled={
                          contador > 0 ||
                          loading
                        }
                        className={
                          botonSecundario
                        }
                      >
                        <FaRedo />

                        {contador > 0
                          ? `Reenviar en ${contador}s`
                          : "Reenviar código"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          volverOpciones
                        }
                        className={
                          botonVolver
                        }
                      >
                        <FaArrowLeft />
                        Cambiar método
                      </button>
                    </>
                  )}

                  {/* PASO 3 */}

                  {pasoTelefono ===
                    3 && (
                    <>
                      <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 flex items-start gap-3">
                        <FaCheckCircle className="text-green-400 mt-0.5" />

                        <div>
                          <p className="text-green-400 font-semibold">
                            Teléfono verificado
                          </p>

                          <p className="text-zinc-400 text-sm mt-1">
                            {telefonoVerificado}
                          </p>
                        </div>
                      </div>

                      <Campo
                        label="Crear contraseña"
                        icon={
                          <FaLock />
                        }
                      >
                        <div className="relative">
                          <input
                            type={
                              mostrarPasswordTelefono
                                ? "text"
                                : "password"
                            }
                            autoComplete="new-password"
                            value={
                              passwordTelefono
                            }
                            onChange={(e) =>
                              setPasswordTelefono(
                                e.target.value
                              )
                            }
                            placeholder="Mínimo 8 caracteres"
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

                        <SeguridadPassword
                          seguridad={
                            seguridadTelefono
                          }
                        />
                      </Campo>

                      <Campo
                        label="Confirmar contraseña"
                        icon={
                          <FaShieldAlt />
                        }
                      >
                        <div className="relative">
                          <input
                            type={
                              mostrarConfirmacionTelefono
                                ? "text"
                                : "password"
                            }
                            autoComplete="new-password"
                            value={
                              confirmarPasswordTelefono
                            }
                            onChange={(e) =>
                              setConfirmarPasswordTelefono(
                                e.target.value
                              )
                            }
                            placeholder="Repite la contraseña"
                            className={`${inputClass} pr-12`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setMostrarConfirmacionTelefono(
                                (actual) =>
                                  !actual
                              )
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-green-400"
                          >
                            {mostrarConfirmacionTelefono ? (
                              <FaEyeSlash />
                            ) : (
                              <FaEye />
                            )}
                          </button>
                        </div>

                        {confirmarPasswordTelefono && (
                          <p
                            className={`text-xs mt-2 ${
                              passwordTelefono ===
                              confirmarPasswordTelefono
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {passwordTelefono ===
                            confirmarPasswordTelefono
                              ? "✓ Las contraseñas coinciden"
                              : "Las contraseñas no coinciden"}
                          </p>
                        )}
                      </Campo>

                      <button
                        type="button"
                        onClick={
                          crearCuentaTelefono
                        }
                        disabled={loading}
                        className={
                          botonPrincipal
                        }
                      >
                        <FaUserPlus />

                        {loading
                          ? "Creando cuenta..."
                          : "Crear mi cuenta"}

                        {!loading && (
                          <FaArrowRight />
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* RECAPTCHA */}

              <div id="recaptcha-register" />

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

              <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <FaShieldAlt className="text-yellow-500 mt-0.5 shrink-0" />

                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Google, correo y teléfono funcionan como métodos independientes de registro. Si eliges teléfono, Wealth verificará el número por SMS y luego podrás iniciar sesión con teléfono + contraseña.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
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

function SeguridadPassword({
  seguridad,
}) {
  if (!seguridad?.nivel) {
    return null;
  }

  return (
    <div className="mt-3">
      <div className="grid grid-cols-3 gap-2">
        <BarraSeguridad
          activa={
            seguridad.nivel >=
            1
          }
          clase="bg-red-400"
        />

        <BarraSeguridad
          activa={
            seguridad.nivel >=
            2
          }
          clase="bg-yellow-400"
        />

        <BarraSeguridad
          activa={
            seguridad.nivel >=
            3
          }
          clase="bg-green-400"
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-zinc-600">
          Mínimo 8 caracteres
        </p>

        <p
          className={`text-xs font-semibold ${
            seguridad.nivel === 1
              ? "text-red-400"
              : seguridad.nivel === 2
              ? "text-yellow-400"
              : "text-green-400"
          }`}
        >
          {seguridad.texto}
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

export default Register;