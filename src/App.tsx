import React, { useState, useEffect } from "react";
import { troubleshootingDatabase } from "./database";
import { TroubleshootingRecord } from "./types";
import ExcelDashboard from "./components/ExcelDashboard";
import AiAssistant from "./components/AiAssistant";
import { InteractiveSchematics } from "./components/InteractiveSchematics";
import { MarpolRegulationsComply } from "./components/MarpolRegulations";
import StepByStepOverhauls from "./components/StepByStepOverhauls";
import PointDefectSystem from "./components/PointDefectSystem";
import { UnitConverter } from "./components/UnitConverter";
import PcDesktopTab from "./components/PcDesktopTab";
import VesselCalculations from "./components/VesselCalculations";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import { uiTranslations, recordTranslations } from "./translations";
import { 
  Anchor, 
  Bot, 
  FileSpreadsheet, 
  Info,
  Layers,
  ShieldCheck, 
  Compass,
  Scale,
  Wrench,
  ArrowLeftRight,
  Laptop,
  Sun,
  Moon,
  Globe
} from "lucide-react";

export default function App() {
  const [records, setRecords] = useState<TroubleshootingRecord[]>([]);
  const [selectedRecordForAi, setSelectedRecordForAi] = useState<TroubleshootingRecord | null>(null);
  const [language, setLanguage] = useState<"EN" | "GR">("EN");
  const t = uiTranslations[language];
  
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return (localStorage.getItem("marine_theme") as "dark" | "light") || "dark";
    } catch {
      return "dark";
    }
  });

  const handleSetTheme = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    localStorage.setItem("marine_theme", newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("theme-light");
      root.style.backgroundColor = "#f8fafc";
    } else {
      root.classList.remove("theme-light");
      root.style.backgroundColor = "#0a111f";
    }
  }, [theme]);

  const [activeMainTab, setActiveMainTab] = useState<"database" | "schematics" | "overhauls" | "defects" | "marpol" | "ai_desk" | "converter" | "desktop" | "calculations">("database");
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [forceOpenRecordId, setForceOpenRecordId] = useState<string | null>(null);
  const [globalSelectedManual, setGlobalSelectedManual] = useState<TroubleshootingRecord | null>(null);

  // Load records
  useEffect(() => {
    try {
      const cached = localStorage.getItem("marine_engine_db_records");
      if (cached) {
        setRecords(JSON.parse(cached));
      } else {
        setRecords(troubleshootingDatabase);
        localStorage.setItem("marine_engine_db_records", JSON.stringify(troubleshootingDatabase));
      }
    } catch {
      setRecords(troubleshootingDatabase);
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
    if (selectedRecordForAi?.id === updatedRec.id) setSelectedRecordForAi(updatedRec);
  };
  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    saveRecords(updated);
    if (selectedRecordForAi?.id === id) setSelectedRecordForAi(null);
  };
  const handleClearSelectedRecordForAi = () => setSelectedRecordForAi(null);

  const tabs = [
    { id: "database", label: t.tabWorksheets, icon: FileSpreadsheet },
    { id: "schematics", label: t.tabSchematics, icon: Compass },
    { id: "overhauls", label: t.tabOverhauls, icon: Wrench },
    { id: "defects", label: t.tabDefects, icon: Anchor },
    { id: "marpol", label: t.tabMarpol, icon: Scale },
    { id: "ai_desk", label: t.tabAiDesk, icon: Bot },
    { id: "converter", label: t.tabConverter, icon: ArrowLeftRight },
    { id: "desktop", label: t.tabPcDesktop, icon: Laptop },
    { id: "calculations", label: t.tabCalculations, icon: Compass },
  ] as const;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${theme === "light" ? "theme-light bg-[#f8fafc] text-slate-900" : "bg-[#0a111f] text-slate-200"}`}>
      
      {/* === PROFESSIONAL HEADER === */}
      <header className="bg-[#0b1424] border-b border-slate-700 shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#22d3ee] rounded-xl flex items-center justify-center">
                <span className="text-[#0a111f] font-black text-xl tracking-[-1px]">DRV</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-white">Engineer Assistant</h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono bg-[#11223b] text-[#22d3ee] rounded-full border border-[#22d3ee]/30">v1.3.1</span>
                </div>
                <p className="text-[11px] text-slate-400 -mt-0.5">Professional Marine Engineering Toolkit</p>
              </div>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3">
            {/* Status */}
            <div className="hidden md:flex items-center gap-2 bg-[#11223b] border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 font-medium">OFFLINE READY</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => handleSetTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-2 px-3 py-2 bg-[#11223b] hover:bg-[#1e293b] border border-slate-700 rounded-xl text-sm transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline text-xs font-medium">{theme === "dark" ? "Light" : "Dark"}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(l => l === "EN" ? "GR" : "EN")}
              className="flex items-center gap-2 px-3 py-2 bg-[#11223b] hover:bg-[#1e293b] border border-slate-700 rounded-xl text-sm transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="font-mono text-xs font-medium">{language}</span>
            </button>
          </div>
        </div>
      </header>

      {/* === NAVIGATION TABS === */}
      <nav className="bg-[#0b1424] border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 md:px-6">
          <div className="flex items-center overflow-x-auto no-scrollbar gap-1 py-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeMainTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap rounded-xl transition-all ${
                    isActive 
                      ? "bg-[#22d3ee] text-[#0a111f] shadow-sm" 
                      : "text-slate-300 hover:bg-[#11223b] hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Workspace */}
          <div className={`flex-1 min-w-0 ${activeMainTab === "ai_desk" ? "w-full" : ""}`}>
            {activeMainTab === "database" && (
              <ExcelDashboard
                records={records}
                onAddRecord={handleAddRecord}
                onUpdateRecord={handleUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
                onSelectForAi={setSelectedRecordForAi}
                forceOpenRecordId={forceOpenRecordId}
                onClearForceOpenRecordId={() => setForceOpenRecordId(null)}
                language={language}
              />
            )}

            {activeMainTab === "schematics" && (
              <InteractiveSchematics
                onSelectRecordForAi={setSelectedRecordForAi}
                onOpenManual={setGlobalSelectedManual}
                language={language}
              />
            )}

            {activeMainTab === "overhauls" && <StepByStepOverhauls language={language} />}
            {activeMainTab === "defects" && <PointDefectSystem language={language} onSelectRecordForAi={(rec) => { setSelectedRecordForAi(rec); setActiveMainTab("ai_desk"); }} />}
            {activeMainTab === "marpol" && <MarpolRegulationsComply />}
            {activeMainTab === "ai_desk" && (
              <div className="h-[700px] border border-slate-700 rounded-2xl overflow-hidden bg-[#0b1424]">
                <AiAssistant
                  selectedRecord={selectedRecordForAi}
                  onClearSelectedRecord={handleClearSelectedRecordForAi}
                  language={language}
                  offlineRecords={records}
                />
              </div>
            )}
            {activeMainTab === "converter" && <UnitConverter language={language} />}
            {activeMainTab === "desktop" && <PcDesktopTab language={language} />}
            {activeMainTab === "calculations" && <VesselCalculations language={language} />}
          </div>

          {/* AI Sidebar (hidden on AI Desk) */}
          {activeMainTab !== "ai_desk" && (
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
              <div className="sticky top-6">
                <div className="mb-3 px-1">
                  <div className="flex items-center gap-2 text-[#22d3ee]">
                    <Bot className="w-5 h-5" />
                    <span className="font-semibold tracking-wider text-sm">CHIEF ENGINEER AI</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Real-time diagnostic support</p>
                </div>
                <div className="h-[620px] border border-slate-700 rounded-2xl overflow-hidden bg-[#0b1424]">
                  <AiAssistant
                    selectedRecord={selectedRecordForAi}
                    onClearSelectedRecord={handleClearSelectedRecordForAi}
                    language={language}
                    offlineRecords={records}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-[#0b1424] py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22d3ee]" />
            <span>SOLAS • MARPOL • STCW Compliant • Fully Offline</span>
          </div>
          <div>© 2026 DRV Engineer Assistant — Built for Marine Engineers</div>
        </div>
      </footer>

      {/* Floating Unit Converter */}
      {activeMainTab !== "converter" && (
        <div className="fixed bottom-6 right-6 z-50">
          {isConverterOpen && (
            <div className="mb-4 w-[380px] shadow-2xl">
              <UnitConverter language={language} isWidgetMode onCloseWidget={() => setIsConverterOpen(false)} />
            </div>
          )}
          <button
            onClick={() => setIsConverterOpen(!isConverterOpen)}
            className="w-14 h-14 bg-[#22d3ee] hover:bg-[#06b6d4] text-[#0a111f] rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-95"
          >
            {isConverterOpen ? <X className="w-6 h-6" /> : <ArrowLeftRight className="w-6 h-6" />}
          </button>
        </div>
      )}

      <PwaInstallPrompt />

      {/* Global Record Modal */}
      {globalSelectedManual && (() => {
        const gIndex = recordTranslations[globalSelectedManual.id];
        const mComponent = (language === "GR" && gIndex) ? gIndex.component : globalSelectedManual.component;
        const mModel = (language === "GR" && gIndex) ? gIndex.makeModel : globalSelectedManual.makeModel;
        const mSymptom = (language === "GR" && gIndex) ? gIndex.faultSymptom : globalSelectedManual.faultSymptom;
        const mCauses = (language === "GR" && gIndex) ? gIndex.possibleCauses : globalSelectedManual.possibleCauses;
        const mSteps = (language === "GR" && gIndex) ? gIndex.troubleshootingSteps : globalSelectedManual.troubleshootingSteps;
        const mSafety = (language === "GR" && gIndex && gIndex.safetyPrecautions) ? gIndex.safetyPrecautions : globalSelectedManual.safetyPrecautions;

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-[#0b1424] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-700 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs font-mono bg-[#11223b] text-[#22d3ee] rounded-full">{globalSelectedManual.category}</span>
                    <span className={`px-3 py-1 text-xs font-mono rounded-full border ${
                      globalSelectedManual.difficulty === "High" ? "text-red-400 border-red-500/40" :
                      globalSelectedManual.difficulty === "Medium" ? "text-amber-400 border-amber-500/40" : "text-emerald-400 border-emerald-500/40"
                    }`}>
                      {globalSelectedManual.difficulty.toUpperCase()} RISK
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold mt-3 tracking-tight">{mComponent}</h3>
                  <p className="text-slate-400 mt-1">{mModel}</p>
                </div>
                <button onClick={() => setGlobalSelectedManual(null)} className="p-2 hover:bg-[#11223b] rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Symptom */}
                <div className="bg-[#11223b] p-5 rounded-2xl">
                  <div className="text-[#f59e0b] text-xs font-semibold tracking-wider mb-2">OBSERVED SYMPTOM</div>
                  <p className="text-lg font-medium">{mSymptom}</p>
                </div>

                {/* Safety */}
                {mSafety && mSafety.length > 0 && (
                  <div className="bg-red-950/30 border border-red-500/30 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-red-400 mb-3">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="font-semibold text-sm tracking-wider">SAFETY CRITICAL</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-red-200">
                      {mSafety.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <div className="font-semibold text-sm mb-3 text-[#22d3ee]">POSSIBLE CAUSES</div>
                    <ul className="space-y-2 text-sm">
                      {mCauses.map((cause, i) => <li key={i} className="flex gap-2"><span className="text-[#22d3ee]">•</span> {cause}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-3 text-[#22d3ee]">RECOMMENDED ACTIONS</div>
                    <ol className="space-y-2 text-sm">
                      {mSteps.map((step, i) => <li key={i} className="flex gap-2"><span className="font-mono text-[#22d3ee] w-5">{i+1}.</span> {step}</li>)}
                    </ol>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-700 flex gap-3 justify-end">
                <button onClick={() => { setSelectedRecordForAi(globalSelectedManual); setActiveMainTab("ai_desk"); setGlobalSelectedManual(null); }} className="px-5 py-2.5 bg-[#22d3ee] hover:bg-[#06b6d4] text-[#0a111f] rounded-xl font-semibold flex items-center gap-2">
                  <Bot className="w-4 h-4" /> Send to AI
                </button>
                <button onClick={() => setGlobalSelectedManual(null)} className="px-5 py-2.5 border border-slate-700 rounded-xl">Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
