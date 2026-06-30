import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <Navbar />

      <main className="pt-20">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;