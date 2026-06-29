import React, { useState, useEffect } from "react";
import { troubleshootingDatabase } from "./database";
import { TroubleshootingRecord } from "./types";
import ExcelDashboard from "./components/ExcelDashboard";
import AiAssistant from "./components/AiAssistant";
import { UnitConverter } from "./components/UnitConverter";
import QuickReference from "./components/QuickReference";
import LOTOChecklist from "./components/LOTOChecklist";
import { 
  Search, 
  Bot, 
  ArrowLeftRight, 
  Moon, 
  Sun, 
  ShieldCheck 
} from "lucide-react";

export default function App() {
  const [records, setRecords] = useState<TroubleshootingRecord[]>([]);
  const [selectedRecordForAi, setSelectedRecordForAi] = useState<TroubleshootingRecord | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("marine_engine_db_records");
    if (cached) {
      setRecords(JSON.parse(cached));
    } else {
      setRecords(troubleshootingDatabase);
      localStorage.setItem("marine_engine_db_records", JSON.stringify(troubleshootingDatabase));
    }
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("marine_theme", newTheme);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme === "light" ? "theme-light bg-[#f8fafc] text-slate-900" : "bg-[#0a111f] text-slate-200"}`}>
      
      {/* === PROFESSIONAL HEADER === */}
      <header className="bg-[#0b1424] border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#22d3ee] rounded-2xl flex items-center justify-center">
                <span className="text-[#0a111f] font-black text-2xl tracking-[-1px]">DRV</span>
              </div>
              <div>
                <div className="font-semibold text-xl tracking-tight">Engineer Assistant</div>
                <div className="text-[10px] text-slate-400 -mt-1">Professional Marine Engineering Toolkit</div>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search faults, components or symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#11223b] border border-slate-700 pl-11 py-2.5 rounded-2xl text-sm focus:outline-none focus:border-[#22d3ee]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleThemeToggle} className="p-2.5 hover:bg-[#11223b] border border-slate-700 rounded-2xl transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowTools(!showTools)} className="px-4 py-2 bg-[#11223b] hover:bg-[#1e293b] border border-slate-700 rounded-2xl text-sm transition-colors">
              Tools
            </button>
          </div>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Database */}
          <div className="lg:col-span-7">
            <div className="mb-4 px-2">
              <h2 className="text-xl font-semibold">Troubleshooting Database</h2>
              <p className="text-sm text-slate-400">Searchable offline knowledge base</p>
            </div>
            <div className="border border-slate-700 rounded-3xl overflow-hidden bg-[#0b1424]">
              <ExcelDashboard
                records={records}
                onAddRecord={() => {}}
                onUpdateRecord={() => {}}
                onDeleteRecord={() => {}}
                onSelectForAi={setSelectedRecordForAi}
                forceOpenRecordId={null}
                onClearForceOpenRecordId={() => {}}
                language="EN"
                externalSearch={searchQuery}
              />
            </div>
          </div>

          {/* AI Assistant */}
          <div className="lg:col-span-5">
            <div className="mb-4 px-2 flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#22d3ee]" />
              <h2 className="text-xl font-semibold">Chief Engineer AI</h2>
            </div>
            <div className="border border-slate-700 rounded-3xl overflow-hidden h-[620px] bg-[#0b1424]">
              <AiAssistant
                selectedRecord={selectedRecordForAi}
                onClearSelectedRecord={() => setSelectedRecordForAi(null)}
                language="EN"
                offlineRecords={records}
              />
            </div>
          </div>
        </div>

        {/* Tools Panel */}
        {showTools && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickReference />
            <LOTOChecklist />
            <div className="bg-[#0b1424] border border-slate-700 rounded-3xl p-5">
              <div className="text-sm font-semibold mb-4 text-[#22d3ee]">Engineering Tools</div>
              <button 
                onClick={() => { /* Open converter */ }} 
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#11223b] hover:bg-[#1e293b] border border-slate-700 rounded-2xl mb-3"
              >
                <ArrowLeftRight className="w-4 h-4" /> Unit Converter
              </button>
              <div className="text-xs text-center text-slate-400 mt-2">More tools available in future updates</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-[#0b1424] py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22d3ee]" />
            <span>SOLAS • MARPOL • STCW Compliant • Fully Offline</span>
          </div>
          <div>v1.5.0 — Professional Marine Engineering Tool</div>
        </div>
      </footer>
    </div>
  );
}
