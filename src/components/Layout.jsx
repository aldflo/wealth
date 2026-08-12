import {
  useEffect,
  useState,
} from "react";

import Navbar from "./Navbar";

import {
  Outlet,
} from "react-router-dom";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase.config";


function Layout() {

  const [
    modoOscuro,
    setModoOscuro,
  ] = useState(false);

  const [
    temaListo,
    setTemaListo,
  ] = useState(false);


  /* =========================================
     CARGAR TEMA DEL USUARIO
  ========================================= */

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (
          user
        ) => {

          setTemaListo(
            false
          );


          /* =====================================
             SIN SESIÓN
             → CLARO POR DEFECTO
          ===================================== */

          if (!user) {

            setModoOscuro(
              false
            );

            document.documentElement.setAttribute(
              "data-theme",
              "claro"
            );

            document.documentElement.style.colorScheme =
              "light";


            setTemaListo(
              true
            );

            return;
          }


          /* =====================================
             CLAVE ÚNICA POR USUARIO + DISPOSITIVO
          ===================================== */

          const claveTema =
            `tema_${user.uid}`;


          /* =====================================
             1. BUSCAR TEMA EN ESTE DISPOSITIVO
          ===================================== */

          const temaLocal =
            localStorage.getItem(
              claveTema
            );


          if (
            temaLocal ===
              "oscuro" ||
            temaLocal ===
              "claro"
          ) {

            const oscuro =
              temaLocal ===
              "oscuro";


            setModoOscuro(
              oscuro
            );


            document.documentElement.setAttribute(
              "data-theme",
              temaLocal
            );


            document.documentElement.style.colorScheme =
              oscuro
                ? "dark"
                : "light";


            setTemaListo(
              true
            );

            return;
          }


          /* =====================================
             2. SI ES PRIMERA VEZ EN ESTE EQUIPO,
                BUSCAR PREFERENCIA EN FIRESTORE
          ===================================== */

          try {

            const usuarioRef =
              doc(
                db,
                "users",
                user.uid
              );


            const snapshot =
              await getDoc(
                usuarioRef
              );


            const temaFirestore =
              snapshot.exists()
                ? snapshot.data()
                    ?.temaPreferido
                : null;


            const temaInicial =
              temaFirestore ===
                "oscuro"
                ? "oscuro"
                : "claro";


            const oscuro =
              temaInicial ===
              "oscuro";


            /* =====================================
               GUARDARLO EN ESTE DISPOSITIVO
            ===================================== */

            localStorage.setItem(
              claveTema,
              temaInicial
            );


            setModoOscuro(
              oscuro
            );


            document.documentElement.setAttribute(
              "data-theme",
              temaInicial
            );


            document.documentElement.style.colorScheme =
              oscuro
                ? "dark"
                : "light";

          } catch (error) {

            console.error(
              "Error cargando tema del usuario:",
              error
            );


            /* =====================================
               FALLBACK
               → CLARO
            ===================================== */

            localStorage.setItem(
              claveTema,
              "claro"
            );


            setModoOscuro(
              false
            );


            document.documentElement.setAttribute(
              "data-theme",
              "claro"
            );


            document.documentElement.style.colorScheme =
              "light";

          } finally {

            setTemaListo(
              true
            );

          }

        }
      );


    return () =>
      unsubscribe();

  }, []);


  /* =========================================
     ACTUALIZAR TEMA DESDE PERFIL
  ========================================= */

  const actualizarTema =
    (
      nuevoTema
    ) => {

      const user =
        auth.currentUser;


      const tema =
        nuevoTema ===
          "oscuro"
          ? "oscuro"
          : "claro";


      const oscuro =
        tema ===
        "oscuro";


      if (user) {

        localStorage.setItem(
          `tema_${user.uid}`,
          tema
        );

      }


      setModoOscuro(
        oscuro
      );


      document.documentElement.setAttribute(
        "data-theme",
        tema
      );


      document.documentElement.style.colorScheme =
        oscuro
          ? "dark"
          : "light";

    };


  /* =========================================
     ESPERAR TEMA
  ========================================= */

  if (
    !temaListo
  ) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <div
            className="
              w-10
              h-10

              border-4
              border-gray-200
              border-t-yellow-500

              rounded-full

              animate-spin

              mx-auto
            "
          />

          <p className="text-gray-500 mt-4">
            Cargando...
          </p>

        </div>

      </div>
    );

  }


  /* =========================================
     RENDER
  ========================================= */

  return (
    <div
      className={`
        min-h-screen

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

      {/* ================================= */}
      {/* NAVBAR */}
      {/* ================================= */}

      <Navbar
        modoOscuro={
          modoOscuro
        }
      />


      {/* ================================= */}
      {/* CONTENIDO */}
      {/* ================================= */}

      <main
        className={`
          pt-20
          min-h-screen

          transition-colors
          duration-300

          ${
            modoOscuro
              ? "bg-black"
              : "bg-gray-50"
          }
        `}
      >

        <Outlet
          context={{
            modoOscuro,
            actualizarTema,
          }}
        />

      </main>

    </div>
  );
}


export default Layout;