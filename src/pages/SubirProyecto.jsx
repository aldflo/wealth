import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase.config";
import { useNavigate, useOutletContext } from "react-router-dom";

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
  FaFolderOpen,
  FaTrash,
  FaEdit,
  FaSearch,
  FaTimes,
  FaStar,
  FaRegStar,
  FaImages,
  FaBuilding,
  FaMapMarkerAlt,
  FaHome,
  FaTag,
  FaLayerGroup,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaPlus,
  FaImage,
  FaSave,
} from "react-icons/fa";

function SubirProyecto() {
  const navigate = useNavigate();

  const { modoOscuro } = useOutletContext() || {};

  // ======================================================
  // FORMULARIO
  // ======================================================

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [categoria, setCategoria] =
    useState("Construcciones");

  const [tipo, setTipo] =
    useState("Residencial");

  const [ubicacion, setUbicacion] =
    useState("");

  const [destacado, setDestacado] =
    useState(false);

  // ======================================================
  // ARCHIVOS NUEVOS
  // ======================================================

  const [imagenes, setImagenes] =
    useState([]);

  const [galeria, setGaleria] =
    useState([]);

  // ======================================================
  // PREVIEWS NUEVOS
  // ======================================================

  const [previewImagenes, setPreviewImagenes] =
    useState([]);

  const [previewGaleria, setPreviewGaleria] =
    useState([]);

  // ======================================================
  // IMÁGENES YA GUARDADAS
  // ======================================================

  const [
    imagenesExistentes,
    setImagenesExistentes,
  ] = useState([]);

  const [
    galeriaExistente,
    setGaleriaExistente,
  ] = useState([]);

  // ======================================================
  // PROYECTOS
  // ======================================================

  const [proyectos, setProyectos] =
    useState([]);

  const [editId, setEditId] =
    useState(null);

  // ======================================================
  // ESTADOS
  // ======================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  // ======================================================
  // FILTROS
  // ======================================================

  const [busqueda, setBusqueda] =
    useState("");

  const [filtro, setFiltro] =
    useState("Todos");

  // ======================================================
  // CONFIGURACIÓN
  // ======================================================

  const MAX_IMAGENES = 8;
  const MAX_GALERIA = 12;

  const categorias = [
    "Construcciones",
    "Remodelaciones",
    "Herrería",
    "Aluminios y Vidrios",
    "Cancelería",
    "Inmobiliaria",
    "Otros",
  ];

  const tiposObra = [
    "Residencial",
    "Comercial",
    "Industrial",
    "Inmobiliario",
    "Otro",
  ];

  // ======================================================
  // LISTAR PROYECTOS
  // ======================================================

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "proyectos"),

      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
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

        setProyectos(data);
      },

      (error) => {
        console.error(
          "Error cargando proyectos:",
          error
        );
      }
    );

    return () => unsub();
  }, []);

  // ======================================================
  // LIMPIAR OBJECT URL AL DESMONTAR
  // ======================================================

  useEffect(() => {
    return () => {
      previewImagenes.forEach((item) => {
        URL.revokeObjectURL(item.url);
      });

      previewGaleria.forEach((item) => {
        URL.revokeObjectURL(item.url);
      });
    };
  }, []);

  // ======================================================
  // VALIDAR ARCHIVO
  // ======================================================

  const validarArchivo = (file) => {
    if (!file.type.startsWith("image/")) {
      return `"${file.name}" no es una imagen válida.`;
    }

    return null;
  };

  // ======================================================
  // AGREGAR IMÁGENES PRINCIPALES
  // ======================================================

  const handlePreviewImagenes = (files) => {
    setError("");
    setMensaje("");

    const nuevos =
      Array.from(files || []);

    if (nuevos.length === 0) {
      return;
    }

    const total =
      imagenesExistentes.length +
      imagenes.length +
      nuevos.length;

    if (total > MAX_IMAGENES) {
      setError(
        `Puedes tener un máximo de ${MAX_IMAGENES} imágenes principales.`
      );
      return;
    }

    for (const file of nuevos) {
      const problema =
        validarArchivo(file);

      if (problema) {
        setError(problema);
        return;
      }
    }

    const previews = nuevos.map(
      (file) => ({
        file,
        url: URL.createObjectURL(file),
      })
    );

    setImagenes((prev) => [
      ...prev,
      ...nuevos,
    ]);

    setPreviewImagenes((prev) => [
      ...prev,
      ...previews,
    ]);
  };

  // ======================================================
  // AGREGAR GALERÍA
  // ======================================================

  const handlePreviewGaleria = (files) => {
    setError("");
    setMensaje("");

    const nuevos =
      Array.from(files || []);

    if (nuevos.length === 0) {
      return;
    }

    const total =
      galeriaExistente.length +
      galeria.length +
      nuevos.length;

    if (total > MAX_GALERIA) {
      setError(
        `Puedes tener un máximo de ${MAX_GALERIA} imágenes en diseños relacionados.`
      );
      return;
    }

    for (const file of nuevos) {
      const problema =
        validarArchivo(file);

      if (problema) {
        setError(problema);
        return;
      }
    }

    const previews = nuevos.map(
      (file) => ({
        file,
        url: URL.createObjectURL(file),
      })
    );

    setGaleria((prev) => [
      ...prev,
      ...nuevos,
    ]);

    setPreviewGaleria((prev) => [
      ...prev,
      ...previews,
    ]);
  };

  // ======================================================
  // ELIMINAR NUEVA IMAGEN PRINCIPAL
  // ======================================================

  const eliminarNuevaImagen = (index) => {
    const preview =
      previewImagenes[index];

    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    setImagenes((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setPreviewImagenes((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ======================================================
  // ELIMINAR NUEVA GALERÍA
  // ======================================================

  const eliminarNuevaGaleria = (index) => {
    const preview =
      previewGaleria[index];

    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    setGaleria((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setPreviewGaleria((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ======================================================
  // ELIMINAR IMAGEN EXISTENTE
  // ======================================================

  const eliminarImg = (url, tipoImagen) => {
    if (tipoImagen === "main") {
      setImagenesExistentes((prev) =>
        prev.filter((i) => i !== url)
      );
    } else {
      setGaleriaExistente((prev) =>
        prev.filter((i) => i !== url)
      );
    }
  };

  // ======================================================
  // CLOUDINARY
  // ======================================================

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
      let detalle = "";

      try {
        const errorData =
          await res.json();

        detalle =
          errorData?.error?.message ||
          "";
      } catch {
        // Si Cloudinary no devuelve JSON, conservamos el mensaje general.
      }

      throw new Error(
        detalle
          ? `No se pudo subir "${file.name}": ${detalle}`
          : `No se pudo subir "${file.name}".`
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

  // ======================================================
  // LIMPIAR FORMULARIO
  // ======================================================

  const limpiarFormulario = () => {
    previewImagenes.forEach((item) => {
      URL.revokeObjectURL(item.url);
    });

    previewGaleria.forEach((item) => {
      URL.revokeObjectURL(item.url);
    });

    setNombre("");
    setDescripcion("");

    setCategoria(
      "Construcciones"
    );

    setTipo(
      "Residencial"
    );

    setUbicacion("");

    setDestacado(false);

    setImagenes([]);
    setGaleria([]);

    setPreviewImagenes([]);
    setPreviewGaleria([]);

    setImagenesExistentes([]);
    setGaleriaExistente([]);

    setEditId(null);

    setError("");
  };

  // ======================================================
  // CANCELAR EDICIÓN
  // ======================================================

  const cancelarEdicion = () => {
    limpiarFormulario();

    setMensaje(
      "Edición cancelada."
    );
  };

  // ======================================================
  // VALIDAR FORMULARIO
  // ======================================================

  const validarFormulario = () => {
    setError("");

    if (!nombre.trim()) {
      setError(
        "Escribe el nombre del proyecto."
      );

      return false;
    }

    if (
      nombre.trim().length < 3
    ) {
      setError(
        "El nombre del proyecto es demasiado corto."
      );

      return false;
    }

    if (!descripcion.trim()) {
      setError(
        "Escribe una descripción del proyecto."
      );

      return false;
    }

    if (
      descripcion.trim().length < 10
    ) {
      setError(
        "La descripción debe contener al menos 10 caracteres."
      );

      return false;
    }

    const totalImagenes =
      imagenesExistentes.length +
      imagenes.length;

    if (totalImagenes === 0) {
      setError(
        "Agrega al menos una imagen principal del proyecto."
      );

      return false;
    }

    return true;
  };

  // ======================================================
  // CREATE / UPDATE
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");

    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // ================================================
      // SUBIR NUEVAS IMÁGENES
      // ================================================

      const urls =
        imagenes.length > 0
          ? await Promise.all(
              imagenes.map(subirImagen)
            )
          : [];

      const galeriaUrls =
        galeria.length > 0
          ? await Promise.all(
              galeria.map(subirImagen)
            )
          : [];

      // ================================================
      // COMBINAR VIEJAS + NUEVAS
      // ================================================

      const imagenesFinales = [
        ...imagenesExistentes,
        ...urls,
      ];

      const galeriaFinal = [
        ...galeriaExistente,
        ...galeriaUrls,
      ];

      // ================================================
      // DATOS
      // ================================================

      const datos = {
        nombre:
          nombre.trim(),

        descripcion:
          descripcion.trim(),

        categoria,

        tipo,

        ubicacion:
          ubicacion.trim(),

        destacado,

        imagenes:
          imagenesFinales,

        // Primera imagen = portada
        imagen:
          imagenesFinales[0] ||
          "",

        galeria:
          galeriaFinal,

        fechaActualizacion:
          serverTimestamp(),
      };

      // ================================================
      // EDITAR
      // ================================================

      if (editId) {
        await updateDoc(
          doc(
            db,
            "proyectos",
            editId
          ),
          datos
        );

        setMensaje(
          "✅ Proyecto actualizado correctamente."
        );
      }

      // ================================================
      // NUEVO
      // ================================================

      else {
        await addDoc(
          collection(
            db,
            "proyectos"
          ),
          {
            ...datos,

            fecha:
              serverTimestamp(),
          }
        );

        setMensaje(
          "✅ Proyecto publicado correctamente."
        );
      }

      limpiarFormulario();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Error guardando proyecto:",
        error
      );

      setError(
        error.message ||
          "No se pudo guardar el proyecto."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // EDITAR
  // ======================================================

  const handleEdit = (p) => {
    setMensaje("");
    setError("");

    setEditId(p.id);

    setNombre(
      p.nombre || ""
    );

    setDescripcion(
      p.descripcion || ""
    );

    setCategoria(
      p.categoria ||
        "Construcciones"
    );

    setTipo(
      p.tipo ||
        "Residencial"
    );

    setUbicacion(
      p.ubicacion || ""
    );

    setDestacado(
      Boolean(p.destacado)
    );

    setImagenesExistentes(
      Array.isArray(p.imagenes)
        ? p.imagenes
        : p.imagen
        ? [p.imagen]
        : []
    );

    setGaleriaExistente(
      Array.isArray(p.galeria)
        ? p.galeria
        : []
    );

    setImagenes([]);
    setGaleria([]);

    setPreviewImagenes([]);
    setPreviewGaleria([]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================================
  // ELIMINAR PROYECTO
  // ======================================================

  const handleDelete = async (id) => {
    const proyecto =
      proyectos.find(
        (p) => p.id === id
      );

    const ok =
      window.confirm(
        `¿Eliminar "${
          proyecto?.nombre ||
          "este proyecto"
        }" definitivamente?`
      );

    if (!ok) return;

    try {
      await deleteDoc(
        doc(
          db,
          "proyectos",
          id
        )
      );

      if (editId === id) {
        limpiarFormulario();
      }
    } catch (error) {
      console.error(
        "Error eliminando proyecto:",
        error
      );

      setError(
        "No se pudo eliminar el proyecto."
      );
    }
  };

  // ======================================================
  // FILTRAR PROYECTOS
  // ======================================================

  const proyectosFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return proyectos.filter(
        (p) => {
          const contenido = [
            p.nombre,
            p.descripcion,
            p.categoria,
            p.tipo,
            p.ubicacion,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const coincideBusqueda =
            !texto ||
            contenido.includes(
              texto
            );

          const coincideCategoria =
            filtro === "Todos" ||
            p.categoria === filtro;

          return (
            coincideBusqueda &&
            coincideCategoria
          );
        }
      );
    }, [
      proyectos,
      busqueda,
      filtro,
    ]);

  // ======================================================
  // CONTADORES
  // ======================================================

  const totalPrincipales =
    imagenesExistentes.length +
    imagenes.length;

  const totalGaleria =
    galeriaExistente.length +
    galeria.length;

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 py-8 md:py-12 transition-colors duration-300 ${
        modoOscuro
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-9">

          <div className="flex items-center gap-4">

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-yellow-500/10
                border
                border-yellow-500/20
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <FaFolderOpen className="text-yellow-500 text-2xl" />
            </div>

            <div>

              <p className="text-xs uppercase tracking-[0.25em] text-yellow-500 font-semibold">
                Administración
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mt-1">
                Panel de Proyectos
              </h1>

              <p className="text-zinc-500 mt-1">
                Administra el catálogo público de Wealth.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/proyectos")
            }
            className={`${botonBase(modoOscuro)} ${modoOscuro ? "border-zinc-600 text-zinc-300" : "border-gray-300 text-gray-700"} hover:border-yellow-500/60 hover:text-yellow-500`}
          >
            <FaBuilding />

            Ver proyectos

            <FaArrowRight />
          </button>

        </div>

        {/* ================================================= */}
        {/* MENSAJES */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 bg-red-500/5 border border-red-500/30 text-red-300 px-5 py-4 rounded-2xl flex items-start gap-3">

            <FaExclamationTriangle className="mt-1 shrink-0" />

            <span>
              {error}
            </span>

          </div>
        )}

        {mensaje && (
          <div className="mb-6 bg-green-500/5 border border-green-500/30 text-green-300 px-5 py-4 rounded-2xl flex items-start gap-3">

            <FaCheckCircle className="mt-1 shrink-0" />

            <span>
              {mensaje}
            </span>

          </div>
        )}

        {/* ================================================= */}
        {/* EDITANDO */}
        {/* ================================================= */}

        {editId && (
          <div className="mb-6 bg-blue-500/5 border border-blue-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <FaEdit className="text-blue-400" />

              <div>

                <p className={modoOscuro ? "font-bold text-white" : "font-bold text-gray-900"}>
                  Editando proyecto
                </p>

                <p className="text-sm text-zinc-400">
                  {nombre}
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={
                cancelarEdicion
              }
              className={`${botonBase(modoOscuro)} border-zinc-600 text-zinc-300 hover:border-red-500/50 hover:text-red-400`}
            >
              <FaTimes />

              Cancelar edición
            </button>

          </div>
        )}

        {/* ================================================= */}
        {/* FORMULARIO */}
        {/* ================================================= */}

        <div
          className={`
            border
            rounded-[30px]
            overflow-hidden
            shadow-2xl
            ${
              modoOscuro
                ? "bg-zinc-950 border-zinc-700"
                : "bg-white border-gray-200 shadow-gray-200/70"
            }
          `}
        >

          {/* CABECERA FORMULARIO */}

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
                    ? "Editar proyecto"
                    : "Nuevo proyecto"}
                </h2>

                <p className={`text-sm mt-1 ${modoOscuro ? "text-zinc-500" : "text-gray-500"}`}>
                  Completa la información que aparecerá en el catálogo.
                </p>

              </div>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8 lg:p-10 space-y-10"
          >

            {/* ================================================= */}
            {/* INFORMACIÓN */}
            {/* ================================================= */}

            <section>

              <TituloSeccion
                numero="01"
                titulo="Información del proyecto"
                descripcion="Datos principales que verá el cliente."
              />

              <div className="space-y-5 mt-6">

                {/* NOMBRE */}

                <Campo
                  titulo="Nombre del proyecto"
                  icon={<FaBuilding />}
                >
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) =>
                      setNombre(
                        e.target.value
                      )
                    }
                    maxLength={120}
                    placeholder="Ej: Fachada residencial con herrería moderna"
                    className={inputClass(modoOscuro)}
                  />

                  <ContadorTexto
                    actual={
                      nombre.length
                    }
                    max={120}
                  />
                </Campo>

                {/* CATEGORIA + TIPO */}

                <div className="grid md:grid-cols-2 gap-5">

                  <Campo
                    titulo="Categoría"
                    icon={<FaTag />}
                  >
                    <select
                      value={categoria}
                      onChange={(e) =>
                        setCategoria(
                          e.target.value
                        )
                      }
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
                    titulo="Tipo de obra"
                    icon={<FaHome />}
                  >
                    <select
                      value={tipo}
                      onChange={(e) =>
                        setTipo(
                          e.target.value
                        )
                      }
                      className={inputClass(modoOscuro)}
                    >
                      {tiposObra.map(
                        (tipoObra) => (
                          <option
                            key={
                              tipoObra
                            }
                            value={
                              tipoObra
                            }
                          >
                            {tipoObra}
                          </option>
                        )
                      )}
                    </select>
                  </Campo>

                </div>

                {/* UBICACIÓN */}

                <Campo
                  titulo="Ubicación del proyecto"
                  icon={
                    <FaMapMarkerAlt />
                  }
                  opcional
                >
                  <input
                    type="text"
                    value={ubicacion}
                    onChange={(e) =>
                      setUbicacion(
                        e.target.value
                      )
                    }
                    placeholder="Ej: San Francisco de Campeche, Campeche"
                    className={inputClass(modoOscuro)}
                  />
                </Campo>

                {/* DESCRIPCIÓN */}

                <Campo
                  titulo="Descripción"
                  icon={
                    <FaLayerGroup />
                  }
                >
                  <textarea
                    rows={6}
                    value={descripcion}
                    onChange={(e) =>
                      setDescripcion(
                        e.target.value
                      )
                    }
                    maxLength={1200}
                    placeholder="Describe el trabajo realizado, materiales, acabados, características principales..."
                    className={inputClass(modoOscuro)}
                  />

                  <ContadorTexto
                    actual={
                      descripcion.length
                    }
                    max={1200}
                  />
                </Campo>

              </div>

            </section>

            {/* ================================================= */}
            {/* MULTIMEDIA */}
            {/* ================================================= */}

            <section className={`border-t pt-9 ${
              modoOscuro ? "border-zinc-800" : "border-gray-200"
            }`}>

              <TituloSeccion
                numero="02"
                titulo="Multimedia"
                descripcion="Agrega fotografías principales y diseños relacionados."
              />

              {/* ================================================= */}
              {/* PRINCIPALES */}
              {/* ================================================= */}

              <div className="mt-6">

                <div className="flex flex-wrap justify-between items-end gap-3 mb-3">

                  <div>

                    <p className="font-semibold flex items-center gap-2">
                      <FaImage className="text-yellow-500" />
                      Imágenes principales
                    </p>

                    <p className="text-xs text-zinc-500 mt-1">
                      La primera imagen será utilizada como portada.
                    </p>

                  </div>

                  <span className={`text-xs border px-3 py-1.5 rounded-full ${
                    modoOscuro
                      ? "bg-black border-zinc-700 text-zinc-400"
                      : "bg-gray-50 border-gray-300 text-gray-600"
                  }`}>
                    {totalPrincipales}/{MAX_IMAGENES}
                  </span>

                </div>

                <label
                  className="
                    block
                    border-2
                    border-dashed
                    border-yellow-500/40
                    hover:border-yellow-500
                    bg-yellow-500/[0.03]
                    hover:bg-yellow-500/[0.06]
                    rounded-3xl
                    p-8
                    md:p-10
                    text-center
                    cursor-pointer
                    transition-all
                  "
                >

                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto">

                    <FaCloudUploadAlt className="text-yellow-500 text-2xl" />

                  </div>

                  <p className={`font-bold mt-4 ${modoOscuro ? "text-white" : "text-gray-900"}`}>
                    Agregar imágenes del proyecto
                  </p>

                  <p className="text-sm text-zinc-500 mt-2">
                    JPG, PNG o WEBP · Se permiten fotografías de alta resolución
                  </p>

                  <p className="text-xs text-zinc-600 mt-1">
                    Hasta {MAX_IMAGENES} imágenes
                  </p>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handlePreviewImagenes(
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
                  <div className="mt-5">

                    <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
                      Imágenes guardadas
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

                      {imagenesExistentes.map(
                        (img, i) => (
                          <ImagenPreview
                            key={img}
                            src={img}
                            etiqueta={
                              i === 0
                                ? "PORTADA"
                                : "GUARDADA"
                            }
                            color="yellow"
                            onDelete={() =>
                              eliminarImg(
                                img,
                                "main"
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
                  <div className="mt-5">

                    <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
                      Nuevas imágenes
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

                      {previewImagenes.map(
                        (item, i) => (
                          <ImagenPreview
                            key={`${item.file.name}-${i}`}
                            src={
                              item.url
                            }
                            etiqueta="NUEVA"
                            color="yellow"
                            onDelete={() =>
                              eliminarNuevaImagen(
                                i
                              )
                            }
                          />
                        )
                      )}

                    </div>

                  </div>
                )}

              </div>

              {/* ================================================= */}
              {/* GALERÍA RELACIONADA */}
              {/* ================================================= */}

              <div className="mt-8">

                <div className="flex flex-wrap justify-between items-end gap-3 mb-3">

                  <div>

                    <p className="font-semibold flex items-center gap-2">
                      <FaImages className="text-blue-400" />
                      Diseños relacionados
                    </p>

                    <p className="text-xs text-zinc-500 mt-1">
                      Renders, planos, variantes o imágenes adicionales.
                    </p>

                  </div>

                  <span className={`text-xs border px-3 py-1.5 rounded-full ${
                    modoOscuro
                      ? "bg-black border-zinc-700 text-zinc-400"
                      : "bg-gray-50 border-gray-300 text-gray-600"
                  }`}>
                    {totalGaleria}/{MAX_GALERIA}
                  </span>

                </div>

                <label
                  className="
                    block
                    border-2
                    border-dashed
                    border-blue-500/40
                    hover:border-blue-500
                    bg-blue-500/[0.03]
                    hover:bg-blue-500/[0.06]
                    rounded-3xl
                    p-8
                    md:p-10
                    text-center
                    cursor-pointer
                    transition-all
                  "
                >

                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">

                    <FaImages className="text-blue-400 text-2xl" />

                  </div>

                  <p className={`font-bold mt-4 ${modoOscuro ? "text-white" : "text-gray-900"}`}>
                    Agregar diseños relacionados
                  </p>

                  <p className="text-sm text-zinc-500 mt-2">
                    JPG, PNG o WEBP · Se permiten fotografías de alta resolución
                  </p>

                  <p className="text-xs text-zinc-600 mt-1">
                    Hasta {MAX_GALERIA} imágenes
                  </p>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handlePreviewGaleria(
                        e.target.files
                      );

                      e.target.value =
                        "";
                    }}
                  />

                </label>

                {/* EXISTENTES */}

                {galeriaExistente.length >
                  0 && (
                  <div className="mt-5">

                    <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
                      Diseños guardados
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

                      {galeriaExistente.map(
                        (img) => (
                          <ImagenPreview
                            key={img}
                            src={img}
                            etiqueta="GUARDADA"
                            color="blue"
                            onDelete={() =>
                              eliminarImg(
                                img,
                                "galeria"
                              )
                            }
                          />
                        )
                      )}

                    </div>

                  </div>
                )}

                {/* NUEVAS */}

                {previewGaleria.length >
                  0 && (
                  <div className="mt-5">

                    <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
                      Nuevos diseños
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

                      {previewGaleria.map(
                        (item, i) => (
                          <ImagenPreview
                            key={`${item.file.name}-${i}`}
                            src={
                              item.url
                            }
                            etiqueta="NUEVA"
                            color="blue"
                            onDelete={() =>
                              eliminarNuevaGaleria(
                                i
                              )
                            }
                          />
                        )
                      )}

                    </div>

                  </div>
                )}

              </div>

            </section>

            {/* ================================================= */}
            {/* PUBLICACIÓN */}
            {/* ================================================= */}

            <section className={`border-t pt-9 ${
              modoOscuro ? "border-zinc-800" : "border-gray-200"
            }`}>

              <TituloSeccion
                numero="03"
                titulo="Publicación"
                descripcion="Configura cómo aparecerá el proyecto en el catálogo."
              />

              {/* DESTACADO */}

              <button
                type="button"
                onClick={() =>
                  setDestacado(
                    (prev) => !prev
                  )
                }
                className={`
                  w-full
                  mt-6
                  rounded-2xl
                  border
                  p-5
                  text-left
                  flex
                  items-center
                  justify-between
                  gap-4
                  transition-all
                  ${
                    destacado
                      ? "bg-yellow-500/5 border-yellow-500/50"
                      : modoOscuro
                      ? "bg-black border-zinc-700 hover:border-zinc-500"
                      : "bg-gray-50 border-gray-300 hover:border-gray-400"
                  }
                `}
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`
                      w-11
                      h-11
                      rounded-xl
                      border
                      flex
                      items-center
                      justify-center
                      ${
                        destacado
                          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                          : "bg-zinc-900 border-zinc-700 text-zinc-500"
                      }
                    `}
                  >

                    {destacado ? (
                      <FaStar />
                    ) : (
                      <FaRegStar />
                    )}

                  </div>

                  <div>

                    <p className="font-bold">
                      Proyecto destacado
                    </p>

                    <p className={`text-sm mt-1 ${modoOscuro ? "text-zinc-500" : "text-gray-500"}`}>
                      Los proyectos destacados tendrán mayor presencia visual en el catálogo.
                    </p>

                  </div>

                </div>

                <div
                  className={`
                    relative
                    w-12
                    h-7
                    rounded-full
                    transition
                    ${
                      destacado
                        ? "bg-yellow-500"
                        : "bg-zinc-700"
                    }
                  `}
                >

                  <div
                    className={`
                      absolute
                      top-1
                      w-5
                      h-5
                      rounded-full
                      bg-white
                      transition-all
                      ${
                        destacado
                          ? "left-6"
                          : "left-1"
                      }
                    `}
                  />

                </div>

              </button>

              {/* BOTONES */}

              <div className="flex flex-col sm:flex-row gap-3 mt-7">

                {editId && (
                  <button
                    type="button"
                    onClick={
                      cancelarEdicion
                    }
                    disabled={loading}
                    className={`${botonBase(modoOscuro)} sm:w-auto border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 disabled:opacity-50`}
                  >
                    <FaTimes />

                    Cancelar
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    ${botonBase(modoOscuro)}
                    flex-1
                    border-yellow-500/50
                    text-yellow-400
                    hover:bg-yellow-500/10
                    hover:border-yellow-500
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  `}
                >

                  {editId ? (
                    <FaSave />
                  ) : (
                    <FaCloudUploadAlt />
                  )}

                  {loading
                    ? editId
                      ? "Actualizando proyecto..."
                      : "Publicando proyecto..."
                    : editId
                    ? "Guardar cambios"
                    : "Publicar proyecto"}

                </button>

              </div>

            </section>

          </form>

        </div>

        {/* ================================================= */}
        {/* PROYECTOS PUBLICADOS */}
        {/* ================================================= */}

        <section className="mt-14">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">

            <div>

              <p className="text-xs uppercase tracking-[0.25em] text-yellow-500 font-semibold">
                Catálogo
              </p>

              <h2 className="text-2xl md:text-3xl font-bold mt-2">
                Proyectos publicados
              </h2>

              <p className="text-zinc-500 mt-1">
                {proyectos.length}{" "}
                {proyectos.length === 1
                  ? "proyecto publicado"
                  : "proyectos publicados"}
              </p>

            </div>

          </div>

          {/* ================================================= */}
          {/* BUSCADOR + FILTRO */}
          {/* ================================================= */}

          <div className="flex flex-col md:flex-row gap-4 mb-7">

            <div className="relative flex-1">

              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />

              <input
                type="text"
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
                placeholder="Buscar proyecto, ubicación, categoría..."
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
              value={filtro}
              onChange={(e) =>
                setFiltro(
                  e.target.value
                )
              }
              className={`${inputClass(modoOscuro)} md:w-[240px]`}
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

          {/* RESULTADOS */}

          <p className="text-sm text-zinc-500 mb-5">
            Mostrando{" "}
            <span className="text-white font-medium">
              {
                proyectosFiltrados.length
              }
            </span>{" "}
            {proyectosFiltrados.length === 1
              ? "proyecto"
              : "proyectos"}
          </p>

          {/* SIN RESULTADOS */}

          {proyectosFiltrados.length ===
            0 && (
            <div className={`border rounded-3xl p-12 text-center ${
              modoOscuro
                ? "bg-zinc-950 border-zinc-700"
                : "bg-white border-gray-200 shadow-sm"
            }`}>

              <FaSearch className="text-zinc-700 text-4xl mx-auto" />

              <h3 className="text-xl font-bold mt-5">
                No encontramos proyectos
              </h3>

              <p className="text-zinc-500 mt-2">
                Prueba otra búsqueda o cambia la categoría.
              </p>

              <button
                type="button"
                onClick={() => {
                  setBusqueda("");
                  setFiltro(
                    "Todos"
                  );
                }}
                className={`${botonBase(modoOscuro)} mx-auto mt-5 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500`}
              >
                Ver todos
              </button>

            </div>
          )}

          {/* ================================================= */}
          {/* GRID */}
          {/* ================================================= */}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

            {proyectosFiltrados.map(
              (p) => (
                <article
                  key={p.id}
                  className={`
                    group
                    border
                    rounded-3xl
                    overflow-hidden
                    hover:border-yellow-500/50
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    shadow-xl
                    ${
                      modoOscuro
                        ? "bg-zinc-950 border-zinc-700"
                        : "bg-white border-gray-200 shadow-gray-200/70"
                    }
                  `}
                >

                  {/* IMAGEN */}

                  <div className="relative h-64 bg-zinc-900 overflow-hidden">

                    {p.imagen ? (
                      <img
                        src={
                          p.imagen
                        }
                        alt={
                          p.nombre
                        }
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <FaImage size={40} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 pointer-events-none" />

                    {/* ETIQUETAS */}

                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">

                      <span className="bg-black/80 backdrop-blur border border-white/10 px-3 py-1.5 text-xs rounded-full">
                        {p.categoria ||
                          "Proyecto"}
                      </span>

                      {p.destacado && (
                        <span className="bg-yellow-500 text-black px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1">
                          <FaStar />
                          Destacado
                        </span>
                      )}

                    </div>

                    {/* TOTAL IMÁGENES */}

                    {Array.isArray(
                      p.imagenes
                    ) &&
                      p.imagenes.length >
                        1 && (
                        <span className="absolute bottom-4 right-4 bg-black/80 border border-white/10 px-3 py-1.5 rounded-full text-xs flex items-center gap-2">

                          <FaImages />

                          {
                            p.imagenes.length
                          }

                        </span>
                      )}

                  </div>

                  {/* INFORMACIÓN */}

                  <div className="p-6">

                    <div className="flex flex-wrap items-center gap-2 text-xs">

                      {p.tipo && (
                        <span className="text-yellow-500 uppercase tracking-wider">
                          {p.tipo}
                        </span>
                      )}

                      {p.ubicacion && (
                        <>
                          <span className="text-zinc-700">
                            •
                          </span>

                          <span className="text-zinc-500 flex items-center gap-1">
                            <FaMapMarkerAlt />
                            {p.ubicacion}
                          </span>
                        </>
                      )}

                    </div>

                    <h3 className="text-xl font-bold mt-3">
                      {p.nombre}
                    </h3>

                    <p className="text-zinc-400 text-sm line-clamp-3 mt-3 min-h-[63px]">
                      {p.descripcion}
                    </p>

                    {/* BOTONES MODERNOS */}

                    <div className="grid grid-cols-2 gap-3 mt-6">

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(p)
                        }
                        className={`${botonBase(modoOscuro)} border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500`}
                      >
                        <FaEdit />

                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            p.id
                          )
                        }
                        className={`${botonBase(modoOscuro)} border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500`}
                      >
                        <FaTrash />

                        Eliminar
                      </button>

                    </div>

                  </div>

                </article>
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
  active:translate-y-0
  ${
    modoOscuro ? "bg-black" : "bg-white"
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
    <div className="flex items-start gap-4">

      <div className="shrink-0 w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 text-xs font-bold">
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
  opcional = false,
}) {
  const { modoOscuro } = useOutletContext() || {};
  return (
    <div>

      <label className={`flex items-center gap-2 text-sm mb-2 ${modoOscuro ? "text-zinc-400" : "text-gray-600"}`}>

        <span className="text-yellow-500">
          {icon}
        </span>

        {titulo}

        {opcional && (
          <span className={`text-xs ${modoOscuro ? "text-zinc-600" : "text-gray-400"}`}>
            (opcional)
          </span>
        )}

      </label>

      {children}

    </div>
  );
}

function ContadorTexto({
  actual,
  max,
}) {
  const { modoOscuro } = useOutletContext() || {};
  return (
    <div className="text-right mt-2">
      <span className={`text-xs ${modoOscuro ? "text-zinc-600" : "text-gray-400"}`}>
        {actual}/{max}
      </span>
    </div>
  );
}

function ImagenPreview({
  src,
  etiqueta,
  onDelete,
  color = "yellow",
}) {
  const etiquetaClass =
    color === "blue"
      ? "text-blue-300 border-blue-500/30"
      : "text-yellow-400 border-yellow-500/30";

  return (
    <div
      className="
        relative
        aspect-square
        bg-black
        rounded-2xl
        overflow-hidden
        border
        border-zinc-700
        group
      "
    >

      <img
        src={src}
        alt="Vista previa"
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      <span
        className={`
          absolute
          bottom-2
          left-2
          bg-black/80
          backdrop-blur
          border
          px-2
          py-1
          rounded-lg
          text-[9px]
          font-bold
          ${etiquetaClass}
        `}
      >
        {etiqueta}
      </span>

      <button
        type="button"
        onClick={onDelete}
        aria-label="Eliminar imagen"
        className="
          absolute
          top-2
          right-2
          w-9
          h-9
          rounded-xl
          bg-black/80
          backdrop-blur
          border
          border-red-500/30
          text-red-400
          hover:bg-red-500/20
          hover:border-red-500
          flex
          items-center
          justify-center
          transition
        "
      >
        <FaTrash size={13} />
      </button>

    </div>
  );
}

export default SubirProyecto;