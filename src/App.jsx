import { Routes, Route } from "react-router-dom";

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
import Cotizaciones from "./pages/Cotizaciones";
import CrearCotizacion from "./pages/CrearCotizacion";
import CotizacionesAdmin from "./pages/CotizacionesAdmin";
import Notificaciones from "./pages/Notificaciones.jsx";

import MenuCliente from "./pages/MenuCliente";
import MenuAdmin from "./pages/MenuAdmin";

function App() {

  return (

    <Routes>

      {/* PUBLICO */}
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />
<Route path="/Notificaciones" element={<Notificaciones />} />
      <Route
        path="/register"
        element={<Register />}
      />

      {/* EMPRESAS */}
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

      {/* CLIENTE */}
      <Route
        path="/cliente"
        element={<MenuCliente />}
      />
      <Route
  path="/admin/clientes"
  element={<Clientes />}
/>
     
      {/* ADMIN */}
      <Route
        path="/admin"
        element={<MenuAdmin />}
      />
        {/* Vizualizarproyectosdesdeadmin*/}
      <Route
  path="/proyectos"
  element={<Proyectos />}
/>

 {/* Subirproyectos desde admin*/}
      <Route
  path="/admin/subir-proyecto"
  element={<SubirProyecto />}
/>
<Route path="/admin/cotizaciones" element={<CotizacionesAdmin />} />
<Route path="/cotizaciones" element={<Cotizaciones />} />
<Route path="/crear-cotizacion" element={<CrearCotizacion />} />

<Route path="/proyecto/:id" element={<DetalleProyecto />} />

      <Route
  path="/contacto"
  element={<Contacto />}
/>
<Route
  path="/ubicacion"
  element={<Ubicacion />}
/>

    </Routes>

  );

}

export default App;
