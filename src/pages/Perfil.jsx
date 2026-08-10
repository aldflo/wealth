import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  updateDoc,
} from "firebase/firestore";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaSave,
  FaShieldAlt,
  FaUser,
} from "react-icons/fa";

import {
  auth,
  db,
} from "../firebase.config";

function Perfil() {
  const navigate = useNavigate();

  const [usuarioAuth, setUsuarioAuth] = useState(null);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");

  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmar, setPasswordConfirmar] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // CARGAR PERFIL
  // ======================================================

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setUsuarioAuth(null);
          setCargando(false);
          return;
        }

        try {
          setUsuarioAuth(user);

          const ref = doc(
            db,
            "users",
            user.uid
          );

          const snap =
            await getDoc(ref);

          if (snap.exists()) {
            const data =
              snap.data();

            setNombre(
              data.nombre || ""
            );

            setCorreo(
              data.correo ||
              user.email ||
              ""
            );

            setTelefono(
              data.telefono || ""
            );
          } else {
            setCorreo(
              user.email || ""
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
          setCargando(false);
        }
      }
    );

    return () => unsub();
  }, []);

  // ======================================================
  // GUARDAR PERFIL
  // ======================================================

  const guardarPerfil =
    async () => {
      if (!usuarioAuth) {
        return;
      }

      setMensaje("");
      setError("");

      if (
        nombre.trim().length <
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
        setGuardando(true);

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

            role:
              "cliente",

            fechaActualizacion:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        setTelefono(
          telefonoLimpio
        );

        setMensaje(
          "✅ Perfil actualizado correctamente."
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
        setGuardando(false);
      }
    };

  // ======================================================
  // CAMBIAR CONTRASEÑA
  // ======================================================

  const cambiarPassword =
    async () => {
      if (!usuarioAuth) {
        return;
      }

      setMensaje("");
      setError("");

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

        setPasswordActual("");
        setPasswordNueva("");
        setPasswordConfirmar("");

        setMensaje(
          "✅ Contraseña actualizada correctamente."
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

  // ======================================================
  // LOADING
  // ======================================================

  if (cargando) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-11 h-11 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin mx-auto" />

          <p className="text-zinc-500 mt-4">
            Cargando perfil...
          </p>

        </div>

      </div>
    );
  }

  if (!usuarioAuth) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-5">

        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center">

          <FaShieldAlt className="text-yellow-500 text-4xl mx-auto" />

          <h1 className="text-2xl font-bold mt-5">
            Inicia sesión
          </h1>

          <p className="text-zinc-500 mt-2">
            Debes iniciar sesión para consultar tu perfil.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold"
          >
            Ir a iniciar sesión
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-5 md:px-7 py-8">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="text-zinc-400 hover:text-white flex items-center gap-2 transition"
        >
          <FaArrowLeft />
          Volver
        </button>

        <div className="mt-7">

          <p className="text-xs uppercase tracking-[0.25em] text-yellow-500 font-semibold">
            Área de clientes
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Mi perfil
          </h1>

          <p className="text-zinc-400 mt-2 max-w-2xl">
            Mantén actualizados tus datos. Wealth utiliza esta información para identificar correctamente tus cotizaciones, proyectos y datos de contacto.
          </p>

        </div>

        {/* MENSAJES */}

        {mensaje && (
          <div className="mt-6 bg-green-500/10 border border-green-500/30 text-green-300 rounded-2xl p-4 flex items-center gap-3">
            <FaCheckCircle />
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4">
            {error}
          </div>
        )}

        {/* DATOS PERSONALES */}

        <section className="mt-8 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center">
              <FaUser />
            </div>

            <div>

              <h2 className="text-xl font-bold">
                Datos personales
              </h2>

              <p className="text-zinc-500 text-sm mt-1">
                Estos datos ayudan a Wealth a identificar tu cuenta.
              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-7">

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
                className={inputClass}
              />
            </Campo>

            <Campo
              titulo="Teléfono"
              icon={<FaPhone />}
            >
              <input
                type="tel"
                value={telefono}
                onChange={(e) =>
                  setTelefono(
                    e.target.value
                  )
                }
                placeholder="9811234567"
                className={inputClass}
              />
            </Campo>

          </div>

          <div className="mt-5">

            <Campo
              titulo="Correo electrónico"
              icon={<FaEnvelope />}
            >
              <input
                type="email"
                value={correo}
                readOnly
                className={`${inputClass} opacity-70 cursor-not-allowed`}
              />

              <p className="text-xs text-zinc-600 mt-2">
                El correo de acceso no se modifica desde esta pantalla.
              </p>

            </Campo>

          </div>

          <div className="flex justify-end mt-7">

            <button
              type="button"
              onClick={
                guardarPerfil
              }
              disabled={
                guardando
              }
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition"
            >
              <FaSave />

              {guardando
                ? "Guardando..."
                : "Guardar cambios"}
            </button>

          </div>

        </section>

        {/* SEGURIDAD */}

        <section className="mt-7 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <FaLock />
            </div>

            <div>

              <h2 className="text-xl font-bold">
                Seguridad
              </h2>

              <p className="text-zinc-500 text-sm mt-1">
                Cambia tu contraseña cuando lo necesites.
              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-7">

            <Campo
              titulo="Contraseña actual"
              icon={<FaLock />}
            >
              <input
                type="password"
                value={passwordActual}
                onChange={(e) =>
                  setPasswordActual(
                    e.target.value
                  )
                }
                autoComplete="current-password"
                className={inputClass}
              />
            </Campo>

            <Campo
              titulo="Nueva contraseña"
              icon={<FaLock />}
            >
              <input
                type="password"
                value={passwordNueva}
                onChange={(e) =>
                  setPasswordNueva(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                className={inputClass}
              />
            </Campo>

            <Campo
              titulo="Confirmar contraseña"
              icon={<FaShieldAlt />}
            >
              <input
                type="password"
                value={passwordConfirmar}
                onChange={(e) =>
                  setPasswordConfirmar(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                className={inputClass}
              />
            </Campo>

          </div>

          <div className="flex justify-end mt-7">

            <button
              type="button"
              onClick={
                cambiarPassword
              }
              disabled={
                cambiandoPassword
              }
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-blue-500/40 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition"
            >
              <FaShieldAlt />

              {cambiandoPassword
                ? "Actualizando..."
                : "Cambiar contraseña"}
            </button>

          </div>

        </section>

      </div>

    </div>
  );
}

// ======================================================
// COMPONENTES AUXILIARES
// ======================================================

function Campo({
  titulo,
  icon,
  children,
}) {
  return (
    <div>

      <label className="text-sm text-zinc-400 flex items-center gap-2 mb-2">

        <span className="text-yellow-500">
          {icon}
        </span>

        {titulo}

      </label>

      {children}

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
  focus:border-yellow-500/70
  focus:ring-2
  focus:ring-yellow-500/10
  transition
`;

export default Perfil;
