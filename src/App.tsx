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
  X 
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
      
      {/* === SIMPLE CLEAN HEADER === */}
      <header className="bg-[#0b1424] border-b border-slate-700 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#22d3ee] rounded-2xl flex items-center justify-center">
              <span className="text-[#0a111f] font-black text-xl">DRV</span>
            </div>
            <div className="font-semibold text-lg">Engineer Assistant</div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleThemeToggle} className="p-2 hover:bg-[#11223b] rounded-xl">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button onClick={() => setShowTools(!showTools)} className="px-4 py-2 bg-[#11223b] hover:bg-[#1e293b] border border-slate-700 rounded-2xl text-sm">
              Tools
            </button>
          </div>
        </div>
      </header>

      {/* === MAIN AREA === */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Type what you're looking for... (e.g. 'scavenge fire', 'high exhaust temp')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#11223b] border border-slate-700 pl-14 py-4 rounded-3xl text-lg placeholder:text-slate-400 focus:outline-none focus:border-[#22d3ee]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Database */}
          <div className="lg:col-span-7">
            <div className="mb-4 px-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Troubleshooting Records</h2>
                <p className="text-sm text-slate-400">Search or browse the database</p>
              </div>
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
            <div className="border border-slate-700 rounded-3xl overflow-hidden h-[580px] bg-[#0b1424]">
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
              <div className="text-sm font-semibold mb-4 text-[#22d3ee]">Quick Tools</div>
              <button 
                onClick={() => setShowConverter(true)} 
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#11223b] hover:bg-[#1e293b] border border-slate-700 rounded-2xl mb-3"
              >
                <ArrowLeftRight className="w-4 h-4" /> Unit Converter
              </button>
              <div className="text-xs text-center text-slate-400">More tools coming soon</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-[#0b1424] py-4 text-center text-xs text-slate-400">
        SOLAS • MARPOL • STCW Compliant • Fully Offline • v1.4.8
      </footer>

      {/* Floating Converter */}
      {showConverter && (
        <div className="fixed bottom-6 right-6 w-[380px] z-50 shadow-2xl">
          <UnitConverter language="EN" isWidgetMode onCloseWidget={() => setShowConverter(false)} />
        </div>
      )}
    </div>
  );
}
