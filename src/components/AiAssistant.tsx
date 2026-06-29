import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Trash2 } from "lucide-react";

interface AiAssistantProps {
  selectedRecord: any;
  onClearSelectedRecord: () => void;
  language: "EN" | "GR";
  offlineRecords: any[];
}

export default function AiAssistant({ selectedRecord, onClearSelectedRecord, language, offlineRecords }: AiAssistantProps) {
  const [messages, setMessages] = useState<any[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello. I'm your Chief Engineer AI. How can I help you?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (selectedRecord) {
      const msg = {
        id: `focus-${Date.now()}`,
        sender: "assistant",
        text: `Focused on **${selectedRecord.component}**. What would you like to know?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, msg]);
    }
  }, [selectedRecord]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/troubleshoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input.trim(),
          selectedRecord: selectedRecord,
          chatHistory: messages.slice(-6)
        })
      });
      const data = await res.json();

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: data.text || "I couldn't generate a response.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `offline-${Date.now()}`,
        sender: "assistant",
        text: "I'm in offline mode. Please check your API key for full functionality.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      sender: "assistant",
      text: "Chat cleared. How can I help you?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    onClearSelectedRecord();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-[#0b1424]">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#22d3ee]" />
          <span className="font-medium">AI Assistant</span>
        </div>
        <button onClick={clearChat} className="p-1.5 hover:bg-[#11223b] rounded-xl"><Trash2 className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : ""}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${msg.sender === "user" ? "bg-[#22d3ee] text-[#0a111f]" : "bg-[#11223b]"}`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-slate-400">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask anything..."
            className="flex-1 bg-[#11223b] border border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none"
            disabled={isLoading}
          />
          <button onClick={sendMessage} disabled={!input.trim() || isLoading} className="px-5 bg-[#22d3ee] text-[#0a111f] rounded-2xl disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
