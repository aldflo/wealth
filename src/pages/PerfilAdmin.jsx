import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  FaArrowLeft,
  FaCheck,
  FaCheckCircle,
  FaEnvelope,
  FaLock,
  FaMoon,
  FaPhone,
  FaSave,
  FaShieldAlt,
  FaSun,
  FaUser,
  FaUserShield,
} from "react-icons/fa";

import {
  auth,
  db,
} from "../firebase.config";


function PerfilAdmin() {

  const navigate =
    useNavigate();


  const {
    modoOscuro,
    actualizarTema,
  } = useOutletContext();


  /* ======================================================
     USUARIO
  ====================================================== */

  const [
    usuarioAuth,
    setUsuarioAuth,
  ] = useState(null);


  /* ======================================================
     PERFIL
  ====================================================== */

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    correo,
    setCorreo,
  ] = useState("");

  const [
    telefono,
    setTelefono,
  ] = useState("");


  const [
    rol,
    setRol,
  ] = useState("");


  /* ======================================================
     CONTRASEÑA
  ====================================================== */

  const [
    passwordActual,
    setPasswordActual,
  ] = useState("");

  const [
    passwordNueva,
    setPasswordNueva,
  ] = useState("");

  const [
    passwordConfirmar,
    setPasswordConfirmar,
  ] = useState("");


  /* ======================================================
     ESTADOS
  ====================================================== */

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    cambiandoPassword,
    setCambiandoPassword,
  ] = useState(false);

  const [
    cambiandoTema,
    setCambiandoTema,
  ] = useState(false);

  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");


  /* ======================================================
     TEMA SELECCIONADO
  ====================================================== */

  const [
    temaSeleccionado,
    setTemaSeleccionado,
  ] = useState(
    modoOscuro
      ? "oscuro"
      : "claro"
  );


  useEffect(() => {

    setTemaSeleccionado(
      modoOscuro
        ? "oscuro"
        : "claro"
    );

  }, [
    modoOscuro,
  ]);


  /* ======================================================
     CARGAR PERFIL
  ====================================================== */

  useEffect(() => {

    const unsub =
      onAuthStateChanged(
        auth,

        async (
          user
        ) => {

          if (!user) {

            setUsuarioAuth(
              null
            );

            setCargando(
              false
            );

            return;

          }


          try {

            setUsuarioAuth(
              user
            );


            const ref =
              doc(
                db,
                "users",
                user.uid
              );


            const snap =
              await getDoc(
                ref
              );


            if (
              snap.exists()
            ) {

              const data =
                snap.data();


              setNombre(
                data.nombre ||
                ""
              );


              setCorreo(
                data.correo ||
                user.email ||
                ""
              );


              setTelefono(
                data.telefono ||
                ""
              );


              setRol(
                data.role ||
                ""
              );


              if (
                data.role !==
                "admin"
              ) {

                setError(
                  "Esta cuenta no tiene permisos de administrador."
                );

              }

            } else {

              setCorreo(
                user.email ||
                ""
              );


              setRol(
                ""
              );


              setError(
                "No encontramos el perfil administrativo de esta cuenta."
              );

            }

          } catch (error) {

            console.error(
              "Error cargando perfil:",
              error
            );


            setError(
              "No se pudo cargar la información del perfil."
            );

          } finally {

            setCargando(
              false
            );

          }

        }
      );


    return () =>
      unsub();

  }, []);


  /* ======================================================
     GUARDAR PERFIL
  ====================================================== */

  const guardarPerfil =
    async () => {

      if (
        !usuarioAuth
      ) {
        return;
      }


      if (
        rol !==
        "admin"
      ) {

        setError(
          "Esta cuenta no tiene permisos para editar un perfil administrativo."
        );

        return;

      }


      setMensaje(
        ""
      );

      setError(
        ""
      );


      if (
        nombre
          .trim()
          .length <
        3
      ) {

        setError(
          "Escribe tu nombre completo."
        );

        return;

      }


      const telefonoLimpio =
        telefono.replace(
          /\D/g,
          ""
        );


      if (
        telefonoLimpio &&
        telefonoLimpio.length <
          10
      ) {

        setError(
          "Escribe un teléfono válido de al menos 10 dígitos."
        );

        return;

      }


      try {

        setGuardando(
          true
        );


        await setDoc(
          doc(
            db,
            "users",
            usuarioAuth.uid
          ),

          {
            uid:
              usuarioAuth.uid,

            nombre:
              nombre.trim(),

            correo:
              (
                correo ||
                usuarioAuth.email ||
                ""
              )
                .trim()
                .toLowerCase(),

            telefono:
              telefonoLimpio,

            fechaActualizacion:
              serverTimestamp(),
          },

          {
            merge:
              true,
          }
        );


        setTelefono(
          telefonoLimpio
        );


        setMensaje(
          "Perfil actualizado correctamente."
        );

      } catch (error) {

        console.error(
          "Error actualizando perfil:",
          error
        );


        setError(
          "No se pudieron guardar los cambios."
        );

      } finally {

        setGuardando(
          false
        );

      }

    };


  /* ======================================================
     CAMBIAR APARIENCIA
  ====================================================== */

  const cambiarTemaPerfil =
    async (
      nuevoTema
    ) => {

      if (
        !usuarioAuth ||
        cambiandoTema
      ) {
        return;
      }


      if (
        rol !==
        "admin"
      ) {

        setError(
          "Esta cuenta no tiene permisos de administrador."
        );

        return;

      }


      if (
        nuevoTema !==
          "claro" &&
        nuevoTema !==
          "oscuro"
      ) {
        return;
      }


      setMensaje(
        ""
      );

      setError(
        ""
      );


      /*
        CAMBIO INMEDIATO EN ESTE DISPOSITIVO.

        Layout guarda:
        tema_UID = claro / oscuro
      */

      actualizarTema?.(
        nuevoTema
      );


      setTemaSeleccionado(
        nuevoTema
      );


      try {

        setCambiandoTema(
          true
        );


        /*
          FIRESTORE queda como preferencia general.

          Si el usuario entra por primera vez
          desde otro dispositivo, Layout puede
          usar este valor como configuración inicial.
        */

        await setDoc(
          doc(
            db,
            "users",
            usuarioAuth.uid
          ),

          {
            temaPreferido:
              nuevoTema,

            fechaActualizacion:
              serverTimestamp(),
          },

          {
            merge:
              true,
          }
        );


        setMensaje(
          nuevoTema ===
            "oscuro"
            ? "Modo oscuro activado."
            : "Modo claro activado."
        );

      } catch (error) {

        console.error(
          "Error guardando apariencia:",
          error
        );


        setError(
          "El tema cambió en este dispositivo, pero no pudimos guardar la preferencia en tu cuenta."
        );

      } finally {

        setCambiandoTema(
          false
        );

      }

    };


  /* ======================================================
     CAMBIAR CONTRASEÑA
  ====================================================== */

  const cambiarPassword =
    async () => {

      if (
        !usuarioAuth
      ) {
        return;
      }


      if (
        rol !==
        "admin"
      ) {

        setError(
          "Esta cuenta no tiene permisos de administrador."
        );

        return;

      }


      setMensaje(
        ""
      );

      setError(
        ""
      );


      if (
        !usuarioAuth.email
      ) {

        setError(
          "Esta cuenta no tiene un correo disponible para cambiar la contraseña."
        );

        return;

      }


      if (
        !passwordActual
      ) {

        setError(
          "Escribe tu contraseña actual."
        );

        return;

      }


      if (
        passwordNueva.length <
        6
      ) {

        setError(
          "La nueva contraseña debe tener al menos 6 caracteres."
        );

        return;

      }


      if (
        passwordNueva !==
        passwordConfirmar
      ) {

        setError(
          "Las nuevas contraseñas no coinciden."
        );

        return;

      }


      try {

        setCambiandoPassword(
          true
        );


        const credencial =
          EmailAuthProvider.credential(
            usuarioAuth.email,
            passwordActual
          );


        await reauthenticateWithCredential(
          usuarioAuth,
          credencial
        );


        await updatePassword(
          usuarioAuth,
          passwordNueva
        );


        setPasswordActual(
          ""
        );

        setPasswordNueva(
          ""
        );

        setPasswordConfirmar(
          ""
        );


        setMensaje(
          "Contraseña actualizada correctamente."
        );

      } catch (error) {

        console.error(
          "Error cambiando contraseña:",
          error
        );


        if (
          error.code ===
          "auth/invalid-credential"
        ) {

          setError(
            "La contraseña actual no es correcta."
          );

        } else {

          setError(
            "No se pudo cambiar la contraseña."
          );

        }

      } finally {

        setCambiandoPassword(
          false
        );

      }

    };


  /* ======================================================
     INICIALES
  ====================================================== */

  const obtenerIniciales =
    () => {

      if (
        !nombre.trim()
      ) {
        return "W";
      }


      const partes =
        nombre
          .trim()
          .split(/\s+/)
          .filter(Boolean);


      if (
        partes.length ===
        1
      ) {

        return partes[0]
          .slice(
            0,
            2
          )
          .toUpperCase();

      }


      return (
        `${partes[0][0]}${
          partes[
            partes.length -
            1
          ][0]
        }`
      ).toUpperCase();

    };


  /* ======================================================
     LOADING
  ====================================================== */

  if (
    cargando
  ) {

    return (
      <div
        className={`
          min-h-screen

          flex
          items-center
          justify-center

          transition-colors
          duration-300

          ${
            modoOscuro
              ? `
                bg-black
                text-white
              `
              : `
                bg-gray-50
                text-gray-900
              `
          }
        `}
      >

        <div className="text-center">

          <div
            className={`
              w-11
              h-11

              border-4
              border-t-yellow-500

              rounded-full
              animate-spin

              mx-auto

              ${
                modoOscuro
                  ? "border-zinc-800"
                  : "border-gray-200"
              }
            `}
          />

          <p
            className={`
              mt-4

              ${
                modoOscuro
                  ? "text-zinc-500"
                  : "text-gray-500"
              }
            `}
          >
            Cargando perfil administrativo...
          </p>

        </div>

      </div>
    );

  }


  /* ======================================================
     SIN USUARIO
  ====================================================== */

  if (
    !usuarioAuth
  ) {

    return (
      <div
        className={`
          min-h-screen

          flex
          items-center
          justify-center

          px-5

          ${
            modoOscuro
              ? `
                bg-black
                text-white
              `
              : `
                bg-gray-50
                text-gray-900
              `
          }
        `}
      >

        <div
          className={`
            max-w-md
            w-full

            border

            rounded-[30px]

            p-8

            text-center

            ${
              modoOscuro
                ? `
                  bg-zinc-950
                  border-zinc-800
                `
                : `
                  bg-white
                  border-gray-200
                  shadow-xl
                `
            }
          `}
        >

          <div
            className="
              w-16
              h-16

              rounded-2xl

              bg-yellow-500/10
              border
              border-yellow-500/20

              flex
              items-center
              justify-center

              mx-auto
            "
          >

            <FaShieldAlt className="text-yellow-500 text-2xl" />

          </div>


          <h1 className="text-2xl font-bold mt-5">
            Inicia sesión
          </h1>


          <p
            className={`
              mt-2

              ${
                modoOscuro
                  ? "text-zinc-500"
                  : "text-gray-500"
              }
            `}
          >
            Debes iniciar sesión con una cuenta administrativa para consultar y configurar este perfil.
          </p>


          <button
            type="button"

            onClick={() =>
              navigate(
                "/login"
              )
            }

            className="
              mt-6

              w-full

              bg-yellow-500
              hover:bg-yellow-400

              text-black

              px-6
              py-3.5

              rounded-2xl

              font-bold

              transition
            "
          >
            Ir a iniciar sesión
          </button>

        </div>

      </div>
    );

  }


  /* ======================================================
     SIN PERMISOS ADMIN
  ====================================================== */

  if (
    usuarioAuth &&
    rol &&
    rol !==
    "admin"
  ) {

    return (
      <div
        className={`
          min-h-screen
          flex
          items-center
          justify-center
          px-5
          ${
            modoOscuro
              ? "bg-black text-white"
              : "bg-gray-50 text-gray-900"
          }
        `}
      >
        <div
          className={`
            max-w-md
            w-full
            border
            rounded-[30px]
            p-8
            text-center
            ${
              modoOscuro
                ? "bg-zinc-950 border-zinc-800"
                : "bg-white border-gray-200 shadow-xl"
            }
          `}
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <FaShieldAlt className="text-red-500 text-2xl" />
          </div>

          <h1 className="text-2xl font-bold mt-5">
            Acceso restringido
          </h1>

          <p
            className={`
              mt-2
              ${
                modoOscuro
                  ? "text-zinc-500"
                  : "text-gray-500"
              }
            `}
          >
            Esta pantalla es exclusiva para cuentas con rol de administrador.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/cliente"
              )
            }
            className="mt-6 w-full bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3.5 rounded-2xl font-bold transition"
          >
            Ir al área de cliente
          </button>
        </div>
      </div>
    );

  }


  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div
      className={`
        min-h-screen

        px-4
        sm:px-5
        md:px-7

        py-8

        transition-colors
        duration-300

        ${
          modoOscuro
            ? `
              bg-black
              text-white
            `
            : `
              bg-gray-50
              text-gray-900
            `
        }
      `}
    >

      <div className="max-w-6xl mx-auto">


        {/* ==================================================
            VOLVER
        ================================================== */}

        <button
          type="button"

          onClick={() =>
            navigate(
              "/admin"
            )
          }

          className={`
            flex
            items-center
            gap-2

            text-sm
            font-medium

            transition

            ${
              modoOscuro
                ? `
                  text-zinc-500
                  hover:text-white
                `
                : `
                  text-gray-500
                  hover:text-gray-900
                `
            }
          `}
        >

          <FaArrowLeft />

          Volver

        </button>


        {/* ==================================================
            CABECERA PREMIUM
        ================================================== */}

        <section
          className={`
            relative

            mt-6

            overflow-hidden

            border

            rounded-[32px]

            ${
              modoOscuro
                ? `
                  bg-gradient-to-br
                  from-zinc-950
                  via-zinc-950
                  to-[#151109]

                  border-zinc-800
                `
                : `
                  bg-gradient-to-br
                  from-white
                  via-white
                  to-yellow-50

                  border-gray-200

                  shadow-sm
                `
            }
          `}
        >

          {/* DECORACIÓN */}

          <div
            className="
              absolute
              -right-24
              -top-24

              w-72
              h-72

              rounded-full

              bg-yellow-500/10

              blur-3xl

              pointer-events-none
            "
          />


          <div
            className="
              relative

              p-6
              sm:p-8
              md:p-10
            "
          >

            <div
              className="
                flex
                flex-col
                md:flex-row

                md:items-center

                gap-6
              "
            >

              {/* AVATAR */}

              <div
                className="
                  w-24
                  h-24

                  shrink-0

                  rounded-[28px]

                  bg-gradient-to-br
                  from-[#e5be60]
                  to-[#a87820]

                  text-black

                  flex
                  items-center
                  justify-center

                  text-3xl
                  font-black

                  shadow-xl
                "
              >
                {
                  obtenerIniciales()
                }
              </div>


              {/* INFORMACIÓN */}

              <div className="min-w-0 flex-1">

                <p
                  className="
                    text-xs
                    uppercase

                    tracking-[0.25em]

                    text-yellow-500

                    font-bold
                  "
                >
                  Administración Wealth
                </p>


                <h1
                  className="
                    text-3xl
                    md:text-4xl

                    font-black

                    mt-2

                    break-words
                  "
                >
                  {nombre ||
                    "Perfil administrador"}
                </h1>


                <div
                  className={`
                    flex
                    flex-wrap

                    gap-x-5
                    gap-y-2

                    mt-4

                    text-sm

                    ${
                      modoOscuro
                        ? "text-zinc-400"
                        : "text-gray-600"
                    }
                  `}
                >

                  {correo && (
                    <span className="flex items-center gap-2">

                      <FaEnvelope className="text-yellow-500" />

                      {correo}

                    </span>
                  )}


                  {telefono && (
                    <span className="flex items-center gap-2">

                      <FaPhone className="text-yellow-500" />

                      {telefono}

                    </span>
                  )}

                </div>

              </div>


              {/* ROL */}

              <div
                className={`
                  self-start
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-full
                  border
                  text-sm
                  font-semibold
                  ${
                    modoOscuro
                      ? `
                        bg-blue-500/10
                        border-blue-500/20
                        text-blue-400
                      `
                      : `
                        bg-blue-50
                        border-blue-200
                        text-blue-700
                      `
                  }
                `}
              >
                <FaUserShield />
                Administrador
              </div>


              {/* ESTADO */}

              <div
                className={`
                  self-start

                  inline-flex
                  items-center
                  gap-2

                  px-4
                  py-2.5

                  rounded-full

                  border

                  text-sm
                  font-semibold

                  ${
                    modoOscuro
                      ? `
                        bg-green-500/10
                        border-green-500/20
                        text-green-400
                      `
                      : `
                        bg-green-50
                        border-green-200
                        text-green-700
                      `
                  }
                `}
              >

                <span
                  className="
                    w-2
                    h-2

                    rounded-full

                    bg-green-500
                  "
                />

                Administrador activo

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            MENSAJES
        ================================================== */}

        {mensaje && (
          <div
            className={`
              mt-6

              border
              border-green-500/30

              bg-green-500/10

              rounded-2xl

              p-4

              flex
              items-center
              gap-3

              ${
                modoOscuro
                  ? "text-green-300"
                  : "text-green-700"
              }
            `}
          >

            <FaCheckCircle className="shrink-0" />

            {mensaje}

          </div>
        )}


        {error && (
          <div
            className={`
              mt-6

              bg-red-500/10

              border
              border-red-500/30

              rounded-2xl

              p-4

              ${
                modoOscuro
                  ? "text-red-300"
                  : "text-red-700"
              }
            `}
          >
            {error}
          </div>
        )}


        {/* ==================================================
            GRID PRINCIPAL
        ================================================== */}

        <div
          className="
            grid
            lg:grid-cols-[1.25fr_.75fr]

            gap-7

            mt-7
          "
        >


          {/* ==================================================
              DATOS PERSONALES
          ================================================== */}

          <section
            className={`
              border
              rounded-[28px]

              p-6
              md:p-8

              ${
                modoOscuro
                  ? `
                    bg-zinc-950
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

            <CabeceraSeccion
              modoOscuro={
                modoOscuro
              }

              icon={
                <FaUser />
              }

              color="yellow"

              titulo="Datos del administrador"

              descripcion="Información de contacto y datos visibles de esta cuenta administrativa."
            />


            <div
              className="
                grid
                md:grid-cols-2

                gap-5

                mt-8
              "
            >

              <Campo
                modoOscuro={
                  modoOscuro
                }

                titulo="Nombre completo"

                icon={
                  <FaUser />
                }
              >

                <input
                  type="text"

                  value={
                    nombre
                  }

                  onChange={(e) =>
                    setNombre(
                      e.target.value
                    )
                  }

                  placeholder="Tu nombre completo"

                  className={
                    inputClass(
                      modoOscuro
                    )
                  }
                />

              </Campo>


              <Campo
                modoOscuro={
                  modoOscuro
                }

                titulo="Teléfono"

                icon={
                  <FaPhone />
                }
              >

                <input
                  type="tel"

                  value={
                    telefono
                  }

                  onChange={(e) =>
                    setTelefono(
                      e.target.value
                    )
                  }

                  placeholder="9811234567"

                  className={
                    inputClass(
                      modoOscuro
                    )
                  }
                />

              </Campo>

            </div>


            <div className="mt-5">

              <Campo
                modoOscuro={
                  modoOscuro
                }

                titulo="Correo electrónico"

                icon={
                  <FaEnvelope />
                }
              >

                <input
                  type="email"

                  value={
                    correo
                  }

                  readOnly

                  className={`
                    ${inputClass(
                      modoOscuro
                    )}

                    opacity-70
                    cursor-not-allowed
                  `}
                />


                <p
                  className={`
                    text-xs
                    mt-2

                    ${
                      modoOscuro
                        ? "text-zinc-600"
                        : "text-gray-400"
                    }
                  `}
                >
                  El correo utilizado para iniciar sesión no se modifica desde esta pantalla.
                </p>

              </Campo>

            </div>


            <div
              className="
                flex
                justify-end

                mt-7
              "
            >

              <button
                type="button"

                onClick={
                  guardarPerfil
                }

                disabled={
                  guardando
                }

                className="
                  w-full
                  sm:w-auto

                  bg-yellow-500
                  hover:bg-yellow-400

                  text-black

                  px-7
                  py-3.5

                  rounded-2xl

                  font-bold

                  flex
                  items-center
                  justify-center
                  gap-2

                  disabled:opacity-50
                  disabled:cursor-not-allowed

                  transition
                "
              >

                <FaSave />

                {guardando
                  ? "Guardando..."
                  : "Guardar cambios"}

              </button>

            </div>

          </section>


          {/* ==================================================
              APARIENCIA
          ================================================== */}

          <section
            className={`
              border

              rounded-[28px]

              p-6
              md:p-8

              ${
                modoOscuro
                  ? `
                    bg-zinc-950
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

            <CabeceraSeccion
              modoOscuro={
                modoOscuro
              }

              icon={
                modoOscuro
                  ? <FaMoon />
                  : <FaSun />
              }

              color="yellow"

              titulo="Apariencia del panel"

              descripcion="Elige cómo quieres ver el panel administrativo en este dispositivo."
            />


            <div className="grid grid-cols-2 gap-4 mt-8">

              {/* CLARO */}

              <button
                type="button"

                onClick={() =>
                  cambiarTemaPerfil(
                    "claro"
                  )
                }

                disabled={
                  cambiandoTema
                }

                className={`
                  relative

                  min-h-[170px]

                  rounded-[24px]

                  border-2

                  p-5

                  text-left

                  transition-all
                  duration-300

                  hover:-translate-y-1

                  ${
                    temaSeleccionado ===
                    "claro"
                      ? `
                        border-yellow-500
                        ring-4
                        ring-yellow-500/10
                      `
                      : modoOscuro
                      ? `
                        border-zinc-800
                        hover:border-zinc-600
                      `
                      : `
                        border-gray-200
                        hover:border-gray-300
                      `
                  }

                  ${
                    modoOscuro
                      ? "bg-zinc-900"
                      : "bg-gray-50"
                  }
                `}
              >

                {temaSeleccionado ===
                  "claro" && (

                  <div
                    className="
                      absolute

                      top-4
                      right-4

                      w-7
                      h-7

                      rounded-full

                      bg-yellow-500

                      text-black

                      flex
                      items-center
                      justify-center

                      text-xs
                    "
                  >
                    <FaCheck />
                  </div>

                )}


                <div
                  className="
                    w-12
                    h-12

                    rounded-2xl

                    bg-yellow-500/15

                    text-yellow-500

                    flex
                    items-center
                    justify-center

                    text-xl
                  "
                >

                  <FaSun />

                </div>


                <p className="font-bold mt-5">
                  Claro
                </p>


                <p
                  className={`
                    text-xs

                    mt-1

                    ${
                      modoOscuro
                        ? "text-zinc-500"
                        : "text-gray-500"
                    }
                  `}
                >
                  Fondos luminosos y alto contraste.
                </p>

              </button>


              {/* OSCURO */}

              <button
                type="button"

                onClick={() =>
                  cambiarTemaPerfil(
                    "oscuro"
                  )
                }

                disabled={
                  cambiandoTema
                }

                className={`
                  relative

                  min-h-[170px]

                  rounded-[24px]

                  border-2

                  p-5

                  text-left

                  transition-all
                  duration-300

                  hover:-translate-y-1

                  ${
                    temaSeleccionado ===
                    "oscuro"
                      ? `
                        border-yellow-500
                        ring-4
                        ring-yellow-500/10
                      `
                      : modoOscuro
                      ? `
                        border-zinc-800
                        hover:border-zinc-600
                      `
                      : `
                        border-gray-200
                        hover:border-gray-300
                      `
                  }

                  ${
                    modoOscuro
                      ? "bg-black"
                      : "bg-[#151517]"
                  }
                `}
              >

                {temaSeleccionado ===
                  "oscuro" && (

                  <div
                    className="
                      absolute

                      top-4
                      right-4

                      w-7
                      h-7

                      rounded-full

                      bg-yellow-500

                      text-black

                      flex
                      items-center
                      justify-center

                      text-xs
                    "
                  >
                    <FaCheck />
                  </div>

                )}


                <div
                  className="
                    w-12
                    h-12

                    rounded-2xl

                    bg-yellow-500/15

                    text-yellow-400

                    flex
                    items-center
                    justify-center

                    text-xl
                  "
                >

                  <FaMoon />

                </div>


                <p className="font-bold mt-5 text-white">
                  Oscuro
                </p>


                <p className="text-xs mt-1 text-zinc-500">
                  Una apariencia elegante con menor luminosidad.
                </p>

              </button>

            </div>


            <div
              className={`
                mt-5

                border

                rounded-2xl

                p-4

                ${
                  modoOscuro
                    ? `
                      bg-black/40
                      border-zinc-800
                    `
                    : `
                      bg-gray-50
                      border-gray-200
                    `
                }
              `}
            >

              <p
                className={`
                  text-xs

                  leading-relaxed

                  ${
                    modoOscuro
                      ? "text-zinc-500"
                      : "text-gray-500"
                  }
                `}
              >
                Esta preferencia se guarda para tu cuenta en este dispositivo. Si utilizas Wealth por primera vez en otro equipo, utilizaremos tu preferencia general como configuración inicial.
              </p>

            </div>

          </section>

        </div>


        {/* ==================================================
            SEGURIDAD
        ================================================== */}

        <section
          className={`
            mt-7

            border

            rounded-[28px]

            p-6
            md:p-8

            ${
              modoOscuro
                ? `
                  bg-zinc-950
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

          <CabeceraSeccion
            modoOscuro={
              modoOscuro
            }

            icon={
              <FaLock />
            }

            color="blue"

            titulo="Seguridad administrativa"

            descripcion="Actualiza tu contraseña para mantener protegida esta cuenta administrativa."
          />


          <div
            className="
              grid
              md:grid-cols-3

              gap-5

              mt-8
            "
          >

            <Campo
              modoOscuro={
                modoOscuro
              }

              titulo="Contraseña actual"

              icon={
                <FaLock />
              }
            >

              <input
                type="password"

                value={
                  passwordActual
                }

                onChange={(e) =>
                  setPasswordActual(
                    e.target.value
                  )
                }

                autoComplete="current-password"

                placeholder="••••••••"

                className={
                  inputClass(
                    modoOscuro
                  )
                }
              />

            </Campo>


            <Campo
              modoOscuro={
                modoOscuro
              }

              titulo="Nueva contraseña"

              icon={
                <FaLock />
              }
            >

              <input
                type="password"

                value={
                  passwordNueva
                }

                onChange={(e) =>
                  setPasswordNueva(
                    e.target.value
                  )
                }

                autoComplete="new-password"

                placeholder="Mínimo 6 caracteres"

                className={
                  inputClass(
                    modoOscuro
                  )
                }
              />

            </Campo>


            <Campo
              modoOscuro={
                modoOscuro
              }

              titulo="Confirmar contraseña"

              icon={
                <FaShieldAlt />
              }
            >

              <input
                type="password"

                value={
                  passwordConfirmar
                }

                onChange={(e) =>
                  setPasswordConfirmar(
                    e.target.value
                  )
                }

                autoComplete="new-password"

                placeholder="Repite la contraseña"

                className={
                  inputClass(
                    modoOscuro
                  )
                }
              />

            </Campo>

          </div>


          <div
            className="
              flex
              justify-end

              mt-7
            "
          >

            <button
              type="button"

              onClick={
                cambiarPassword
              }

              disabled={
                cambiandoPassword
              }

              className={`
                w-full
                sm:w-auto

                border

                px-7
                py-3.5

                rounded-2xl

                font-bold

                flex
                items-center
                justify-center
                gap-2

                disabled:opacity-50
                disabled:cursor-not-allowed

                transition

                ${
                  modoOscuro
                    ? `
                      bg-zinc-900
                      hover:bg-zinc-800

                      border-zinc-700
                      hover:border-blue-500/40

                      text-white
                    `
                    : `
                      bg-gray-50
                      hover:bg-gray-100

                      border-gray-300
                      hover:border-blue-400

                      text-gray-800
                    `
                }
              `}
            >

              <FaShieldAlt className="text-blue-400" />

              {cambiandoPassword
                ? "Actualizando..."
                : "Cambiar contraseña"}

            </button>

          </div>

        </section>


        {/* ==================================================
            FOOTER PERFIL
        ================================================== */}

        <div
          className={`
            mt-7

            flex
            items-center
            justify-center

            gap-2

            text-xs

            ${
              modoOscuro
                ? "text-zinc-700"
                : "text-gray-400"
            }
          `}
        >

          <FaShieldAlt />

          Configuración exclusiva de tu cuenta administrativa Wealth.

        </div>

      </div>

    </div>
  );
}


/* ======================================================
   CABECERA SECCIÓN
====================================================== */

function CabeceraSeccion({
  modoOscuro,
  icon,
  titulo,
  descripcion,
  color = "yellow",
}) {

  const colores = {

    yellow: `
      bg-yellow-500/10
      border-yellow-500/20
      text-yellow-500
    `,

    blue: `
      bg-blue-500/10
      border-blue-500/20
      text-blue-400
    `,

  };


  return (
    <div className="flex items-start gap-4">

      <div
        className={`
          w-12
          h-12

          shrink-0

          rounded-2xl

          border

          flex
          items-center
          justify-center

          ${colores[color]}
        `}
      >
        {icon}
      </div>


      <div>

        <h2 className="text-xl font-bold">
          {titulo}
        </h2>


        <p
          className={`
            text-sm

            mt-1

            ${
              modoOscuro
                ? "text-zinc-500"
                : "text-gray-500"
            }
          `}
        >
          {descripcion}
        </p>

      </div>

    </div>
  );
}


/* ======================================================
   CAMPO
====================================================== */

function Campo({
  titulo,
  icon,
  children,
  modoOscuro,
}) {

  return (
    <div>

      <label
        className={`
          text-sm

          flex
          items-center
          gap-2

          mb-2.5

          font-medium

          ${
            modoOscuro
              ? "text-zinc-400"
              : "text-gray-600"
          }
        `}
      >

        <span className="text-yellow-500">
          {icon}
        </span>

        {titulo}

      </label>

      {children}

    </div>
  );
}


/* ======================================================
   INPUT
====================================================== */

const inputClass =
  (
    modoOscuro
  ) => `
    w-full

    ${
      modoOscuro
        ? `
          bg-black
          border-zinc-700

          text-white

          placeholder:text-zinc-700
        `
        : `
          bg-gray-50
          border-gray-300

          text-gray-900

          placeholder:text-gray-400
        `
    }

    border

    rounded-2xl

    px-4
    py-3.5

    outline-none

    focus:border-yellow-500/70

    focus:ring-2
    focus:ring-yellow-500/10

    transition
  `;


export default PerfilAdmin;