import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Trash2, Settings, X, Lightbulb, Key, Printer, Bookmark } from "lucide-react";

interface AiAssistantProps {
  selectedRecord: any;
  onClearSelectedRecord: () => void;
  language: "EN" | "GR";
  offlineRecords: any[];
}

const suggestedPrompts = [
  "What are the most common causes?",
  "Give me the safety checklist",
  "What tools do I need?",
  "Walk me through troubleshooting steps",
  "What could go wrong if I miss this?",
];

export default function AiAssistant({ selectedRecord, onClearSelectedRecord, language, offlineRecords }: AiAssistantProps) {
  const [messages, setMessages] = useState<any[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello Chief. I'm your **Chief Engineer AI**. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [aiConfigured, setAiConfigured] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch("/api/settings/status");
        if (res.ok) {
          const data = await res.json();
          setAiConfigured(data.configured);
        }
      } catch {}
    };
    checkConfig();
  }, []);

  useEffect(() => {
    if (selectedRecord) {
      const msg = {
        id: `focus-${Date.now()}`,
        sender: "assistant",
        text: `Focused on **${selectedRecord.component}** (${selectedRecord.makeModel}).\n\nWhat would you like to know?`,
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
      const fallback = buildOfflineResponse(messageText);
      setMessages(prev => [...prev, {
        id: `offline-${Date.now()}`,
        sender: "assistant",
        text: fallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const buildOfflineResponse = (query: string) => {
    if (!selectedRecord && offlineRecords.length === 0) {
      return "I'm currently in offline mode. Please configure your Gemini API key in settings for full AI capabilities.";
    }

    let response = "### Offline Mode Active\n\n";

    if (selectedRecord) {
      response += `**Focused on:** ${selectedRecord.component} (${selectedRecord.makeModel})\n\n`;
      response += `**Symptom:** ${selectedRecord.faultSymptom}\n\n`;
      response += "**Likely Causes:**\n";
      selectedRecord.possibleCauses.forEach((c: string) => response += `- ${c}\n`);
      response += "\n**Recommended Actions:**\n";
      selectedRecord.troubleshootingSteps.forEach((s: string, i: number) => response += `${i + 1}. ${s}\n`);
    } else {
      const matches = offlineRecords.filter(r => 
        r.component.toLowerCase().includes(query.toLowerCase()) ||
        r.faultSymptom.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3);

      if (matches.length > 0) {
        response += "Here are the closest matches from your database:\n\n";
        matches.forEach((r, i) => {
          response += `**${i + 1}. ${r.component}** (${r.makeModel})\n`;
          response += `${r.faultSymptom}\n\n`;
        });
      } else {
        response += "No close matches found in your local database.";
      }
    }

    return response;
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

  const saveApiKey = async () => {
    if (!apiKey.trim()) return;

    try {
      await fetch("/api/settings/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim(), model: "gemini-2.5-flash" })
      });
      setAiConfigured(true);
      setShowSettings(false);
      setApiKey("");
      alert("API key saved successfully!");
    } catch {
      alert("Failed to save API key");
    }
  };

  const printChat = () => {
    const printContent = messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(`<pre>${printContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Save answer to local lessons vault
  const saveToVault = (msg: any) => {
    if (msg.sender !== "assistant") return;

    const vault = JSON.parse(localStorage.getItem("marine_ai_vault") || "[]");
    const newItem = {
      id: Date.now(),
      question: messages[messages.length - 2]?.text || "General Question",
      answer: msg.text,
      timestamp: new Date().toISOString(),
      relatedTo: selectedRecord?.component || "General"
    };
    vault.unshift(newItem);
    localStorage.setItem("marine_ai_vault", JSON.stringify(vault.slice(0, 100))); // Keep last 100
    alert("Answer saved to your Offline Lessons Vault!");
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
            <div className="text-emerald-400 text-xs">{aiConfigured ? "Online" : "Offline Mode"}</div>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={printChat} className="p-2 hover:bg-[#11223b] rounded-xl" title="Print Chat"><Printer className="w-4 h-4" /></button>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-[#11223b] rounded-xl"><Settings className="w-4 h-4" /></button>
          <button onClick={clearChat} className="p-2 hover:bg-[#11223b] rounded-xl"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : ""}`}>
            <div className={`max-w-[88%] px-5 py-3.5 rounded-3xl leading-relaxed ${msg.sender === "user" 
              ? "bg-[#22d3ee] text-[#0a111f]" 
              : "bg-[#11223b]"}`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className="text-[10px] mt-2 opacity-60 text-right flex justify-between items-center">
                <span>{msg.timestamp}</span>
                {msg.sender === "assistant" && msg.id !== "welcome" && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(msg.text)}
                      className="text-[#22d3ee] hover:text-white"
                      title="Copy"
                    >
                      Copy
                    </button>
                    <button 
                      onClick={() => saveToVault(msg)} 
                      className="text-[#22d3ee] hover:text-white"
                      title="Save to Vault"
                    >
                      <Bookmark className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
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
      {messages.length < 5 && (
        <div className="px-5 pb-3">
          <div className="text-xs text-slate-400 mb-2 flex items-center gap-2"><Lightbulb className="w-3 h-3" /> Try asking:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, i) => (
              <button key={i} onClick={() => sendMessage(prompt)} className="text-xs px-3 py-1.5 bg-[#11223b] hover:bg-[#1e293b] border border-slate-700 rounded-2xl">
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
            className="px-6 bg-[#22d3ee] text-[#0a111f] rounded-3xl disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1424] border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4">
              <div className="font-semibold flex items-center gap-2"><Key className="w-4 h-4" /> AI Settings</div>
              <button onClick={() => setShowSettings(false)}><X /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400">Gemini API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your Gemini API key"
                  className="w-full mt-1 bg-[#11223b] border border-slate-700 rounded-xl p-3"
                />
              </div>

              <div className="text-xs text-slate-400">
                Get your free API key from Google AI Studio. It is stored locally on your device.
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSettings(false)} className="flex-1 py-3 border border-slate-700 rounded-2xl">Cancel</button>
                <button onClick={saveApiKey} className="flex-1 py-3 bg-[#22d3ee] text-[#0a111f] rounded-2xl font-medium">Save Key</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
