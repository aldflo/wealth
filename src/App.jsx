import { Routes, Route } from "react-router-dom";

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
import Notificaciones from "./pages/Notificaciones.jsx";
import Galeria from "./pages/Galeria";
import Subirgaleria from "./pages/Subirgaleria";
import MenuCliente from "./pages/MenuCliente";
import MenuAdmin from "./pages/MenuAdmin";
import Favoritos from "./pages/favoritos";
import ChatIA from "./pages/ChatIA";

function App() {
  return (
    <Routes>

      {/* 🔥 TODO DENTRO DE LAYOUT */}
      <Route element={<Layout />}>

        {/* PUBLICO */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/ubicacion" element={<Ubicacion />} />

        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/Notificaciones" element={<Notificaciones />} />

        {/* EMPRESAS */}
        <Route path="/construcciones" element={<WealthConstrucciones />} />
        <Route path="/inmobiliaria" element={<WealthInmobiliario />} />
        <Route path="/aluminios" element={<WealthVyA />} />

        {/* CLIENTE */}
        <Route path="/cliente" element={<MenuCliente />} />
        <Route path="/admin/clientes" element={<Clientes />} />
         <Route path="/chat-ia" element={<ChatIA />} />

        {/* ADMIN */}
        <Route path="/admin" element={<MenuAdmin />} />

        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/subir-galeria" element={<Subirgaleria />} />
        <Route path="/galeria" element={<Galeria />} />

        <Route path="/admin/subir-proyecto" element={<SubirProyecto />} />
        <Route path="/admin/cotizaciones" element={<CotizacionesAdmin />} />

        <Route path="/cotizaciones" element={<Cotizaciones />} />
        <Route path="/crear-cotizacion" element={<CrearCotizacion />} />

        <Route path="/proyecto/:id" element={<DetalleProyecto />} />

      </Route>

    </Routes>
  );
}

export default App;