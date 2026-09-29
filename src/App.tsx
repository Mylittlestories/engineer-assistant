import React, { useState, useEffect } from "react";
import { troubleshootingDatabase } from "./database";
import { TroubleshootingRecord } from "./types";
import ExcelDashboard from "./components/ExcelDashboard";
import AiAssistant from "./components/AiAssistant";
import { UnitConverter } from "./components/UnitConverter";
import EngineerSuite from "./components/EngineerSuite";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import {
  AlertTriangle,
  ArrowLeftRight,
  Bot,
  BookOpen,
  Database,
  Download,
  Home,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  ShipWheel,
  Sun,
  Wrench,
  X
} from "lucide-react";

const RECORDS_STORAGE_KEY = "marine_engine_db_records";
const THEME_STORAGE_KEY = "marine_theme";
const APP_VERSION = "2.1.0";
const STATIC_PAGE_URL = "https://mylittlestories.github.io/engineer-assistant/";

type AppView = "home" | "database" | "ai" | "suite";

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
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function FeatureCard({ icon: Icon, title, text, action, onClick, accent = "cyan" }: {
  icon: React.ComponentType<any>;
  title: string;
  text: string;
  action: string;
  onClick: () => void;
  accent?: "cyan" | "emerald" | "amber" | "blue" | "red";
}) {
  const accentClass = {
    cyan: "md-icon-cyan",
    emerald: "md-icon-emerald",
    amber: "md-icon-amber",
    blue: "md-icon-blue",
    red: "md-icon-red",
  }[accent];

  return (
    <button onClick={onClick} className="md-feature-card text-left">
      <div className={`md-feature-icon ${accentClass}`}><Icon className="w-5 h-5" /></div>
      <div className="font-semibold text-slate-900 dark:text-slate-100">{title}</div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p>
      <div className="mt-4 text-sm font-bold text-sky-700 dark:text-cyan-300">{action}</div>
    </button>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<any> }) {
  return (
    <div className="md-stat-card">
      <Icon className="w-5 h-5 text-sky-600" />
      <div>
        <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [records, setRecords] = useState<TroubleshootingRecord[]>(() => loadStoredRecords());
  const [selectedRecordForAi, setSelectedRecordForAi] = useState<TroubleshootingRecord | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => loadStoredTheme());
  const [activeView, setActiveView] = useState<AppView>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnitConverter, setShowUnitConverter] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const openAiWithRecord = (record: TroubleshootingRecord) => {
    setSelectedRecordForAi(record);
    setActiveView("ai");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems: Array<{ id: AppView; label: string; icon: React.ComponentType<any> }> = [
    { id: "home", label: "Home", icon: Home },
    { id: "database", label: "Faults", icon: Database },
    { id: "ai", label: "AI", icon: Bot },
    { id: "suite", label: "Engineer Suite", icon: Wrench },
  ];

  const navButton = (item: typeof navItems[number]) => {
    const Icon = item.icon;
    const active = activeView === item.id;
    return (
      <button
        key={item.id}
        onClick={() => { setActiveView(item.id); setMobileMenuOpen(false); }}
        className={`md-nav-pill ${active ? "md-nav-pill-active" : ""}`}
      >
        <Icon className="w-4 h-4" /> {item.label}
      </button>
    );
  };

  const renderHome = () => (
    <div className="space-y-6">
      <section className="md-hero-card">
        <div className="md-hero-content">
          <div className="md-chip"><ShieldCheck className="w-4 h-4" /> Offline-first • GitHub Pages • Desktop apps</div>
          <h1>Marine engineering help without the clutter.</h1>
          <p>
            Start with a fault, ask the Chief Engineer AI, open a PDF manual vault, or jump into daily shipboard tools. Calm screens, large actions, and safety-first guidance.
          </p>
          <div className="md-command-bar">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setActiveView("database")}
              placeholder="Search oil mist, scavenge fire, generator hunting, purifier water carry-over..."
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setActiveView("database")} className="md-primary-button"><Database className="w-4 h-4" /> Troubleshoot a fault</button>
            <button onClick={() => setActiveView("ai")} className="md-secondary-button"><Bot className="w-4 h-4" /> Ask AI</button>
            <button onClick={() => setActiveView("suite")} className="md-secondary-button"><BookOpen className="w-4 h-4" /> Manuals & tools</button>
          </div>
        </div>
        <div className="md-hero-panel">
          <img src="icons/icon-192.png" alt="Engineer Assistant icon" className="w-24 h-24 rounded-[1.75rem] shadow-xl" />
          <div className="text-center">
            <div className="text-xl font-black text-slate-900 dark:text-white">Engineer Assistant</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">v{APP_VERSION}</div>
          </div>
          <a href={STATIC_PAGE_URL} className="md-primary-button w-full justify-center"><Download className="w-4 h-4" /> Static web app</a>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="offline records" value={records.length} icon={Database} />
        <StatCard label="AI modes" value="3" icon={Bot} />
        <StatCard label="PDF.js manuals" value="Yes" icon={BookOpen} />
        <StatCard label="safety-first" value="LOTO" icon={ShieldCheck} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <FeatureCard icon={Database} title="Fault finding" text="Browse clear machinery cards with causes, safety actions, and checklists." action="Open faults" onClick={() => setActiveView("database")} accent="blue" />
        <FeatureCard icon={Bot} title="Chief Engineer AI" text="Use Browser Gemini on static pages, desktop Gemini, or offline database guidance." action="Open AI" onClick={() => setActiveView("ai")} accent="cyan" />
        <FeatureCard icon={BookOpen} title="Manual vault" text="Upload PDFs with PDF.js, search excerpts, and feed relevant text to AI." action="Open manuals" onClick={() => setActiveView("suite")} accent="emerald" />
        <FeatureCard icon={AlertTriangle} title="Emergency mode" text="Blackout, scavenge fire, crankcase risk, steering failure and more." action="Open suite" onClick={() => setActiveView("suite")} accent="red" />
      </section>

      <section className="md-surface-card p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily engineer workflow</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">One clean place for watch handover, PMS, spares, defect reports, photos, calculators and backup.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowUnitConverter(true)} className="md-secondary-button"><ArrowLeftRight className="w-4 h-4" /> Unit converter</button>
            <button onClick={() => setActiveView("suite")} className="md-primary-button"><Wrench className="w-4 h-4" /> Engineer Suite</button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderDatabase = () => (
    <section className="md-page-grid">
      <div className="md-section-heading md-page-main">
        <div className="md-chip"><Database className="w-4 h-4" /> Troubleshooting database</div>
        <h1>Choose a fault card</h1>
        <p>Search by symptom, component, maker, alarm text, or safety action. Tap “Ask AI” to focus the assistant on that fault.</p>
      </div>
      <div className="md-page-main md-surface-card overflow-hidden">
        <ExcelDashboard
          records={records}
          onAddRecord={handleAddRecord}
          onUpdateRecord={handleUpdateRecord}
          onDeleteRecord={handleDeleteRecord}
          onSelectForAi={openAiWithRecord}
          forceOpenRecordId={null}
          onClearForceOpenRecordId={() => {}}
          language="EN"
          externalSearch={searchQuery}
        />
      </div>
      <aside className="md-page-side space-y-4">
        <div className="md-surface-card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white">Fast search</h3>
          <div className="md-command-bar mt-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search faults..." />
          </div>
        </div>
        <div className="md-surface-card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white">Safety reminder</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Verify LOTO, pressure release, hot surface cooling, and maker limits before any hands-on inspection.</p>
        </div>
      </aside>
    </section>
  );

  const renderAi = () => (
    <section className="md-page-grid">
      <div className="md-section-heading md-page-main">
        <div className="md-chip"><Bot className="w-4 h-4" /> Chief Engineer AI</div>
        <h1>Ask clearly. Verify safely.</h1>
        <p>AI uses selected fault records, PDF/manual vault snippets, and ship profile context when available. Exact values must still come from the vessel manual.</p>
      </div>
      <div className="md-page-main md-surface-card overflow-hidden h-[720px]">
        <AiAssistant
          selectedRecord={selectedRecordForAi}
          onClearSelectedRecord={() => setSelectedRecordForAi(null)}
          language="EN"
          offlineRecords={records}
        />
      </div>
      <aside className="md-page-side space-y-4">
        {selectedRecordForAi ? (
          <div className="md-surface-card p-5 border-sky-200 dark:border-cyan-900">
            <div className="text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-cyan-300">AI focus</div>
            <h3 className="font-bold text-slate-900 dark:text-white mt-2">{selectedRecordForAi.component}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{selectedRecordForAi.faultSymptom}</p>
            <button onClick={() => setSelectedRecordForAi(null)} className="md-secondary-button mt-4 w-full justify-center">Clear focus</button>
          </div>
        ) : (
          <div className="md-surface-card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white">No focused fault</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Open the fault database and tap a card, or ask a general engineering question.</p>
            <button onClick={() => setActiveView("database")} className="md-primary-button mt-4 w-full justify-center">Find a fault</button>
          </div>
        )}
        <div className="md-surface-card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white">Good prompt format</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>1. Equipment and maker</li>
            <li>2. Alarm text and readings</li>
            <li>3. Recent work or fuel change</li>
            <li>4. What you already checked</li>
          </ul>
        </div>
      </aside>
    </section>
  );

  return (
    <div className={`md-app min-h-screen flex flex-col font-sans ${theme === "dark" ? "dark theme-dark" : "theme-light"}`}>
      <header className="md-topbar">
        <div className="md-topbar-inner">
          <button onClick={() => setActiveView("home")} className="md-brand">
            <img src="icons/icon-192.png" alt="Engineer Assistant" />
            <span>
              <strong>Engineer Assistant</strong>
              <small>Marine engineering toolkit</small>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map(navButton)}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={handleThemeToggle} className="md-icon-button" title="Toggle theme">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setShowUnitConverter(true)} className="hidden sm:inline-flex md-icon-button" title="Unit converter"><ArrowLeftRight className="w-5 h-5" /></button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden md-icon-button" title="Menu"><Menu className="w-5 h-5" /></button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md-mobile-nav">
            {navItems.map(navButton)}
          </div>
        )}
      </header>

      <main className="flex-1 md-shell">
        {activeView === "home" && renderHome()}
        {activeView === "database" && renderDatabase()}
        {activeView === "ai" && renderAi()}
        {activeView === "suite" && <EngineerSuite />}
      </main>

      {showUnitConverter && (
        <div className="fixed inset-0 z-[90] bg-slate-950/60 backdrop-blur-sm p-3 md:p-8 flex items-center justify-center">
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071524] shadow-2xl">
            <button
              onClick={() => setShowUnitConverter(false)}
              className="absolute right-3 top-3 z-10 md-icon-button bg-white/90 dark:bg-[#11223b]"
              aria-label="Close unit converter"
            >
              <X className="w-5 h-5" />
            </button>
            <UnitConverter language="EN" />
          </div>
        </div>
      )}

      <PwaInstallPrompt />

      <footer className="md-footer">
        <div className="md-footer-inner">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>SOLAS • MARPOL • STCW aware • Offline-first decision support</span>
          </div>
          <div>v{APP_VERSION} — GitHub Pages, PWA, and Desktop ready</div>
        </div>
      </footer>
    </div>
  );
}
