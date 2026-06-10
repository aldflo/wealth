import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

import {
  sendPasswordResetEmail
} from "firebase/auth";

import { db, auth } from "../firebase.config";

import {
  FaUser,
  FaSearch,
  FaEdit,
  FaTrash,
  FaKey,
  FaSave,
  FaTimes
} from "react-icons/fa";

function Clientes() {

  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [rolEditado, setRolEditado] = useState("");

  const obtenerClientes = async () => {
    const snapshot = await getDocs(collection(db, "users"));

    const lista = [];

    snapshot.forEach((docu) => {
      lista.push({
        id: docu.id,
        ...docu.data()
      });
    });

    setClientes(lista);
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  const iniciarEdicion = (cliente) => {
    setEditando(cliente.id);
    setNombreEditado(cliente.nombre);
    setRolEditado(cliente.role);
  };

  const guardarCambios = async (id) => {
    await updateDoc(doc(db, "users", id), {
      nombre: nombreEditado,
      role: rolEditado
    });

    setEditando(null);
    obtenerClientes();
  };

  const eliminarCliente = async (id) => {
    const confirmar = window.confirm("¿Deseas eliminar este usuario?");
    if (!confirmar) return;

    await deleteDoc(doc(db, "users", id));
    obtenerClientes();
  };

  const resetPassword = async (correo) => {
    try {
      await sendPasswordResetEmail(auth, correo);
      alert("Correo de recuperación enviado.");
    } catch (error) {
      alert(error.message);
    }
  };

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.correo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (

    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">

      <div className="max-w-7xl mx-auto">

        {/* TITULO */}
        <div className="mb-8 lg:mb-10 text-center lg:text-left">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">

            Gestión de
            <span className="text-yellow-500"> Clientes</span>

          </h1>

          <p className="text-zinc-400 mt-3 text-sm sm:text-base">
            Administración de usuarios registrados.
          </p>

        </div>

        {/* BUSCADOR */}
        <div className="relative mb-8">

          <FaSearch className="absolute left-4 top-4 text-zinc-400" />

          <input
            type="text"
            placeholder="Buscar usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 sm:py-4 outline-none focus:border-yellow-500"
          />

        </div>

        {/* HEADER SOLO DESKTOP */}
        <div className="hidden md:grid grid-cols-4 bg-yellow-500 text-black font-bold p-5 rounded-t-2xl">

          <div>Nombre</div>
          <div>Correo</div>
          <div>Rol</div>
          <div className="text-center">Acciones</div>

        </div>

        {/* LISTA RESPONSIVE */}
        <div className="bg-zinc-900 md:rounded-b-3xl border border-zinc-800">

          {clientesFiltrados.map((cliente) => (

            <div
              key={cliente.id}
              className="flex flex-col md:grid md:grid-cols-4 gap-4 md:gap-0 p-5 border-b border-zinc-800"
            >

              {/* NOMBRE */}
              <div>

                {editando === cliente.id ? (

                  <input
                    value={nombreEditado}
                    onChange={(e) => setNombreEditado(e.target.value)}
                    className="bg-zinc-800 p-2 rounded-lg w-full"
                  />

                ) : (

                  <div className="flex items-center gap-3">
                    <FaUser className="text-yellow-500" />
                    <span className="break-words">
                      {cliente.nombre}
                    </span>
                  </div>

                )}

              </div>

              {/* CORREO */}
              <div className="text-sm md:text-base text-zinc-300 break-all">
                {cliente.correo}
              </div>

              {/* ROL */}
              <div>

                {editando === cliente.id ? (

                  <select
                    value={rolEditado}
                    onChange={(e) => setRolEditado(e.target.value)}
                    className="bg-zinc-800 p-2 rounded-lg w-full"
                  >

                    <option value="cliente">Cliente</option>
                    <option value="admin">Administrador</option>

                  </select>

                ) : (

                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                    cliente.role === "admin"
                      ? "bg-red-600"
                      : "bg-green-600"
                  }`}>
                    {cliente.role}
                  </span>

                )}

              </div>

              {/* ACCIONES */}
              <div className="flex flex-wrap md:flex-nowrap justify-start md:justify-center gap-2 mt-2 md:mt-0">

                {editando === cliente.id ? (

                  <>
                    <button
                      onClick={() => guardarCambios(cliente.id)}
                      className="bg-green-600 p-3 rounded-xl"
                    >
                      <FaSave />
                    </button>

                    <button
                      onClick={() => setEditando(null)}
                      className="bg-zinc-700 p-3 rounded-xl"
                    >
                      <FaTimes />
                    </button>
                  </>

                ) : (

                  <>
                    <button
                      onClick={() => iniciarEdicion(cliente)}
                      className="bg-blue-600 p-3 rounded-xl"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => resetPassword(cliente.correo)}
                      className="bg-yellow-600 p-3 rounded-xl"
                    >
                      <FaKey />
                    </button>

                    <button
                      onClick={() => eliminarCliente(cliente.id)}
                      className="bg-red-600 p-3 rounded-xl"
                    >
                      <FaTrash />
                    </button>
                  </>

                )}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

export default Clientes;