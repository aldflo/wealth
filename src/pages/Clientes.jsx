import { useEffect, useMemo, useState } from "react";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  getFunctions,
  httpsCallable,
} from "firebase/functions";

import { db, auth } from "../firebase.config";

import {
  FaUser,
  FaUsers,
  FaSearch,
  FaEdit,
  FaTrash,
  FaKey,
  FaSave,
  FaTimes,
  FaShieldAlt,
  FaUserCheck,
  FaLock,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilter,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function Clientes() {
  // ======================================================
  // DATOS
  // ======================================================

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ======================================================
  // FILTROS
  // ======================================================

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");

  // ======================================================
  // MODAL EDITAR
  // ======================================================

  const [modalEditar, setModalEditar] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const [nombreEditado, setNombreEditado] = useState("");
  const [rolEditado, setRolEditado] = useState("cliente");

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // ======================================================
  // MODAL ACCESO
  // ======================================================

  const [modalAcceso, setModalAcceso] = useState(false);
  const [clienteAcceso, setClienteAcceso] = useState(null);

  // ======================================================
  // ESTADOS
  // ======================================================

  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // FIREBASE FUNCTIONS
  // ======================================================

  const functions = getFunctions();

  // ======================================================
  // USUARIOS EN TIEMPO REAL
  // ======================================================

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "users"),

      (snapshot) => {
        const lista = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        lista.sort((a, b) => {
          const nombreA = (
            a.nombre ||
            a.correo ||
            ""
          ).toLowerCase();

          const nombreB = (
            b.nombre ||
            b.correo ||
            ""
          ).toLowerCase();

          return nombreA.localeCompare(nombreB, "es");
        });

        setClientes(lista);
        setCargando(false);
      },

      (error) => {
        console.error(error);

        setError(
          "No se pudieron cargar los usuarios."
        );

        setCargando(false);
      }
    );

    return () => unsub();
  }, []);

  // ======================================================
  // USUARIO ACTUAL
  // ======================================================

  const uidActual =
    auth.currentUser?.uid ||
    null;

  const correoActual =
    auth.currentUser?.email ||
    "";

  const esCuentaActual = (cliente) => {
    return (
      (uidActual &&
        cliente.id === uidActual) ||
      (correoActual &&
        cliente.correo?.toLowerCase() ===
          correoActual.toLowerCase())
    );
  };

  // ======================================================
  // ESTADÍSTICAS
  // ======================================================

  const estadisticas = useMemo(() => {
    const admins = clientes.filter(
      (cliente) =>
        cliente.role === "admin"
    ).length;

    const clientesNormales =
      clientes.filter(
        (cliente) =>
          cliente.role !== "admin"
      ).length;

    return {
      total: clientes.length,
      admins,
      clientes: clientesNormales,
    };
  }, [clientes]);

  // ======================================================
  // FILTRAR
  // ======================================================

  const clientesFiltrados = useMemo(() => {
    const texto =
      busqueda
        .trim()
        .toLowerCase();

    return clientes.filter((cliente) => {
      const coincideBusqueda =
        !texto ||
        cliente.nombre
          ?.toLowerCase()
          .includes(texto) ||
        cliente.correo
          ?.toLowerCase()
          .includes(texto);

      const coincideRol =
        filtroRol === "todos" ||
        cliente.role === filtroRol;

      return (
        coincideBusqueda &&
        coincideRol
      );
    });
  }, [
    clientes,
    busqueda,
    filtroRol,
  ]);

  // ======================================================
  // ABRIR EDICIÓN
  // ======================================================

  const iniciarEdicion = (cliente) => {
    setClienteEditando(cliente);

    setNombreEditado(
      cliente.nombre || ""
    );

    setRolEditado(
      cliente.role || "cliente"
    );

    setNuevaPassword("");
    setMostrarPassword(false);

    setError("");
    setMensaje("");

    setModalEditar(true);
  };

  // ======================================================
  // CAMBIAR PASSWORD DESDE ADMIN
  // ======================================================

  const cambiarPasswordAdmin = async (
    cliente,
    password
  ) => {
    if (!password) {
      return;
    }

    const cambiarPassword =
      httpsCallable(
        functions,
        "cambiarPasswordUsuario"
      );

    await cambiarPassword({
      uid: cliente.id,
      nuevaPassword: password,
    });
  };

  // ======================================================
  // GUARDAR CAMBIOS
  // ======================================================

  const guardarCambios = async () => {
    if (!clienteEditando) {
      return;
    }

    setError("");

    if (!nombreEditado.trim()) {
      setError(
        "Escribe el nombre del usuario."
      );

      return;
    }

    if (
      nuevaPassword &&
      nuevaPassword.length < 6
    ) {
      setError(
        "La nueva contraseña debe tener al menos 6 caracteres."
      );

      return;
    }

    const cambioPassword =
      Boolean(
        nuevaPassword.trim()
      );

    if (cambioPassword) {
      const confirmar =
        window.confirm(
          `¿Cambiar la contraseña de ${clienteEditando.correo}?\n\nLa contraseña anterior dejará de funcionar.`
        );

      if (!confirmar) {
        return;
      }
    }

    try {
      setProcesando(true);

      // ================================================
      // FIRESTORE
      // ================================================

      await updateDoc(
        doc(
          db,
          "users",
          clienteEditando.id
        ),
        {
          nombre:
            nombreEditado.trim(),

          role:
            rolEditado,

          fechaActualizacion:
            serverTimestamp(),
        }
      );

      // ================================================
      // AUTH PASSWORD
      // ================================================

      if (cambioPassword) {
        await cambiarPasswordAdmin(
          clienteEditando,
          nuevaPassword.trim()
        );
      }

      setModalEditar(false);
      setClienteEditando(null);
      setNuevaPassword("");

      setMensaje(
        cambioPassword
          ? "✅ Usuario y contraseña actualizados correctamente."
          : "✅ Usuario actualizado correctamente."
      );
    } catch (error) {
      console.error(error);

      const codigo =
        error?.code ||
        "";

      if (
        codigo.includes(
          "permission-denied"
        )
      ) {
        setError(
          "No tienes permisos para realizar esta operación."
        );
      } else if (
        codigo.includes(
          "unauthenticated"
        )
      ) {
        setError(
          "Debes iniciar sesión nuevamente."
        );
      } else {
        setError(
          error?.message ||
            "No se pudieron guardar los cambios."
        );
      }
    } finally {
      setProcesando(false);
    }
  };

  // ======================================================
  // ELIMINAR
  // ======================================================

  const eliminarCliente = async (
    cliente
  ) => {
    if (
      esCuentaActual(cliente)
    ) {
      setError(
        "No puedes eliminar tu propia cuenta desde este panel."
      );

      return;
    }

    const confirmar =
      window.confirm(
        `¿Eliminar a "${
          cliente.nombre ||
          cliente.correo
        }"?`
      );

    if (!confirmar) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "users",
          cliente.id
        )
      );

      setMensaje(
        "Usuario eliminado de la base de datos."
      );
    } catch (error) {
      console.error(error);

      setError(
        "No se pudo eliminar el usuario."
      );
    }
  };

  // ======================================================
  // ACCESO
  // ======================================================

  const abrirAcceso = (
    cliente
  ) => {
    setClienteAcceso(cliente);

    setError("");
    setMensaje("");

    setModalAcceso(true);
  };

  // ======================================================
  // RESET POR CORREO
  // ======================================================

  const resetPassword =
    async () => {
      if (
        !clienteAcceso?.correo
      ) {
        return;
      }

      const confirmar =
        window.confirm(
          `¿Enviar un correo de recuperación a ${clienteAcceso.correo}?`
        );

      if (!confirmar) {
        return;
      }

      try {
        setProcesando(true);

        await sendPasswordResetEmail(
          auth,
          clienteAcceso.correo
        );

        setModalAcceso(false);
        setClienteAcceso(null);

        setMensaje(
          `✅ Correo de recuperación enviado a ${clienteAcceso.correo}.`
        );
      } catch (error) {
        console.error(error);

        setError(
          "No se pudo enviar el correo de recuperación."
        );
      } finally {
        setProcesando(false);
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
            Cargando usuarios...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-xs uppercase tracking-[0.25em] text-yellow-500 font-semibold">
            Administración
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">
            Gestión de{" "}
            <span className="text-yellow-500">
              Usuarios
            </span>
          </h1>

          <p className="text-zinc-400 mt-3">
            Administra usuarios, roles y acceso a sus cuentas.
          </p>

        </div>

        {/* MENSAJES */}

        {mensaje && (
          <div className="mb-6 bg-green-500/5 border border-green-500/30 rounded-2xl p-4 text-green-300 flex gap-3">
            <FaCheckCircle className="mt-1" />
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/5 border border-red-500/30 rounded-2xl p-4 text-red-300 flex gap-3">
            <FaExclamationTriangle className="mt-1" />
            {error}
          </div>
        )}

        {/* ESTADÍSTICAS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">

          <TarjetaEstadistica
            titulo="Usuarios"
            valor={estadisticas.total}
            icon={<FaUsers />}
            color="yellow"
          />

          <TarjetaEstadistica
            titulo="Clientes"
            valor={estadisticas.clientes}
            icon={<FaUserCheck />}
            color="green"
          />

          <TarjetaEstadistica
            titulo="Administradores"
            valor={estadisticas.admins}
            icon={<FaShieldAlt />}
            color="red"
          />

        </div>

        {/* BUSCADOR */}

        <div className="flex flex-col md:flex-row gap-4 mb-7">

          <div className="relative flex-1">

            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />

            <input
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
              placeholder="Buscar nombre o correo..."
              className={`${inputClass} pl-12`}
            />

          </div>

          <div className="relative md:w-[250px]">

            <FaFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />

            <select
              value={filtroRol}
              onChange={(e) =>
                setFiltroRol(
                  e.target.value
                )
              }
              className={`${inputClass} pl-12`}
            >
              <option value="todos">
                Todos los roles
              </option>

              <option value="cliente">
                Clientes
              </option>

              <option value="admin">
                Administradores
              </option>
            </select>

          </div>

        </div>

        {/* DESKTOP */}

        <div className="hidden lg:block bg-zinc-950 border border-zinc-700 rounded-3xl overflow-hidden">

          <div className="grid grid-cols-[1.1fr_1.5fr_.8fr_1fr] gap-4 px-6 py-4 bg-zinc-900 border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-500">

            <div>Usuario</div>
            <div>Correo</div>
            <div>Rol</div>
            <div className="text-right">
              Acciones
            </div>

          </div>

          {clientesFiltrados.map(
            (cliente) => (
              <div
                key={cliente.id}
                className="grid grid-cols-[1.1fr_1.5fr_.8fr_1fr] gap-4 items-center px-6 py-5 border-b border-zinc-800 last:border-0 hover:bg-zinc-900/60 transition"
              >

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center">
                    <FaUser />
                  </div>

                  <div>

                    <p className="font-semibold">
                      {cliente.nombre ||
                        "Sin nombre"}
                    </p>

                    {esCuentaActual(
                      cliente
                    ) && (
                      <span className="text-[10px] text-blue-400">
                        Tu cuenta
                      </span>
                    )}

                  </div>

                </div>

                <div className="text-zinc-400 break-all">
                  {cliente.correo ||
                    "Sin correo"}
                </div>

                <RolBadge
                  rol={
                    cliente.role
                  }
                />

                <div className="flex justify-end gap-2">

                  <BotonIcono
                    color="blue"
                    titulo="Editar"
                    onClick={() =>
                      iniciarEdicion(
                        cliente
                      )
                    }
                  >
                    <FaEdit />
                  </BotonIcono>

                  <BotonIcono
                    color="yellow"
                    titulo="Acceso"
                    onClick={() =>
                      abrirAcceso(
                        cliente
                      )
                    }
                  >
                    <FaKey />
                  </BotonIcono>

                  {!esCuentaActual(
                    cliente
                  ) && (
                    <BotonIcono
                      color="red"
                      titulo="Eliminar"
                      onClick={() =>
                        eliminarCliente(
                          cliente
                        )
                      }
                    >
                      <FaTrash />
                    </BotonIcono>
                  )}

                </div>

              </div>
            )
          )}

        </div>

        {/* MOBILE */}

        <div className="grid md:grid-cols-2 lg:hidden gap-5">

          {clientesFiltrados.map(
            (cliente) => (
              <article
                key={cliente.id}
                className="bg-zinc-950 border border-zinc-700 rounded-3xl p-5"
              >

                <div className="flex gap-3">

                  <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
                    <FaUser />
                  </div>

                  <div>

                    <h2 className="font-bold text-lg">
                      {cliente.nombre ||
                        "Sin nombre"}
                    </h2>

                    <p className="text-sm text-zinc-500 break-all">
                      {cliente.correo}
                    </p>

                  </div>

                </div>

                <div className="mt-4">
                  <RolBadge
                    rol={
                      cliente.role
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">

                  <button
                    type="button"
                    onClick={() =>
                      iniciarEdicion(
                        cliente
                      )
                    }
                    className={`${botonBase} border-blue-500/40 text-blue-400`}
                  >
                    <FaEdit />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      abrirAcceso(
                        cliente
                      )
                    }
                    className={`${botonBase} border-yellow-500/40 text-yellow-400`}
                  >
                    <FaKey />
                    Acceso
                  </button>

                </div>

              </article>
            )
          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* MODAL EDITAR */}
      {/* ================================================= */}

      {modalEditar &&
        clienteEditando && (
          <Modal
            cerrar={() => {
              if (!procesando) {
                setModalEditar(
                  false
                );
              }
            }}
          >

            <div className="p-6 md:p-8">

              <div className="flex justify-between gap-4">

                <div>

                  <p className="text-xs uppercase tracking-[0.22em] text-blue-400">
                    Usuario
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    Editar usuario
                  </h2>

                  <p className="text-sm text-zinc-500 mt-1">
                    {
                      clienteEditando.correo
                    }
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setModalEditar(
                      false
                    )
                  }
                  className={botonCerrar}
                >
                  <FaTimes />
                </button>

              </div>

              <div className="space-y-5 mt-7">

                {/* NOMBRE */}

                <Campo
                  titulo="Nombre"
                  icon={<FaUser />}
                >

                  <input
                    value={
                      nombreEditado
                    }
                    onChange={(e) =>
                      setNombreEditado(
                        e.target.value
                      )
                    }
                    className={
                      inputClass
                    }
                  />

                </Campo>

                {/* CORREO */}

                <Campo
                  titulo="Correo"
                  icon={
                    <FaEnvelope />
                  }
                >

                  <div className="bg-black border border-zinc-700 rounded-2xl p-4 text-zinc-400">
                    {
                      clienteEditando.correo
                    }
                  </div>

                </Campo>

                {/* ROL */}

                <Campo
                  titulo="Rol"
                  icon={
                    <FaShieldAlt />
                  }
                >

                  <select
                    value={
                      rolEditado
                    }
                    onChange={(e) =>
                      setRolEditado(
                        e.target.value
                      )
                    }
                    className={
                      inputClass
                    }
                  >

                    <option value="cliente">
                      Cliente
                    </option>

                    <option value="admin">
                      Administrador
                    </option>

                  </select>

                </Campo>

                {/* ================================================= */}
                {/* CONTRASEÑA */}
                {/* ================================================= */}

                <Campo
                  titulo="Nueva contraseña"
                  icon={<FaLock />}
                >

                  <div className="relative">

                    <input
                      type={
                        mostrarPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        nuevaPassword
                      }
                      onChange={(e) =>
                        setNuevaPassword(
                          e.target.value
                        )
                      }
                      placeholder="Dejar vacío para conservar la actual"
                      autoComplete="new-password"
                      className={`${inputClass} pr-14`}
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

                  <p className="text-xs text-zinc-500 mt-2">
                    Escribe una contraseña solamente si deseas reemplazar la actual. Mínimo 6 caracteres.
                  </p>

                </Campo>

                {/* AVISO */}

                {nuevaPassword && (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">

                    <p className="text-sm text-yellow-400 flex items-center gap-2">
                      <FaKey />

                      Se cambiará la contraseña
                    </p>

                    <p className="text-xs text-zinc-500 mt-2">
                      La contraseña anterior dejará de funcionar después de guardar.
                    </p>

                  </div>
                )}

              </div>

              {/* BOTONES */}

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-zinc-800">

                <button
                  type="button"
                  onClick={() =>
                    setModalEditar(
                      false
                    )
                  }
                  className={`${botonBase} border-zinc-600 text-zinc-300`}
                >
                  <FaTimes />
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={
                    procesando
                  }
                  onClick={
                    guardarCambios
                  }
                  className={`${botonBase} border-blue-500/50 text-blue-400 hover:bg-blue-500/10 disabled:opacity-50`}
                >
                  <FaSave />

                  {procesando
                    ? "Guardando..."
                    : "Guardar cambios"}

                </button>

              </div>

            </div>

          </Modal>
        )}

      {/* ================================================= */}
      {/* MODAL ACCESO */}
      {/* ================================================= */}

      {modalAcceso &&
        clienteAcceso && (
          <Modal
            cerrar={() =>
              setModalAcceso(
                false
              )
            }
          >

            <div className="p-6 md:p-8">

              <div className="flex justify-between">

                <div>

                  <p className="text-xs uppercase text-yellow-500 tracking-widest">
                    Seguridad
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    Administrar acceso
                  </h2>

                  <p className="text-zinc-500 text-sm mt-1">
                    {
                      clienteAcceso.correo
                    }
                  </p>

                </div>

                <button
                  onClick={() =>
                    setModalAcceso(
                      false
                    )
                  }
                  className={
                    botonCerrar
                  }
                >
                  <FaTimes />
                </button>

              </div>

              <div className="mt-7 bg-black border border-zinc-700 rounded-2xl p-5">

                <div className="flex gap-3">

                  <FaLock className="text-yellow-500 mt-1" />

                  <div>

                    <p className="font-semibold">
                      Contraseña actual
                    </p>

                    <p className="tracking-widest text-zinc-500 mt-2">
                      ••••••••••••
                    </p>

                    <p className="text-xs text-zinc-600 mt-2">
                      Firebase no permite recuperar la contraseña anterior en texto legible.
                    </p>

                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  resetPassword
                }
                disabled={
                  procesando
                }
                className={`${botonBase} w-full mt-6 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10`}
              >
                <FaEnvelope />

                Enviar recuperación por correo
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalAcceso(
                    false
                  );

                  iniciarEdicion(
                    clienteAcceso
                  );
                }}
                className={`${botonBase} w-full mt-3 border-blue-500/40 text-blue-400 hover:bg-blue-500/10`}
              >
                <FaKey />

                Asignar nueva contraseña
              </button>

            </div>

          </Modal>
        )}

    </div>
  );
}

// ======================================================
// ESTILOS
// ======================================================

const inputClass = `
  w-full
  bg-zinc-900
  border
  border-zinc-700
  rounded-2xl
  p-4
  text-white
  outline-none
  focus:border-yellow-500/70
  focus:ring-2
  focus:ring-yellow-500/10
  transition
`;

const botonBase = `
  bg-black
  border
  px-5
  py-3.5
  rounded-2xl
  font-semibold
  flex
  items-center
  justify-center
  gap-2
  transition-all
`;

const botonCerrar = `
  w-11
  h-11
  bg-black
  border
  border-zinc-700
  rounded-xl
  flex
  items-center
  justify-center
  text-zinc-400
`;

function TarjetaEstadistica({
  titulo,
  valor,
  icon,
  color,
}) {
  const colores = {
    yellow:
      "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",

    green:
      "text-green-400 bg-green-500/10 border-green-500/20",

    red:
      "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="bg-zinc-950 border border-zinc-700 rounded-2xl p-5">

      <div className="flex justify-between">

        <div>
          <p className="text-sm text-zinc-500">
            {titulo}
          </p>

          <p className="text-3xl font-bold mt-1">
            {valor}
          </p>
        </div>

        <div
          className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colores[color]}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

function RolBadge({ rol }) {
  const admin =
    rol === "admin";

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-bold ${
        admin
          ? "bg-red-500/10 text-red-400 border-red-500/30"
          : "bg-green-500/10 text-green-400 border-green-500/30"
      }`}
    >
      {admin
        ? "Administrador"
        : "Cliente"}
    </span>
  );
}

function BotonIcono({
  children,
  titulo,
  color,
  onClick,
}) {
  const colores = {
    blue:
      "border-blue-500/40 text-blue-400",

    yellow:
      "border-yellow-500/40 text-yellow-400",

    red:
      "border-red-500/40 text-red-400",
  };

  return (
    <button
      type="button"
      title={titulo}
      onClick={onClick}
      className={`w-11 h-11 bg-black border rounded-xl flex items-center justify-center ${colores[color]}`}
    >
      {children}
    </button>
  );
}

function Campo({
  titulo,
  icon,
  children,
}) {
  return (
    <div>

      <label className="text-sm text-zinc-400 flex gap-2 mb-2">

        <span className="text-yellow-500">
          {icon}
        </span>

        {titulo}

      </label>

      {children}

    </div>
  );
}

function Modal({
  children,
  cerrar,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={cerrar}
    >

      <div
        className="w-full max-w-xl bg-zinc-950 border border-zinc-700 rounded-3xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {children}
      </div>

    </div>
  );
}

export default Clientes;