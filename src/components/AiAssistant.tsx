import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { 
  Bot, 
  Send, 
  Trash2, 
  Sparkles, 
  HelpCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  X,
  Bookmark,
  BookmarkCheck,
  Search,
  BookOpen,
  PlusCircle,
  FileCheck,
  Download,
  Check,
  BookMarked,
  FolderMinus,
  Briefcase
} from "lucide-react";
import { ChatMessage, TroubleshootingRecord, SavedQaItem } from "../types";
import { uiTranslations } from "../translations";

interface AiAssistantProps {
  selectedRecord: TroubleshootingRecord | null;
  onClearSelectedRecord: () => void;
  language?: "EN" | "GR";
}

export default function AiAssistant({ selectedRecord, onClearSelectedRecord, language = "EN" }: AiAssistantProps) {
  const t = uiTranslations[language];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Saved Offline Lessons/Q&A state
  const [savedLessons, setSavedLessons] = useState<SavedQaItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"chat" | "vault">("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);

  // Manual draft states
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [customAnswer, setCustomAnswer] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [expandedSavedId, setExpandedSavedId] = useState<string | null>(null);

  // Suggested shipboard Q&A prompt presets
  const promptPresets = [
    {
      title: "Scavenge Space Fire",
      query: "My 2-stroke propulsion engine is showing a scavenge space temperature rise. What is the immediate safety protocol?"
    },
    {
      title: "OWS ppm High Limit",
      query: "The 15ppm bilge monitor is reading high and discharging to sump. How can I clean and calibrate the photoelectric sensor?"
    },
    {
      title: "Boiler Ignition Failure",
      query: "The auxiliary boiler keeps tripping with a flame failure alarm after burner startup. Help me trace the electrical and fuel issues."
    }
  ];

  // Load saved Q&As from localStorage on initialization
  useEffect(() => {
    try {
      const stored = localStorage.getItem("marine_ai_saved_qa");
      if (stored) {
        setSavedLessons(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to read saved Q&As from localStorage", e);
    }
  }, []);

  // Sync to localStorage
  const saveLessonsToStorage = (updatedList: SavedQaItem[]) => {
    setSavedLessons(updatedList);
    try {
      localStorage.setItem("marine_ai_saved_qa", JSON.stringify(updatedList));
    } catch (e) {
      console.error("Failed to write saved Q&As to localStorage", e);
    }
  };

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeSubTab]);

  // Handle case where user selects a record from the Excel dashboard rows
  useEffect(() => {
    if (selectedRecord) {
      // Switch back to chat tab when context is parsed
      setActiveSubTab("chat");
      const systemMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        sender: "assistant",
        text: `### ⚓ Chief Advisor Synced // Component: **${selectedRecord.component}**\n\nI have localized my engineering diagnostic logic to the **${selectedRecord.makeModel} — ${selectedRecord.component}** which is experiencing:  \n**"${selectedRecord.faultSymptom}"**\n\nHow do you want to troubleshoot this issue? Ask me to: \n- Explain the physical chemistry behind the possible causes. \n- Formulate a strict safety checklist for the crew before overhauling. \n- Illustrate detailed mechanical tools needed and a step-by-step repair guide.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, systemMsg]);
    }
  }, [selectedRecord]);

  // Initial welcome message if chat starts empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "assistant",
          text: `### ⚓ Welcome to the Ship Engine Room AI Control Panel\n\nI am your AI Chief Engineer. I can advise you on complex mechanical troubleshooting, safety guidelines, and operations for propulsion engines, diesel generators, and all auxiliary machineries.\n\nBrowse search terms, click **AI Troubleshoot** on any database record to sync diagnostic focus, or ask a direct question below to begin!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [messages]);

  // Clear Chat History
  const clearChat = () => {
    if (window.confirm(language === "EN" ? "Do you want to reset the conversation logs?" : "Θέλετε να επαναφέρετε το ιστορικό της συζήτησης;")) {
      setMessages([]);
      onClearSelectedRecord();
    }
  };

  // Submit query
  const handleSendMessage = async (textToSend: string) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText) return;

    setInputText("");
    
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/troubleshoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmedText,
          chatHistory: messages.filter(m => m.id !== "welcome"),
          selectedRecord: selectedRecord
        })
      });

      if (!response.ok) {
        throw new Error("HTTP connection error or missing server.ts configuration");
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        sender: "assistant",
        text: data.text || "I was unable to analyze this symptom. Please crossreference with offline ship manuals limit values.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

    } catch (err: any) {
      console.error("AI request failure: ", err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "assistant",
        text: `### ⚠️ Diagnostic Link Failure\n\nI was unable to reach the AI model server. \n- **Check Server**: Ensure you have configured your \`GEMINI_API_KEY\` in your secrets pane.\n- **Offline Fallback**: You can continue referencing the pre-loaded **Vast Offline Database** in the main sheet which contains step-by-step procedures completely independent of any server connections!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Save specific AI Message into Offline Learning Vault
  const handleSaveToVault = (assistantMsg: ChatMessage) => {
    if (savedLessons.some(item => item.answer === assistantMsg.text)) {
      return;
    }

    const assistantIndex = messages.findIndex(m => m.id === assistantMsg.id);
    let questionText = language === "EN" ? "General Shipboard AI Consultation" : "Γενική Συμβουλευτική Μηχανοστασίου AI";
    
    if (assistantIndex > 0) {
      for (let i = assistantIndex - 1; i >= 0; i--) {
        if (messages[i].sender === "user") {
          questionText = messages[i].text;
          break;
        }
      }
    } else if (selectedRecord) {
      questionText = language === "EN"
        ? `Symptom Consultation: ${selectedRecord.faultSymptom} on ${selectedRecord.component}`
        : `Διάγνωση Συμπτώματος: ${selectedRecord.faultSymptom} στο στοιχείο ${selectedRecord.component}`;
    }

    const newItem: SavedQaItem = {
      id: `saved-${Date.now()}`,
      question: questionText,
      answer: assistantMsg.text,
      timestamp: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      topic: selectedRecord?.component || (language === "EN" ? "AI Advisory" : "Συμβουλή AI")
    };

    const newList = [newItem, ...savedLessons];
    saveLessonsToStorage(newList);

    setSaveSuccessId(assistantMsg.id);
    setTimeout(() => {
      setSaveSuccessId(null);
    }, 2500);
  };

  // Delete saved lesson
  const handleDeleteSavedItem = (id: string) => {
    if (window.confirm(language === "EN" ? "Delete this saved learning card?" : "Διαγραφή αυτού του αποθηκευμένου μαθήματος;")) {
      const filtered = savedLessons.filter(item => item.id !== id);
      saveLessonsToStorage(filtered);
      if (expandedSavedId === id) {
        setExpandedSavedId(null);
      }
    }
  };

  // Export saved lessons as backup JSON
  const handleExportSavedLessons = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedLessons, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `marine_engine_ai_saved_qa_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  // Add customized study card manually
  const handleAddCustomLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || !customAnswer.trim()) return;

    const newItem: SavedQaItem = {
      id: `custom-${Date.now()}`,
      question: customQuestion.trim(),
      answer: customAnswer.trim(),
      timestamp: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      topic: customTopic.trim() || (language === "EN" ? "Manual Lesson" : "Χειροκίνητο Μάθημα")
    };

    const newList = [newItem, ...savedLessons];
    saveLessonsToStorage(newList);

    setCustomQuestion("");
    setCustomAnswer("");
    setCustomTopic("");
    setShowCustomForm(false);
    setExpandedSavedId(newItem.id);
  };

  // Filter saved lessons based on the query search bar
  const filteredLessons = savedLessons.filter(item => {
    const q = searchQuery.toLowerCase();
    return item.question.toLowerCase().includes(q) || 
           item.answer.toLowerCase().includes(q) || 
           (item.topic && item.topic.toLowerCase().includes(q));
  });

  return (
    <div className="flex flex-col h-full bg-[#0d1425] border border-slate-800 rounded-xl shadow-xl overflow-hidden shrink-0" id="ai-cabinet">
      
      {/* Tab Switcher Panel & Main Control */}
      <div className="p-3 bg-[#111827] border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3" id="ai-cabinet-header">
        
        {/* Logo and Identification */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Bot className="w-5 h-5 text-[#dfb15b]" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-slate-950 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-display uppercase tracking-wider">
              {language === "EN" ? "DIAGNOSTIC AI WORKSTATION" : "ΣΤΑΘΜΟΣ ΤΕΧΝΗΤΗΣ ΝΟΗΜΟΣΥΝΗΣ"}
              <Sparkles className="w-3.5 h-3.5 text-[#dfb15b] animate-pulse" />
            </h3>
            <p className="text-[9px] text-[#dfb15b] uppercase tracking-widest font-mono">
              {language === "EN" ? "Co-Pilot & Offline Knowledge Locker" : "Συνεργάτης Διάγνωσης & Τοπική Αποθήκη"}
            </p>
          </div>
        </div>

        {/* Local Workstation Sub-Tabs */}
        <div className="flex items-center gap-1.5 self-stretch md:self-auto w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("chat")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded transition-all cursor-pointer border ${
              activeSubTab === "chat"
                ? "bg-[#11223b] text-[#dfb15b] border-[#cca45c]/50 shadow-inner"
                : "bg-slate-900 text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{t.tabActiveChat}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("vault")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded transition-all cursor-pointer border ${
              activeSubTab === "vault"
                ? "bg-[#11223b] text-[#dfb15b] border-[#cca45c]/50 shadow-inner"
                : "bg-slate-900 text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>{t.tabLessons}</span>
            <span className="ml-1 bg-[#cca45c]/25 text-[#dfb15b] rounded-full px-1.5 py-0.2 text-[8px] border border-[#cca45c]/20">
              {savedLessons.length}
            </span>
          </button>
        </div>

      </div>

      {/* Sync Banner if active db focus is chosen */}
      {selectedRecord && activeSubTab === "chat" && (
        <div className="bg-[#11223b] border-b border-[#cca45c]/25 p-2 px-4 flex justify-between items-center text-xs text-sky-200 animate-fade-in" id="record-lock-banner">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 bg-[#dfb15b] rounded-full animate-ping shrink-0" />
            <span className="font-bold text-[#dfb15b] font-mono text-[10px] tracking-widest shrink-0 uppercase">ANALYZING SPEC CODES:</span>
            <span className="truncate italic text-slate-300 font-mono text-[11px]">{selectedRecord.component} ({selectedRecord.makeModel})</span>
          </div>
          <button 
            onClick={onClearSelectedRecord}
            className="p-0.5 bg-[#cca45c]/10 hover:bg-[#cca45c]/20 text-[#dfb15b] rounded transition-colors cursor-pointer"
            title="Deselect active machine reference"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Active Tab Screen Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">

        {activeSubTab === "chat" ? (
          /* ================= ACTIVE CHAT MODE ================= */
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs" id="chat-messages-scroll-area">
            {messages.map((msg) => {
              const isAI = msg.sender === "assistant";
              const isAlreadySaved = isAI && savedLessons.some(item => item.answer === msg.text);
              const isSuccess = saveSuccessId === msg.id;

              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[92%] ${isAI ? "self-start w-full" : "self-end"}`}
                  id={`chat-msg-${msg.id}`}
                >
                  {/* Sender Tag Header */}
                  <span className={`text-[9px] font-mono text-slate-400 mb-1 flex items-center justify-between gap-2 uppercase tracking-wider ${!isAI ? "self-end" : "self-start w-full"}`}>
                    <span className="flex items-center gap-1">
                      {isAI ? (
                        <>
                          <Bot className="w-3 h-3 text-[#dfb15b]" />
                          <span className="text-[#dfb15b] font-bold">CHIEF_ADVISOR.EXE</span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-bold">STAFF_ENGINEER</span>
                      )}
                      <span>•</span>
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      <span>{msg.timestamp}</span>
                    </span>

                    {/* Action buttons on AI response bubble */}
                    {isAI && msg.id !== "welcome" && (
                      <button
                        onClick={() => handleSaveToVault(msg)}
                        disabled={isAlreadySaved}
                        className={`p-1 px-2.5 rounded text-[9px] font-bold font-mono tracking-widest uppercase flex items-center gap-1.5 cursor-pointer select-none transition-all border ${
                          isSuccess
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/50"
                            : isAlreadySaved
                            ? "bg-[#11223b]/50 text-[#dfb15b]/60 border-[#cca45c]/20 cursor-default"
                            : "bg-[#11223b] hover:bg-[#1b3254] text-[#dfb15b] border-[#cca45c]/35 shadow-sm hover:scale-105 active:scale-95"
                        }`}
                        title={isAlreadySaved ? "Saved to offline database" : "Save this answer to offline Vault"}
                      >
                        {isSuccess ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>{language === "EN" ? "SAVED" : "ΑΠΟΘΗΚΕΥΤΗΚΕ"}</span>
                          </>
                        ) : isAlreadySaved ? (
                          <>
                            <FileCheck className="w-3 h-3 text-emerald-400" />
                            <span>{language === "EN" ? "OFFLINE SAVED" : "OFFLINE ΑΠΟΘΗΚΕΥΜΕΝΟ"}</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3 h-3 text-[#dfb15b]" />
                            <span>{t.buttonSaveToVault}</span>
                          </>
                        )}
                      </button>
                    )}
                  </span>

                  {/* Message Bubble Frame */}
                  <div className={`p-3.5 rounded-lg border leading-relaxed text-xs shadow-md ${
                    isAI 
                      ? "bg-[#0b1424]/75 border-slate-800 text-slate-200" 
                      : "bg-[#11223b]/60 border-[#cca45c]/20 text-slate-100 self-end"
                  }`}>
                    {isAI ? (
                      <div className="markdown-body select-text flex flex-col gap-2">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap select-text font-mono text-[11px] text-slate-200">{msg.text}</p>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Loading Bubble */}
            {isLoading && (
              <div className="flex flex-col max-w-[90%] self-start animate-pulse" id="ai-chat-loader">
                <span className="text-[9px] font-mono text-[#dfb15b] mb-1 flex items-center gap-1 uppercase tracking-wider">
                  <Bot className="w-3 h-3 text-[#dfb15b]" />
                  <span>CHIEF_ADVISOR.EXE</span>
                </span>
                <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center gap-2.5 text-slate-300">
                  <Loader2 className="w-4 h-4 text-[#dfb15b] animate-spin" />
                  <span className="italic text-2xs font-mono text-slate-400">
                    {language === "EN" 
                      ? "Chief Engineer analyzing telemetry, mapping safety variables..."
                      : "Ο Πρώτος αναλύει σενάρια βλαβών, υπολογίζει όρια ασφαλείας..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* ================= VAULT OFFLINE MODE ================= */
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-xs" id="vault-tab-inner">
            
            {/* Header controls inside offline locker */}
            <div className="bg-[#0c1524] p-3 border border-slate-800/80 rounded-lg flex flex-col gap-3 shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                
                <h4 className="text-xs font-bold text-slate-100 font-display flex items-center gap-2 uppercase tracking-wide">
                  <BookOpen className="w-4 h-4 text-[#dfb15b]" />
                  <span>{t.savedLessonsTitle}</span>
                </h4>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  {savedLessons.length > 0 && (
                    <button
                      onClick={handleExportSavedLessons}
                      className="p-1 px-2.5 bg-slate-900 hover:bg-slate-805 text-slate-300 hover:text-white border border-slate-800 hover:border-[#cca45c]/30 rounded text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                      title="Export all database learning units into physical JSON files"
                    >
                      <Download className="w-3 h-3 text-[#dfb15b]" />
                      <span>{language === "EN" ? "Backup Locker" : "Εξαγωγή Αντιγράφου"}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowCustomForm(!showCustomForm)}
                    className="p-1 px-2.5 bg-[#11223b] hover:bg-[#1b3254] text-[#dfb15b] border border-[#cca45c]/40 rounded text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-inner"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{showCustomForm ? (language === "EN" ? "Cancel" : "Ακύρωση") : (language === "EN" ? "Draft Card" : "Προσθήκη Κάρτας")}</span>
                  </button>
                </div>

              </div>

              {/* Offline Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t.labelSearchLessons}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#050a14] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 py-1.5 pl-8 pr-3 rounded focus:outline-none focus:border-[#cca45c]/50 font-mono"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Custom Manual Lesson Card Creator Block */}
            {showCustomForm && (
              <form 
                onSubmit={handleAddCustomLesson}
                className="bg-[#0b1424] border border-[#cca45c]/30 rounded-lg p-3.5 p-4 flex flex-col gap-3 animate-fade-in"
              >
                <div className="flex justify-between items-center border-b border-[#cca45c]/10 pb-2">
                  <span className="text-xs font-bold text-[#dfb15b] font-display uppercase tracking-wider flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4" />
                    <span>{t.customLessonFormTitle}</span>
                  </span>
                  <button type="button" onClick={() => setShowCustomForm(false)} className="text-slate-500 hover:text-slate-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">{language === "EN" ? "Machine Segment / Topic" : "Μηχάνημα / Θέμα"}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Scavenge System, HP Injectors No.4"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 tracking-wide py-1 text-slate-200 text-xs focus:ring-1 focus:ring-[#cca45c]/50 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">{t.customLessonLabelQuestion}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.customLessonPlaceholderQ}
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-[#cca45c]/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">{t.customLessonLabelAnswer}</label>
                  <textarea
                    required
                    rows={3}
                    placeholder={t.customLessonPlaceholderA}
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-[#cca45c]/50 focus:outline-none font-mono"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#cca45c] hover:bg-[#8c6b2d] text-slate-950 hover:text-white font-bold rounded text-xs transition-colors uppercase tracking-wider font-mono flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.buttonAddCustomLesson}</span>
                </button>
              </form>
            )}

            {/* Offline Database Render list */}
            {filteredLessons.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-850 rounded-lg bg-slate-900/20 text-slate-400 gap-2 flex-1" id="vault-empty-view">
                <FileCheck className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="max-w-xs font-medium text-slate-400 leading-relaxed text-[11px] font-sans">
                  {t.savedLessonsEmpty}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 flex-1 pb-4" id="vault-cards-list">
                {filteredLessons.map((item) => {
                  const isExpanded = expandedSavedId === item.id;
                  return (
                    <div 
                      key={item.id}
                      className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                        isExpanded 
                          ? "bg-[#0f1a2e] border-[#cca45c]/50 shadow-md" 
                          : "bg-[#0b1424] hover:bg-[#11223b]/50 border-slate-800 hover:border-slate-750"
                      }`}
                    >
                      {/* Card Header clickable to expand */}
                      <div 
                        onClick={() => setExpandedSavedId(isExpanded ? null : item.id)}
                        className="p-3 flex justify-between items-start gap-4 cursor-pointer select-none"
                      >
                        <div className="flex-1 min-w-0">
                          {/* Topic label tag */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-[#11223b] text-[#dfb15b] border border-[#cca45c]/30 text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.2 rounded">
                              {item.topic}
                            </span>
                            <span className="text-[8px] text-slate-500 font-mono">
                              {item.timestamp}
                            </span>
                          </div>
                          {/* Question text */}
                          <h5 className="text-[11px] font-bold text-slate-100 font-mono tracking-normal leading-snug line-clamp-2">
                            {item.question}
                          </h5>
                        </div>

                        {/* Expand / delete actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSavedItem(item.id);
                            }}
                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded transition-all"
                            title={t.buttonDeleteLesson}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Body - Markdown Content Renderer */}
                      {isExpanded && (
                        <div className="p-3.5 bg-[#080d19]/80 border-t border-slate-800/80 animate-fade-in text-slate-200 select-text leading-relaxed">
                          <div className="markdown-body text-xs">
                            <Markdown>{item.answer}</Markdown>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Suggested Input Presets (Shown in Active conversation when logs are sparse) */}
      {messages.length <= 2 && !isLoading && activeSubTab === "chat" && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-2 shrink-0" id="ai-quick-presets">
          <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-[#dfb15b]" />
            {language === "EN" ? "Suggested Diagnostic Scenarios" : "Προτεινόμενα Σενάρια Διάγνωσης"}
          </p>
          <div className="flex flex-col gap-1.5">
            {promptPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(preset.query)}
                className="text-left text-[11px] p-2 bg-[#111827]/40 hover:bg-[#111827] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded font-medium transition-all truncate cursor-pointer"
                title={preset.query}
              >
                <b className="text-[#dfb15b]">{preset.title}:</b> {preset.query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box Area when chatting */}
      {activeSubTab === "chat" && (
        <div className="p-3 bg-[#111827] border-t border-slate-800 shrink-0" id="ai-input-chamber">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <div className="text-cyan-500">
              <Bot className="w-4 h-4 text-[#dfb15b] animate-pulse" />
            </div>
            <input
              id="chat-input-field"
              type="text"
              placeholder={selectedRecord ? "Query synced active fault code parameters..." : "Query ship diagnostics, calculations, or manuals..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleSendMessage(inputText);
                }
              }}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none text-xs text-slate-200 focus:ring-0 placeholder-slate-500 focus:outline-none"
            />
            <button
              id="send-chat-btn"
              onClick={() => handleSendMessage(inputText)}
              disabled={isLoading || !inputText.trim()}
              className="px-3 py-1 bg-[#cca45c] hover:bg-[#8c6b2d] text-slate-950 font-bold hover:text-white text-[11px] rounded shadow-sm cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 transition-colors uppercase tracking-wider font-mono"
              title="Transmit message to AI Chief"
            >
              {language === "EN" ? "SEND" : "ΑΠΟΣΤΟΛΗ"}
            </button>
          </div>
          <div className="mt-2 text-[9px] text-slate-600 text-center font-mono uppercase tracking-wide" id="engine-advisory-clause">
            <span>* SECURITY ADVISORY: COUPLING ME-C V4.2 / COMPLIANT WITH SOLAS INTERFACES</span>
          </div>
        </div>
      )}
    </div>
  );
}
