import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY,
});

// 💬 CHAT
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Escribe un mensaje" });
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash", // 🔥 ESTE ES EL CORRECTO
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    res.json({
      reply: result.text,
    });

  } catch (error) {
    console.error("❌ ERROR GEMINI:", error);

    res.status(500).json({
      reply: error?.message || "Error con Gemini",
    });
  }
});

app.listen(5000, () => {
  console.log("✅ WEALTH IA corriendo en http://localhost:5000");
});