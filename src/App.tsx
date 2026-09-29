import React, { useState, useEffect } from "react";
import { troubleshootingDatabase } from "./database";
import { TroubleshootingRecord } from "./types";
import ExcelDashboard from "./components/ExcelDashboard";
import AiAssistant from "./components/AiAssistant";
import { UnitConverter } from "./components/UnitConverter";
import EngineerSuite from "./components/EngineerSuite";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import {
  ArrowLeftRight,
  Bot,
  Database,
  Download,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  Wrench,
  X
} from "lucide-react";

const RECORDS_STORAGE_KEY = "marine_engine_db_records";
const THEME_STORAGE_KEY = "marine_theme";
const APP_VERSION = "2.0.0";

function loadStoredRecords(): TroubleshootingRecord[] {
  try {
    const cached = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!cached) return troubleshootingDatabase;
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : troubleshootingDatabase;
  } catch {
    return troubleshootingDatabase;
  }
}

function persistRecords(records: TroubleshootingRecord[]) {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage can be unavailable in locked-down browsers; the bundled database still works.
  }
}

function loadStoredTheme(): "dark" | "light" {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export default function App() {
  const [records, setRecords] = useState<TroubleshootingRecord[]>(() => loadStoredRecords());
  const [selectedRecordForAi, setSelectedRecordForAi] = useState<TroubleshootingRecord | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => loadStoredTheme());
  const [searchQuery, setSearchQuery] = useState("");
  const [showTools, setShowTools] = useState(false);
  const [showUnitConverter, setShowUnitConverter] = useState(false);

  useEffect(() => {
    persistRecords(records);
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures.
    }
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(current => current === "dark" ? "light" : "dark");
  };

  const handleAddRecord = (record: TroubleshootingRecord) => {
    setRecords(current => [record, ...current]);
  };

  const handleUpdateRecord = (record: TroubleshootingRecord) => {
    setRecords(current => current.map(item => item.id === record.id ? record : item));
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(current => current.filter(item => item.id !== id));
    setSelectedRecordForAi(current => current?.id === id ? null : current);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme === "light" ? "theme-light bg-[#eef5fb] text-slate-900" : "bg-[#06111f] text-slate-200"}`}>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071524]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="icons/icon-192.png" alt="Engineer Assistant" className="w-11 h-11 rounded-2xl shadow-lg shadow-cyan-950/40 shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-lg md:text-xl tracking-tight truncate">Engineer Assistant</div>
              <div className="text-[11px] text-cyan-200/70 -mt-0.5 truncate">Marine troubleshooting • AI • calculators</div>
            </div>
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search alarms, symptoms, components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#11223b] border border-slate-700/80 pl-11 py-2.5 rounded-2xl text-sm focus:outline-none focus:border-[#22d3ee]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleThemeToggle} className="p-2.5 hover:bg-[#11223b] border border-slate-700 rounded-2xl transition-colors" title="Toggle theme">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowTools(!showTools)} className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#11223b] hover:bg-[#1e293b] border border-slate-700 rounded-2xl text-sm transition-colors">
              <Wrench className="w-4 h-4" /> Engineer Suite
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 space-y-8">
        <section className="app-hero rounded-[2rem] p-5 md:p-7 border border-cyan-500/20 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.24),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.14),transparent_28%)]" />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-100 text-xs font-semibold mb-4">
                <ShieldCheck className="w-4 h-4" /> Offline-first toolkit with static GitHub Pages AI option
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-tight">
                Faster fault finding for marine engineers.
              </h1>
              <p className="mt-3 text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
                Search the onboard knowledge base, send a fault directly to the AI assistant, open shipboard calculators, and keep working even when the internet is unavailable.
              </p>

              <div className="mt-5 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Try: oil mist alarm, scavenge fire, generator hunting, purifier water carry-over..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#071524]/80 border border-slate-700/80 pl-12 pr-4 py-3.5 rounded-2xl text-sm focus:outline-none focus:border-[#22d3ee] shadow-inner"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => setShowTools(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#22d3ee] text-[#071524] text-sm font-bold hover:bg-cyan-300">
                  <Wrench className="w-4 h-4" /> Open engineer suite
                </button>
                <button onClick={() => setShowUnitConverter(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/10 text-sm font-semibold hover:bg-white/15">
                  <ArrowLeftRight className="w-4 h-4" /> Unit converter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-[#071524]/75 p-4">
                <Database className="w-5 h-5 text-cyan-300 mb-3" />
                <div className="text-2xl font-black text-white">{records.length}</div>
                <div className="text-xs text-slate-400">offline records</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#071524]/75 p-4">
                <Bot className="w-5 h-5 text-emerald-300 mb-3" />
                <div className="text-2xl font-black text-white">Gemini</div>
                <div className="text-xs text-slate-400">browser or desktop</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#071524]/75 p-4">
                <Download className="w-5 h-5 text-amber-300 mb-3" />
                <div className="text-2xl font-black text-white">PWA</div>
                <div className="text-xs text-slate-400">installable web app</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#071524]/75 p-4">
                <ShieldCheck className="w-5 h-5 text-red-300 mb-3" />
                <div className="text-2xl font-black text-white">LOTO</div>
                <div className="text-xs text-slate-400">safety centered</div>
              </div>
            </div>
          </div>
        </section>

        {selectedRecordForAi && (
          <section className="rounded-3xl border border-cyan-800/50 bg-cyan-950/20 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-cyan-100">
              <span className="font-semibold">AI focus:</span> {selectedRecordForAi.component} — {selectedRecordForAi.faultSymptom}
            </div>
            <button onClick={() => setSelectedRecordForAi(null)} className="text-xs text-cyan-300 hover:text-white self-start sm:self-auto">Clear focus</button>
          </section>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <section className="xl:col-span-7">
            <div className="mb-4 px-1 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Troubleshooting database</h2>
                <p className="text-sm text-slate-400">Choose a card to focus the AI assistant on that machinery fault.</p>
              </div>
            </div>
            <div className="border border-slate-700/80 rounded-[2rem] overflow-hidden bg-[#0b1424] shadow-2xl shadow-black/20">
              <ExcelDashboard
                records={records}
                onAddRecord={handleAddRecord}
                onUpdateRecord={handleUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
                onSelectForAi={setSelectedRecordForAi}
                forceOpenRecordId={null}
                onClearForceOpenRecordId={() => {}}
                language="EN"
                externalSearch={searchQuery}
              />
            </div>
          </section>

          <section className="xl:col-span-5 xl:sticky xl:top-24">
            <div className="mb-4 px-1 flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#22d3ee]" />
              <h2 className="text-xl md:text-2xl font-bold">Chief Engineer AI</h2>
            </div>
            <div className="border border-slate-700/80 rounded-[2rem] overflow-hidden h-[680px] bg-[#0b1424] shadow-2xl shadow-black/20">
              <AiAssistant
                selectedRecord={selectedRecordForAi}
                onClearSelectedRecord={() => setSelectedRecordForAi(null)}
                language="EN"
                offlineRecords={records}
              />
            </div>
          </section>
        </div>

        {showTools && <EngineerSuite />}
      </main>

      {showUnitConverter && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm p-3 md:p-8 flex items-center justify-center">
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-700 bg-[#071524] shadow-2xl">
            <button
              onClick={() => setShowUnitConverter(false)}
              className="absolute right-3 top-3 z-10 p-2 rounded-xl bg-[#11223b] hover:bg-[#1e293b] border border-slate-700"
              aria-label="Close unit converter"
            >
              <X className="w-4 h-4" />
            </button>
            <UnitConverter language="EN" />
          </div>
        </div>
      )}

      <PwaInstallPrompt />

      <footer className="border-t border-slate-700/80 bg-[#071524] py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22d3ee]" />
            <span>SOLAS • MARPOL • STCW aware • Offline-first decision support</span>
          </div>
          <div>v{APP_VERSION} — GitHub Pages, PWA, and Desktop ready</div>
        </div>
      </footer>
    </div>
  );
}
