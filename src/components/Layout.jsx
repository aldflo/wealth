import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      {/* NAVBAR GLOBAL */}
      <Navbar />

      {/* CONTENIDO DE CADA PÁGINA */}
      <main className="pt-20 min-h-screen bg-black">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;