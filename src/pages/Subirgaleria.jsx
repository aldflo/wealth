import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import { db } from "../firebase.config";

import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  FaCloudUploadAlt,
  FaTrash,
  FaImages,
  FaEdit,
  FaTimes,
  FaSearch,
  FaFolderOpen,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaImage,
  FaSave,
  FaLayerGroup,
  FaTag,
  FaPlus,
} from "react-icons/fa";

// ======================================================
// CONFIGURACIÓN
// ======================================================

const MAX_IMAGENES = 20;
const MAX_MB = 5;

const SUBCATEGORIAS = {
  Construcciones: [
    "Servicios de Electrificación",
    "Remodelaciones y Obra Ligera",
    "Instalación y Mantenimiento",
    "Estructuras Metálicas y Herrería",
    "Estructuras metálicas",
    "Barandales",
    "Cortinas metálicas",
    "Domos",
    "Protectores",
    "Rejas y portones",
    "Cercado de malla ciclónica",
    "Estructuras a diseño",
  ],

  "Aluminios y Vidrios": [
    "Fabricación de vidrio templado",
    "Canceles de baño",
    "Espejos y vitrinas",
    "Ventanas de aluminio",
    "Puertas residenciales",
    "Puertas de baño y mosquiteras",
    "Domos de vidrio y aluminio",
    "Cancelería moderna",
    "Diseños arquitectónicos ligeros",
    "Barandales de vidrio y aluminio",
    "Protectores y rejas ligeras",
    "Seguridad estética",
    "Portones eléctricos",
    "Sistemas automáticos de apertura",
    "Estructuras residenciales",
    "Fabricación personalizada",
    "Diseños arquitectónicos",
    "Proyectos especiales en aluminio y vidrio",
  ],

  Inmobiliaria: [
    "Casas",
    "Departamentos",
    "Terrenos",
    "Locales comerciales",
    "Propiedades en venta",
    "Propiedades en renta",
    "Desarrollos inmobiliarios",
  ],
};

// ======================================================
// NORMALIZAR CATEGORÍA ANTIGUA
// ======================================================

const normalizarCategoria = (categoria) => {
  if (categoria === "Vidrio y Aluminio") {
    return "Aluminios y Vidrios";
  }

  return categoria;
};

// ======================================================
// COMPONENTE
// ======================================================

function SubirGaleria() {
  const navigate = useNavigate();

  const { modoOscuro } = useOutletContext() || {};

  // ====================================================
  // FORMULARIO
  // ====================================================

  const [categoria, setCategoria] =
    useState("Construcciones");

  const [subcategoria, setSubcategoria] =
    useState("");

  const [imagenes, setImagenes] =
    useState([]);

  const [previewImagenes, setPreviewImagenes] =
    useState([]);

  // ====================================================
  // FIRESTORE
  // ====================================================

  const [galeriaDB, setGaleriaDB] =
    useState([]);

  // ====================================================
  // EDICIÓN
  // ====================================================

  const [editId, setEditId] =
    useState(null);

  const [
    imagenesExistentes,
    setImagenesExistentes,
  ] = useState([]);

  // ====================================================
  // ESTADOS
  // ====================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  // ====================================================
  // FILTROS ADMIN
  // ====================================================

  const [busqueda, setBusqueda] =
    useState("");

  const [filtroCategoria, setFiltroCategoria] =
    useState("Todos");

  // ====================================================
  // ESCUCHAR GALERÍAS
  // ====================================================

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "galeria"),

      (snap) => {
        const data = snap.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
          categoria: normalizarCategoria(
            documento.data().categoria
          ),
        }));

        data.sort((a, b) => {
          const fechaA =
            a.fechaActualizacion?.toMillis?.() ||
            a.fecha?.toMillis?.() ||
            0;

          const fechaB =
            b.fechaActualizacion?.toMillis?.() ||
            b.fecha?.toMillis?.() ||
            0;

          return fechaB - fechaA;
        });

        setGaleriaDB(data);
      },

      (error) => {
        console.error(
          "Error cargando galerías:",
          error
        );
      }
    );

    return () => unsub();
  }, []);

  // ====================================================
  // CATEGORÍAS
  // ====================================================

  const categorias = Object.keys(
    SUBCATEGORIAS
  );

  // ====================================================
  // SUBCATEGORÍAS DISPONIBLES
  // ====================================================

  const subcategoriasDisponibles =
    SUBCATEGORIAS[categoria] || [];

  // ====================================================
  // VALIDAR ARCHIVO
  // ====================================================

  const validarArchivo = (file) => {
    if (!file.type.startsWith("image/")) {
      return `"${file.name}" no es una imagen válida.`;
    }

    if (
      file.size >
      MAX_MB * 1024 * 1024
    ) {
      return `"${file.name}" supera el límite de ${MAX_MB} MB.`;
    }

    return null;
  };

  // ====================================================
  // SELECCIONAR IMÁGENES
  // ====================================================

  const seleccionarImagenes = (files) => {
    setError("");
    setMensaje("");

    const nuevas =
      Array.from(files || []);

    if (!nuevas.length) {
      return;
    }

    const total =
      imagenesExistentes.length +
      imagenes.length +
      nuevas.length;

    if (total > MAX_IMAGENES) {
      setError(
        `Puedes tener un máximo de ${MAX_IMAGENES} imágenes por galería.`
      );

      return;
    }

    for (const file of nuevas) {
      const problema =
        validarArchivo(file);

      if (problema) {
        setError(problema);
        return;
      }
    }

    const nuevosPreviews =
      nuevas.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));

    setImagenes((prev) => [
      ...prev,
      ...nuevas,
    ]);

    setPreviewImagenes((prev) => [
      ...prev,
      ...nuevosPreviews,
    ]);
  };

  // ====================================================
  // ELIMINAR NUEVA IMAGEN
  // ====================================================

  const eliminarNuevaImagen = (index) => {
    const preview =
      previewImagenes[index];

    if (preview?.url) {
      URL.revokeObjectURL(
        preview.url
      );
    }

    setImagenes((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );

    setPreviewImagenes((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  // ====================================================
  // QUITAR IMAGEN EXISTENTE
  // ====================================================

  const quitarImagenExistente = (url) => {
    setImagenesExistentes(
      (prev) =>
        prev.filter(
          (imagen) =>
            imagen !== url
        )
    );
  };

  // ====================================================
  // CLOUDINARY
  // ====================================================

  const subirImagen = async (file) => {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "upload_preset",
      "wealth"
    );

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dxj4iczvk/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error(
        `No se pudo subir "${file.name}".`
      );
    }

    const data =
      await res.json();

    if (!data.secure_url) {
      throw new Error(
        "Cloudinary no devolvió la URL de la imagen."
      );
    }

    return data.secure_url;
  };

  // ====================================================
  // LIMPIAR
  // ====================================================

  const limpiarFormulario = () => {
    previewImagenes.forEach(
      (preview) => {
        URL.revokeObjectURL(
          preview.url
        );
      }
    );

    setCategoria(
      "Construcciones"
    );

    setSubcategoria("");

    setImagenes([]);

    setPreviewImagenes([]);

    setImagenesExistentes([]);

    setEditId(null);

    setError("");
  };

  // ====================================================
  // CANCELAR EDICIÓN
  // ====================================================

  const cancelarEdicion = () => {
    limpiarFormulario();

    setMensaje(
      "Edición cancelada."
    );
  };

  // ====================================================
  // VALIDAR FORMULARIO
  // ====================================================

  const validarFormulario = () => {
    setError("");

    if (!categoria) {
      setError(
        "Selecciona una categoría."
      );
      return false;
    }

    if (!subcategoria) {
      setError(
        "Selecciona una subcategoría."
      );
      return false;
    }

    const total =
      imagenesExistentes.length +
      imagenes.length;

    if (total === 0) {
      setError(
        "Selecciona al menos una imagen."
      );
      return false;
    }

    return true;
  };

  // ====================================================
  // GUARDAR
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");

    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const nuevasUrls =
        imagenes.length > 0
          ? await Promise.all(
              imagenes.map(
                subirImagen
              )
            )
          : [];

      const imagenesFinales = [
        ...imagenesExistentes,
        ...nuevasUrls,
      ];

      // ================================================
      // EDITAR
      // ================================================

      if (editId) {
        await updateDoc(
          doc(
            db,
            "galeria",
            editId
          ),
          {
            categoria,
            subcategoria,
            imagenes:
              imagenesFinales,

            fechaActualizacion:
              serverTimestamp(),
          }
        );

        setMensaje(
          "✅ Galería actualizada correctamente."
        );
      }

      // ================================================
      // NUEVA / AGREGAR A EXISTENTE
      // ================================================

      else {
        const existente =
          galeriaDB.find(
            (g) =>
              normalizarCategoria(
                g.categoria
              ) ===
                categoria &&
              g.subcategoria ===
                subcategoria
          );

        if (existente) {
          const combinadas = [
            ...(existente.imagenes ||
              []),
            ...nuevasUrls,
          ];

          if (
            combinadas.length >
            MAX_IMAGENES
          ) {
            throw new Error(
              `Esta galería superaría el máximo de ${MAX_IMAGENES} imágenes.`
            );
          }

          await updateDoc(
            doc(
              db,
              "galeria",
              existente.id
            ),
            {
              categoria,
              imagenes:
                combinadas,

              fechaActualizacion:
                serverTimestamp(),
            }
          );

          setMensaje(
            "✅ Las nuevas imágenes fueron agregadas a la galería existente."
          );
        } else {
          await addDoc(
            collection(
              db,
              "galeria"
            ),
            {
              categoria,

              subcategoria,

              imagenes:
                nuevasUrls,

              fecha:
                serverTimestamp(),

              fechaActualizacion:
                serverTimestamp(),
            }
          );

          setMensaje(
            "✅ Galería publicada correctamente."
          );
        }
      }

      limpiarFormulario();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Error guardando galería:",
        error
      );

      setError(
        error.message ||
          "No se pudo guardar la galería."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // EDITAR
  // ====================================================

  const handleEdit = (galeria) => {
    setError("");
    setMensaje("");

    const categoriaNormalizada =
      normalizarCategoria(
        galeria.categoria
      );

    setEditId(
      galeria.id
    );

    setCategoria(
      categoriaNormalizada
    );

    setSubcategoria(
      galeria.subcategoria ||
        ""
    );

    setImagenesExistentes(
      Array.isArray(
        galeria.imagenes
      )
        ? galeria.imagenes
        : []
    );

    setImagenes([]);

    previewImagenes.forEach(
      (preview) => {
        URL.revokeObjectURL(
          preview.url
        );
      }
    );

    setPreviewImagenes([]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ====================================================
  // ELIMINAR GALERÍA
  // ====================================================

  const eliminarGaleria = async (
    galeria
  ) => {
    const confirmar =
      window.confirm(
        `¿Eliminar la galería "${galeria.subcategoria}"?\n\nEsta acción eliminará la sección completa de Firestore.`
      );

    if (!confirmar) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "galeria",
          galeria.id
        )
      );

      if (
        editId === galeria.id
      ) {
        limpiarFormulario();
      }

      setMensaje(
        "Galería eliminada."
      );
    } catch (error) {
      console.error(error);

      setError(
        "No se pudo eliminar la galería."
      );
    }
  };

  // ====================================================
  // FILTRAR GALERÍAS
  // ====================================================

  const galeriasFiltradas =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return galeriaDB.filter(
        (g) => {
          const contenido = [
            g.categoria,
            g.subcategoria,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const coincideTexto =
            !texto ||
            contenido.includes(
              texto
            );

          const coincideCategoria =
            filtroCategoria ===
              "Todos" ||
            normalizarCategoria(
              g.categoria
            ) ===
              filtroCategoria;

          return (
            coincideTexto &&
            coincideCategoria
          );
        }
      );
    }, [
      galeriaDB,
      busqueda,
      filtroCategoria,
    ]);

  // ====================================================
  // TOTAL
  // ====================================================

  const totalImagenesActual =
    imagenesExistentes.length +
    imagenes.length;

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 py-8 md:py-12 transition-colors duration-300 ${
        modoOscuro
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >

      <div className="max-w-7xl mx-auto">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-9">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">

              <FaImages className="text-yellow-500 text-2xl" />

            </div>

            <div>

              <p className="text-xs uppercase tracking-[0.25em] text-yellow-500 font-semibold">
                Administración
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mt-1">
                Administrar Galería
              </h1>

              <p className="text-zinc-500 mt-1">
                Organiza fotografías por categoría y tipo de trabajo.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/galeria")
            }
            className={`${botonBase(modoOscuro)} ${modoOscuro ? "border-zinc-600 text-zinc-300" : "border-gray-300 text-gray-700"} hover:border-yellow-500/60 hover:text-yellow-500`}
          >
            <FaImages />

            Ver galería pública

            <FaArrowRight />
          </button>

        </div>

        {/* ================================================= */}
        {/* MENSAJES */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 bg-red-500/5 border border-red-500/30 text-red-300 p-4 rounded-2xl flex gap-3">

            <FaExclamationTriangle className="mt-1 shrink-0" />

            {error}

          </div>
        )}

        {mensaje && (
          <div className="mb-6 bg-green-500/5 border border-green-500/30 text-green-300 p-4 rounded-2xl flex gap-3">

            <FaCheckCircle className="mt-1 shrink-0" />

            {mensaje}

          </div>
        )}

        {/* ================================================= */}
        {/* MODO EDICIÓN */}
        {/* ================================================= */}

        {editId && (
          <div className="mb-6 bg-blue-500/5 border border-blue-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div className="flex gap-3 items-center">

              <FaEdit className="text-blue-400" />

              <div>

                <p className="font-bold">
                  Editando galería
                </p>

                <p className={modoOscuro ? "text-sm text-zinc-400" : "text-sm text-gray-600"}>
                  {categoria} →{" "}
                  {subcategoria}
                </p>

                <p className="text-xs text-zinc-600 mt-1">
                  {
                    imagenesExistentes.length
                  }{" "}
                  imágenes guardadas
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={
                cancelarEdicion
              }
              className={`${botonBase(modoOscuro)} border-zinc-600 text-zinc-300 hover:border-red-500/60 hover:text-red-400`}
            >
              <FaTimes />
              Cancelar edición
            </button>

          </div>
        )}

        {/* ================================================= */}
        {/* FORMULARIO */}
        {/* ================================================= */}

        <div className={`border rounded-[30px] overflow-hidden ${
          modoOscuro
            ? "bg-zinc-950 border-zinc-700"
            : "bg-white border-gray-200 shadow-sm"
        }`}>

          <div className={`p-6 md:p-8 border-b ${
            modoOscuro ? "border-zinc-800" : "border-gray-200"
          }`}>

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                {editId ? (
                  <FaEdit />
                ) : (
                  <FaPlus />
                )}
              </div>

              <div>

                <h2 className="text-xl md:text-2xl font-bold">
                  {editId
                    ? "Editar galería"
                    : "Nueva galería"}
                </h2>

                <p className={`text-sm mt-1 ${modoOscuro ? "text-zinc-500" : "text-gray-500"}`}>
                  Clasifica las imágenes antes de publicarlas.
                </p>

              </div>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8 lg:p-10 space-y-10"
          >

            {/* ============================================= */}
            {/* 01 CLASIFICACIÓN */}
            {/* ============================================= */}

            <section>

              <TituloSeccion
                numero="01"
                titulo="Clasificación"
                descripcion="Selecciona dónde aparecerán las fotografías."
              />

              <div className="grid md:grid-cols-2 gap-5 mt-6">

                <Campo
                  titulo="Categoría"
                  icon={<FaLayerGroup />}
                >

                  <select
                    value={categoria}
                    onChange={(e) => {
                      setCategoria(
                        e.target.value
                      );

                      setSubcategoria(
                        ""
                      );
                    }}
                    className={inputClass(modoOscuro)}
                  >

                    {categorias.map(
                      (cat) => (
                        <option
                          key={cat}
                          value={cat}
                        >
                          {cat}
                        </option>
                      )
                    )}

                  </select>

                </Campo>

                <Campo
                  titulo="Subcategoría"
                  icon={<FaTag />}
                >

                  <select
                    value={subcategoria}
                    onChange={(e) =>
                      setSubcategoria(
                        e.target.value
                      )
                    }
                    className={inputClass(modoOscuro)}
                  >

                    <option value="">
                      Selecciona una subcategoría
                    </option>

                    {subcategoriasDisponibles.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}

                  </select>

                </Campo>

              </div>

            </section>

            {/* ============================================= */}
            {/* 02 IMÁGENES */}
            {/* ============================================= */}

            <section className={`border-t pt-9 ${
              modoOscuro ? "border-zinc-800" : "border-gray-200"
            }`}>

              <TituloSeccion
                numero="02"
                titulo="Imágenes"
                descripcion="Puedes agregar hasta 20 fotografías por sección."
              />

              <div className="flex justify-between items-center mt-6 mb-3">

                <p className={modoOscuro ? "text-sm text-zinc-400" : "text-sm text-gray-600"}>
                  Fotografías de la galería
                </p>

                <span className={`border text-xs px-3 py-1.5 rounded-full ${
                  modoOscuro
                    ? "bg-black border-zinc-700 text-zinc-400"
                    : "bg-gray-50 border-gray-300 text-gray-600"
                }`}>
                  {totalImagenesActual}/
                  {MAX_IMAGENES}
                </span>

              </div>

              <label className="block border-2 border-dashed border-yellow-500/40 hover:border-yellow-500 bg-yellow-500/[0.03] hover:bg-yellow-500/[0.06] rounded-3xl p-8 md:p-10 text-center cursor-pointer transition">

                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto">

                  <FaCloudUploadAlt className="text-yellow-500 text-2xl" />

                </div>

                <p className="font-bold mt-4">
                  Seleccionar imágenes
                </p>

                <p className="text-sm text-zinc-500 mt-2">
                  JPG, PNG o WEBP · Máximo {MAX_MB} MB
                </p>

                <p className="text-xs text-zinc-600 mt-1">
                  Puedes seleccionar varias fotografías
                </p>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    seleccionarImagenes(
                      e.target.files
                    );

                    e.target.value =
                      "";
                  }}
                />

              </label>

              {/* EXISTENTES */}

              {imagenesExistentes.length >
                0 && (
                <div className="mt-6">

                  <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
                    Imágenes guardadas
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">

                    {imagenesExistentes.map(
                      (img) => (
                        <ImagenPreview
                          key={img}
                          src={img}
                          etiqueta="GUARDADA"
                          onDelete={() =>
                            quitarImagenExistente(
                              img
                            )
                          }
                        />
                      )
                    )}

                  </div>

                </div>
              )}

              {/* NUEVAS */}

              {previewImagenes.length >
                0 && (
                <div className="mt-6">

                  <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
                    Nuevas imágenes
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">

                    {previewImagenes.map(
                      (preview, index) => (
                        <ImagenPreview
                          key={`${preview.file.name}-${index}`}
                          src={
                            preview.url
                          }
                          etiqueta="NUEVA"
                          onDelete={() =>
                            eliminarNuevaImagen(
                              index
                            )
                          }
                        />
                      )
                    )}

                  </div>

                </div>
              )}

              {/* BOTONES */}

              <div className="flex flex-col sm:flex-row gap-3 mt-8">

                {editId && (
                  <button
                    type="button"
                    onClick={
                      cancelarEdicion
                    }
                    className={`${botonBase(modoOscuro)} border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500`}
                  >
                    <FaTimes />
                    Cancelar
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`${botonBase(modoOscuro)} flex-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500 disabled:opacity-50`}
                >

                  {editId ? (
                    <FaSave />
                  ) : (
                    <FaCloudUploadAlt />
                  )}

                  {loading
                    ? "Guardando..."
                    : editId
                    ? "Guardar cambios"
                    : "Publicar galería"}

                </button>

              </div>

            </section>

          </form>

        </div>

        {/* ================================================= */}
        {/* CATÁLOGO ADMIN */}
        {/* ================================================= */}

        <section className="mt-14">

          <div className="mb-6">

            <p className="text-xs uppercase tracking-[0.25em] text-yellow-500 font-semibold">
              Galería
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mt-2">
              Secciones publicadas
            </h2>

            <p className="text-zinc-500 mt-1">
              {galeriaDB.length}{" "}
              {galeriaDB.length === 1
                ? "sección"
                : "secciones"}
            </p>

          </div>

          {/* BUSCADOR */}

          <div className="flex flex-col md:flex-row gap-4 mb-7">

            <div className="relative flex-1">

              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />

              <input
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
                placeholder="Buscar categoría o subcategoría..."
                className={`${inputClass(modoOscuro)} pl-12 pr-11`}
              />

              {busqueda && (
                <button
                  type="button"
                  onClick={() =>
                    setBusqueda("")
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <FaTimes />
                </button>
              )}

            </div>

            <select
              value={filtroCategoria}
              onChange={(e) =>
                setFiltroCategoria(
                  e.target.value
                )
              }
              className={`${inputClass(modoOscuro)} md:w-[260px]`}
            >

              <option value="Todos">
                Todas las categorías
              </option>

              {categorias.map(
                (cat) => (
                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>
                )
              )}

            </select>

          </div>

          {/* SIN RESULTADOS */}

          {galeriasFiltradas.length ===
            0 && (
            <div className={`border rounded-3xl p-12 text-center ${
              modoOscuro
                ? "border-zinc-700 bg-zinc-950"
                : "border-gray-200 bg-white shadow-sm"
            }`}>

              <FaImages className="text-zinc-700 text-4xl mx-auto" />

              <h3 className="font-bold text-xl mt-5">
                No encontramos galerías
              </h3>

              <p className="text-zinc-500 mt-2">
                Cambia la búsqueda o el filtro.
              </p>

            </div>
          )}

          {/* GRID */}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

            {galeriasFiltradas.map(
              (g) => (
                <GaleriaAdminCard
                  key={g.id}
                  modoOscuro={modoOscuro}
                  galeria={g}
                  editar={() =>
                    handleEdit(g)
                  }
                  eliminar={() =>
                    eliminarGaleria(
                      g
                    )
                  }
                />
              )
            )}

          </div>

        </section>

      </div>

    </div>
  );
}

// ======================================================
// ESTILOS
// ======================================================

const inputClass = (modoOscuro) => `
  w-full
  border
  rounded-2xl
  p-4
  outline-none
  focus:border-yellow-500/70
  focus:ring-2
  focus:ring-yellow-500/10
  transition
  ${
    modoOscuro
      ? "bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
  }
`;

const botonBase = (modoOscuro) => `
  border
  px-5
  py-3.5
  rounded-2xl
  font-semibold
  flex
  items-center
  justify-center
  gap-2
  transition-all
  duration-200
  hover:-translate-y-[1px]
  ${
    modoOscuro
      ? "bg-black"
      : "bg-white"
  }
`;

// ======================================================
// COMPONENTES
// ======================================================

function TituloSeccion({
  numero,
  titulo,
  descripcion,
}) {
  const { modoOscuro } = useOutletContext() || {};
  return (
    <div className="flex gap-4">

      <div className="w-10 h-10 shrink-0 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold">
        {numero}
      </div>

      <div>

        <h3 className="text-xl font-bold">
          {titulo}
        </h3>

        <p className={`text-sm mt-1 ${modoOscuro ? "text-zinc-500" : "text-gray-500"}`}>
          {descripcion}
        </p>

      </div>

    </div>
  );
}

function Campo({
  titulo,
  icon,
  children,
}) {
  const { modoOscuro } = useOutletContext() || {};
  return (
    <div>

      <label className={`text-sm flex items-center gap-2 mb-2 ${modoOscuro ? "text-zinc-400" : "text-gray-600"}`}>

        <span className="text-yellow-500">
          {icon}
        </span>

        {titulo}

      </label>

      {children}

    </div>
  );
}

function ImagenPreview({
  src,
  etiqueta,
  onDelete,
}) {
  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-zinc-700">

      <img
        src={src}
        alt="Vista previa"
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

      <span className="absolute bottom-2 left-2 bg-black/80 border border-yellow-500/30 text-yellow-400 text-[9px] font-bold px-2 py-1 rounded-lg">
        {etiqueta}
      </span>

      <button
        type="button"
        onClick={onDelete}
        className="absolute top-2 right-2 w-9 h-9 rounded-xl bg-black/85 border border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-500/10 flex items-center justify-center transition"
      >
        <FaTrash size={13} />
      </button>

    </div>
  );
}

function GaleriaAdminCard({
  galeria,
  editar,
  eliminar,
  modoOscuro,
}) {
  const imagenes =
    Array.isArray(
      galeria.imagenes
    )
      ? galeria.imagenes
      : [];

  const restantes =
    Math.max(
      imagenes.length - 4,
      0
    );

  return (
    <article
      className={`border hover:border-yellow-500/40 rounded-3xl overflow-hidden transition ${
        modoOscuro
          ? "bg-zinc-950 border-zinc-700"
          : "bg-white border-gray-200 shadow-sm"
      }`}
    >

      {/* MOSAICO */}

      <div className="grid grid-cols-2 gap-1 p-2 bg-black">

        {imagenes
          .slice(0, 4)
          .map((img, index) => (
            <div
              key={img}
              className="relative h-32 overflow-hidden rounded-xl bg-zinc-900"
            >

              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
              />

              {index === 3 &&
                restantes > 0 && (
                  <div className="absolute inset-0 bg-black/65 flex items-center justify-center">

                    <span className="text-2xl font-bold">
                      +{restantes}
                    </span>

                  </div>
                )}

            </div>
          ))}

        {imagenes.length === 0 && (
          <div className="col-span-2 h-64 flex items-center justify-center">

            <FaImage className="text-zinc-700 text-4xl" />

          </div>
        )}

      </div>

      <div className="p-5">

        <p className="text-xs uppercase tracking-wider text-yellow-500">
          {galeria.categoria}
        </p>

        <h3 className="text-xl font-bold mt-2">
          {galeria.subcategoria}
        </h3>

        <p className="text-sm text-zinc-500 mt-2 flex items-center gap-2">

          <FaImages />

          {imagenes.length}{" "}
          {imagenes.length === 1
            ? "imagen"
            : "imágenes"}

        </p>

        <div className="grid grid-cols-2 gap-3 mt-5">

          <button
            type="button"
            onClick={editar}
            className={`${botonBase(modoOscuro)} border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500`}
          >
            <FaEdit />
            Editar
          </button>

          <button
            type="button"
            onClick={eliminar}
            className={`${botonBase(modoOscuro)} border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500`}
          >
            <FaTrash />
            Eliminar
          </button>

        </div>

      </div>

    </article>
  );
}

export default SubirGaleria;