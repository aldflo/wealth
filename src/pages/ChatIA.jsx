import { useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import SuggestedQuestions from "./SuggestedQuestions";
import ProjectGallery from "./ProjectGallery";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";

import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase.config";

/* 🔥 FIRESTORE RECOMENDACIONES */
const getRecomendaciones = async (text) => {
  const t = text.toLowerCase();

  let subcategoria = null;

  if (t.includes("puerta")) subcategoria = "puertas";
  if (t.includes("ventana")) subcategoria = "ventanas";
  if (t.includes("cancel")) subcategoria = "canceles";
  if (t.includes("vidrio")) subcategoria = "puertas";

  if (!subcategoria) return [];

  const q = query(
    collection(db, "galeria"),
    where("subcategoria", "==", subcategoria),
    limit(6)
  );

  const snap = await getDocs(q);

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export default function ChatIA() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setProjects([]);

    try {
      /* 🤖 BACKEND */
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error("Error backend IA");

      const data = await res.json();

      const aiText = data?.reply || "Sin respuesta";

      setMessages([...newMessages, {
        role: "ai",
        content: aiText
      }]);

      /* 🔥 GALERÍA REAL */
      const recomendaciones = await getRecomendaciones(text);

      if (recomendaciones.length > 0) {
        setProjects(
          recomendaciones.map(item => ({
            id: item.id,
            title: item.titulo,
            img: item.imagenes?.[0] || ""
          }))
        );
      }

    } catch (err) {
      console.error("ERROR CHAT:", err);

      setMessages([...newMessages, {
        role: "ai",
        content: "Error al conectar con IA"
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white">

      <div className="border-b border-[#c89b3c]/30 bg-black/40 backdrop-blur-md">
        <ChatHeader />
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState onSelect={sendMessage} />
        ) : (
          <ChatMessages messages={messages} />
        )}
      </div>

      {loading && <TypingIndicator />}

      {projects.length > 0 && (
        <ProjectGallery projects={projects} />
      )}

      <SuggestedQuestions onSelect={sendMessage} />

      <ChatInput
        value={input}
        setValue={setInput}
        onSend={() => sendMessage()}
        loading={loading}
      />
    </div>
  );
}