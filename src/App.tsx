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
  HelpCircle, 
  Info,
  Layers,
  Settings,
  ShieldCheck, 
  Sparkles,
  Compass,
  Scale,
  Wrench,
  BookOpen,
  X,
  Activity,
  ShieldAlert,
  CheckCircle,
  TrendingDown,
  ArrowLeftRight,
  Laptop
} from "lucide-react";

export default function App() {
  // Sync state with local storage to preserve marine engineer edits offline!
  const [records, setRecords] = useState<TroubleshootingRecord[]>([]);
  const [selectedRecordForAi, setSelectedRecordForAi] = useState<TroubleshootingRecord | null>(null);
  const [language, setLanguage] = useState<"EN" | "GR">("EN");
  const t = uiTranslations[language];
  const [theme, setTheme] = useState<"dark" | "ciel">(() => {
    try {
      const cached = localStorage.getItem("marine_theme");
      return (cached === "dark" || cached === "ciel") ? cached : "ciel";
    } catch {
      return "ciel";
    }
  });

  const handleSetTheme = (newTheme: "dark" | "ciel") => {
    setTheme(newTheme);
    try {
      localStorage.setItem("marine_theme", newTheme);
    } catch (e) {
      console.error(e);
    }
  };

  // Synchronize theme class on document element for absolute viewport and dialog background coverage
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === "ciel") {
        root.classList.add("theme-ciel");
        root.style.backgroundColor = "#f0f9ff";
      } else {
        root.classList.remove("theme-ciel");
        root.style.backgroundColor = "#071524";
      }
    } catch (error) {
      console.error("Theme root assignment failed: ", error);
    }
  }, [theme]);
  
  // Tab states: active tab switcher
  const [activeMainTab, setActiveMainTab] = useState<"database" | "schematics" | "overhauls" | "defects" | "marpol" | "ai_desk" | "converter" | "desktop" | "calculations">("database");
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [forceOpenRecordId, setForceOpenRecordId] = useState<string | null>(null);
  const [globalSelectedManual, setGlobalSelectedManual] = useState<TroubleshootingRecord | null>(null);

  // Initialize records from localStorage or default database
  useEffect(() => {
    try {
      const cached = localStorage.getItem("marine_engine_db_records");
      if (cached) {
        setRecords(JSON.parse(cached));
      } else {
        setRecords(troubleshootingDatabase);
        localStorage.setItem("marine_engine_db_records", JSON.stringify(troubleshootingDatabase));
      }
    } catch (e) {
      console.error("Local storage reads failed: ", e);
      setRecords(troubleshootingDatabase);
    }
  }, []);

  // Save changes to localStorage on any state modification
  const saveRecords = (updated: TroubleshootingRecord[]) => {
    setRecords(updated);
    try {
      localStorage.setItem("marine_engine_db_records", JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage writes failed: ", e);
    }
  };

  // Add a newly logged fault record
  const handleAddRecord = (newRec: TroubleshootingRecord) => {
    const updated = [newRec, ...records];
    saveRecords(updated);
  };

  // Update an existing row
  const handleUpdateRecord = (updatedRec: TroubleshootingRecord) => {
    const updated = records.map(r => r.id === updatedRec.id ? updatedRec : r);
    saveRecords(updated);
    // If the active AI-linked record is updated, keep it in sync!
    if (selectedRecordForAi?.id === updatedRec.id) {
      setSelectedRecordForAi(updatedRec);
    }
  };

  // Delete a logged row
  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    saveRecords(updated);
    if (selectedRecordForAi?.id === id) {
      setSelectedRecordForAi(null);
    }
  };

  // Clean the AI selected context focus
  const handleClearSelectedRecordForAi = () => {
    setSelectedRecordForAi(null);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 selection:bg-sky-500/30 selection:text-sky-200 ${theme === "ciel" ? "theme-ciel bg-[#f0f9ff] text-slate-800" : "bg-[#040a14] text-slate-200"}`} id="marine-app-scaffold">
      
      {/* PROFESSIONAL SHIPBOARD BANNER / HEADER */}
      <header className="bg-[#0b1424] text-white border-b border-sky-500/30 shrink-0 shadow-lg animate-fade-in" id="app-header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          {/* Logo / Title Area */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-500 rounded flex items-center justify-center font-black text-slate-950 shadow-md font-display tracking-widest text-sm">
              DRV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-bold tracking-tight text-white font-display uppercase">
                  {t.title} <span className="text-sky-400">{t.spanTitle}</span>
                </h1>
                <span className="bg-[#11223b] text-sky-400 border border-sky-500/30 text-[9px] font-bold font-mono tracking-widest py-0.5 px-2 rounded">
                  {t.version}
                </span>
              </div>
              <p className="text-[10px] text-sky-400/80 font-mono tracking-wider uppercase mt-0.5">
                {t.description}
              </p>
            </div>
          </div>
 
          {/* Quick Ship Status Indicator & Theme/Language Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleSetTheme(theme === "dark" ? "ciel" : "dark")}
              className="bg-[#11223b] hover:bg-[#1b3254] text-sky-400 border border-sky-500/30 font-mono text-[10px] font-extrabold py-2 px-3 rounded flex items-center gap-1.5 cursor-pointer shadow-inner uppercase select-none transition-all active:scale-95"
              title="Toggle Theme / Αλλαγή Θέματος"
            >
              <span>{theme === "ciel" ? "🌙" : "☀️"}</span>
              <span>{theme === "ciel" ? (language === "EN" ? "Dark Theme" : "Σκοτεινό") : (language === "EN" ? "Ciel Light" : "Ciel Γαλάζιο")}</span>
            </button>

            <button
              onClick={() => setLanguage(l => l === "EN" ? "GR" : "EN")}
              className="bg-[#11223b] hover:bg-[#1b3254] text-sky-400 border border-sky-500/30 font-mono text-[10px] font-extrabold py-2 px-3 rounded flex items-center gap-1.5 cursor-pointer shadow-inner uppercase select-none transition-all active:scale-95"
              title="Switch language / Αλλαγή γλώσσας"
            >
              <span>🌐</span>
              <span>{language === "EN" ? "GR" : "EN"}</span>
            </button>

            <div className="flex items-center gap-4 bg-[#090f1d] border border-sky-500/25 p-1.5 px-3 rounded font-mono text-[10px] shadow-inner" id="ship-status-widget">
              <div className="flex items-center gap-2 border-r border-sky-500/10 pr-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div>
                  <p className="text-emerald-400 font-bold uppercase">{t.dbSecure}</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-1.5 border-r border-sky-500/10 pr-3 text-sky-400 font-bold">
                <Layers className="w-3.5 h-3.5 text-sky-450" />
                <span>{t.solasApproved}</span>
              </div>
              <div className="hidden sm:block text-slate-400 font-semibold text-[9px]">
                {t.indexSensors}
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* CORE ACTION TAB SWITCHER MENU */}
      <nav className="bg-[#0c1524] border-b border-sky-500/20 shrink-0 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center overflow-x-auto select-none" id="main-tabs-navbar">
          
          <button
            id="tab-btn-database"
            onClick={() => setActiveMainTab("database")}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs uppercase tracking-wider font-bold transition-all border-b-2 font-display ${
              activeMainTab === "database"
                ? "text-sky-400 border-sky-500 bg-[#11223b]"
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#11223b]/40"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            <span>{t.tabWorksheets}</span>
          </button>

          <button
            id="tab-btn-schematics"
            onClick={() => setActiveMainTab("schematics")}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs uppercase tracking-wider font-bold transition-all border-b-2 font-display ${
              activeMainTab === "schematics"
                ? "text-sky-400 border-sky-500 bg-[#11223b]"
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#11223b]/40"
            }`}
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>{t.tabSchematics}</span>
          </button>

          <button
            id="tab-btn-overhauls"
            onClick={() => setActiveMainTab("overhauls")}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs uppercase tracking-wider font-bold transition-all border-b-2 font-display ${
              activeMainTab === "overhauls"
                ? "text-sky-400 border-sky-500 bg-[#11223b]"
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#11223b]/40"
            }`}
          >
            <Wrench className="w-4 h-4 text-sky-400" />
            <span>{t.tabOverhauls}</span>
          </button>

          <button
            id="tab-btn-defects"
            onClick={() => setActiveMainTab("defects")}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs uppercase tracking-wider font-bold transition-all border-b-2 font-display ${
              activeMainTab === "defects"
                ? "text-sky-400 border-sky-500 bg-[#11223b]"
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#11223b]/40"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-orange-500" />
            <span>{t.tabDefects}</span>
          </button>

          <button
            id="tab-btn-marpol"
            onClick={() => setActiveMainTab("marpol")}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs uppercase tracking-wider font-bold transition-all border-b-2 font-display ${
              activeMainTab === "marpol"
                ? "text-sky-400 border-sky-500 bg-[#11223b]"
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#11223b]/40"
            }`}
          >
            <Scale className="w-4 h-4 text-sky-400" />
            <span>{t.tabMarpol}</span>
          </button>

          <button
            id="tab-btn-ai-desk"
            onClick={() => setActiveMainTab("ai_desk")}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs uppercase tracking-wider font-bold transition-all border-b-2 font-display ${
              activeMainTab === "ai_desk"
                ? "text-sky-400 border-sky-500 bg-[#11223b]"
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#11223b]/40"
            }`}
          >
            <Bot className="w-4 h-4 text-sky-400" />
            <span>{t.tabAiDesk}</span>
          </button>

          <button
            id="tab-btn-converter"
            onClick={() => setActiveMainTab("converter")}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs uppercase tracking-wider font-bold transition-all border-b-2 font-display ${
              activeMainTab === "converter"
                ? "text-sky-400 border-sky-500 bg-[#11223b]"
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#11223b]/40"
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-sky-400" />
            <span>{t.tabConverter}</span>
          </button>

          <button
            id="tab-btn-desktop"
            onClick={() => setActiveMainTab("desktop")}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs uppercase tracking-wider font-bold transition-all border-b-2 font-display ${
              activeMainTab === "desktop"
                ? "text-sky-400 border-sky-500 bg-[#11223b]"
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#11223b]/40"
            }`}
          >
            <Laptop className="w-4 h-4 text-sky-400" />
            <span>{t.tabPcDesktop}</span>
          </button>

          <button
            id="tab-btn-calculations"
            onClick={() => setActiveMainTab("calculations")}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs uppercase tracking-wider font-bold transition-all border-b-2 font-display ${
              activeMainTab === "calculations"
                ? "text-sky-400 border-sky-500 bg-[#11223b]"
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#11223b]/40"
            }`}
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>{t.tabCalculations}</span>
          </button>

        </div>
      </nav>

      {/* SYSTEM QUICK ADVISORY CARD */}
      <section className="bg-slate-900/60 border-b border-sky-500/20 py-2.5 px-4" id="intro-hero-guide">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="bg-sky-500/10 text-sky-400 p-1.5 rounded shrink-0 border border-sky-500/20">
              <Info className="w-3.5 h-3.5" />
            </div>
            <p className="leading-relaxed text-[11px] text-slate-300">
              {activeMainTab === "database" && (
                <span><strong>Worksheet Database Mode:</strong> Add, edit, or remove custom failure logs of 2-stroke engines or auxiliary units. All data remains saved locally and is completely available offline. Generate high-quality Microsoft Excel sheets instantly.</span>
              )}
              {activeMainTab === "schematics" && (
                <span><strong>Interactive Blueprint Mode:</strong> Select an engine layout above, hover over active hotspots (•) to inspect design limits, and view corresponding database fault logs. Tap <em>AI Advise</em> to query the active diagnostic model.</span>
              )}
              {activeMainTab === "overhauls" && (
                <span><strong>Machinery Overhaul Manuals:</strong> Follow step-by-step checklists to complete major overhauls according to verified maker limits (such as MAN B&W 2-Stroke values). Specify dimensions in our wear tolerance calculator to verify safe class status.</span>
              )}
              {activeMainTab === "defects" && (
                <span><strong>Point Defect Diagnostic Desk:</strong> Search or input engine room problems to receive interactive, clickable solutions. Pre-test sensors and auxiliary actuators using physical simulation blocks.</span>
              )}
              {activeMainTab === "marpol" && (
                <span><strong>Maritime Compliance Desk:</strong> Search official limits for OWS discharges (15ppm), incinerator boundaries, Ballast Water Treatment standards, and required Oil Record Book Part I logging checklists.</span>
              )}
              {activeMainTab === "ai_desk" && (
                <span><strong>Expanded AI Workstation:</strong> Formulate deep step-by-step custom troubleshooting procedures, trace complex electrical/hydraulic interlocks, or ask questions to your 24/7 technical advisor.</span>
              )}
              {activeMainTab === "converter" && (
                <span><strong>Engineering Unit Converter:</strong> Live translation calculations for shipboard Pressure (bar/psi), Temperature (C/F), Viscosity (cSt/SSU), and Torque (Nm/lb-ft). Review design values and maker tolerances instantly.</span>
              )}
              {activeMainTab === "desktop" && (
                <span><strong>PC / EXE Standalone Mode:</strong> Export offline bundling scripts, compile double-clickable Windows executables, and read shipboard installation manuals.</span>
              )}
              {activeMainTab === "calculations" && (
                <span><strong>Vessel Calculations Desk:</strong> Calculate Crankshaft journal web deflections, run logarithmic MARPOL fuel changeovers, and draft compliant Oil Record Book Part I ledger lines offline.</span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* PORT INGRESS PERMISSIONS FRAME / COMPLIANCE WARNING */}
      {selectedRecordForAi && activeMainTab !== "ai_desk" && (
        <div className="bg-[#111c30] text-cyan-300 border-b border-cyan-900/40 py-2 px-6 flex justify-between items-center text-[11px]" id="scent-banner">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping shrink-0" />
            <span className="font-bold uppercase font-mono text-[10px]">Active Focus:</span>
            <span className="truncate italic font-mono text-slate-305 font-medium">{selectedRecordForAi.component} ({selectedRecordForAi.makeModel})</span>
          </div>
          <button 
            onClick={handleClearSelectedRecordForAi}
            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-cyan-950 text-cyan-400 hover:text-white rounded border border-cyan-800/40 cursor-pointer"
          >
            Release Focus
          </button>
        </div>
      )}

      {/* CORE SPLIT HUB LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 items-stretch" id="app-main-chamber">
        
        {/* Left Hand Area: Active Tab Content (Fills width in AI center) */}
        <div className={`flex-1 min-w-0 ${activeMainTab === "ai_desk" ? "w-full" : ""}`} id="main-active-workspace">
          
          {activeMainTab === "database" && (
            <div className="animate-fade-in">
              <ExcelDashboard
                records={records}
                onAddRecord={handleAddRecord}
                onUpdateRecord={handleUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
                onSelectForAi={(rec) => {
                  setSelectedRecordForAi(rec);
                }}
                forceOpenRecordId={forceOpenRecordId}
                onClearForceOpenRecordId={() => setForceOpenRecordId(null)}
                language={language}
              />
            </div>
          )}

          {activeMainTab === "schematics" && (
            <div className="h-full animate-fade-in">
              <InteractiveSchematics
                onSelectRecordForAi={(rec) => {
                  setSelectedRecordForAi(rec);
                }}
                onOpenManual={(rec) => {
                  // Direct Instant Pop-up without forcing database tab-navigation first!
                  setGlobalSelectedManual(rec);
                }}
                language={language}
              />
            </div>
          )}

          {activeMainTab === "overhauls" && (
            <div className="h-full animate-fade-in">
              <StepByStepOverhauls language={language} />
            </div>
          )}

          {activeMainTab === "defects" && (
            <div className="h-full animate-fade-in">
              <PointDefectSystem 
                language={language} 
                onSelectRecordForAi={(rec) => {
                  setSelectedRecordForAi(rec);
                  setActiveMainTab("ai_desk");
                }}
              />
            </div>
          )}

          {activeMainTab === "marpol" && (
            <div className="h-full animate-fade-in">
              <MarpolRegulationsComply />
            </div>
          )}

          {activeMainTab === "ai_desk" && (
            <div className="h-[650px] animate-fade-in border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <AiAssistant
                selectedRecord={selectedRecordForAi}
                onClearSelectedRecord={handleClearSelectedRecordForAi}
                language={language}
                offlineRecords={records}
              />
            </div>
          )}

          {activeMainTab === "converter" && (
            <div className="animate-fade-in">
              <UnitConverter language={language} />
            </div>
          )}

          {activeMainTab === "desktop" && (
            <div className="animate-fade-in">
              <PcDesktopTab language={language} />
            </div>
          )}

          {activeMainTab === "calculations" && (
            <div className="animate-fade-in h-full">
              <VesselCalculations language={language} />
            </div>
          )}

        </div>

        {/* Right Hand Area: AI Copilot Column (Hidden only when fullscreen in AI_desk) */}
        {activeMainTab !== "ai_desk" && (
          <div className="w-full lg:w-[380px] xl:w-[410px] flex flex-col shrink-0 animate-fade-in" id="sidebar-ai-advisor-panel">
            <div className="flex flex-col gap-1 mb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#22d3ee] font-mono flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-cyan-400" />
                CHIEF ENGINEERING CO-PILOT
              </h2>
              <p className="text-[10px] text-slate-500 font-semibold">
                Instant interactive help synchronized with worksheets & schematics.
              </p>
            </div>

            <div className="flex-1 min-h-[500px]">
              <AiAssistant
                selectedRecord={selectedRecordForAi}
                onClearSelectedRecord={handleClearSelectedRecordForAi}
                language={language}
                offlineRecords={records}
              />
            </div>
          </div>
        )}

      </main>

      {/* GLOBAL POPUP: IMMERSIVE HIGH-CONTRAST SEVERE-CONDITIONS TROUBLESHOOTING CARD */}
      <PwaInstallPrompt />

      {globalSelectedManual && (() => {
        const gIndex = recordTranslations[globalSelectedManual.id];
        const mComponent = (language === "GR" && gIndex) ? gIndex.component : globalSelectedManual.component;
        const mModel = (language === "GR" && gIndex) ? gIndex.makeModel : globalSelectedManual.makeModel;
        const mSymptom = (language === "GR" && gIndex) ? gIndex.faultSymptom : globalSelectedManual.faultSymptom;
        const mCauses = (language === "GR" && gIndex) ? gIndex.possibleCauses : globalSelectedManual.possibleCauses;
        const mSteps = (language === "GR" && gIndex) ? gIndex.troubleshootingSteps : globalSelectedManual.troubleshootingSteps;
        const mSafety = (language === "GR" && gIndex && gIndex.safetyPrecautions) ? gIndex.safetyPrecautions : globalSelectedManual.safetyPrecautions;

        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-55 animate-fade-in" id="global-manual-overlay">
            <div className="bg-[#050914] rounded-xl shadow-2xl border-2 border-cyan-500/50 w-full max-w-3xl overflow-hidden flex flex-col max-h-[88vh] text-slate-100">
              
              {/* Attention Industrial Yellow/Black Warning Bar */}
              <div className="bg-gradient-to-r from-amber-500 via-yellow-450 to-amber-500 text-slate-950 font-mono font-black py-1.5 px-4 text-[10px] tracking-widest flex items-center justify-between uppercase shrink-0 border-b border-cyan-950" id="industrial-strip">
                <div className="flex items-center gap-1.5 font-sans">
                  <ShieldAlert className="w-4 h-4 text-slate-900 animate-pulse" />
                  <span>{language === "GR" ? "[STCW-95 ΣΥΜΜΟΡΦΩΣΗ] ΚΑΡΤΑ ΕΚΤΑΚΤΗΣ ΑΝΑΓΚΗΣ ER // ΕΝΕΡΓΗ ΑΠΟΚΑΤΑΣΤΑΣΗ" : "[STCW-95 COMPLIANT MANUAL] CRITICAL FIELD REPAIR CARD // ACTIVE TROUBLESHOOT"}</span>
                </div>
                <span className="hidden sm:inline bg-slate-900 text-amber-400 font-bold px-1.5 py-0.5 rounded text-[8px] tracking-normal border border-amber-500/30">
                  {language === "GR" ? "ΤΟΠΙΚΗ ΜΝΗΜΗ" : "OFFLINE CACHED"}
                </span>
              </div>

              {/* Header section with rich dark control panel theme */}
              <div className="p-5 border-b border-slate-800 bg-[#0d1425] flex justify-between items-start shrink-0" id="modal-core-header">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/20 tracking-wider">
                      {globalSelectedManual.category}
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase py-0.5 px-2 rounded tracking-wider border ${
                      globalSelectedManual.difficulty === "High"
                        ? "text-red-400 bg-red-950/70 border-red-800/40"
                        : globalSelectedManual.difficulty === "Medium"
                          ? "text-amber-400 bg-amber-950/70 border-amber-800/40"
                          : "text-cyan-400 bg-cyan-950/70 border-cyan-850"
                    }`}>
                      {language === "GR" ? "ΕΠΙΠΕΔΟ ΚΙΝΔΥΝΟΥ" : "RISK LEVEL"}: {language === "GR" ? (globalSelectedManual.difficulty === "High" ? "ΚΡΙΣΙΜΟ" : globalSelectedManual.difficulty === "Medium" ? "ΜΕΣΑΙΟ" : "ΡΟΥΤΙΝΑΣ") : globalSelectedManual.difficulty.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase">
                      SYS-ID: {globalSelectedManual.id}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-display text-white mt-2 leading-tight tracking-tight uppercase border-b border-cyan-950 pb-2 flex items-center gap-2">
                    <span className="text-cyan-400 font-mono font-bold tracking-widest">⚙</span>
                    {mComponent}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-2 font-medium">
                    {language === "GR" ? "Προδιαγραφή Εξοπλισμού:" : "Equipment Standard:"} <strong className="text-slate-200">{mModel}</strong>
                  </p>
                </div>

                <button 
                  onClick={() => setGlobalSelectedManual(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
                  title="Dismiss Technical Document"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content optimized for poor ship control-room lighting: crisp typography, high contrast, pure white and cyan highlighting */}
              <div className="p-6 overflow-y-auto space-y-5 bg-[#050914] text-slate-100 font-sans" id="modal-core-body">
                
                {/* STARK PROBLEM SYMPTOM BAR */}
                <div className="bg-amber-950/40 p-4 rounded-lg border border-amber-700/30 shadow-inner">
                  <h4 className="font-mono font-bold text-amber-400 flex items-center gap-1.5 text-[11px] tracking-wider uppercase mb-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    {language === "GR" ? "Παρατηρηθέν Σύμπτωμα / Κατάσταση Συναγερμού" : "Observed Vessel Symptom / Alert Condition"}
                  </h4>
                  <p className="text-white text-sm font-bold font-mono tracking-tight leading-relaxed">
                    {mSymptom}
                  </p>
                </div>

                {/* CRITICAL SAFETY NOTICES (SOLAS COMPLIANCE) */}
                {mSafety && mSafety.length > 0 && (
                  <div className="bg-red-950/50 p-4 rounded-lg border-2 border-red-600/40">
                    <h4 className="font-mono font-black text-red-400 flex items-center gap-1.5 text-[11px] tracking-wider uppercase mb-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                      {language === "GR" ? "ΟΔΗΓΙΕΣ ΑΣΦΑΛΕΙΑΣ SOLAS MHXANΟΣΤΑΣΙΟΥ" : "SOLAS ENGINE ROOM CRITICAL SAFETY INSTRUCTIONS"}
                    </h4>
                    <ul className="list-disc pl-5 text-red-200 text-xs flex flex-col gap-1.5 font-bold leading-relaxed">
                      {mSafety.map((prec, i) => (
                        <li key={i}>{prec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* TWO COLUMN GRID FOR CAUSES AND PROCEDURES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  
                  {/* Causes Column */}
                  <div className="bg-[#0b1120] p-4 rounded-lg border border-slate-800">
                    <h4 className="font-mono font-bold text-cyan-400 border-b border-slate-800 pb-2 flex items-center gap-1.5 text-[11px] tracking-wider uppercase mb-2.5">
                      <TrendingDown className="w-4 h-4 text-cyan-400" />
                      {language === "GR" ? "Πιθανές Μηχανικές Αιτίες" : "Root Mechanical Causes"}
                    </h4>
                    <ul className="list-decimal pl-5 text-slate-350 flex flex-col gap-2 text-xs font-semibold leading-relaxed">
                      {mCauses.map((cause, i) => (
                        <li key={i} className="pl-1 text-slate-200 font-medium">{cause}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Technical Procedures Column */}
                  <div className="bg-[#0b1120] p-4 rounded-lg border border-slate-800 font-sans">
                    <h4 className="font-mono font-bold text-teal-400 border-b border-slate-800 pb-2 flex items-center gap-1.5 text-[11px] tracking-wider uppercase mb-2.5">
                      <Wrench className="w-4 h-4 text-teal-400" />
                      {language === "GR" ? "Βήματα Αποκατάστασης" : "Action Checklist"}
                    </h4>
                    <ol className="list-decimal pl-5 text-slate-300 flex flex-col gap-2.5 text-xs font-bold leading-relaxed">
                      {mSteps.map((step, i) => (
                        <li key={i} className="pl-1 text-slate-100">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                </div>

                {/* STCW LEVEL DIAGNOSTICS DECREE */}
                <div className="border border-slate-800 rounded bg-[#0d1425]/30 p-2.5 text-[10px] text-slate-450 font-mono text-center uppercase tracking-wide">
                  <span>{language === "GR" ? "Επίπεδο Πιστοποίησης: Εγκεκριμένα Δεδομένα Πρώτου Μηχανικού (STCW-95 Code III/2)" : "Verification Certificate Level: Approved Chief Engineer Offline Operations Desk (STCW-95 Code III/2)"}</span>
                </div>

              </div>

              {/* Footer with actions */}
              <div className="p-4 border-t border-slate-800 bg-[#0d1425] flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0" id="modal-core-footer">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setSelectedRecordForAi(globalSelectedManual);
                      setActiveMainTab("ai_desk");
                      setGlobalSelectedManual(null);
                    }}
                    className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 justify-center cursor-pointer transition-colors"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{language === "GR" ? "ΑΠΟΣΤΟΛΗ ΣΤΟΝ AI CO-PILOT" : "TRANSLATE TO DIAGNOSTIC AI CO-PILOT"}</span>
                  </button>

                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 justify-center cursor-pointer"
                    title="Print Emergency Slip to ship bridge printer"
                  >
                    <span>{language === "GR" ? "ΕΚΤΥΠΩΣΗ ΔΕΛΤΙΟΥ ΕΚΤΑΚΤΗΣ ΑΝΑΓΚΗΣ" : "PRINT EMERGENCY SLIP"}</span>
                  </button>
                </div>

                <button
                  onClick={() => setGlobalSelectedManual(null)}
                  className="w-full sm:w-auto border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
                >
                  {language === "GR" ? "ΚΛΕΙΣΙΜΟ ΚΑΡΤΑΣ" : "CLOSE ACTIVE CARD"}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* PROFESSIONAL SHIPBOARD COMPLIANCE FOOTER (Credited to George Derventlis) */}
      <footer className="bg-[#111827] text-slate-500 border-t border-slate-800 py-5 text-center text-xs shrink-0 select-none font-mono" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] tracking-wide text-slate-450">
          <div className="flex items-center gap-2 uppercase font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>SOLAS // MARPOL ANNEX V WORK DESK // STCW LEVEL-I UNLIMITED CERTIFICATION</span>
          </div>
          <div>
            <p className="uppercase text-slate-400 font-bold">
              Pre-cached Diagnostics & Schematics Operational completely Offline
            </p>
          </div>
          <div className="text-slate-400 font-bold">
            <span>© 2026 DRV ENGINEER ASSISTANT // DEVELOPMENT BY GEORGE DERVENTLIS</span>
          </div>
        </div>
      </footer>

      {/* GLOBAL PERSISTENT FLOATING UNIT CONVERTER WIDGET */}
      {activeMainTab !== "converter" && (
        <div className="fixed bottom-20 right-6 z-40 flex flex-col items-end" id="floating-converter-entry">
          {isConverterOpen && (
            <div className="w-[360px] sm:w-[450px] mb-3 animate-fade-in drop-shadow-2xl">
              <UnitConverter 
                language={language} 
                isWidgetMode={true} 
                onCloseWidget={() => setIsConverterOpen(false)} 
              />
            </div>
          )}
          
          <button
            onClick={() => setIsConverterOpen(!isConverterOpen)}
            className="w-12 h-12 rounded-full bg-[#cca45c] hover:bg-[#dfb15b] text-slate-950 font-bold shadow-2xl flex items-center justify-center cursor-pointer transition-all active:scale-90 hover:scale-105 border-2 border-[#dfb15b]"
            title={language === "GR" ? "Υπολογιστής Μονάδων" : "Engineering Unit Converter"}
            id="btn-toggle-floating-converter"
          >
            {isConverterOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <ArrowLeftRight className="w-5 h-5" />
            )}
          </button>
        </div>
      )}

    </div>
  );
}
