import { useState } from "react";
import wealthLogo from "../assets/wealthlogo.jpeg";
import {
  signInWithPopup,
  signInWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  auth,
  provider,
  db
} from "../firebase.config";

import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [mostrarLogin, setMostrarLogin] = useState(false);

  const [correo, setCorreo] = useState("");

  const [password, setPassword] = useState("");

  // LOGIN GOOGLE
  const loginGoogle = async () => {

    try {

      const result = await signInWithPopup(
        auth,
        provider
      );

      const user = result.user;

      const userRef = doc(db, "users", user.uid);

      const userSnap = await getDoc(userRef);

      // SI NO EXISTE
      if (!userSnap.exists()) {

        await setDoc(userRef, {

          nombre: user.displayName,

          correo: user.email,

          role: "cliente"

        });

      }

      const finalSnap = await getDoc(userRef);

      const userData = finalSnap.data();

      if (userData.role === "admin") {

        navigate("/admin");

      } else {

        navigate("/cliente");

      }

    } catch (error) {

      console.log(error);

      alert(error.message);

    }

  };

  // LOGIN USUARIO
  const loginUsuario = async (e) => {

    e.preventDefault();

    try {

      const result = await signInWithEmailAndPassword(
        auth,
        correo,
        password
      );

      const user = result.user;

      const userRef = doc(db, "users", user.uid);

      const userSnap = await getDoc(userRef);

      const userData = userSnap.data();

      if (userData.role === "admin") {

        navigate("/admin");

      } else {

        navigate("/cliente");

      }

    } catch (error) {

      console.log(error);

      alert(error.message);

    }

  };

  return (

    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center overflow-hidden relative">

      {/* FONDO SUPERIOR */}
      <div className="absolute top-0 left-0 w-full h-[45%] overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40"></div>

      </div>

      {/* FONDO INFERIOR */}
      <div className="absolute bottom-0 left-0 w-full h-[45%] overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50"></div>

      </div>

      {/* LINEAS DIAGONALES */}
      <div className="absolute inset-0">

        <div className="absolute w-[160%] h-2 bg-[#c89b3c] rotate-[28deg] top-[28%] -left-40"></div>

        <div className="absolute w-[160%] h-1 bg-[#d4af37] rotate-[28deg] top-[30%] -left-40"></div>

        <div className="absolute w-[160%] h-2 bg-[#c89b3c] rotate-[28deg] bottom-[28%] -left-40"></div>

        <div className="absolute w-[160%] h-1 bg-[#d4af37] rotate-[28deg] bottom-[30%] -left-40"></div>

      </div>

      {/* LOGIN CARD */}
      <div className="relative z-20 w-full max-w-md bg-white/95 backdrop-blur-md rounded-[35px] shadow-2xl border border-zinc-200 p-10 mx-4">

        {/* LOGO */}
        <div className="flex justify-center mb-8">

          <div className="flex flex-col items-center">
 <p className="text-zinc-500 text-sm mt-2 tracking-[3px] uppercase">
             WEALTH
            </p>
           

            <p className="text-zinc-500 text-sm mt-2 tracking-[3px] uppercase">
              Grupo Empresarial
            </p>

          </div>

        </div>

        {/* TITULO */}
        <div className="text-center mb-8">

          <h1 className="text-4xl font-black text-zinc-800 mb-2">
            Bienvenido
          </h1>

          <p className="text-zinc-500">
            Accede a tu cuenta de Wealth
          </p>

        </div>

        {/* GOOGLE */}
        <button
          onClick={loginGoogle}
          className="w-full bg-zinc-900 hover:bg-black text-white py-4 rounded-2xl font-semibold transition duration-300 mb-4 flex items-center justify-center gap-3 shadow-lg"
        >

          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
            alt="Google"
            className="w-5 h-5"
          />

          Continuar con Google

        </button>

        {/* BOTON USUARIO */}
        <button
          onClick={() => setMostrarLogin(!mostrarLogin)}
          className="w-full bg-gradient-to-r from-[#c89b3c] to-[#d4af37] hover:scale-[1.02] text-white py-4 rounded-2xl font-semibold transition duration-300 shadow-lg"
        >
          Iniciar sesión con usuario
        </button>

        {/* FORMULARIO */}
        {mostrarLogin && (

          <form
            onSubmit={loginUsuario}
            className="mt-6 space-y-4"
          >

            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full border border-zinc-300 focus:border-[#c89b3c] bg-zinc-100 px-5 py-4 rounded-2xl outline-none transition"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-zinc-300 focus:border-[#c89b3c] bg-zinc-100 px-5 py-4 rounded-2xl outline-none transition"
            />

            <button
              type="submit"
              className="w-full bg-[#1f2937] hover:bg-black text-white py-4 rounded-2xl font-semibold transition duration-300"
            >
              Entrar al sistema
            </button>

          </form>

        )}

        {/* REGISTER */}
        <div className="mt-8 text-center">

          <span className="text-zinc-500">
            ¿No tienes cuenta?
          </span>

          <a
            href="/register"
            className="text-[#c89b3c] hover:text-[#a67c2d] ml-2 font-bold"
          >
            Registrarse
          </a>

        </div>

      </div>

    </div>
  );
}

export default Login;