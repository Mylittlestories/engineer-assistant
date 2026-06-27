import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Trash2, Bookmark, Settings, X } from "lucide-react";

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
      text: "Hello, I'm your **Chief Engineer AI**. How can I assist you with marine engineering today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto message when record is selected
  useEffect(() => {
    if (selectedRecord) {
      const msg = {
        id: `sys-${Date.now()}`,
        sender: "assistant",
        text: `I'm now focused on **${selectedRecord.component}** (${selectedRecord.makeModel}).\n\nWhat would you like to know about this issue?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, msg]);
    }
  }, [selectedRecord]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/troubleshoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input.trim(),
          selectedRecord: selectedRecord || null,
          chatHistory: messages.slice(-6)
        })
      });

      const data = await res.json();

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: data.text || "I couldn't generate a response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        sender: "assistant",
        text: "⚠️ Unable to connect to the AI service. Please check your connection or API key.",
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
    <div className="flex flex-col h-full bg-[#0b1424]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#22d3ee] rounded-xl flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#0a111f]" />
          </div>
          <div>
            <div className="font-semibold">Chief Engineer AI</div>
            <div className="text-xs text-emerald-400">Online • Ready to assist</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedRecord && (
            <div className="text-xs px-3 py-1 bg-[#11223b] rounded-full border border-[#22d3ee]/30 text-[#22d3ee]">
              Focused
            </div>
          )}
          <button onClick={clearChat} className="p-2 hover:bg-[#11223b] rounded-xl">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : ""}`}>
            <div className={`max-w-[85%] ${msg.sender === "user" ? "bg-[#22d3ee] text-[#0a111f]" : "bg-[#11223b]"} px-5 py-3 rounded-2xl`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className="text-[10px] mt-1.5 opacity-60 text-right">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex">
            <div className="bg-[#11223b] px-5 py-3 rounded-2xl flex items-center gap-2">
              <div className="animate-pulse">Thinking...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={selectedRecord ? `Ask about ${selectedRecord.component}...` : "Ask anything about marine engineering..."}
            className="flex-1 bg-[#11223b] border border-slate-700 rounded-2xl px-5 py-3 text-sm focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-5 bg-[#22d3ee] text-[#0a111f] rounded-2xl disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center text-[10px] text-slate-500 mt-2">
          AI responses are based on engineering knowledge + your local database
        </div>
      </div>
    </div>
  );
}
