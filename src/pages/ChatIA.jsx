import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import SuggestedQuestions from "./SuggestedQuestions";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";
import ChatHistory from "./ChatHistory";

import {
  auth,
  db,
} from "../firebase.config";

/* =========================================
   CONFIGURACIÓN
========================================= */

const API_URL =
  "/.netlify/functions/chat";

const IA_TIMEOUT = 20000;
const RESULTADOS_POR_BLOQUE = 3;

/* =========================================
   UTILIDADES
========================================= */

const normalizarTexto = (texto = "") => {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const normalizarCategoriaGaleria = (
  categoria = ""
) => {
  if (categoria === "Vidrio y Aluminio") {
    return "Aluminios y Vidrios";
  }

  return categoria;
};

/* =========================================
   DATOS FIRESTORE
========================================= */

const getEmpresaInfo = async () => {
  try {
    const snapshot = await getDoc(
      doc(db, "empresa", "informacion")
    );

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("❌ EMPRESA:", error);
    return null;
  }
};

const getFAQ = async () => {
  try {
    const snapshot = await getDocs(
      collection(db, "faq")
    );

    return snapshot.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));
  } catch (error) {
    console.warn("⚠️ FAQ:", error);
    return [];
  }
};

const getTodosProyectos = async () => {
  try {
    const snapshot = await getDocs(
      collection(db, "proyectos")
    );

    return snapshot.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));
  } catch (error) {
    console.error("❌ PROYECTOS:", error);
    return [];
  }
};

const getTodaGaleria = async () => {
  try {
    const snapshot = await getDocs(
      collection(db, "galeria")
    );

    return snapshot.docs.map((documento) => {
      const datos = documento.data();

      return {
        id: documento.id,
        ...datos,
        categoria:
          normalizarCategoriaGaleria(
            datos.categoria
          ),
      };
    });
  } catch (error) {
    console.error("❌ GALERÍA:", error);
    return [];
  }
};

/* =========================================
   RESPUESTAS RÁPIDAS EMPRESA
========================================= */

const getRespuestaEmpresa = (
  texto,
  empresa
) => {
  if (!empresa) {
    return null;
  }

  const t = normalizarTexto(texto);

  if (
    t.includes("ubicacion") ||
    t.includes("direccion") ||
    t.includes("donde estan") ||
    t.includes("donde se encuentran") ||
    t.includes("donde quedan") ||
    t.includes("como llego") ||
    t.includes("ubicados")
  ) {
    const direccion = empresa.direccion || "";
    const ciudad = empresa.ciudad || "";

    return {
      content:
        direccion && ciudad
          ? `Estamos ubicados en ${direccion}, ${ciudad}.`
          : direccion
          ? `Estamos ubicados en ${direccion}.`
          : "No tengo una dirección confirmada disponible en este momento.",
      actions: [
        {
          type: "contacto",
          label: "💬 Contacto",
        },
        {
          type: "cotizar",
          label: "📋 Crear cotización",
        },
      ],
    };
  }

  if (
    t.includes("contacto") ||
    t.includes("telefono") ||
    t.includes("numero") ||
    t.includes("whatsapp") ||
    t.includes("whatsap") ||
    t.includes("watsapp") ||
    t.includes("llamar")
  ) {
    return {
      content: empresa.contacto
        ? `Puedes comunicarte con Grupo Empresarial Wealth al ${empresa.contacto}.`
        : "No tengo un número de contacto confirmado disponible en este momento.",
      actions: [
        {
          type: "cotizar",
          label: "📋 Solicitar cotización",
        },
      ],
    };
  }

  if (
    t.includes("correo") ||
    t.includes("email") ||
    t.includes("mail")
  ) {
    return {
      content: empresa.correo
        ? `Nuestro correo de contacto es ${empresa.correo}.`
        : "No tengo un correo confirmado disponible en este momento.",
    };
  }

  if (
    t.includes("horario") ||
    t.includes("horarios") ||
    t.includes("cuando abren") ||
    t.includes("cuando cierran") ||
    t.includes("a que hora")
  ) {
    return {
      content: empresa.horarios
        ? `Nuestro horario de atención es ${empresa.horarios}.`
        : "No tengo un horario confirmado disponible en este momento.",
    };
  }

  return null;
};

/* =========================================
   CORTESÍA
========================================= */

const detectarCortesia = (texto) => {
  const t = normalizarTexto(texto);

  if (
    t === "hola" ||
    t === "hola hola" ||
    t === "buenas" ||
    t === "que tal" ||
    t.includes("buenos dias") ||
    t.includes("buenas tardes") ||
    t.includes("buenas noches")
  ) {
    return {
      content:
        "¡Hola! 👋 Soy WEALTH IA. Puedo ayudarte con Construcción, Inmobiliaria, Aluminios y Vidrios, mostrarte proyectos publicados o enseñarte referencias de nuestra galería.",
      actions: [
        {
          type: "mostrar-proyectos-general",
          label: "🏢 Ver proyectos",
        },
        {
          type: "mostrar-galeria-general",
          label: "🖼️ Ver galería",
        },
        {
          type: "cotizar",
          label: "📋 Crear cotización",
        },
      ],
    };
  }

  if (
    t.includes("gracias") ||
    t.includes("muchas gracias") ||
    t.includes("te agradezco")
  ) {
    return {
      content:
        "¡Con gusto! 😊 Si quieres, puedo mostrarte más proyectos, más imágenes o ayudarte con una cotización.",
    };
  }

  if (
    t === "ok" ||
    t === "okay" ||
    t === "vale" ||
    t === "perfecto" ||
    t === "entendido" ||
    t === "muy bien" ||
    t === "esta bien"
  ) {
    return {
      content:
        "Perfecto 👍. Cuando quieras seguimos.",
    };
  }

  if (
    t === "adios" ||
    t.includes("hasta luego") ||
    t.includes("nos vemos") ||
    t.includes("hasta pronto")
  ) {
    return {
      content:
        "¡Hasta pronto! 👋 Gracias por comunicarte con Grupo Empresarial Wealth.",
    };
  }

  return null;
};

/* =========================================
   CONCEPTOS
========================================= */

const CONCEPTOS = {
  construccion: [
    "construccion",
    "construcciones",
    "construir",
    "obra",
    "obras",
    "obra civil",
    "edificacion",
    "edificar",
    "infraestructura",
    "ampliacion",
    "ampliaciones",
    "ampliar",
  ],
  remodelacion: [
    "remodelacion",
    "remodelar",
    "remodelaciones",
  ],
  inmobiliaria: [
    "inmobiliaria",
    "inmobiliario",
    "bienes raices",
    "inmueble",
    "inmuebles",
    "propiedad",
    "propiedades",
  ],
  terreno: [
    "terreno",
    "terrenos",
    "lote",
    "lotes",
    "predio",
    "predios",
  ],
  casa: [
    "casa",
    "casas",
    "vivienda",
    "viviendas",
    "residencia",
    "residencial",
  ],
  departamento: [
    "departamento",
    "departamentos",
    "depa",
  ],
  venta: [
    "venta",
    "vender",
    "comprar",
    "compra",
  ],
  renta: [
    "renta",
    "rentar",
    "alquiler",
    "alquilar",
  ],
  aluminio: [
    "aluminio",
    "aluminios",
  ],
  vidrio: [
    "vidrio",
    "vidrios",
    "cristal",
    "cristales",
    "acristalado",
    "acristalamiento",
  ],
  templado: [
    "templado",
    "vidrio templado",
    "cristal templado",
  ],
  herreria: [
    "herreria",
    "metalico",
    "metalica",
    "metal",
    "acero",
  ],
  puerta: [
    "puerta",
    "puertas",
    "puerta corrediza",
    "puerta abatible",
  ],
  ventana: [
    "ventana",
    "ventanas",
    "ventanal",
    "ventanales",
    "ventana corrediza",
    "ventana fija",
  ],
  cancel: [
    "cancel",
    "canceles",
    "mampara",
    "mamparas",
  ],
  bano: [
    "bano",
    "banos",
    "regadera",
    "regaderas",
    "ducha",
  ],
  porton: [
    "porton",
    "portones",
  ],
  fachada: [
    "fachada",
    "fachadas",
  ],
  espejo: [
    "espejo",
    "espejos",
  ],
  escalera: [
    "escalera",
    "escaleras",
    "caracol",
  ],
  techo: [
    "techo",
    "techos",
    "techumbre",
    "techumbres",
  ],
  estructura: [
    "estructura",
    "estructuras",
  ],
  cocina: [
    "cocina",
    "cocinas",
  ],
  barandal: [
    "barandal",
    "barandales",
    "baranda",
    "barandas",
  ],
  domo: ["domo", "domos"],
  division: [
    "division",
    "divisiones",
    "divisor",
  ],
  mosquitero: [
    "mosquitero",
    "mosquiteros",
  ],
  local: [
    "local",
    "locales",
    "local comercial",
    "locales comerciales",
  ],
  oficina: [
    "oficina",
    "oficinas",
  ],
};

const detectarConceptos = (texto) => {
  const t = normalizarTexto(texto);
  const detectados = [];

  Object.entries(CONCEPTOS).forEach(
    ([concepto, palabras]) => {
      const encontrado = palabras.some(
        (palabra) =>
          t.includes(
            normalizarTexto(palabra)
          )
      );

      if (encontrado) {
        detectados.push(concepto);
      }
    }
  );

  return [...new Set(detectados)];
};

const detectarAreaProyecto = (texto) => {
  const conceptos = detectarConceptos(texto);

  if (
    conceptos.some((c) =>
      [
        "construccion",
        "remodelacion",
        "fachada",
        "escalera",
        "techo",
        "estructura",
        "cocina",
        "local",
        "oficina",
      ].includes(c)
    )
  ) {
    return "construccion";
  }

  if (
    conceptos.some((c) =>
      [
        "inmobiliaria",
        "terreno",
        "casa",
        "departamento",
        "venta",
        "renta",
      ].includes(c)
    )
  ) {
    return "inmobiliaria";
  }

  if (
    conceptos.some((c) =>
      [
        "aluminio",
        "vidrio",
        "templado",
        "herreria",
        "puerta",
        "ventana",
        "cancel",
        "bano",
        "porton",
        "espejo",
        "barandal",
        "domo",
        "division",
        "mosquitero",
      ].includes(c)
    )
  ) {
    return "aluminios";
  }

  return null;
};

const esConsultaServicio = (texto) => {
  return detectarConceptos(texto).length > 0;
};

/* =========================================
   INTENCIONES
========================================= */

const esPreguntaServicios = (texto) => {
  const t = normalizarTexto(texto);

  return (
    t.includes("que servicios") ||
    t.includes("cuales servicios") ||
    t.includes("servicios ofrecen") ||
    t.includes("servicios manejan") ||
    t.includes("que areas manejan") ||
    t.includes("cuales areas") ||
    t.includes("a que se dedican") ||
    t.includes("que hacen ustedes") ||
    t.includes("que hace wealth") ||
    t.includes("que trabajos realizan") ||
    t.includes("que trabajos hacen")
  );
};

const esIntencionMostrar = (texto) => {
  const t = normalizarTexto(texto);

  return (
    t.includes("muestrame") ||
    t.includes("muestra") ||
    t.includes("ensenarme") ||
    t.includes("ensena") ||
    t.includes("quiero ver") ||
    t.includes("puedo ver") ||
    t.includes("tienes") ||
    t.includes("tienen") ||
    t.includes("modelos") ||
    t.includes("fotos") ||
    t.includes("imagenes") ||
    t.includes("opciones") ||
    t.includes("proyectos") ||
    t.includes("trabajos") ||
    t.includes("realizado") ||
    t.includes("realizados") ||
    t.includes("ejemplos")
  );
};

const esIntencionGaleria = (texto) => {
  const t = normalizarTexto(texto);

  return (
    t.includes("galeria") ||
    t.includes("fotos") ||
    t.includes("foto") ||
    t.includes("imagenes") ||
    t.includes("imagen") ||
    t.includes("fotografias") ||
    t.includes("fotografia") ||
    t.includes("disenos") ||
    t.includes("referencias visuales") ||
    t.includes("referencia visual") ||
    t.includes("catalogo visual")
  );
};

const esIntencionProyectos = (texto) => {
  const t = normalizarTexto(texto);

  return (
    t.includes("proyectos") ||
    t.includes("proyecto realizado") ||
    t.includes("proyectos realizados") ||
    t.includes("trabajos realizados") ||
    t.includes("trabajos que han hecho") ||
    t.includes("trabajos que hicieron") ||
    t.includes("que han realizado") ||
    t.includes("que han hecho") ||
    t.includes("portafolio")
  );
};

const esIntencionMas = (texto) => {
  const t = normalizarTexto(texto);

  return (
    t === "mas" ||
    t === "otros" ||
    t === "otras" ||
    t.includes("muestrame mas") ||
    t.includes("muestra mas") ||
    t.includes("quiero ver mas") ||
    t.includes("ensename mas") ||
    t.includes("mas imagenes") ||
    t.includes("mas fotos") ||
    t.includes("mas proyectos") ||
    t.includes("mas opciones") ||
    t.includes("otras opciones") ||
    t.includes("otros modelos") ||
    t.includes("otros proyectos") ||
    t.includes("otras imagenes") ||
    t.includes("otras fotos") ||
    t.includes("siguientes")
  );
};

const esIntencionCotizacion = (texto) => {
  const t = normalizarTexto(texto);

  return (
    t.includes("cotizar") ||
    t.includes("cotizacion") ||
    t.includes("presupuesto") ||
    t.includes("quiero contratar") ||
    t.includes("me interesa") ||
    t.includes("quisiera") ||
    t.includes("quiero hacer") ||
    t.includes("necesito") ||
    t.includes("cuanto cuesta") ||
    t.includes("cuanto costaria") ||
    t.includes("cuanto saldria") ||
    t.includes("precio")
  );
};

const esMensajeMuyIncompleto = (texto) => {
  const palabras = normalizarTexto(texto)
    .split(/\s+/)
    .filter(Boolean);

  return (
    palabras.length <= 2 &&
    detectarConceptos(texto).length === 0 &&
    !esIntencionMas(texto)
  );
};

/* =========================================
   MEMORIA DEL PROYECTO
========================================= */

const actualizarMemoriaProyecto = (
  memoriaAnterior,
  texto
) => {
  const t = normalizarTexto(texto);

  const memoria = {
    ...(memoriaAnterior || {}),
  };

  const conceptos = detectarConceptos(texto);
  const area = detectarAreaProyecto(texto);

  if (area) {
    memoria.area = area;
  }

  const nombres = {
    puerta: "Puerta",
    ventana: "Ventana",
    cancel: "Cancel",
    bano: "Baño",
    porton: "Portón",
    fachada: "Fachada",
    espejo: "Espejo",
    escalera: "Escalera",
    techo: "Techo / Techumbre",
    estructura: "Estructura",
    remodelacion: "Remodelación",
    construccion: "Construcción",
    terreno: "Terreno",
    casa: "Casa",
    departamento: "Departamento",
    barandal: "Barandal",
    domo: "Domo",
    division: "División",
    mosquitero: "Mosquitero",
    local: "Local comercial",
    oficina: "Oficina",
  };

  const prioridadTipo = [
    "puerta",
    "ventana",
    "cancel",
    "porton",
    "fachada",
    "espejo",
    "barandal",
    "domo",
    "division",
    "mosquitero",
    "escalera",
    "techo",
    "estructura",
    "remodelacion",
    "construccion",
    "terreno",
    "casa",
    "departamento",
    "local",
    "oficina",
    "bano",
  ];

  const tipo = prioridadTipo.find(
    (concepto) =>
      conceptos.includes(concepto)
  );

  if (tipo) {
    memoria.tipoTrabajo = nombres[tipo];
  }

  if (conceptos.includes("herreria")) {
    memoria.material = "Herrería";
  }

  if (conceptos.includes("aluminio")) {
    memoria.material = "Aluminio";
  }

  if (conceptos.includes("templado")) {
    memoria.material = "Vidrio templado";
  } else if (conceptos.includes("vidrio")) {
    memoria.material = "Vidrio";
  }

  const medida = t.match(
    /(\d+(?:[.,]\d+)?)\s*(?:m|metros?)?\s*(?:x|por)\s*(\d+(?:[.,]\d+)?)\s*(?:m|metros?)?/
  );

  if (medida) {
    memoria.ancho = medida[1].replace(",", ".");
    memoria.alto = medida[2].replace(",", ".");
  }

  const estilos = [
    "moderno",
    "moderna",
    "minimalista",
    "clasico",
    "clasica",
    "industrial",
    "elegante",
    "rustico",
    "rustica",
    "contemporaneo",
    "contemporanea",
  ];

  const estilo = estilos.find((item) =>
    t.includes(item)
  );

  if (estilo) {
    memoria.estilo = estilo;
  }

  const colores = [
    "negro",
    "negra",
    "blanco",
    "blanca",
    "gris",
    "cromado",
    "cromada",
    "dorado",
    "dorada",
    "natural",
    "bronce",
  ];

  const color = colores.find((item) =>
    t.includes(item)
  );

  if (color) {
    memoria.color = color;
  }

  if (t.includes("segur")) {
    memoria.prioridad = "Seguridad";
  }

  if (t.includes("privacidad")) {
    memoria.prioridad = "Privacidad";
  }

  return memoria;
};

/* =========================================
   BÚSQUEDA DE PROYECTOS / GALERÍA
========================================= */

const textoProyecto = (proyecto) => {
  return normalizarTexto(
    [
      proyecto.nombre,
      proyecto.titulo,
      proyecto.descripcion,
      proyecto.categoria,
      proyecto.subcategoria,
      proyecto.tipo,
      proyecto.ubicacion,
    ]
      .filter(Boolean)
      .join(" ")
  );
};

const textoGaleria = (grupo) => {
  return normalizarTexto(
    [
      normalizarCategoriaGaleria(
        grupo.categoria
      ),
      grupo.subcategoria,
      grupo.nombre,
      grupo.descripcion,
      grupo.tipo,
    ]
      .filter(Boolean)
      .join(" ")
  );
};

const coincideConceptos = (
  textoItem,
  conceptos
) => {
  if (!conceptos.length) {
    return true;
  }

  return conceptos.every((concepto) => {
    const palabras =
      CONCEPTOS[concepto] || [];

    return palabras.some((palabra) =>
      textoItem.includes(
        normalizarTexto(palabra)
      )
    );
  });
};

const formatearProyecto = (proyecto) => {
  return {
    id: proyecto.id,
    type: "proyecto",
    title:
      proyecto.nombre ||
      proyecto.titulo ||
      "Proyecto Wealth",
    img:
      proyecto.imagen ||
      proyecto.imagenes?.[0] ||
      "",
    descripcion:
      proyecto.descripcion || "",
    categoria:
      proyecto.categoria || "",
    subcategoria:
      proyecto.subcategoria || "",
    ubicacion:
      proyecto.ubicacion || "",
    route: `/proyecto/${proyecto.id}`,
  };
};

const buscarProyectosRelacionadosTodos = (
  texto,
  proyectos
) => {
  const conceptos = detectarConceptos(texto);

  if (!conceptos.length) {
    return proyectos.map(formatearProyecto);
  }

  return proyectos
    .filter((proyecto) =>
      coincideConceptos(
        textoProyecto(proyecto),
        conceptos
      )
    )
    .map(formatearProyecto);
};

const buscarGaleriaRelacionadaTodos = (
  texto,
  galeria
) => {
  const conceptos = detectarConceptos(texto);

  const grupos = conceptos.length
    ? galeria.filter((grupo) =>
        coincideConceptos(
          textoGaleria(grupo),
          conceptos
        )
      )
    : galeria;

  /*
    La galería se ordena por bloques de 3 imágenes por grupo.

    Ejemplo:
    - 3 Protectores
    - 3 Canceles
    - 3 Ventanales
    - 3 Domos
    - etc.

    Si un grupo tiene más de 3 imágenes, después de recorrer
    los demás grupos volvemos a ese grupo para mostrar las
    siguientes 3. Así se recorre TODA la galería sin quedarse
    mostrando solamente la primera subcategoría.
  */

  const gruposConImagenes = grupos
    .map((grupo) => ({
      grupo,
      imagenes: Array.isArray(grupo.imagenes)
        ? grupo.imagenes.filter(Boolean)
        : [],
    }))
    .filter(
      ({ imagenes }) =>
        imagenes.length > 0
    );

  const items = [];

  const maxImagenes = Math.max(
    0,
    ...gruposConImagenes.map(
      ({ imagenes }) => imagenes.length
    )
  );

  for (
    let inicio = 0;
    inicio < maxImagenes;
    inicio += RESULTADOS_POR_BLOQUE
  ) {
    gruposConImagenes.forEach(
      ({ grupo, imagenes }) => {
        const bloqueGrupo = imagenes.slice(
          inicio,
          inicio + RESULTADOS_POR_BLOQUE
        );

        bloqueGrupo.forEach(
          (imagen, indexLocal) => {
            const indexReal =
              inicio + indexLocal;

            items.push({
              id: `${grupo.id}_${indexReal}`,
              grupoId: grupo.id,
              type: "galeria",
              title:
                grupo.subcategoria ||
                grupo.nombre ||
                "Referencia Wealth",
              img: imagen,
              descripcion:
                grupo.descripcion ||
                "Referencia disponible en nuestra galería.",
              categoria:
                normalizarCategoriaGaleria(
                  grupo.categoria || ""
                ),
              subcategoria:
                grupo.subcategoria || "",
              route: "/galeria",
            });
          }
        );
      }
    );
  }

  return items;
};

const filtrarGaleriaPorArea = (
  galeria,
  area
) => {
  if (!area) {
    return galeria;
  }

  const equivalencias = {
    construccion: [
      "construccion",
      "construcciones",
    ],
    inmobiliaria: [
      "inmobiliaria",
      "inmobiliario",
    ],
    aluminios: [
      "aluminios y vidrios",
      "vidrio y aluminio",
      "aluminio",
      "vidrio",
      "aluminios",
    ],
  };

  const palabras =
    equivalencias[area] || [];

  return galeria.filter((grupo) => {
    const categoria = normalizarTexto(
      normalizarCategoriaGaleria(
        grupo.categoria || ""
      )
    );

    return palabras.some((palabra) =>
      categoria.includes(
        normalizarTexto(palabra)
      )
    );
  });
};

const obtenerFotosGaleriaTodas = (
  texto,
  galeria,
  areaContexto = null
) => {
  const conceptos = detectarConceptos(texto);
  const areaTexto = detectarAreaProyecto(texto);
  const area = areaTexto || areaContexto || null;

  if (conceptos.length > 0) {
    const relacionadas =
      buscarGaleriaRelacionadaTodos(
        texto,
        galeria
      );

    if (relacionadas.length > 0) {
      return relacionadas;
    }
  }

  const gruposArea = filtrarGaleriaPorArea(
    galeria,
    area
  );

  return buscarGaleriaRelacionadaTodos(
    "",
    gruposArea.length > 0
      ? gruposArea
      : galeria
  );
};

const describirConsulta = (texto) => {
  const memoria = actualizarMemoriaProyecto(
    {},
    texto
  );

  const partes = [];

  if (memoria.tipoTrabajo) {
    partes.push(memoria.tipoTrabajo);
  }

  if (memoria.material) {
    partes.push(`de ${memoria.material}`);
  }

  if (memoria.estilo) {
    partes.push(`estilo ${memoria.estilo}`);
  }

  if (partes.length) {
    return partes.join(" ");
  }

  return "lo que buscas";
};

/* =========================================
   COMPONENTE
========================================= */

export default function ChatIA() {
  const { modoOscuro } = useOutletContext();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [empresa, setEmpresa] = useState(null);
  const [faq, setFaq] = useState([]);
  const [proyectosDB, setProyectosDB] =
    useState([]);
  const [galeriaDB, setGaleriaDB] =
    useState([]);
  const [catalogoReady, setCatalogoReady] =
    useState(false);

  const [areaActual, setAreaActual] =
    useState(null);
  const [memoriaProyecto, setMemoriaProyecto] =
    useState({});

  /*
    contextoVisual guarda lo último que el usuario estaba viendo.
    Así "muéstrame más" sabe si debe continuar con ventanales,
    proyectos, galería, etc.
  */
  const [contextoVisual, setContextoVisual] =
    useState(null);

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] =
    useState(false);
  const [conversations, setConversations] =
    useState([]);
  const [currentId, setCurrentId] =
    useState(null);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const operationIdRef = useRef(0);

  const limpiarTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const abortarPeticionActual = () => {
    limpiarTimeout();

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const cancelarRespuesta = () => {
    if (!loading) {
      return;
    }

    operationIdRef.current += 1;
    abortarPeticionActual();
    setLoading(false);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content:
          "Respuesta cancelada. Puedes escribir otra pregunta o intentarlo nuevamente.",
      },
    ]);
  };

  useEffect(() => {
    return () => {
      operationIdRef.current += 1;
      abortarPeticionActual();
    };
  }, []);

  /* =========================================
     AUTH
  ========================================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthReady(true);

        if (!currentUser) {
          setConversations([]);
          setCurrentId(null);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================================
     CARGAR CATÁLOGO
  ========================================= */

  useEffect(() => {
    const cargar = async () => {
      try {
        const [
          infoEmpresa,
          infoFaq,
          proyectos,
          galeria,
        ] = await Promise.all([
          getEmpresaInfo(),
          getFAQ(),
          getTodosProyectos(),
          getTodaGaleria(),
        ]);

        setEmpresa(infoEmpresa);
        setFaq(infoFaq);
        setProyectosDB(proyectos);
        setGaleriaDB(galeria);
      } finally {
        setCatalogoReady(true);
      }
    };

    cargar();
  }, []);

  /* =========================================
     HISTORIAL
  ========================================= */

  useEffect(() => {
    if (!user) {
      return;
    }

    const cargar = async () => {
      try {
        const consulta = query(
          collection(db, "chatHistorial"),
          where("uid", "==", user.uid)
        );

        const snapshot = await getDocs(consulta);

        const lista = snapshot.docs.map(
          (documento) => ({
            id: documento.id,
            ...documento.data(),
          })
        );

        lista.sort(
          (a, b) =>
            new Date(b.updatedAt || 0) -
            new Date(a.updatedAt || 0)
        );

        setConversations(lista);
      } catch (error) {
        console.error("❌ HISTORIAL:", error);
      }
    };

    cargar();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* =========================================
     GUARDAR CONVERSACIÓN
  ========================================= */

  const guardarConversacion = async (
    nuevosMensajes,
    datosExtra = {}
  ) => {
    if (!user || !nuevosMensajes.length) {
      return;
    }

    try {
      let id = currentId;

      if (!id) {
        const referencia = doc(
          collection(db, "chatHistorial")
        );

        id = referencia.id;
        setCurrentId(id);
      }

      const primerMensaje = nuevosMensajes.find(
        (mensaje) => mensaje.role === "user"
      );

      const titulo =
        primerMensaje?.content?.slice(0, 45) ||
        "Conversación";

      const conversacion = {
        uid: user.uid,
        titulo,
        messages: nuevosMensajes,
        areaActual:
          datosExtra.areaActual ??
          areaActual ??
          null,
        memoriaProyecto:
          datosExtra.memoriaProyecto ??
          memoriaProyecto ??
          {},
        contextoVisual:
          datosExtra.contextoVisual ??
          contextoVisual ??
          null,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(
        doc(db, "chatHistorial", id),
        conversacion,
        { merge: true }
      );

      setConversations((prev) => [
        {
          id,
          ...conversacion,
        },
        ...prev.filter((item) => item.id !== id),
      ]);
    } catch (error) {
      console.error("❌ GUARDANDO CHAT:", error);
    }
  };

  const nuevaConversacion = () => {
    operationIdRef.current += 1;
    abortarPeticionActual();
    setLoading(false);
    setMessages([]);
    setAreaActual(null);
    setMemoriaProyecto({});
    setContextoVisual(null);
    setCurrentId(null);
    setInput("");
  };

  const abrirConversacion = (conversation) => {
    operationIdRef.current += 1;
    abortarPeticionActual();
    setLoading(false);
    setCurrentId(conversation.id);
    setMessages(conversation.messages || []);
    setAreaActual(conversation.areaActual || null);
    setMemoriaProyecto(
      conversation.memoriaProyecto || {}
    );
    setContextoVisual(
      conversation.contextoVisual || null
    );
  };

  const eliminarConversacion = async (id) => {
    if (!user) {
      return;
    }

    try {
      await deleteDoc(
        doc(db, "chatHistorial", id)
      );

      setConversations((prev) =>
        prev.filter((item) => item.id !== id)
      );

      if (currentId === id) {
        nuevaConversacion();
      }
    } catch (error) {
      console.error("❌ BORRAR CHAT:", error);
    }
  };

  /* =========================================
     RESPONDER GALERÍA
  ========================================= */

  const responderGaleria = async (
    newMessages,
    texto,
    nuevaMemoria,
    opciones = {}
  ) => {
    const continuar = opciones.continuar === true;

    const consultaAnterior =
      contextoVisual?.tipo === "galeria"
        ? contextoVisual.consulta || ""
        : "";

    const conceptosTexto = detectarConceptos(texto);
    const conceptosAnteriores = detectarConceptos(
      consultaAnterior
    );

    const mismosConceptos =
      conceptosTexto.length > 0 &&
      conceptosAnteriores.length > 0 &&
      conceptosTexto.every((concepto) =>
        conceptosAnteriores.includes(concepto)
      );

    const consulta =
      continuar &&
      (
        conceptosTexto.length === 0 ||
        mismosConceptos
      )
        ? consultaAnterior
        : texto;

    const areaConsulta =
      detectarAreaProyecto(consulta) ||
      opciones.areaForzada ||
      contextoVisual?.area ||
      areaActual ||
      null;

    const todos = obtenerFotosGaleriaTodas(
      consulta,
      galeriaDB,
      areaConsulta
    );

    const mismaBusqueda =
      contextoVisual?.tipo === "galeria" &&
      normalizarTexto(
        contextoVisual.consulta || ""
      ) === normalizarTexto(consulta);

    let offset =
      continuar && mismaBusqueda
        ? contextoVisual?.offset || 0
        : 0;

    // Si ya llegamos al final, volvemos a empezar.
    if (offset >= todos.length) {
      offset = 0;
    }

    const bloque = todos.slice(
      offset,
      offset + RESULTADOS_POR_BLOQUE
    );

    const siguienteOffset =
      offset + bloque.length;

    const hayMas =
      siguienteOffset < todos.length;

    let content = "";

    if (!todos.length) {
      content =
        "No encontré fotografías publicadas que coincidan con esa búsqueda. Puedes probar con otra categoría o solicitar una cotización personalizada.";
    } else if (!bloque.length) {
      content =
        "Ya te mostré las referencias publicadas que encontré para esta búsqueda. Puedes abrir la galería completa o preguntarme por otra opción.";
    } else if (continuar) {
      content =
        `Claro 📸. Te muestro ${bloque.length} referencia${bloque.length === 1 ? "" : "s"} más relacionadas con ${describirConsulta(consulta)}.`;
    } else if (detectarConceptos(consulta).length > 0) {
      content =
        `Claro 📸. Encontré referencias de nuestra galería relacionadas con ${describirConsulta(consulta)}. Te muestro ${bloque.length} para empezar.`;
    } else {
      content =
        "Claro 📸. Te muestro algunas referencias reales disponibles en la galería de Wealth.";
    }

    const actions = [];

    if (todos.length > RESULTADOS_POR_BLOQUE) {
      actions.push({
        type: "mostrar-mas-galeria",
        label: hayMas
          ? "➕ Mostrar 3 más"
          : "🔄 Volver a empezar",
      });
    }

    actions.push({
      type: "ver-galeria",
      label: "🖼️ Ver toda la galería",
    });

    actions.push({
      type: "cotizar",
      label: "📋 Cotizar referencia",
    });

    const nuevoContexto = {
      tipo: "galeria",
      consulta,
      area: areaConsulta,
      offset: siguienteOffset,
      total: todos.length,
    };

    const mensajeIA = {
      role: "ai",
      content,
      attachments: bloque,
      actions,
    };

    const finales = [
      ...newMessages,
      mensajeIA,
    ];

    setMessages(finales);
    setContextoVisual(nuevoContexto);

    if (areaConsulta) {
      setAreaActual(areaConsulta);
    }

    await guardarConversacion(finales, {
      areaActual: areaConsulta,
      memoriaProyecto: nuevaMemoria,
      contextoVisual: nuevoContexto,
    });
  };

  /* =========================================
     RESPONDER PROYECTOS
  ========================================= */

  const responderProyectos = async (
    newMessages,
    texto,
    nuevaMemoria,
    opciones = {}
  ) => {
    const continuar = opciones.continuar === true;

    const consultaAnterior =
      contextoVisual?.tipo === "proyectos"
        ? contextoVisual.consulta || ""
        : "";

    const conceptosTexto = detectarConceptos(texto);
    const conceptosAnteriores = detectarConceptos(
      consultaAnterior
    );

    const mismosConceptos =
      conceptosTexto.length > 0 &&
      conceptosAnteriores.length > 0 &&
      conceptosTexto.every((concepto) =>
        conceptosAnteriores.includes(concepto)
      );

    const consulta =
      continuar &&
      (
        conceptosTexto.length === 0 ||
        mismosConceptos
      )
        ? consultaAnterior
        : texto;

    const todos = buscarProyectosRelacionadosTodos(
      consulta,
      proyectosDB
    );

    const mismaBusqueda =
      contextoVisual?.tipo === "proyectos" &&
      normalizarTexto(
        contextoVisual.consulta || ""
      ) === normalizarTexto(consulta);

    let offset =
      continuar && mismaBusqueda
        ? contextoVisual?.offset || 0
        : 0;

    // Si ya llegamos al final, volvemos a empezar.
    if (offset >= todos.length) {
      offset = 0;
    }

    const bloque = todos.slice(
      offset,
      offset + RESULTADOS_POR_BLOQUE
    );

    const siguienteOffset =
      offset + bloque.length;

    const hayMas =
      siguienteOffset < todos.length;

    let content = "";

    if (!todos.length) {
      content =
        "No encontré proyectos publicados que coincidan exactamente con esa búsqueda. Puedes revisar la galería de referencias o solicitar una cotización personalizada.";
    } else if (!bloque.length) {
      content =
        "Ya te mostré los proyectos publicados que encontré para esta búsqueda. Puedes abrir la página de proyectos para ver el portafolio completo.";
    } else if (continuar) {
      content =
        `Claro 🏢. Aquí tienes ${bloque.length} proyecto${bloque.length === 1 ? "" : "s"} más relacionados con ${describirConsulta(consulta)}.`;
    } else if (detectarConceptos(consulta).length > 0) {
      content =
        `Encontré proyectos publicados relacionados con ${describirConsulta(consulta)}. Te muestro ${bloque.length} para empezar.`;
    } else {
      content =
        "Claro 🏢. Te muestro algunos proyectos reales publicados por Grupo Empresarial Wealth.";
    }

    const actions = [];

    if (todos.length > RESULTADOS_POR_BLOQUE) {
      actions.push({
        type: "mostrar-mas-proyectos",
        label: hayMas
          ? "➕ Mostrar 3 más"
          : "🔄 Volver a empezar",
      });
    }

    actions.push({
      type: "ver-proyectos",
      label: "🏢 Ver más proyectos",
    });

    actions.push({
      type: "cotizar",
      label: "📋 Crear cotización",
    });

    const nuevaArea =
      detectarAreaProyecto(consulta) ||
      areaActual ||
      null;

    const nuevoContexto = {
      tipo: "proyectos",
      consulta,
      area: nuevaArea,
      offset: siguienteOffset,
      total: todos.length,
    };

    const mensajeIA = {
      role: "ai",
      content,
      attachments: bloque,
      actions,
    };

    const finales = [
      ...newMessages,
      mensajeIA,
    ];

    setMessages(finales);
    setContextoVisual(nuevoContexto);

    if (nuevaArea) {
      setAreaActual(nuevaArea);
    }

    await guardarConversacion(finales, {
      areaActual: nuevaArea,
      memoriaProyecto: nuevaMemoria,
      contextoVisual: nuevoContexto,
    });
  };

  /* =========================================
     RESPONDER REFERENCIAS MIXTAS
  ========================================= */

  const responderReferencias = async (
    newMessages,
    texto,
    nuevaMemoria
  ) => {
    const proyectos =
      buscarProyectosRelacionadosTodos(
        texto,
        proyectosDB
      ).slice(0, 2);

    const galeria =
      buscarGaleriaRelacionadaTodos(
        texto,
        galeriaDB
      ).slice(0, 2);

    const items = [
      ...proyectos,
      ...galeria,
    ].slice(0, 3);

    const descripcion = describirConsulta(texto);

    let content;

    if (items.length > 0) {
      if (
        proyectos.length > 0 &&
        galeria.length > 0
      ) {
        content =
          `Encontré proyectos realizados y referencias relacionadas con ${descripcion}. Los proyectos son trabajos publicados por Wealth; las imágenes de galería son referencias o inspiración.`;
      } else if (proyectos.length > 0) {
        content =
          `Encontré proyectos realizados relacionados con ${descripcion}.`;
      } else {
        content =
          `No encontré un proyecto publicado que coincida exactamente con ${descripcion}, pero sí encontré referencias en nuestra galería.`;
      }
    } else {
      content =
        `No encontré un proyecto ni una referencia publicada que coincida exactamente con ${descripcion}. Si tienes una idea o fotografía, puedes solicitar una cotización personalizada.`;
    }

    const actions = [
      {
        type: "ver-proyectos",
        label: "🏢 Ver proyectos",
      },
      {
        type: "ver-galeria",
        label: "🖼️ Ver galería",
      },
      {
        type: "cotizar",
        label: "📋 Crear cotización",
      },
    ];

    const mensajeIA = {
      role: "ai",
      content,
      attachments: items,
      actions,
    };

    const finales = [
      ...newMessages,
      mensajeIA,
    ];

    const nuevaArea =
      detectarAreaProyecto(texto) ||
      areaActual;

    setMessages(finales);
    setAreaActual(nuevaArea);

    await guardarConversacion(finales, {
      areaActual: nuevaArea,
      memoriaProyecto: nuevaMemoria,
    });
  };

  /* =========================================
     ENVIAR MENSAJE
  ========================================= */

  const sendMessage = async (
    text = input
  ) => {
    if (!text || !text.trim() || loading) {
      return;
    }

    const cleanText = text.trim();
    const previousMessages = messages;

    const userMessage = {
      role: "user",
      content: cleanText,
    };

    const newMessages = [
      ...previousMessages,
      userMessage,
    ];

    setMessages(newMessages);
    setInput("");

    const nuevaMemoria =
      actualizarMemoriaProyecto(
        memoriaProyecto,
        cleanText
      );

    setMemoriaProyecto(nuevaMemoria);

    /* =========================================
       SEGUIMIENTO "MUÉSTRAME MÁS"
    ========================================= */

    if (
      catalogoReady &&
      esIntencionMas(cleanText) &&
      contextoVisual
    ) {
      if (contextoVisual.tipo === "galeria") {
        await responderGaleria(
          newMessages,
          cleanText,
          nuevaMemoria,
          { continuar: true }
        );
        return;
      }

      if (contextoVisual.tipo === "proyectos") {
        await responderProyectos(
          newMessages,
          cleanText,
          nuevaMemoria,
          { continuar: true }
        );
        return;
      }
    }

    /* =========================================
       EMPRESA
    ========================================= */

    const respuestaEmpresa =
      getRespuestaEmpresa(
        cleanText,
        empresa
      );

    if (respuestaEmpresa) {
      const finales = [
        ...newMessages,
        {
          role: "ai",
          ...respuestaEmpresa,
        },
      ];

      setMessages(finales);

      await guardarConversacion(finales, {
        memoriaProyecto: nuevaMemoria,
      });
      return;
    }

    /* =========================================
       CORTESÍA
    ========================================= */

    const respuestaCortesia =
      detectarCortesia(cleanText);

    if (respuestaCortesia) {
      const finales = [
        ...newMessages,
        {
          role: "ai",
          ...respuestaCortesia,
        },
      ];

      setMessages(finales);

      await guardarConversacion(finales, {
        memoriaProyecto: nuevaMemoria,
      });
      return;
    }

    /* =========================================
       SERVICIOS GENERALES
    ========================================= */

    if (
      esPreguntaServicios(cleanText) &&
      detectarConceptos(cleanText).length === 0
    ) {
      const mensajeIA = {
        role: "ai",
        content:
          "Grupo Empresarial Wealth trabaja principalmente en Construcción, Inmobiliaria y Aluminios y Vidrios. También puedo mostrarte proyectos reales publicados y referencias de nuestra galería.",
        actions: [
          {
            type: "mostrar-proyectos-general",
            label: "🏢 Ver proyectos",
          },
          {
            type: "mostrar-galeria-general",
            label: "🖼️ Ver galería",
          },
          {
            type: "cotizar",
            label: "📋 Crear cotización",
          },
        ],
      };

      const finales = [
        ...newMessages,
        mensajeIA,
      ];

      setMessages(finales);

      await guardarConversacion(finales, {
        memoriaProyecto: nuevaMemoria,
      });
      return;
    }

    /* =========================================
       GALERÍA
       ROTACIÓN AUTOMÁTICA
    ========================================= */

    if (
      catalogoReady &&
      esIntencionGaleria(cleanText)
    ) {
      const continuarGaleria =
        contextoVisual?.tipo === "galeria";

      await responderGaleria(
        newMessages,
        cleanText,
        nuevaMemoria,
        {
          continuar: continuarGaleria,
        }
      );

      return;
    }

    /* =========================================
       PROYECTOS
       ROTACIÓN AUTOMÁTICA
    ========================================= */

    if (
      catalogoReady &&
      esIntencionProyectos(cleanText)
    ) {
      const continuarProyectos =
        contextoVisual?.tipo === "proyectos";

      await responderProyectos(
        newMessages,
        cleanText,
        nuevaMemoria,
        {
          continuar: continuarProyectos,
        }
      );

      return;
    }

    /* =========================================
       MENSAJE CORTO INCOMPLETO
    ========================================= */

    if (esMensajeMuyIncompleto(cleanText)) {
      const finales = [
        ...newMessages,
        {
          role: "ai",
          content:
            "No alcancé a entender qué te gustaría consultar. Puedes decirme, por ejemplo, si buscas proyectos, imágenes de galería, construcción, inmobiliaria, vidrio, aluminio o una cotización.",
        },
      ];

      setMessages(finales);

      await guardarConversacion(finales, {
        memoriaProyecto: nuevaMemoria,
      });
      return;
    }

    const consultaServicio =
      esConsultaServicio(cleanText);

    const quiereMostrar =
      esIntencionMostrar(cleanText);

    const quiereCotizar =
      esIntencionCotizacion(cleanText);

    /* =========================================
       MOSTRAR REFERENCIAS ESPECÍFICAS
    ========================================= */

    if (
      catalogoReady &&
      consultaServicio &&
      (quiereMostrar || quiereCotizar)
    ) {
      await responderReferencias(
        newMessages,
        cleanText,
        nuevaMemoria
      );
      return;
    }

    /* =========================================
       CONTEXTO PARA GROQ
    ========================================= */

    let referencias = {
      proyectos: [],
      galeria: [],
      items: [],
      cantidad: 0,
    };

    if (catalogoReady && consultaServicio) {
      const proyectos =
        buscarProyectosRelacionadosTodos(
          cleanText,
          proyectosDB
        ).slice(0, 3);

      const galeria =
        buscarGaleriaRelacionadaTodos(
          cleanText,
          galeriaDB
        ).slice(0, 3);

      referencias = {
        proyectos,
        galeria,
        items: [
          ...proyectos,
          ...galeria,
        ].slice(0, 3),
        cantidad:
          proyectos.length + galeria.length,
      };
    }

    const mensajeNormalizado =
      normalizarTexto(cleanText);

    const faqRelacionadas = faq
      .filter((item) => {
        const claves = Array.isArray(
          item.palabrasClave
        )
          ? item.palabrasClave
          : [];

        return claves.some((clave) =>
          mensajeNormalizado.includes(
            normalizarTexto(clave)
          )
        );
      })
      .slice(0, 3);

    /* =========================================
       GROQ
    ========================================= */

    const operationId =
      ++operationIdRef.current;

    setLoading(true);
    abortarPeticionActual();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    timeoutRef.current = setTimeout(() => {
      controller.abort();
    }, IA_TIMEOUT);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: cleanText,
          history: previousMessages,
          empresa,
          memoriaProyecto: nuevaMemoria,
          areaActual:
            detectarAreaProyecto(cleanText) ||
            areaActual,
          faq: faqRelacionadas,
          contextoReferencias: {
            cantidad: referencias.items.length,
            proyectos:
              referencias.proyectos.map(
                (item) => ({
                  title: item.title,
                  descripcion:
                    item.descripcion,
                  categoria:
                    item.categoria,
                })
              ),
            galeria:
              referencias.galeria.map(
                (item) => ({
                  title: item.title,
                  categoria:
                    item.categoria,
                  subcategoria:
                    item.subcategoria,
                })
              ),
          },
        }),
      });

      limpiarTimeout();

      if (
        operationId !== operationIdRef.current
      ) {
        return;
      }

      const raw = await response.text();
      let data;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(
          "Respuesta inválida del backend."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.reply || "Error WEALTH IA"
        );
      }

      const actions = [];

      if (consultaServicio) {
        actions.push({
          type: "cotizar",
          label: "📋 Crear cotización",
        });
      }

      const aiMessage = {
        role: "ai",
        content: data.reply,
        attachments:
          referencias.items.slice(0, 3),
        actions,
      };

      const finales = [
        ...newMessages,
        aiMessage,
      ];

      setMessages(finales);

      const nuevaArea =
        detectarAreaProyecto(cleanText) ||
        areaActual;

      setAreaActual(nuevaArea);

      await guardarConversacion(finales, {
        areaActual: nuevaArea,
        memoriaProyecto: nuevaMemoria,
      });
    } catch (error) {
      limpiarTimeout();

      if (
        operationId !== operationIdRef.current
      ) {
        return;
      }

      console.error("❌ CHAT:", error);

      let mensaje =
        "No pude conectarme con WEALTH IA en este momento. Puedes intentarlo nuevamente.";

      if (error?.name === "AbortError") {
        mensaje =
          "La respuesta tardó demasiado y fue cancelada automáticamente. Puedes intentarlo nuevamente.";
      }

      const finales = [
        ...newMessages,
        {
          role: "ai",
          content: mensaje,
          actions: [
            {
              type: "reintentar",
              label: "🔄 Intentar nuevamente",
              message: cleanText,
            },
          ],
        },
      ];

      setMessages(finales);
    } finally {
      limpiarTimeout();
      abortControllerRef.current = null;

      if (
        operationId === operationIdRef.current
      ) {
        setLoading(false);
      }
    }
  };

  /* =========================================
     ACCIONES DE BOTONES
  ========================================= */

  const handleAction = async (action) => {
    if (!action || loading) {
      return;
    }

    if (action.type === "mostrar-proyectos-general") {
      await sendMessage(
        "Muéstrame proyectos realizados por Wealth"
      );
      return;
    }

    if (action.type === "mostrar-galeria-general") {
      await sendMessage(
        "Muéstrame la galería de imágenes"
      );
      return;
    }

    if (action.type === "mostrar-mas-galeria") {
      await sendMessage("Muéstrame más imágenes");
      return;
    }

    if (action.type === "mostrar-mas-proyectos") {
      await sendMessage("Muéstrame más proyectos");
      return;
    }

    if (action.type === "ver-galeria") {
      navigate("/galeria");
      return;
    }

    if (action.type === "ver-proyectos") {
      navigate("/proyectos");
      return;
    }

    if (action.type === "buscar-construccion") {
      await sendMessage(
        "Muéstrame proyectos y trabajos de construcción"
      );
      return;
    }

    if (action.type === "buscar-inmobiliaria") {
      await sendMessage(
        "Muéstrame proyectos inmobiliarios"
      );
      return;
    }

    if (action.type === "buscar-aluminios") {
      await sendMessage(
        "Muéstrame trabajos de aluminio y vidrio"
      );
      return;
    }

    if (
      action.type ===
      "buscar-galeria-inmobiliaria"
    ) {
      await sendMessage(
        "Muéstrame fotos de la galería de inmobiliaria"
      );
      return;
    }

    if (
      action.type ===
      "buscar-galeria-construccion"
    ) {
      await sendMessage(
        "Muéstrame fotos de la galería de construcción"
      );
      return;
    }

    if (
      action.type ===
      "buscar-galeria-aluminios"
    ) {
      await sendMessage(
        "Muéstrame fotos de la galería de aluminios y vidrios"
      );
      return;
    }

    if (action.type === "contacto") {
      await sendMessage("Contacto");
      return;
    }

    if (action.type === "cotizar") {
      const usuario = auth.currentUser;

      if (!usuario) {
        navigate("/login", {
          state: {
            desdeIA: true,
            redirectTo:
              "/crear-cotizacion",
          },
        });
        return;
      }

      navigate("/crear-cotizacion", {
        state: {
          desdeIA: true,
        },
      });
      return;
    }

    if (
      action.type === "reintentar" &&
      action.message
    ) {
      await sendMessage(action.message);
    }
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div
      className={`
        w-full
        min-h-[calc(100vh-95px)]
        transition-colors
        duration-300
        ${
          modoOscuro
            ? "bg-[#050505]"
            : "bg-gray-50"
        }
      `}
    >
      <div className="max-w-[1500px] mx-auto px-3 sm:px-6 py-5">
        <div
          className={`
            flex
            h-[calc(100vh-135px)]
            min-h-[650px]
            overflow-hidden
            border
            border-[#c89b3c]/20
            rounded-[28px]
            transition-colors
            duration-300
            ${
              modoOscuro
                ? `
                  bg-gradient-to-b
                  from-[#0b0b0b]
                  via-[#070707]
                  to-[#050505]
                  shadow-[0_30px_80px_rgba(0,0,0,0.45)]
                `
                : `
                  bg-gradient-to-b
                  from-white
                  via-[#fdfdfc]
                  to-[#f7f7f5]
                  shadow-[0_24px_60px_rgba(0,0,0,0.10)]
                `
            }
          `}
        >
          {authReady && user && (
            <ChatHistory
              conversations={conversations}
              currentId={currentId}
              onSelect={abrirConversacion}
              onNew={nuevaConversacion}
              onDelete={eliminarConversacion}
              modoOscuro={modoOscuro}
            />
          )}

          <div className="flex-1 min-w-0 flex flex-col">
            <ChatHeader
              modoOscuro={modoOscuro}
            />

            <div
              className={`
                relative
                flex-1
                overflow-y-auto
                scroll-smooth
                transition-colors
                duration-300
                ${
                  modoOscuro
                    ? "bg-transparent"
                    : "bg-white/40"
                }
              `}
            >
              <div className="relative z-10 h-full">
                {messages.length === 0 ? (
                  <EmptyState
                    onSelect={sendMessage}
                    modoOscuro={modoOscuro}
                  />
                ) : (
                  <div className="max-w-5xl mx-auto py-6">
                    <ChatMessages
                      messages={messages}
                      onAction={handleAction}
                      memoriaProyecto={
                        memoriaProyecto
                      }
                      modoOscuro={modoOscuro}
                    />

                    {loading && (
                      <TypingIndicator
                        modoOscuro={modoOscuro}
                      />
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            <div
              className={`
                border-t
                border-[#c89b3c]/15
                backdrop-blur-xl
                transition-colors
                duration-300
                ${
                  modoOscuro
                    ? "bg-black/80"
                    : "bg-white/85"
                }
              `}
            >
              {!user && (
                <p
                  className={`
                    text-[11px]
                    text-center
                    pt-3
                    ${
                      modoOscuro
                        ? "text-zinc-600"
                        : "text-gray-500"
                    }
                  `}
                >
                  Inicia sesión para guardar tu historial de conversaciones.
                </p>
              )}

              <div className="max-w-5xl mx-auto px-3 pt-3">
                <SuggestedQuestions
                  onSelect={sendMessage}
                  loading={
                    loading || !catalogoReady
                  }
                  modoOscuro={modoOscuro}
                />
              </div>

              <div className="max-w-5xl mx-auto">
                <ChatInput
                  value={input}
                  setValue={setInput}
                  onSend={() => sendMessage()}
                  loading={loading}
                  onCancel={cancelarRespuesta}
                  modoOscuro={modoOscuro}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}