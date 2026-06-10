import { useState } from "react";


import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  setDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebase.config";

import {
  useNavigate
} from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");

  const [correo, setCorreo] = useState("");

  const [password, setPassword] = useState("");

  const registerUser = async (e) => {

    e.preventDefault();

    try {

      const result = await createUserWithEmailAndPassword(
        auth,
        correo,
        password
      );

      const user = result.user;

      // GUARDAR EN FIRESTORE
      await setDoc(doc(db, "users", user.uid), {

        nombre: nombre,

        correo: correo,

        role: "cliente"

      });

      // REDIRIGIR
      navigate("/cliente");

    } catch (error) {

      console.log(error);

      alert(error.message);

    }

  };

  return (

    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center overflow-hidden relative">

      {/* IMAGEN SUPERIOR */}
      <div className="absolute top-0 left-0 w-full h-[45%] overflow-hidden">

        <img
          src="/wealth-banner.jpg"
          alt="Wealth"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/30"></div>

      </div>

      {/* IMAGEN INFERIOR */}
      <div className="absolute bottom-0 left-0 w-full h-[45%] overflow-hidden">

        <img
          src="/wealth-banner.jpg"
          alt="Wealth"
          className="w-full h-full object-cover scale-y-[-1]"
        />

        <div className="absolute inset-0 bg-black/40"></div>

      </div>

      {/* LINEAS DORADAS */}
      <div className="absolute inset-0 z-10">

        <div className="absolute w-[180%] h-[6px] bg-[#c89b3c] rotate-[28deg] top-[29%] -left-56"></div>

        <div className="absolute w-[180%] h-[2px] bg-[#d4af37] rotate-[28deg] top-[31%] -left-56"></div>

        <div className="absolute w-[180%] h-[6px] bg-[#c89b3c] rotate-[28deg] bottom-[29%] -left-56"></div>

        <div className="absolute w-[180%] h-[2px] bg-[#d4af37] rotate-[28deg] bottom-[31%] -left-56"></div>

      </div>

      {/* CARD */}
      <div className="relative z-20 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[35px] shadow-2xl border border-zinc-200 p-10 mx-4">

        {/* LOGO */}
        <div className="flex justify-center mb-6">

          <div className="flex flex-col items-center">

            <img
              src="/wealth-logo.png"
              alt="Wealth"
              className="w-44 object-contain"
            />

            <span className="text-zinc-500 text-xs tracking-[4px] uppercase mt-2">
              Grupo Empresarial
            </span>

          </div>

        </div>

        {/* TITULO */}
        <div className="text-center mb-8">

          <h1 className="text-4xl font-black text-zinc-800 mb-2">
            Crear Cuenta
          </h1>

          <p className="text-zinc-500">
            Regístrate para acceder a Wealth
          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={registerUser}
          className="space-y-5"
        >

          {/* NOMBRE */}
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full bg-zinc-100 border border-zinc-300 focus:border-[#c89b3c] px-5 py-4 rounded-2xl outline-none transition"
          />

          {/* CORREO */}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className="w-full bg-zinc-100 border border-zinc-300 focus:border-[#c89b3c] px-5 py-4 rounded-2xl outline-none transition"
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-zinc-100 border border-zinc-300 focus:border-[#c89b3c] px-5 py-4 rounded-2xl outline-none transition"
          />

          {/* BOTON */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#c89b3c] to-[#d4af37] hover:scale-[1.02] text-white font-bold py-4 rounded-2xl transition duration-300 shadow-xl"
          >
            Crear cuenta
          </button>

        </form>

        {/* LOGIN */}
        <div className="mt-8 text-center">

          <span className="text-zinc-500">
            ¿Ya tienes cuenta?
          </span>

          <a
            href="/"
            className="text-[#c89b3c] hover:text-[#a67c2d] ml-2 font-bold"
          >
            Iniciar sesión
          </a>

        </div>

      </div>

    </div>
  );
}

export default Register;