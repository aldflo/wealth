import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  auth,
  db,
} from "../firebase.config";

import {
  FaBuilding,
  FaHardHat,
  FaDoorOpen,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaBars,
  FaTimes,
  FaUser,
  FaUserShield,
  FaSignOutAlt,
  FaSignInAlt,
  FaChevronRight,
} from "react-icons/fa";

function Navbar() {
  const navigate =
    useNavigate();

  // ======================================================
  // ESTADOS
  // ======================================================

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    role,
    setRole,
  ] = useState(null);

  const [
    cargandoUsuario,
    setCargandoUsuario,
  ] = useState(true);

  // ======================================================
  // ESCUCHAR SESIÓN
  // ======================================================

  useEffect(() => {
    const unsub =
      onAuthStateChanged(
        auth,
        async (
          currentUser
        ) => {
          try {
            setCargandoUsuario(
              true
            );

            if (
              !currentUser
            ) {
              setUser(
                null
              );

              setRole(
                null
              );

              return;
            }

            setUser(
              currentUser
            );

            const userRef =
              doc(
                db,
                "users",
                currentUser.uid
              );

            const snap =
              await getDoc(
                userRef
              );

            if (
              snap.exists()
            ) {
              setRole(
                snap.data()
                  ?.role ||
                  "cliente"
              );
            } else {
              setRole(
                "cliente"
              );
            }

          } catch (
            error
          ) {
            console.error(
              "Error obteniendo usuario:",
              error
            );

            setRole(
              null
            );

          } finally {
            setCargandoUsuario(
              false
            );
          }
        }
      );

    return () =>
      unsub();

  }, []);

  // ======================================================
  // CERRAR MENÚ AL CAMBIAR TAMAÑO
  // ======================================================

  useEffect(() => {
    const cerrarDesktop =
      () => {
        if (
          window.innerWidth >=
          1024
        ) {
          setOpen(
            false
          );
        }
      };

    window.addEventListener(
      "resize",
      cerrarDesktop
    );

    return () =>
      window.removeEventListener(
        "resize",
        cerrarDesktop
      );

  }, []);

  // ======================================================
  // BLOQUEAR SCROLL CUANDO MOBILE ESTÁ ABIERTO
  // ======================================================

  useEffect(() => {
    if (
      open
    ) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };

  }, [
    open,
  ]);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout =
    async () => {
      try {
        await signOut(
          auth
        );

        setOpen(
          false
        );

        navigate(
          "/"
        );

      } catch (
        error
      ) {
        console.error(
          "Error al cerrar sesión:",
          error
        );
      }
    };

  // ======================================================
  // RUTA PANEL
  // ======================================================

  const rutaPanel =
    role === "admin"
      ? "/admin"
      : "/cliente";

  const textoPanel =
    role === "admin"
      ? "Panel Admin"
      : "Mi Panel";

  // ======================================================
  // ESTILO LINK
  // ======================================================

  const navClass =
    ({
      isActive,
    }) => `
      relative
      flex
      items-center
      gap-2
      h-20
      text-sm
      xl:text-[15px]
      font-medium
      whitespace-nowrap
      transition-all
      duration-200

      ${
        isActive
          ? "text-[#d6ab4c]"
          : "text-zinc-200 hover:text-[#d6ab4c]"
      }

      after:absolute
      after:left-0
      after:right-0
      after:bottom-0
      after:h-[2px]
      after:rounded-full
      after:transition-all

      ${
        isActive
          ? "after:bg-[#d6ab4c]"
          : "after:bg-transparent"
      }
    `;

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <>
      {/* ================================================= */}
      {/* NAVBAR DESKTOP / PRINCIPAL */}
      {/* ================================================= */}

      <nav
        className="
          fixed
          top-0
          left-0
          right-0
          z-[90]

          h-20

          bg-black/95
          backdrop-blur-xl

          border-b
          border-white/10

          shadow-[0_10px_30px_rgba(0,0,0,0.35)]
        "
      >

        <div
          className="
            max-w-[1600px]
            mx-auto
            h-full

            px-5
            md:px-7
            xl:px-8

            flex
            items-center
          "
        >

          {/* ================================================= */}
          {/* LOGO */}
          {/* ================================================= */}

          <div className="flex-shrink-0">

            <Link
              to="/"
              onClick={() =>
                setOpen(
                  false
                )
              }
              className="group flex flex-col"
            >

              <h1
                className="
                  text-white
                  group-hover:text-[#d6ab4c]

                  font-black

                  text-2xl
                  xl:text-[27px]

                  leading-none

                  tracking-[0.04em]

                  transition
                "
              >
                WEALTH
              </h1>

              <span
                className="
                  text-[#d6ab4c]

                  text-[10px]
                  xl:text-[11px]

                  uppercase

                  tracking-[0.27em]

                  mt-1.5

                  whitespace-nowrap
                "
              >
                Grupo Empresarial
              </span>

            </Link>

          </div>

          {/* ================================================= */}
          {/* MENÚ CENTRAL DESKTOP */}
          {/* ================================================= */}

          <div
            className="
              flex-1
              hidden
              lg:flex
              justify-center

              min-w-0

              px-5
            "
          >

            <div
              className="
                flex
                items-center

                gap-5
                xl:gap-8
                2xl:gap-10
              "
            >

              {/* ASISTENTE IA - SIN ROBOT */}

              <NavLink
                to="/chat-ia"
                className={
                  navClass
                }
              >
                Asistente IA
              </NavLink>

              {/* INMOBILIARIA */}

              <NavLink
                to="/inmobiliaria"
                className={
                  navClass
                }
              >
                <FaBuilding />

                Inmobiliaria
              </NavLink>

              {/* CONSTRUCCIONES */}

              <NavLink
                to="/construcciones"
                className={
                  navClass
                }
              >
                <FaHardHat />

                Construcciones
              </NavLink>

              {/* ALUMINIOS */}

              <NavLink
                to="/aluminios"
                className={
                  navClass
                }
              >
                <FaDoorOpen />

                Aluminios
              </NavLink>

              {/* CONTACTO */}

              <NavLink
                to="/contacto"
                className={
                  navClass
                }
              >
                <FaPhoneAlt />

                Contacto
              </NavLink>

              {/* UBICACIÓN */}

              <NavLink
                to="/ubicacion"
                className={
                  navClass
                }
              >
                <FaMapMarkerAlt />

                Ubicación
              </NavLink>

            </div>

          </div>

          {/* ================================================= */}
          {/* DERECHA DESKTOP */}
          {/* ================================================= */}

          <div
            className="
              hidden
              lg:flex
              items-center

              gap-3

              border-l
              border-white/10

              pl-5
              xl:pl-6

              flex-shrink-0
            "
          >

            {!cargandoUsuario &&
              user && (
                <Link
                  to={
                    rutaPanel
                  }
                  className="
                    h-11

                    px-4

                    rounded-xl

                    border
                    border-[#c89b3c]/35

                    bg-[#c89b3c]/5

                    text-[#e0b84d]

                    hover:bg-[#c89b3c]/15
                    hover:border-[#c89b3c]/70

                    flex
                    items-center
                    gap-2

                    text-sm
                    font-semibold

                    whitespace-nowrap

                    transition-all
                    duration-200
                  "
                >

                  {role ===
                  "admin" ? (
                    <FaUserShield />
                  ) : (
                    <FaUser />
                  )}

                  {
                    textoPanel
                  }

                </Link>
              )}

            {!cargandoUsuario &&
              (user ? (
                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="
                    h-11

                    px-4
                    xl:px-5

                    rounded-xl

                    bg-red-600/90

                    hover:bg-red-600

                    border
                    border-red-500/40

                    text-white

                    flex
                    items-center
                    gap-2

                    font-semibold

                    text-sm

                    whitespace-nowrap

                    shadow-lg
                    shadow-red-950/20

                    transition-all
                    duration-200

                    hover:-translate-y-[1px]
                  "
                >

                  <FaSignOutAlt />

                  Cerrar Sesión

                </button>
              ) : (
                <Link
                  to="/login"
                  className="
                    h-11

                    px-5

                    rounded-xl

                    bg-gradient-to-r
                    from-[#b88a2d]
                    to-[#d6ab4c]

                    hover:from-[#c89b3c]
                    hover:to-[#e0b84d]

                    text-black

                    flex
                    items-center
                    gap-2

                    font-bold

                    text-sm

                    whitespace-nowrap

                    shadow-lg
                    shadow-[#c89b3c]/10

                    transition-all
                    duration-200

                    hover:-translate-y-[1px]
                  "
                >

                  <FaSignInAlt />

                  Iniciar Sesión

                </Link>
              ))}

          </div>

          {/* ================================================= */}
          {/* HAMBURGUESA */}
          {/* ================================================= */}

          <div
            className="
              ml-auto
              lg:hidden

              flex
              items-center
              gap-3
            "
          >

            {!cargandoUsuario &&
              user && (
                <Link
                  to={
                    rutaPanel
                  }
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                  className="
                    hidden
                    sm:flex

                    items-center
                    gap-2

                    px-3.5
                    py-2

                    border
                    border-[#c89b3c]/30

                    rounded-xl

                    text-[#d6ab4c]

                    text-sm
                    font-semibold
                  "
                >

                  <FaUser />

                  {role ===
                  "admin"
                    ? "Admin"
                    : "Mi Panel"}

                </Link>
              )}

            <button
              type="button"
              onClick={() =>
                setOpen(
                  (actual) =>
                    !actual
                )
              }
              className="
                w-11
                h-11

                rounded-xl

                border
                border-zinc-700

                bg-zinc-950

                text-white

                hover:text-[#d6ab4c]
                hover:border-[#c89b3c]/50

                flex
                items-center
                justify-center

                transition

                text-xl
              "
              aria-label={
                open
                  ? "Cerrar menú"
                  : "Abrir menú"
              }
            >

              {open ? (
                <FaTimes />
              ) : (
                <FaBars />
              )}

            </button>

          </div>

        </div>

      </nav>

      {/* ================================================= */}
      {/* OVERLAY */}
      {/* ================================================= */}

      <div
        onClick={() =>
          setOpen(
            false
          )
        }
        className={`
          lg:hidden

          fixed
          inset-0

          z-[91]

          bg-black/70
          backdrop-blur-sm

          transition-opacity
          duration-300

          ${
            open
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          }
        `}
      />

      {/* ================================================= */}
      {/* MENÚ MOBILE */}
      {/* ================================================= */}

      <aside
        className={`
          lg:hidden

          fixed
          top-0
          right-0

          z-[92]

          w-[88%]
          max-w-[390px]

          h-dvh

          bg-zinc-950

          border-l
          border-zinc-700

          shadow-2xl

          transition-transform
          duration-300

          ${
            open
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >

        {/* HEADER MOBILE */}

        <div
          className="
            h-20

            px-5

            border-b
            border-zinc-800

            flex
            items-center
            justify-between
          "
        >

          <Link
            to="/"
            onClick={() =>
              setOpen(
                false
              )
            }
            className="flex flex-col"
          >

            <span className="text-xl font-black tracking-wider">
              WEALTH
            </span>

            <span className="text-[9px] text-[#d6ab4c] tracking-[0.24em] uppercase">
              Grupo Empresarial
            </span>

          </Link>

          <button
            type="button"
            onClick={() =>
              setOpen(
                false
              )
            }
            className="
              w-11
              h-11

              rounded-xl

              border
              border-zinc-700

              flex
              items-center
              justify-center

              text-zinc-400

              hover:text-white
              hover:border-zinc-500

              transition
            "
          >
            <FaTimes />
          </button>

        </div>

        {/* LINKS */}

        <div
          className="
            h-[calc(100dvh-80px)]

            overflow-y-auto

            px-5
            py-6
          "
        >

          {/* MI PANEL MOBILE */}

          {!cargandoUsuario &&
            user && (
              <Link
                to={
                  rutaPanel
                }
                onClick={() =>
                  setOpen(
                    false
                  )
                }
                className="
                  mb-6

                  p-4

                  rounded-2xl

                  border
                  border-[#c89b3c]/30

                  bg-[#c89b3c]/5

                  flex
                  items-center
                  justify-between

                  group
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-11
                      h-11

                      rounded-xl

                      bg-[#c89b3c]/10

                      border
                      border-[#c89b3c]/20

                      flex
                      items-center
                      justify-center

                      text-[#d6ab4c]
                    "
                  >

                    {role ===
                    "admin" ? (
                      <FaUserShield />
                    ) : (
                      <FaUser />
                    )}

                  </div>

                  <div>

                    <p className="text-xs text-zinc-500">
                      Cuenta Wealth
                    </p>

                    <p className="font-bold text-white">
                      {
                        textoPanel
                      }
                    </p>

                  </div>

                </div>

                <FaChevronRight
                  className="
                    text-zinc-600

                    group-hover:text-[#d6ab4c]

                    transition
                  "
                />

              </Link>
            )}

          {/* NAVEGACIÓN */}

          <div className="space-y-2">

            <MobileLink
              to="/chat-ia"
              cerrar={() =>
                setOpen(
                  false
                )
              }
            >
              Asistente IA
            </MobileLink>

            <MobileLink
              to="/inmobiliaria"
              icon={
                <FaBuilding />
              }
              cerrar={() =>
                setOpen(
                  false
                )
              }
            >
              Inmobiliaria
            </MobileLink>

            <MobileLink
              to="/construcciones"
              icon={
                <FaHardHat />
              }
              cerrar={() =>
                setOpen(
                  false
                )
              }
            >
              Construcciones
            </MobileLink>

            <MobileLink
              to="/aluminios"
              icon={
                <FaDoorOpen />
              }
              cerrar={() =>
                setOpen(
                  false
                )
              }
            >
              Aluminios
            </MobileLink>

            <MobileLink
              to="/contacto"
              icon={
                <FaPhoneAlt />
              }
              cerrar={() =>
                setOpen(
                  false
                )
              }
            >
              Contacto
            </MobileLink>

            <MobileLink
              to="/ubicacion"
              icon={
                <FaMapMarkerAlt />
              }
              cerrar={() =>
                setOpen(
                  false
                )
              }
            >
              Ubicación
            </MobileLink>

          </div>

          {/* CUENTA */}

          <div
            className="
              mt-7
              pt-6

              border-t
              border-zinc-800
            "
          >

            {!cargandoUsuario &&
              (user ? (
                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="
                    w-full

                    bg-red-600/90

                    hover:bg-red-600

                    border
                    border-red-500/40

                    text-white

                    px-6
                    py-3.5

                    rounded-xl

                    font-bold

                    flex
                    items-center
                    justify-center
                    gap-2

                    transition
                  "
                >

                  <FaSignOutAlt />

                  Cerrar Sesión

                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                  className="
                    w-full

                    bg-gradient-to-r
                    from-[#b88a2d]
                    to-[#d6ab4c]

                    text-black

                    px-6
                    py-3.5

                    rounded-xl

                    font-bold

                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >

                  <FaSignInAlt />

                  Iniciar Sesión

                </Link>
              ))}

          </div>

        </div>

      </aside>
    </>
  );
}

// ======================================================
// LINK MOBILE
// ======================================================

function MobileLink({
  to,
  icon,
  children,
  cerrar,
}) {
  return (
    <NavLink
      to={
        to
      }
      onClick={
        cerrar
      }
      className={({
        isActive,
      }) => `
        w-full

        px-4
        py-3.5

        rounded-xl

        flex
        items-center
        justify-between

        border

        transition-all

        ${
          isActive
            ? `
              bg-[#c89b3c]/10
              border-[#c89b3c]/30
              text-[#d6ab4c]
            `
            : `
              bg-black/30
              border-transparent
              text-zinc-300

              hover:bg-zinc-900
              hover:border-zinc-700
              hover:text-white
            `
        }
      `}
    >

      <div className="flex items-center gap-3">

        {icon && (
          <span className="text-[#d6ab4c]">
            {icon}
          </span>
        )}

        <span className="font-medium">
          {children}
        </span>

      </div>

      <FaChevronRight
        size={12}
        className="opacity-40"
      />

    </NavLink>
  );
}

export default Navbar;