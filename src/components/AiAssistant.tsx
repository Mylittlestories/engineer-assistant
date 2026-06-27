import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Trash2, Bookmark, X, Lightbulb } from "lucide-react";

interface AiAssistantProps {
  selectedRecord: any;
  onClearSelectedRecord: () => void;
  language: "EN" | "GR";
  offlineRecords: any[];
}

const suggestedPrompts = [
  "What are the most common causes for this symptom?",
  "Walk me through the safety checklist before inspection",
  "What tools and measurements do I need?",
  "How do I isolate this system safely?",
];

export default function AiAssistant({ selectedRecord, onClearSelectedRecord, language, offlineRecords }: AiAssistantProps) {
  const [messages, setMessages] = useState<any[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello Chief. I'm your **Chief Engineer AI**. How can I assist you with marine engineering today?",
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
        text: `I'm now focused on **${selectedRecord.component}** (${selectedRecord.makeModel}).\n\nWhat would you like to know?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, msg]);
    }
  }, [selectedRecord]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: messageText,
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
          prompt: messageText,
          selectedRecord: selectedRecord,
          chatHistory: messages.slice(-8)
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
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: "⚠️ Unable to reach the AI service. Please check your connection.",
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
          <div className="w-9 h-9 bg-[#22d3ee] rounded-2xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#0a111f]" />
          </div>
          <div>
            <div className="font-semibold">Chief Engineer AI</div>
            <div className="text-emerald-400 text-xs">Professional Marine Assistant</div>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 hover:bg-[#11223b] rounded-xl"><Trash2 className="w-4 h-4" /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : ""}`}>
            <div className={`max-w-[88%] px-5 py-3.5 rounded-3xl leading-relaxed ${msg.sender === "user" 
              ? "bg-[#22d3ee] text-[#0a111f]" 
              : "bg-[#11223b]"}`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className="text-[10px] mt-2 opacity-60 text-right">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex">
            <div className="bg-[#11223b] px-5 py-3 rounded-3xl text-sm flex items-center gap-2">
              Analyzing engineering data...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length < 4 && (
        <div className="px-5 pb-3">
          <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
            <Lightbulb className="w-3 h-3" /> Suggested questions
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-3 py-1.5 bg-[#11223b] hover:bg-[#1e293b] border border-slate-700 rounded-2xl"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
            placeholder={selectedRecord ? `Ask about ${selectedRecord.component}...` : "Describe the issue or ask a question..."}
            className="flex-1 bg-[#11223b] border border-slate-700 rounded-3xl px-5 py-3 text-sm focus:outline-none focus:border-[#22d3ee]"
            disabled={isLoading}
          />
          <button 
            onClick={() => sendMessage()} 
            disabled={!input.trim() || isLoading}
            className="px-6 bg-[#22d3ee] text-[#0a111f] rounded-3xl disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
