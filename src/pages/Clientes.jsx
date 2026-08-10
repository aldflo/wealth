import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

import {
  db,
  auth,
} from "../firebase.config";

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
  FaPhone,
  FaGoogle,
} from "react-icons/fa";

function Clientes() {
  /* ======================================================
     DATOS
  ====================================================== */

  const [
    clientes,
    setClientes,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  /* ======================================================
     FILTROS
  ====================================================== */

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    filtroRol,
    setFiltroRol,
  ] = useState("todos");

  const [
    filtroProveedor,
    setFiltroProveedor,
  ] = useState("todos");

  /* ======================================================
     MODAL EDITAR
  ====================================================== */

  const [
    modalEditar,
    setModalEditar,
  ] = useState(false);

  const [
    clienteEditando,
    setClienteEditando,
  ] = useState(null);

  const [
    nombreEditado,
    setNombreEditado,
  ] = useState("");

  const [
    rolEditado,
    setRolEditado,
  ] = useState("cliente");

  const [
    nuevaPassword,
    setNuevaPassword,
  ] = useState("");

  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false);

  /* ======================================================
     MODAL ACCESO
  ====================================================== */

  const [
    modalAcceso,
    setModalAcceso,
  ] = useState(false);

  const [
    clienteAcceso,
    setClienteAcceso,
  ] = useState(null);

  /* ======================================================
     ESTADOS
  ====================================================== */

  const [
    procesando,
    setProcesando,
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
     FUNCTIONS
  ====================================================== */

  const functions =
    getFunctions();

  /* ======================================================
     USUARIOS
  ====================================================== */

  useEffect(() => {
    const unsub =
      onSnapshot(
        collection(
          db,
          "users"
        ),

        (
          snapshot
        ) => {
          const lista =
            snapshot.docs.map(
              (
                documento
              ) => ({
                id:
                  documento.id,

                ...documento.data(),
              })
            );

          lista.sort(
            (a, b) => {
              const aTexto =
                (
                  a.nombre ||
                  a.correo ||
                  a.telefono ||
                  ""
                ).toLowerCase();

              const bTexto =
                (
                  b.nombre ||
                  b.correo ||
                  b.telefono ||
                  ""
                ).toLowerCase();

              return aTexto.localeCompare(
                bTexto,
                "es"
              );
            }
          );

          setClientes(
            lista
          );

          setCargando(
            false
          );
        },

        (
          error
        ) => {
          console.error(
            error
          );

          setError(
            "No se pudieron cargar los usuarios."
          );

          setCargando(
            false
          );
        }
      );

    return () =>
      unsub();

  }, []);

  /* ======================================================
     ACTUAL
  ====================================================== */

  const uidActual =
    auth.currentUser?.uid ||
    null;

  const correoActual =
    auth.currentUser?.email ||
    "";

  const telefonoActual =
    auth.currentUser
      ?.phoneNumber ||
    "";

  const esCuentaActual =
    (cliente) => {
      return (
        (
          uidActual &&
          cliente.id ===
            uidActual
        ) ||
        (
          correoActual &&
          cliente.correo
            ?.toLowerCase() ===
            correoActual.toLowerCase()
        ) ||
        (
          telefonoActual &&
          cliente.telefono ===
            telefonoActual
        )
      );
    };

  /* ======================================================
     PROVEEDOR
  ====================================================== */

  const obtenerProveedor =
    (cliente) => {
      if (
        cliente.proveedor ===
        "telefono" ||
        (
          cliente.telefono &&
          !cliente.correo
        )
      ) {
        return "telefono";
      }

      if (
        cliente.proveedor ===
        "google" ||
        cliente.proveedor ===
        "google.com"
      ) {
        return "google";
      }

      return "password";
    };

  /* ======================================================
     ESTADÍSTICAS
  ====================================================== */

  const estadisticas =
    useMemo(() => {
      const admins =
        clientes.filter(
          (cliente) =>
            cliente.role ===
            "admin"
        ).length;

      const normales =
        clientes.filter(
          (cliente) =>
            cliente.role !==
            "admin"
        ).length;

      const telefonos =
        clientes.filter(
          (cliente) =>
            obtenerProveedor(
              cliente
            ) ===
            "telefono"
        ).length;

      return {
        total:
          clientes.length,

        admins,

        clientes:
          normales,

        telefonos,
      };

    }, [
      clientes,
    ]);

  /* ======================================================
     FILTRO
  ====================================================== */

  const clientesFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return clientes.filter(
        (cliente) => {
          const coincideBusqueda =
            !texto ||
            cliente.nombre
              ?.toLowerCase()
              .includes(
                texto
              ) ||
            cliente.correo
              ?.toLowerCase()
              .includes(
                texto
              ) ||
            cliente.telefono
              ?.toLowerCase()
              .includes(
                texto
              );

          const coincideRol =
            filtroRol ===
              "todos" ||
            cliente.role ===
              filtroRol;

          const proveedor =
            obtenerProveedor(
              cliente
            );

          const coincideProveedor =
            filtroProveedor ===
              "todos" ||
            proveedor ===
              filtroProveedor;

          return (
            coincideBusqueda &&
            coincideRol &&
            coincideProveedor
          );
        }
      );

    }, [
      clientes,
      busqueda,
      filtroRol,
      filtroProveedor,
    ]);

  /* ======================================================
     EDITAR
  ====================================================== */

  const iniciarEdicion =
    (cliente) => {
      setClienteEditando(
        cliente
      );

      setNombreEditado(
        cliente.nombre ||
          ""
      );

      setRolEditado(
        cliente.role ||
          "cliente"
      );

      setNuevaPassword(
        ""
      );

      setMostrarPassword(
        false
      );

      setModalEditar(
        true
      );

      setError("");
      setMensaje("");
    };

  /* ======================================================
     PASSWORD ADMIN
  ====================================================== */

  const cambiarPasswordAdmin =
    async (
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
        uid:
          cliente.id,

        nuevaPassword:
          password,
      });
    };

  /* ======================================================
     GUARDAR
  ====================================================== */

  const guardarCambios =
    async () => {
      if (
        !clienteEditando
      ) {
        return;
      }

      if (
        !nombreEditado.trim()
      ) {
        setError(
          "Escribe el nombre del usuario."
        );

        return;
      }

      const proveedor =
        obtenerProveedor(
          clienteEditando
        );

      if (
        proveedor ===
          "telefono" &&
        nuevaPassword
      ) {
        setError(
          "Las cuentas creadas únicamente con teléfono no utilizan contraseña."
        );

        return;
      }

      try {
        setProcesando(
          true
        );

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

        if (
          nuevaPassword
        ) {
          await cambiarPasswordAdmin(
            clienteEditando,
            nuevaPassword
          );
        }

        setModalEditar(
          false
        );

        setClienteEditando(
          null
        );

        setNuevaPassword(
          ""
        );

        setMensaje(
          "✅ Usuario actualizado correctamente."
        );

      } catch (error) {
        console.error(
          error
        );

        setError(
          error?.message ||
          "No se pudieron guardar los cambios."
        );

      } finally {
        setProcesando(
          false
        );
      }
    };

  /* ======================================================
     ELIMINAR
  ====================================================== */

  const eliminarCliente =
    async (
      cliente
    ) => {
      if (
        esCuentaActual(
          cliente
        )
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
            cliente.correo ||
            cliente.telefono
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
        console.error(
          error
        );

        setError(
          "No se pudo eliminar el usuario."
        );
      }
    };

  /* ======================================================
     ACCESO
  ====================================================== */

  const abrirAcceso =
    (cliente) => {
      setClienteAcceso(
        cliente
      );

      setModalAcceso(
        true
      );

      setError("");
      setMensaje("");
    };

  /* ======================================================
     RESET EMAIL
  ====================================================== */

  const resetPassword =
    async () => {
      if (
        !clienteAcceso?.correo
      ) {
        return;
      }

      try {
        setProcesando(
          true
        );

        await sendPasswordResetEmail(
          auth,
          clienteAcceso.correo
        );

        setModalAcceso(
          false
        );

        setMensaje(
          `✅ Correo enviado a ${clienteAcceso.correo}.`
        );

      } catch (error) {
        console.error(
          error
        );

        setError(
          "No se pudo enviar el correo."
        );

      } finally {
        setProcesando(
          false
        );
      }
    };

  /* ======================================================
     LOADING
  ====================================================== */

  if (
    cargando
  ) {
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

  /* ======================================================
     RENDER
  ====================================================== */

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
            Administra clientes, roles y métodos de acceso.
          </p>

        </div>

        {/* MENSAJES */}

        {mensaje && (
          <div className="mb-6 bg-green-500/5 border border-green-500/30 rounded-2xl p-4 text-green-300 flex gap-3">

            <FaCheckCircle />

            {mensaje}

          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/5 border border-red-500/30 rounded-2xl p-4 text-red-300 flex gap-3">

            <FaExclamationTriangle />

            {error}

          </div>
        )}

        {/* ESTADÍSTICAS */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

          <TarjetaEstadistica
            titulo="Usuarios"
            valor={
              estadisticas.total
            }
            icon={
              <FaUsers />
            }
            color="yellow"
          />

          <TarjetaEstadistica
            titulo="Clientes"
            valor={
              estadisticas.clientes
            }
            icon={
              <FaUserCheck />
            }
            color="green"
          />

          <TarjetaEstadistica
            titulo="Administradores"
            valor={
              estadisticas.admins
            }
            icon={
              <FaShieldAlt />
            }
            color="red"
          />

          <TarjetaEstadistica
            titulo="Con teléfono"
            valor={
              estadisticas.telefonos
            }
            icon={
              <FaPhone />
            }
            color="blue"
          />

        </div>

        {/* BUSCADOR */}

        <div className="grid md:grid-cols-[1fr_220px_220px] gap-4 mb-7">

          <div className="relative">

            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />

            <input
              value={
                busqueda
              }
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
              placeholder="Buscar nombre, correo o teléfono..."
              className={`${inputClass} pl-12`}
            />

          </div>

          <div className="relative">

            <FaFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />

            <select
              value={
                filtroRol
              }
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

          <select
            value={
              filtroProveedor
            }
            onChange={(e) =>
              setFiltroProveedor(
                e.target.value
              )
            }
            className={
              inputClass
            }
          >
            <option value="todos">
              Todos los accesos
            </option>

            <option value="password">
              Correo
            </option>

            <option value="google">
              Google
            </option>

            <option value="telefono">
              Teléfono
            </option>
          </select>

        </div>

        {/* DESKTOP */}

        <div className="hidden lg:block bg-zinc-950 border border-zinc-700 rounded-3xl overflow-hidden">

          <div className="grid grid-cols-[1.2fr_1.3fr_1fr_.8fr_1fr] gap-4 px-6 py-4 bg-zinc-900 border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-500">

            <div>
              Usuario
            </div>

            <div>
              Contacto
            </div>

            <div>
              Acceso
            </div>

            <div>
              Rol
            </div>

            <div className="text-right">
              Acciones
            </div>

          </div>

          {clientesFiltrados.map(
            (cliente) => {
              const proveedor =
                obtenerProveedor(
                  cliente
                );

              return (
                <div
                  key={
                    cliente.id
                  }
                  className="grid grid-cols-[1.2fr_1.3fr_1fr_.8fr_1fr] gap-4 items-center px-6 py-5 border-b border-zinc-800 last:border-0 hover:bg-zinc-900/60"
                >

                  {/* NOMBRE */}

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

                  {/* CONTACTO */}

                  <div className="text-sm">

                    {cliente.correo && (
                      <p className="text-zinc-400 flex items-center gap-2">

                        <FaEnvelope />

                        {
                          cliente.correo
                        }

                      </p>
                    )}

                    {cliente.telefono && (
                      <p className="text-zinc-400 flex items-center gap-2 mt-1">

                        <FaPhone />

                        {
                          cliente.telefono
                        }

                      </p>
                    )}

                    {!cliente.correo &&
                      !cliente.telefono && (
                      <span className="text-zinc-600">
                        Sin contacto
                      </span>
                    )}

                  </div>

                  {/* PROVEEDOR */}

                  <ProveedorBadge
                    proveedor={
                      proveedor
                    }
                  />

                  <RolBadge
                    rol={
                      cliente.role
                    }
                  />

                  {/* ACCIONES */}

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
              );
            }
          )}

        </div>

        {/* MOBILE */}

        <div className="grid md:grid-cols-2 lg:hidden gap-5">

          {clientesFiltrados.map(
            (cliente) => {
              const proveedor =
                obtenerProveedor(
                  cliente
                );

              return (
                <article
                  key={
                    cliente.id
                  }
                  className="bg-zinc-950 border border-zinc-700 rounded-3xl p-5"
                >

                  <h2 className="font-bold text-lg">
                    {cliente.nombre ||
                      "Sin nombre"}
                  </h2>

                  {cliente.correo && (
                    <p className="text-sm text-zinc-500 mt-2 flex items-center gap-2">

                      <FaEnvelope />

                      {
                        cliente.correo
                      }

                    </p>
                  )}

                  {cliente.telefono && (
                    <p className="text-sm text-zinc-500 mt-2 flex items-center gap-2">

                      <FaPhone />

                      {
                        cliente.telefono
                      }

                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">

                    <ProveedorBadge
                      proveedor={
                        proveedor
                      }
                    />

                    <RolBadge
                      rol={
                        cliente.role
                      }
                    />

                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">

                    <button
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
              );
            }
          )}

        </div>

      </div>

      {/* MODAL EDITAR */}

      {modalEditar &&
        clienteEditando && (
          <Modal
            cerrar={() =>
              setModalEditar(
                false
              )
            }
          >

            <div className="p-6 md:p-8">

              <div className="flex justify-between">

                <div>

                  <p className="text-xs uppercase tracking-widest text-blue-400">
                    Usuario
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    Editar usuario
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setModalEditar(
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

              <div className="space-y-5 mt-7">

                <Campo
                  titulo="Nombre"
                  icon={
                    <FaUser />
                  }
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

                {obtenerProveedor(
                  clienteEditando
                ) !==
                  "telefono" && (
                  <Campo
                    titulo="Nueva contraseña"
                    icon={
                      <FaLock />
                    }
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
                        className={`${inputClass} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setMostrarPassword(
                            !mostrarPassword
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                      >
                        {mostrarPassword ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>

                    </div>

                  </Campo>
                )}

                {obtenerProveedor(
                  clienteEditando
                ) ===
                  "telefono" && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">

                    <p className="text-green-400 font-semibold flex items-center gap-2">

                      <FaPhone />

                      Cuenta telefónica

                    </p>

                    <p className="text-xs text-zinc-500 mt-2">
                      Esta cuenta accede mediante código SMS y no necesita contraseña.
                    </p>

                  </div>
                )}

              </div>

              <button
                type="button"
                onClick={
                  guardarCambios
                }
                disabled={
                  procesando
                }
                className={`${botonBase} w-full mt-7 border-blue-500/40 text-blue-400`}
              >

                <FaSave />

                {procesando
                  ? "Guardando..."
                  : "Guardar cambios"}

              </button>

            </div>

          </Modal>
        )}

      {/* MODAL ACCESO */}

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

              {obtenerProveedor(
                clienteAcceso
              ) ===
                "telefono" ? (
                <div className="mt-7 bg-green-500/5 border border-green-500/20 rounded-2xl p-5">

                  <FaPhone className="text-green-400 text-2xl" />

                  <p className="font-bold mt-3">
                    Acceso por teléfono
                  </p>

                  <p className="text-zinc-400 mt-2">
                    {
                      clienteAcceso.telefono
                    }
                  </p>

                  <p className="text-xs text-zinc-500 mt-3">
                    Este usuario inicia sesión mediante un código SMS enviado por Firebase.
                  </p>

                </div>
              ) : (
                <>
                  <div className="mt-7 bg-black border border-zinc-700 rounded-2xl p-5">

                    <p className="font-semibold">
                      Acceso mediante{" "}
                      {obtenerProveedor(
                        clienteAcceso
                      ) ===
                      "google"
                        ? "Google"
                        : "correo y contraseña"}
                    </p>

                  </div>

                  {clienteAcceso.correo &&
                    obtenerProveedor(
                      clienteAcceso
                    ) ===
                      "password" && (
                      <button
                        type="button"
                        onClick={
                          resetPassword
                        }
                        disabled={
                          procesando
                        }
                        className={`${botonBase} w-full mt-6 border-yellow-500/50 text-yellow-400`}
                      >

                        <FaEnvelope />

                        Enviar recuperación por correo

                      </button>
                    )}
                </>
              )}

            </div>

          </Modal>
        )}

    </div>
  );
}

/* ======================================================
   COMPONENTES
====================================================== */

function ProveedorBadge({
  proveedor,
}) {
  if (
    proveedor ===
    "telefono"
  ) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-bold">
        <FaPhone />
        Teléfono
      </span>
    );
  }

  if (
    proveedor ===
    "google"
  ) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold">
        <FaGoogle />
        Google
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold">
      <FaEnvelope />
      Correo
    </span>
  );
}

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

    blue:
      "text-blue-400 bg-blue-500/10 border-blue-500/20",
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

function RolBadge({
  rol,
}) {
  const admin =
    rol ===
    "admin";

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
      title={
        titulo
      }
      onClick={
        onClick
      }
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
      onClick={
        cerrar
      }
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

/* ======================================================
   ESTILOS
====================================================== */

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

export default Clientes;