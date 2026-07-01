import { useEffect, useState } from "react";
import { db } from "../firebase.config";
import { collection, getDocs } from "firebase/firestore";

function Galeria() {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 filtros
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState("todos");

  const fetchGaleria = async () => {
    try {
      const snap = await getDocs(collection(db, "galeria"));

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGrupos(data);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchGaleria();
  }, []);

  // 🔥 FILTRO REAL
  const gruposFiltrados = grupos.filter((g) => {
    const catOk =
      filtroCategoria === "todos" || g.categoria === filtroCategoria;

    const subOk =
      filtroSubcategoria === "todos" ||
      g.subcategoria === filtroSubcategoria;

    return catOk && subOk;
  });

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-4xl font-bold mb-6">
        Galería de Diseños
      </h1>

      {/* 🔥 FILTROS */}
      <div className="flex flex-wrap gap-4 mb-10">

        <select
          value={filtroCategoria}
          onChange={(e) => {
            setFiltroCategoria(e.target.value);
            setFiltroSubcategoria("todos");
          }}
          className="bg-zinc-800 p-3 rounded-xl"
        >
          <option value="todos">Todas las categorías</option>
          <option value="Construcciones">Construcciones</option>
          <option value="Inmobiliaria">Inmobiliaria</option>
          <option value="Vidrio y Aluminio">Vidrio y Aluminio</option>
        </select>

        <select
          value={filtroSubcategoria}
          onChange={(e) => setFiltroSubcategoria(e.target.value)}
          className="bg-zinc-800 p-3 rounded-xl"
        >
          <option value="todos">Todas las subcategorías</option>

          {(filtroCategoria === "todos" ||
            filtroCategoria === "Construcciones") && (
            <>
              <option value="Servicios de Electrificación">
                Servicios de Electrificación
              </option>
              <option value="Remodelaciones y Obra Ligera">
                Remodelaciones y Obra Ligera
              </option>
              <option value="Instalación y Mantenimiento">
                Instalación y Mantenimiento
              </option>
              <option value="Estructuras Metálicas y Herrería">
                Estructuras Metálicas y Herrería
              </option>
              <option value="Estructuras metálicas">
                Estructuras metálicas
              </option>
              <option value="Barandales">
                Barandales
              </option>
              <option value="Cortinas metálicas">
                Cortinas metálicas
              </option>
              <option value="Domos">
                Domos
              </option>
              <option value="Protectores">
                Protectores
              </option>
              <option value="Rejas y portones">
                Rejas y portones
              </option>
              <option value="Cercado de malla ciclónica">
                Cercado de malla ciclónica
              </option>
              <option value="Estructuras a diseño">
                Estructuras a diseño
              </option>
            </>
          )}

          {(filtroCategoria === "todos" ||
            filtroCategoria === "Vidrio y Aluminio") && (
            <>
              <option value="Fabricación de vidrio templado">
                Fabricación de vidrio templado
              </option>
              <option value="Canceles de baño">
                Canceles de baño
              </option>
              <option value="Espejos y vitrinas">
                Espejos y vitrinas
              </option>
              <option value="Ventanas de aluminio">
                Ventanas de aluminio
              </option>
              <option value="Puertas residenciales">
                Puertas residenciales
              </option>
              <option value="Puertas de baño y mosquiteras">
                Puertas de baño y mosquiteras
              </option>
              <option value="Domos de vidrio y aluminio">
                Domos de vidrio y aluminio
              </option>
              <option value="Cancelería moderna">
                Cancelería moderna
              </option>
              <option value="Diseños arquitectónicos ligeros">
                Diseños arquitectónicos ligeros
              </option>
              <option value="Barandales de vidrio y aluminio">
                Barandales de vidrio y aluminio
              </option>
              <option value="Protectores y rejas ligeras">
                Protectores y rejas ligeras
              </option>
              <option value="Seguridad estética">
                Seguridad estética
              </option>
              <option value="Portones eléctricos">
                Portones eléctricos
              </option>
              <option value="Sistemas automáticos de apertura">
                Sistemas automáticos de apertura
              </option>
              <option value="Estructuras residenciales">
                Estructuras residenciales
              </option>
              <option value="Fabricación personalizada">
                Fabricación personalizada
              </option>
              <option value="Diseños arquitectónicos">
                Diseños arquitectónicos
              </option>
              <option value="Proyectos especiales en aluminio y vidrio">
                Proyectos especiales en aluminio y vidrio
              </option>
            </>
          )}

        </select>

      </div>

      {/* 🔥 CARGA */}
      {loading && (
        <p className="text-zinc-400">Cargando galería...</p>
      )}

      {/* 🔥 GALERÍA */}
      <div className="space-y-12">

        {gruposFiltrados.map((grupo) => (
          <div key={grupo.id}>

            {/* TITULO */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-yellow-500">
                {grupo.categoria} → {grupo.subcategoria}
              </h2>

              <p className="text-zinc-400 text-sm">
                Diseños disponibles en esta sección
              </p>
            </div>

            {/* IMÁGENES */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

              {grupo.imagenes?.map((img, i) => (
                <div
                  key={i}
                  className="bg-zinc-900 rounded-2xl overflow-hidden hover:scale-105 transition"
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}

            </div>

          </div>
        ))}

      </div>

      {!loading && gruposFiltrados.length === 0 && (
        <p className="text-zinc-500 mt-10">
          No hay imágenes en esta selección.
        </p>
      )}

    </div>
  );
}

export default Galeria;