import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("WEALTH IA backend funcionando 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Escribe un mensaje" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ reply: "Falta GROQ_API_KEY en .env" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "Eres un asistente experto en construcción, vidrio y aluminio."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ GROQ ERROR:", data);
      return res.status(500).json({
        reply: data?.error?.message || "Error en Groq API",
      });
    }

    res.json({
      reply: data?.choices?.[0]?.message?.content || "Sin respuesta",
    });

  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    res.status(500).json({ reply: "Error en servidor" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("✅ WEALTH IA corriendo en http://localhost:" + PORT);
});