import React, { useEffect, useMemo, useState } from "react";
import { troubleshootingDatabase } from "./database";
import { TroubleshootingRecord } from "./types";
import ExcelDashboard from "./components/ExcelDashboard";
import AiAssistant from "./components/AiAssistant";
import { UnitConverter } from "./components/UnitConverter";
import EngineerSuite from "./components/EngineerSuite";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import RealTroubleshooter from "./components/RealTroubleshooter";
import ManualVault from "./components/ManualVault";
import {
  AlertTriangle,
  ArrowLeftRight,
  Bot,
  BookOpen,
  CheckCircle2,
  Database,
  Download,
  Home,
  Moon,
  Search,
  ShieldCheck,
  ShipWheel,
  Sun,
  Wrench,
  X
} from "lucide-react";

const RECORDS_STORAGE_KEY = "marine_engine_db_records";
const THEME_STORAGE_KEY = "marine_theme_v2_2";
const APP_VERSION = "2.4.0";
const STATIC_PAGE_URL = "https://mylittlestories.github.io/engineer-assistant/";
const RELEASE_URL = "https://github.com/Mylittlestories/engineer-assistant/releases/latest";

type AppView = "home" | "manuals" | "database" | "ai" | "suite";

type NavItem = {
  id: AppView;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  helper: string;
};

const navItems: NavItem[] = [
  { id: "home", label: "Fix", shortLabel: "Fix", icon: Home, helper: "Troubleshoot now" },
  { id: "manuals", label: "Manuals", shortLabel: "Manuals", icon: BookOpen, helper: "PDF and maker data" },
  { id: "database", label: "Faults", shortLabel: "Faults", icon: Database, helper: "Known fault cards" },
  { id: "ai", label: "AI", shortLabel: "AI", icon: Bot, helper: "Ask with context" },
  { id: "suite", label: "More", shortLabel: "More", icon: Wrench, helper: "PMS, reports, emergency" },
];

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

function safeScrollTop() {
  window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
}

function PageHeading({ eyebrow, title, text, icon: Icon }: {
  eyebrow: string;
  title: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="ea-page-heading">
      <div className="ea-eyebrow"><Icon className="h-4 w-4" /> {eyebrow}</div>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, title, text, action, onClick, tone = "default" }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  action: string;
  onClick: () => void;
  tone?: "default" | "safe" | "warn" | "ai";
}) {
  return (
    <button type="button" onClick={onClick} className={`ea-quick-card ea-tone-${tone}`}>
      <span className="ea-quick-icon"><Icon className="h-5 w-5" /></span>
      <span className="ea-quick-title">{title}</span>
      <span className="ea-quick-text">{text}</span>
      <span className="ea-quick-action">{action}</span>
    </button>
  );
}

function MiniStatus({ icon: Icon, value, label }: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
}) {
  return (
    <div className="ea-mini-status">
      <Icon className="h-4 w-4" />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function App() {
  const [records, setRecords] = useState<TroubleshootingRecord[]>(() => loadStoredRecords());
  const [selectedRecordForAi, setSelectedRecordForAi] = useState<TroubleshootingRecord | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => loadStoredTheme());
  const [activeView, setActiveView] = useState<AppView>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [homeSearch, setHomeSearch] = useState("");
  const [aiPrefill, setAiPrefill] = useState("");
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

  const currentView = useMemo(
    () => navItems.find(item => item.id === activeView) || navItems[0],
    [activeView]
  );

  const goToView = (view: AppView) => {
    setActiveView(view);
    safeScrollTop();
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
    goToView("ai");
  };

  const searchFaults = (query: string) => {
    setSearchQuery(query.trim());
    setHomeSearch(query.trim());
    goToView("database");
  };

  const submitHomeSearch = (event: React.FormEvent) => {
    event.preventDefault();
    searchFaults(homeSearch);
  };

  const renderHome = () => (
    <div className="ea-stack">
      <RealTroubleshooter
        records={records}
        onOpenFaults={(query) => searchFaults(query)}
        onAskAi={(prompt) => { setAiPrefill(prompt); goToView("ai"); }}
      />

      <section className="ea-simple-actions" aria-label="Direct actions">
        <button type="button" onClick={() => goToView("database")}>
          <Database className="h-5 w-5" />
          <span><strong>Known fault cards</strong><small>Browse built-in cases</small></span>
        </button>
        <button type="button" onClick={() => goToView("ai")}>
          <Bot className="h-5 w-5" />
          <span><strong>Ask AI</strong><small>Use case context or general question</small></span>
        </button>
        <button type="button" onClick={() => goToView("manuals")}>
          <BookOpen className="h-5 w-5" />
          <span><strong>Manuals / PDF</strong><small>Upload or paste maker data</small></span>
        </button>
        <button type="button" onClick={() => setShowUnitConverter(true)}>
          <ArrowLeftRight className="h-5 w-5" />
          <span><strong>Unit converter</strong><small>Pressure, temp, torque</small></span>
        </button>
      </section>

      <section className="ea-card ea-row-card">
        <div>
          <h2>Use manuals only when needed</h2>
          <p>The app can build a troubleshooting path from symptoms, readings, trends and recent work. Upload PDFs only for exact maker limits, reset steps, torque values and citations.</p>
        </div>
        <div className="ea-row-actions">
          <a href={STATIC_PAGE_URL} className="ea-button ea-button-secondary"><Home className="h-4 w-4" /> Static page</a>
          <a href={RELEASE_URL} className="ea-button ea-button-primary"><Download className="h-4 w-4" /> Downloads</a>
        </div>
      </section>
    </div>
  );

  const renderDatabase = () => (
    <div className="ea-stack">
      <PageHeading
        icon={Database}
        eyebrow="Fault database"
        title="Find the fault, then act safely."
        text="Use short searches. Tap a card for likely causes, immediate safety points, checklist steps, or focused AI help."
      />
      <form onSubmit={(event) => event.preventDefault()} className="ea-card ea-search-panel ea-search-sticky">
        <Search className="h-5 w-5" />
        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search fault, alarm, maker, component or symptom..." />
        {searchQuery && <button type="button" onClick={() => setSearchQuery("")}>Clear</button>}
      </form>
      <section className="ea-module-card ea-compact-scope">
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
      </section>
    </div>
  );

  const renderAi = () => (
    <div className="ea-stack">
      <PageHeading
        icon={Bot}
        eyebrow="Chief Engineer AI"
        title="Ask one clear question."
        text="Give equipment, alarm text, readings, recent work and what you checked. AI is support only — verify all limits in the vessel manual."
      />
      {selectedRecordForAi ? (
        <section className="ea-card ea-focus-card">
          <div>
            <span>Focused fault</span>
            <strong>{selectedRecordForAi.component}</strong>
            <p>{selectedRecordForAi.faultSymptom}</p>
          </div>
          <button type="button" onClick={() => setSelectedRecordForAi(null)} className="ea-button ea-button-secondary">Clear</button>
        </section>
      ) : (
        <section className="ea-card ea-row-card">
          <div>
            <h2>No fault selected</h2>
            <p>Open Faults and tap “Ask AI”, or ask a general engineering question below.</p>
          </div>
          <button type="button" onClick={() => goToView("database")} className="ea-button ea-button-primary">Find a fault</button>
        </section>
      )}
      <section className="ea-ai-card ea-compact-scope">
        <AiAssistant
          selectedRecord={selectedRecordForAi}
          onClearSelectedRecord={() => setSelectedRecordForAi(null)}
          language="EN"
          offlineRecords={records}
          initialPrompt={aiPrefill}
          onInitialPromptConsumed={() => setAiPrefill("")}
        />
      </section>
    </div>
  );

  const renderManuals = () => (
    <div className="ea-stack">
      <PageHeading
        icon={BookOpen}
        eyebrow="Manuals / PDF"
        title="Save only the pages you need."
        text="Use PDF upload for maker limits and official procedures. Troubleshooting works without PDFs; manuals only make answers more exact."
      />
      <ManualVault />
    </div>
  );

  const renderSuite = () => (
    <div className="ea-stack">
      <PageHeading
        icon={Wrench}
        eyebrow="Engineer tools"
        title="Manuals, safety, logs and reports."
        text="A single offline shipboard workspace. Pick the tool tab you need; everything saves locally and can be exported."
      />
      <section className="ea-module-card ea-suite-card ea-compact-scope">
        <EngineerSuite />
      </section>
    </div>
  );

  return (
    <div className={`ea-app min-h-screen font-sans ${theme === "dark" ? "dark theme-dark" : "theme-light"}`}>
      <header className="ea-topbar">
        <div className="ea-topbar-row">
          <button type="button" onClick={() => goToView("home")} className="ea-brand" aria-label="Go to start">
            <img src="icons/icon-192.png" alt="" />
            <span>
              <strong>Engineer Assistant</strong>
              <small>{currentView.helper}</small>
            </span>
          </button>

          <nav className="ea-desktop-nav" aria-label="Main navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = item.id === activeView;
              return (
                <button key={item.id} type="button" onClick={() => goToView(item.id)} className={active ? "active" : ""}>
                  <Icon className="h-4 w-4" /> {item.label}
                </button>
              );
            })}
          </nav>

          <div className="ea-top-actions">
            <button type="button" onClick={() => setShowUnitConverter(true)} className="ea-icon-action" title="Unit converter" aria-label="Unit converter">
              <ArrowLeftRight className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setTheme(current => current === "dark" ? "light" : "dark")} className="ea-icon-action" title="Toggle theme" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="ea-main">
        <div className="ea-mobile-view-title">
          <currentView.icon className="h-4 w-4" /> {currentView.label}
        </div>
        {activeView === "home" && renderHome()}
        {activeView === "manuals" && renderManuals()}
        {activeView === "database" && renderDatabase()}
        {activeView === "ai" && renderAi()}
        {activeView === "suite" && renderSuite()}
      </main>

      <nav className="ea-bottom-nav" aria-label="Mobile navigation">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = item.id === activeView;
          return (
            <button key={item.id} type="button" onClick={() => goToView(item.id)} className={active ? "active" : ""}>
              <Icon className="h-5 w-5" />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {showUnitConverter && (
        <div className="ea-modal" role="dialog" aria-modal="true" aria-label="Unit converter">
          <div className="ea-modal-card ea-compact-scope">
            <button
              onClick={() => setShowUnitConverter(false)}
              className="ea-modal-close"
              aria-label="Close unit converter"
            >
              <X className="h-5 w-5" />
            </button>
            <UnitConverter language="EN" />
          </div>
        </div>
      )}

      <PwaInstallPrompt />

      <footer className="ea-footer">
        <div>
          <CheckCircle2 className="h-4 w-4" /> Offline-first decision support • v{APP_VERSION}
        </div>
        <span>SOLAS • MARPOL • STCW aware</span>
      </footer>
    </div>
  );
}
