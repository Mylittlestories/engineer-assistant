import React, { useState, useEffect } from "react";
import { troubleshootingDatabase } from "./database";
import { TroubleshootingRecord } from "./types";
import ExcelDashboard from "./components/ExcelDashboard";
import AiAssistant from "./components/AiAssistant";
import { UnitConverter } from "./components/UnitConverter";
import { 
  Search, 
  Bot, 
  ArrowLeftRight, 
  Moon, 
  Sun, 
  Globe,
  ShieldCheck,
  Settings
} from "lucide-react";

export default function App() {
  const [records, setRecords] = useState<TroubleshootingRecord[]>([]);
  const [selectedRecordForAi, setSelectedRecordForAi] = useState<TroubleshootingRecord | null>(null);
  const [language, setLanguage] = useState<"EN" | "GR">("EN");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [showConverter, setShowConverter] = useState(false);
  const [showAiSettings, setShowAiSettings] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("marine_engine_db_records");
    if (cached) {
      setRecords(JSON.parse(cached));
    } else {
      setRecords(troubleshootingDatabase);
      localStorage.setItem("marine_engine_db_records", JSON.stringify(troubleshootingDatabase));
    }
  }, []);

  const saveRecords = (updated: TroubleshootingRecord[]) => {
    setRecords(updated);
    localStorage.setItem("marine_engine_db_records", JSON.stringify(updated));
  };

  const handleAddRecord = (newRec: TroubleshootingRecord) => saveRecords([newRec, ...records]);
  const handleUpdateRecord = (updatedRec: TroubleshootingRecord) => {
    const updated = records.map(r => r.id === updatedRec.id ? updatedRec : r);
    saveRecords(updated);
  };
  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    saveRecords(updated);
    if (selectedRecordForAi?.id === id) setSelectedRecordForAi(null);
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("marine_theme", newTheme);
  };

  // Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme === "light" ? "theme-light bg-[#f8fafc] text-slate-900" : "bg-[#0a111f] text-slate-200"}`}>
      
      {/* Header */}
      <header className="bg-[#0b1424] border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#22d3ee] rounded-2xl flex items-center justify-center">
              <span className="text-[#0a111f] font-black text-xl">DRV</span>
            </div>
            <div>
              <div className="font-semibold text-lg tracking-tight">Engineer Assistant</div>
              <div className="text-[10px] text-slate-400 -mt-1">Professional Marine Engineering Toolkit</div>
            </div>
          </div>

          {/* Global Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search faults, components, symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#11223b] border border-slate-700 pl-11 py-2.5 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#22d3ee]"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button onClick={handleThemeToggle} className="p-2.5 hover:bg-[#11223b] border border-slate-700 rounded-2xl">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button onClick={() => setLanguage(l => l === "EN" ? "GR" : "EN")} className="flex items-center gap-2 px-3 py-2 hover:bg-[#11223b] border border-slate-700 rounded-2xl text-sm">
              <Globe className="w-4 h-4" />
              <span className="font-mono text-xs">{language}</span>
            </button>

            <button onClick={() => setShowConverter(!showConverter)} className="flex items-center gap-2 px-4 py-2 bg-[#11223b] hover:bg-[#1e293b] border border-slate-700 rounded-2xl text-sm">
              <ArrowLeftRight className="w-4 h-4" />
              <span>Converter</span>
            </button>

            <button onClick={() => setShowAiSettings(true)} className="flex items-center gap-2 px-4 py-2 bg-[#11223b] hover:bg-[#1e293b] border border-slate-700 rounded-2xl text-sm">
              <Settings className="w-4 h-4" />
              <span>AI Key</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Database */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4 px-1">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Troubleshooting Database</h2>
                <p className="text-sm text-slate-400">Offline marine engineering knowledge base</p>
              </div>
              <div className="text-xs px-4 py-1.5 bg-[#11223b] border border-slate-700 rounded-full text-[#22d3ee]">
                {records.length} records
              </div>
            </div>

            <div className="border border-slate-700 rounded-3xl overflow-hidden bg-[#0b1424]">
              <ExcelDashboard
                records={records}
                onAddRecord={handleAddRecord}
                onUpdateRecord={handleUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
                onSelectForAi={setSelectedRecordForAi}
                forceOpenRecordId={null}
                onClearForceOpenRecordId={() => {}}
                language={language}
                externalSearch={searchQuery}
              />
            </div>
          </div>

          {/* AI Assistant */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#22d3ee]" />
                <h2 className="text-2xl font-semibold tracking-tight">Chief Engineer AI</h2>
              </div>
              {selectedRecordForAi && (
                <button onClick={() => setSelectedRecordForAi(null)} className="text-xs px-3 py-1 bg-[#11223b] hover:bg-red-900/30 border border-slate-700 rounded-full">
                  Clear Focus
                </button>
              )}
            </div>

            <div className="border border-slate-700 rounded-3xl overflow-hidden h-[620px] bg-[#0b1424]">
              <AiAssistant
                selectedRecord={selectedRecordForAi}
                onClearSelectedRecord={() => setSelectedRecordForAi(null)}
                language={language}
                offlineRecords={records}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-[#0b1424] py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22d3ee]" />
            <span>SOLAS • MARPOL • STCW Compliant • Fully Offline</span>
          </div>
          <div>Professional Marine Engineering Tool • v1.3.4</div>
        </div>
      </footer>

      {/* Floating Converter */}
      {showConverter && (
        <div className="fixed bottom-6 right-6 w-[380px] z-50 shadow-2xl">
          <UnitConverter language={language} isWidgetMode onCloseWidget={() => setShowConverter(false)} />
        </div>
      )}

      {/* AI Settings Modal */}
      {showAiSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1424] border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4">
              <div className="font-semibold">AI Configuration</div>
              <button onClick={() => setShowAiSettings(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="text-sm text-slate-300">
              To use the online AI, please open the <strong>Chief Engineer AI</strong> panel and click the settings icon (gear) inside it to configure your Gemini API key.
            </div>
            <button onClick={() => setShowAiSettings(false)} className="mt-6 w-full py-3 border border-slate-700 rounded-2xl">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
