/* =========================================
   WEALTH IA - NETLIFY FUNCTION
========================================= */

const limpiarTexto = (texto = "") => {
  return String(texto).trim();
};

/* =========================================
   DETECTAR PRECIO GENERADO
========================================= */

const contienePrecioInventado = (texto) => {
  if (!texto) {
    return false;
  }

  const expresiones = [
    /\$\s*\d[\d,.]*/i,
    /\d[\d,.]*\s*(?:mxn|pesos?|usd|dolares?)/i,
    /(?:mxn|pesos?|usd|dolares?)\s*\d[\d,.]*/i,
  ];

  return expresiones.some((regex) => regex.test(texto));
};

/* =========================================
   FUNCIÓN PRINCIPAL
========================================= */

export default async (request) => {
  /* =========================================
     SOLO PERMITIR POST
  ========================================= */

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        reply: "Método no permitido.",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    /* =========================================
       LEER DATOS DEL FRONTEND
    ========================================= */

    const {
      message,
      history = [],
      empresa = null,
      memoriaProyecto = {},
      faq = [],
      contextoReferencias = null,
    } = await request.json();

    /* =========================================
       VALIDACIÓN MENSAJE
    ========================================= */

    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({
          reply: "Escribe un mensaje.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    /* =========================================
       VALIDAR API KEY
    ========================================= */

    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY no configurada");

      return new Response(
        JSON.stringify({
          reply:
            "WEALTH IA no está configurado correctamente.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    /* =========================================
       HISTORIAL
    ========================================= */

    const conversation = history
      .slice(-12)
      .filter(
        (mensaje) =>
          mensaje &&
          mensaje.content &&
          (mensaje.role === "user" ||
            mensaje.role === "ai")
      )
      .map((mensaje) => ({
        role:
          mensaje.role === "ai"
            ? "assistant"
            : "user",

        content: mensaje.content,
      }));

    /* =========================================
       EMPRESA
    ========================================= */

    const empresaContexto = empresa
      ? `
DATOS OFICIALES DE GRUPO EMPRESARIAL WEALTH

Nombre:
${empresa.nombre || "No disponible"}

Ciudad:
${empresa.ciudad || "No disponible"}

Dirección:
${empresa.direccion || "No disponible"}

Contacto:
${empresa.contacto || "No disponible"}

Correo:
${empresa.correo || "No disponible"}

Horario:
${empresa.horarios || "No disponible"}

Descripción:
${empresa.descripcion || "No disponible"}
`
      : `
No hay información oficial adicional de la empresa disponible.
`;

    /* =========================================
       MEMORIA DEL PROYECTO
    ========================================= */

    const memoriaContexto = `
INFORMACIÓN QUE EL CLIENTE YA PROPORCIONÓ

Tipo de trabajo:
${memoriaProyecto.tipoTrabajo || "No definido"}

Área:
${memoriaProyecto.area || "No definida"}

Material:
${memoriaProyecto.material || "No definido"}

Ancho:
${memoriaProyecto.ancho || "No definido"}

Alto:
${memoriaProyecto.alto || "No definido"}

Estilo:
${memoriaProyecto.estilo || "No definido"}

Color:
${memoriaProyecto.color || "No definido"}

Prioridad:
${memoriaProyecto.prioridad || "No definida"}
`;

    /* =========================================
       REFERENCIAS REALES
    ========================================= */

    let referenciasContexto = `
No se encontraron referencias relacionadas para esta consulta.
`;

    if (
      contextoReferencias &&
      contextoReferencias.cantidad > 0
    ) {
      const proyectos = Array.isArray(
        contextoReferencias.proyectos
      )
        ? contextoReferencias.proyectos
        : [];

      const galeria = Array.isArray(
        contextoReferencias.galeria
      )
        ? contextoReferencias.galeria
        : [];

      const proyectosTexto = proyectos.length
        ? proyectos
            .map(
              (item, index) =>
                `${index + 1}. ${
                  item.title || "Proyecto"
                } - ${item.descripcion || ""}`
            )
            .join("\n")
        : "Ninguno";

      const galeriaTexto = galeria.length
        ? galeria
            .map(
              (item, index) =>
                `${index + 1}. ${
                  item.title || "Referencia"
                }`
            )
            .join("\n")
        : "Ninguna";

      referenciasContexto = `
REFERENCIAS REALES ENCONTRADAS POR LA APLICACIÓN

PROYECTOS:
${proyectosTexto}

GALERÍA:
${galeriaTexto}

Solo estas referencias están confirmadas para esta consulta.
`;
    }

    /* =========================================
       FAQ
    ========================================= */

    const faqContexto =
      Array.isArray(faq) && faq.length
        ? faq
            .map(
              (item, index) => `
FAQ ${index + 1}

Pregunta:
${item.pregunta || ""}

Respuesta oficial:
${item.respuesta || ""}
`
            )
            .join("\n")
        : `
No hay FAQ oficial relacionada.
`;

    /* =========================================
       PROMPT DEL SISTEMA
    ========================================= */

    const systemPrompt = `
Eres WEALTH IA, asistente virtual de Grupo Empresarial Wealth.

${empresaContexto}

${memoriaContexto}

${referenciasContexto}

${faqContexto}

============================================
IDENTIDAD
============================================

Tu nombre es WEALTH IA.

Nunca digas que eres ChatGPT.

Hablas en español.

Debes ser profesional, claro, amable y breve.

============================================
ÁREAS PRINCIPALES
============================================

Grupo Empresarial Wealth trabaja principalmente en:

1. Construcciones
2. Inmobiliaria
3. Aluminios y Vidrios

============================================
FUENTE DE VERDAD
============================================

Los datos proporcionados por la aplicación son la fuente de verdad.

No inventes información sobre Wealth.

============================================
PROYECTOS Y GALERÍA
============================================

PROYECTOS significa trabajos reales publicados.

GALERÍA significa referencias, diseños o inspiración.

Nunca afirmes que una fotografía de Galería es un proyecto realizado por Wealth.

Nunca inventes proyectos.

Nunca inventes fotografías.

Nunca inventes modelos.

Nunca digas que Wealth tiene un producto si no está confirmado en las referencias recibidas.

============================================
RECOMENDACIONES
============================================

Si existen referencias reales relacionadas:

puedes mencionarlas y explicar que la interfaz las muestra.

Si NO existe ninguna referencia:

debes ser transparente.

Puedes decir:

"No encontré una referencia publicada que coincida exactamente con lo que buscas."

Después puedes preguntar si el cliente:

- tiene una fotografía,
- tiene un diseño,
- tiene una idea,
- o desea hacer una solicitud personalizada.

La aplicación mostrará el botón para crear la cotización.

Nunca recomiendes un producto diferente simplemente porque pertenezca a la misma categoría.

Ejemplo:

Cliente:
"Quiero una puerta de herrería."

Si no existe puerta de herrería:

NO debes ofrecer canceles de baño.

NO debes ofrecer ventanas.

NO debes decir que esos productos son equivalentes.

============================================
COTIZACIONES
============================================

Cuando el cliente quiera cotizar:

NO hagas cinco preguntas al mismo tiempo.

Haz UNA pregunta por respuesta.

Utiliza la información que ya existe en:

INFORMACIÓN QUE EL CLIENTE YA PROPORCIONÓ.

Nunca vuelvas a preguntar algo que ya sabes.

Ejemplo:

Si el cliente dijo:

"Quiero una puerta de herrería."

Ya sabes:

Tipo = Puerta
Material = Herrería

Por lo tanto NO preguntes:

"¿Qué tipo de trabajo necesita?"

ni:

"¿Qué material prefiere?"

Pregunta únicamente el siguiente dato útil que falte.

Por ejemplo:

"¿Qué medidas aproximadas tendría la puerta?"

Si ya conoces las medidas:

pregunta el siguiente dato faltante.

Cuando existan suficientes datos:

indica que puede continuar al formulario de cotización.

============================================
PRECIOS
============================================

Está estrictamente prohibido inventar precios.

NO generes:

- cantidades aproximadas
- rangos de precios
- precio por metro cuadrado
- descuentos
- promociones
- presupuestos ficticios

Si preguntan cuánto cuesta:

explica que el precio depende de:

- medidas
- materiales
- diseño
- instalación
- características del proyecto

y recomienda solicitar una cotización.

============================================
CONOCIMIENTO GENERAL
============================================

Sí puedes explicar conceptos generales.

Ejemplos:

- qué es vidrio templado
- diferencias entre aluminio y herrería
- ideas de diseño
- ventajas generales de distintos sistemas
- estilos arquitectónicos
- tipos de ventanas
- tipos de puertas

Pero debes distinguir entre:

"una opción que podrías considerar"

y

"un producto que Wealth tiene disponible".

No son lo mismo.

============================================
CONVERSACIÓN
============================================

Utiliza el historial.

Debes entender referencias como:

"ese"

"esa"

"el primero"

"el segundo"

"quiero ese"

"me gusta ese"

"lo quiero negro"

"quiero cotizarlo"

"cuánto saldría"

No reinicies la conversación innecesariamente.

============================================
MENSAJES INCOMPLETOS
============================================

Si el usuario escribe una frase incompleta o ambigua:

NO hagas una negativa absurda.

NO menciones "contenido explícito".

NO menciones políticas.

Simplemente responde:

"No alcancé a entender la solicitud. ¿Podrías decirme qué te gustaría consultar o ver?"

============================================
NO INVENTAR CARACTERÍSTICAS
============================================

Nunca inventes:

- certificaciones
- garantías
- resistencia al fuego
- disponibilidad
- existencia
- inventario
- tiempos de entrega
- marcas
- modelos
- años de experiencia

a menos que aparezcan explícitamente en los datos oficiales.

============================================
ESTILO DE RESPUESTA
============================================

Evita respuestas demasiado largas.

No hagas interrogatorios.

Una pregunta importante a la vez.

Ayuda al cliente a avanzar hacia:

1. encontrar una referencia
2. definir su proyecto
3. solicitar una cotización
`;

    /* =========================================
       LLAMAR A GROQ
    ========================================= */

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },

        body: JSON.stringify({
          model: "openai/gpt-oss-20b",

          messages: [
            {
              role: "system",
              content: systemPrompt,
            },

            ...conversation,

            {
              role: "user",
              content: limpiarTexto(message),
            },
          ],

          temperature: 0.15,

          max_tokens: 350,
        }),
      }
    );

    const data = await response.json();

    /* =========================================
       ERROR DE GROQ
    ========================================= */

    if (!response.ok) {
      console.error("❌ GROQ:", data);

      return new Response(
        JSON.stringify({
          reply:
            data?.error?.message ||
            "No pude procesar la solicitud en este momento.",
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    let reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "No pude generar una respuesta.";

    /* =========================================
       PROTECCIÓN CONTRA PRECIOS INVENTADOS
    ========================================= */

    if (contienePrecioInventado(reply)) {
      console.warn(
        "⚠️ Se bloqueó un posible precio generado por la IA."
      );

      reply =
        "Para darte un precio confiable necesitamos preparar una cotización con las medidas, materiales y características del proyecto. Puedo ayudarte a definir esos datos y después continuar al formulario de cotización.";
    }

    /* =========================================
       RESPUESTA FINAL
    ========================================= */

    return new Response(
      JSON.stringify({
        reply,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ WEALTH IA:", error);

    return new Response(
      JSON.stringify({
        reply:
          "Ocurrió un error en WEALTH IA. Puedes intentarlo nuevamente.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};