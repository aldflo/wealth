import { useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import SuggestedQuestions from "./SuggestedQuestions";
import ProjectGallery from "./ProjectGallery";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";

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
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await res.json();

      const aiText = data?.reply || "No pude generar respuesta.";

      const aiMessage = {
        role: "ai",
        content: aiText,
      };

      setMessages([...newMessages, aiMessage]);

      if (
        aiText.toLowerCase().includes("cancel") ||
        aiText.toLowerCase().includes("vidrio") ||
        aiText.toLowerCase().includes("proyecto")
      ) {
        setProjects([
          {
            id: 1,
            title: "Cancel de vidrio moderno",
            img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          },
          {
            id: 2,
            title: "Fachada minimalista",
            img: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
          },
        ]);
      }
    } catch (err) {
      console.error(err);

      setMessages([
        ...newMessages,
        { role: "ai", content: "Error al conectar con IA" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white">
      
      {/* Header con estilo oscuro */}
      <div className="border-b border-[#c89b3c]/30 bg-black/40 backdrop-blur-md">
        <ChatHeader />
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
        {messages.length === 0 ? (
          <EmptyState onSelect={sendMessage} />
        ) : (
          <ChatMessages messages={messages} />
        )}
      </div>

      {/* Indicador */}
      {loading && (
        <div className="text-[#c89b3c]">
          <TypingIndicator />
        </div>
      )}

      {/* Proyectos */}
      {projects.length > 0 && (
        <div className="border-t border-[#c89b3c]/20 bg-black/30">
          <ProjectGallery projects={projects} />
        </div>
      )}

      {/* Sugerencias */}
      <div className="bg-black/40 border-t border-[#c89b3c]/20">
        <SuggestedQuestions onSelect={sendMessage} />
      </div>

      {/* Input */}
      <div className="bg-black/60 border-t border-[#c89b3c]/30 backdrop-blur-md">
        <ChatInput
          value={input}
          setValue={setInput}
          onSend={() => sendMessage()}
          loading={loading}
        />
      </div>

    </div>
  );
}