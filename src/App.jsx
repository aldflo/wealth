import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contacto from "./pages/Contacto";

import WealthConstrucciones from "./pages/WealthConstrucciones";
import WealthInmobiliario from "./pages/WealthInmobiliario";
import WealthVyA from "./pages/WealthVyA";

import Ubicacion from "./pages/Ubicacion";
import Clientes from "./pages/Clientes";

import Proyectos from "./pages/Proyectos";
import SubirProyecto from "./pages/SubirProyecto";
import DetalleProyecto from "./pages/DetalleProyecto";

import Cotizaciones from "./pages/cotizaciones";
import CrearCotizacion from "./pages/CrearCotizacion";
import CotizacionesAdmin from "./pages/CotizacionesAdmin";

import Galeria from "./pages/Galeria";
import Subirgaleria from "./pages/Subirgaleria";

import MenuCliente from "./pages/MenuCliente";
import MenuAdmin from "./pages/MenuAdmin";

import Favoritos from "./pages/favoritos";
import ChatIA from "./pages/ChatIA";
import Perfil from "./pages/Perfil";

import MisProyectos from "./pages/MisProyectos";
import ProyectosTerminadosAdmin from "./pages/ProyectosTerminadosAdmin";

function App() {
  return (
    <Routes>

      {/* TODO DENTRO DE LAYOUT */}
      <Route element={<Layout />}>

        {/* ================================================= */}
        {/* PUBLICO */}
        {/* ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/contacto"
          element={<Contacto />}
        />

        <Route
          path="/ubicacion"
          element={<Ubicacion />}
        />

        <Route
          path="/favoritos"
          element={<Favoritos />}
        />

        {/* ================================================= */}
        {/* EMPRESAS */}
        {/* ================================================= */}

        <Route
          path="/construcciones"
          element={<WealthConstrucciones />}
        />

        <Route
          path="/inmobiliaria"
          element={<WealthInmobiliario />}
        />

        <Route
          path="/aluminios"
          element={<WealthVyA />}
        />

        {/* ================================================= */}
        {/* CLIENTE */}
        {/* ================================================= */}

        <Route
          path="/cliente"
          element={<MenuCliente />}
        />

        {/* RUTAS CANÓNICAS DEL CLIENTE */}

        <Route
          path="/cliente/cotizaciones"
          element={<Cotizaciones />}
        />

        <Route
          path="/cliente/mis-proyectos"
          element={<MisProyectos />}
        />

        <Route
          path="/crear-cotizacion"
          element={<CrearCotizacion />}
        />

        <Route
          path="/chat-ia"
          element={<ChatIA />}
        />

        <Route
          path="/perfil"
          element={<Perfil />}
        />

        {/* COMPATIBILIDAD CON LINKS ANTIGUOS */}

        <Route
          path="/cotizaciones"
          element={
            <Navigate
              to="/cliente/cotizaciones"
              replace
            />
          }
        />

        <Route
          path="/mis-proyectos"
          element={
            <Navigate
              to="/cliente/mis-proyectos"
              replace
            />
          }
        />

        {/* ================================================= */}
        {/* ADMIN */}
        {/* ================================================= */}

        <Route
          path="/admin"
          element={<MenuAdmin />}
        />

        <Route
          path="/admin/clientes"
          element={<Clientes />}
        />

        <Route
          path="/admin/cotizaciones"
          element={<CotizacionesAdmin />}
        />

        <Route
          path="/admin/proyectos-terminados"
          element={<ProyectosTerminadosAdmin />}
        />

        <Route
          path="/admin/subir-proyecto"
          element={<SubirProyecto />}
        />

        {/* ================================================= */}
        {/* PROYECTOS / CATÁLOGO */}
        {/* ================================================= */}

        <Route
          path="/proyectos"
          element={<Proyectos />}
        />

        <Route
          path="/proyecto/:id"
          element={<DetalleProyecto />}
        />

        {/* ================================================= */}
        {/* GALERÍA */}
        {/* ================================================= */}

        <Route
          path="/galeria"
          element={<Galeria />}
        />

        <Route
          path="/subir-galeria"
          element={<Subirgaleria />}
        />

      </Route>

    </Routes>
  );
}

export default App;