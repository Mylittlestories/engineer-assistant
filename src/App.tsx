import React, { useEffect, useMemo, useState } from "react";
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
const APP_VERSION = "2.2.0";
const STATIC_PAGE_URL = "https://mylittlestories.github.io/engineer-assistant/";
const RELEASE_URL = "https://github.com/Mylittlestories/engineer-assistant/releases/latest";

type AppView = "home" | "database" | "ai" | "suite";

type NavItem = {
  id: AppView;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  helper: string;
};

const navItems: NavItem[] = [
  { id: "home", label: "Start", shortLabel: "Start", icon: Home, helper: "Choose what you need" },
  { id: "database", label: "Faults", shortLabel: "Faults", icon: Database, helper: "Find causes and checks" },
  { id: "ai", label: "AI", shortLabel: "AI", icon: Bot, helper: "Ask with context" },
  { id: "suite", label: "Tools", shortLabel: "Tools", icon: Wrench, helper: "Manuals, PMS, reports" },
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
      <section className="ea-start-panel">
        <div className="ea-start-copy">
          <div className="ea-eyebrow"><ShieldCheck className="h-4 w-4" /> Simple shipboard workflow</div>
          <h1>What do you need right now?</h1>
          <p>
            A clean, mobile-first assistant for faults, AI guidance, manuals, safety, PMS, spares, logs, reports and emergency checklists.
          </p>

          <form onSubmit={submitHomeSearch} className="ea-search-panel">
            <Search className="h-5 w-5" />
            <input
              value={homeSearch}
              onChange={(event) => setHomeSearch(event.target.value)}
              placeholder="Search: oil mist, generator hunting, purifier, scavenge fire..."
            />
            <button type="submit">Search</button>
          </form>

          <div className="ea-suggestion-row" aria-label="Common searches">
            {["oil mist", "blackout", "generator hunting", "purifier water"].map(example => (
              <button key={example} type="button" onClick={() => searchFaults(example)}>{example}</button>
            ))}
          </div>
        </div>

        <div className="ea-identity-card">
          <img src="icons/icon-192.png" alt="Engineer Assistant icon" />
          <strong>Engineer Assistant</strong>
          <span>v{APP_VERSION}</span>
          <a href={STATIC_PAGE_URL} className="ea-button ea-button-primary"><Download className="h-4 w-4" /> Open static app</a>
        </div>
      </section>

      <section className="ea-action-grid" aria-label="Main app actions">
        <QuickAction
          icon={Database}
          title="Troubleshoot a fault"
          text="Search alarms, components and symptoms. Open a compact card with causes, safety and checklist steps."
          action="Open faults"
          onClick={() => goToView("database")}
        />
        <QuickAction
          icon={Bot}
          title="Ask Chief Engineer AI"
          text="Use Browser Gemini on GitHub Pages, desktop Gemini, or offline database advice when no key is saved."
          action="Open AI"
          onClick={() => goToView("ai")}
          tone="ai"
        />
        <QuickAction
          icon={BookOpen}
          title="Manuals and PDF vault"
          text="Upload PDF manuals with PDF.js, save excerpts locally, and use them as cited context for AI."
          action="Open manuals"
          onClick={() => goToView("suite")}
          tone="safe"
        />
        <QuickAction
          icon={AlertTriangle}
          title="Emergency and safety"
          text="Fast access to blackout, scavenge fire, crankcase risk, steering, PTW and LOTO guidance."
          action="Open tools"
          onClick={() => goToView("suite")}
          tone="warn"
        />
      </section>

      <section className="ea-status-grid" aria-label="App status">
        <MiniStatus icon={Database} value={records.length} label="fault records" />
        <MiniStatus icon={BookOpen} value="PDF.js" label="manual extraction" />
        <MiniStatus icon={ShieldCheck} value="Offline" label="PWA ready" />
        <MiniStatus icon={ShipWheel} value="Desktop" label="Windows, Linux, macOS" />
      </section>

      <section className="ea-card ea-row-card">
        <div>
          <h2>Install or download</h2>
          <p>Use it in the browser, install it as a PWA, or download a desktop app from GitHub Releases.</p>
        </div>
        <div className="ea-row-actions">
          <a href={STATIC_PAGE_URL} className="ea-button ea-button-secondary"><Home className="h-4 w-4" /> Static page</a>
          <a href={RELEASE_URL} className="ea-button ea-button-primary"><Download className="h-4 w-4" /> Releases</a>
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
        />
      </section>
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
