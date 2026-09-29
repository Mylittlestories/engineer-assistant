import React, { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Database, FileText, Plus, Search, Trash2, Upload } from "lucide-react";
import { extractPdfText } from "../utils/pdfText";
import {
  loadManualDocuments,
  saveManualDocuments,
  searchManualDocuments,
  type ManualDocument,
} from "../utils/shipAssistant";

type ImportState = {
  tone: "idle" | "working" | "success" | "warning" | "error";
  message: string;
};

const MAX_MANUAL_CHARS = 180000;
const PDF_PAGE_LIMIT = 80;

function storageSizeKb(documents: ManualDocument[]) {
  return Math.round(JSON.stringify(documents).length / 1024);
}

export default function ManualVault({ compact = false }: { compact?: boolean }) {
  const [manuals, setManuals] = useState<ManualDocument[]>(() => loadManualDocuments());
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [importState, setImportState] = useState<ImportState>({ tone: "idle", message: "" });

  const snippets = useMemo(() => searchManualDocuments(search, manuals, 6), [search, manuals]);

  const updateManuals = (next: ManualDocument[]) => {
    try {
      saveManualDocuments(next);
      setManuals(next);
      return true;
    } catch (error: any) {
      setImportState({
        tone: "error",
        message: error?.name === "QuotaExceededError"
          ? "Browser storage is full. Delete older manual entries or import a smaller section."
          : error?.message || "Could not save this manual in browser storage."
      });
      return false;
    }
  };

  const readFile = async (file?: File) => {
    if (!file) return;
    setImportState({ tone: "working", message: `Reading ${file.name} locally in this browser...` });

    try {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const rawText = isPdf ? await extractPdfText(file, PDF_PAGE_LIMIT) : await file.text();
      const cleaned = rawText.replace(/\u0000/g, "").trim();

      setTitle(file.name.replace(/\.[^.]+$/, ""));
      setSource(isPdf ? `${file.name} (PDF.js local text extraction)` : file.name);
      setContent(cleaned.slice(0, MAX_MANUAL_CHARS));

      if (!cleaned) {
        setImportState({
          tone: "warning",
          message: "The file opened, but no selectable text was found. If this is a scanned PDF, export/OCR it first or paste the needed section."
        });
        return;
      }

      setImportState({
        tone: cleaned.length > MAX_MANUAL_CHARS ? "warning" : "success",
        message: cleaned.length > MAX_MANUAL_CHARS
          ? `Imported text from ${file.name}, but kept the first ${Math.round(MAX_MANUAL_CHARS / 1000)}k characters to keep the app fast.`
          : `Imported ${Math.round(cleaned.length / 1000)}k characters from ${file.name}. Review, then tap Save manual.`
      });
    } catch (error: any) {
      setImportState({
        tone: "error",
        message: `${error?.message || "Could not read this file."} If it is a protected/scanned PDF, export text or paste the relevant pages.`
      });
    }
  };

  const saveManual = () => {
    const text = content.trim();
    if (!text) {
      setImportState({ tone: "warning", message: "Add or paste some manual text before saving." });
      return;
    }

    const next: ManualDocument[] = [{
      id: `manual-${Date.now()}`,
      title: title.trim() || "Untitled manual note",
      source: source.trim() || "Local note",
      content: text.slice(0, MAX_MANUAL_CHARS),
      addedAt: new Date().toISOString()
    }, ...manuals].slice(0, 40);

    if (updateManuals(next)) {
      setTitle("");
      setSource("");
      setContent("");
      setImportState({ tone: "success", message: "Manual section saved. AI will use matching snippets as context." });
    }
  };

  const deleteManual = (id: string) => {
    updateManuals(manuals.filter(manual => manual.id !== id));
  };

  const stateClass = importState.tone === "error" ? "mv-error" : importState.tone === "warning" ? "mv-warning" : importState.tone === "success" ? "mv-success" : "";

  return (
    <section className={`mv-shell ${compact ? "mv-compact" : ""}`}>
      <div className="mv-hero">
        <div>
          <div className="ea-eyebrow"><BookOpen className="h-4 w-4" /> Manual vault</div>
          <h2>Upload a PDF only when you need exact maker data.</h2>
          <p>PDF.js extracts selectable text locally in the browser. Nothing is sent to a server. For scanned/protected manuals, paste the needed section or OCR it first.</p>
        </div>
        <div className="mv-stats">
          <strong>{manuals.length}</strong>
          <span>saved sections</span>
          <small>{storageSizeKb(manuals)} kB local storage</small>
        </div>
      </div>

      <div className="mv-grid">
        <section className="mv-card">
          <h3><Upload className="h-4 w-4" /> Add manual section</h3>
          <label className="mv-upload-button">
            <Upload className="h-5 w-5" />
            <span>Choose PDF / text file</span>
            <input type="file" accept="application/pdf,.pdf,.txt,.md,.csv,.json,.log,.xml,.html" onChange={(event) => readFile(event.target.files?.[0])} />
          </label>
          {importState.message && <div className={`mv-status ${stateClass}`}>{importState.message}</div>}

          <label className="mv-field"><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Main engine manual, Purifier water transducer pages..." /></label>
          <label className="mv-field"><span>Source / page</span><input value={source} onChange={(event) => setSource(event.target.value)} placeholder="PDF name, page range, maker bulletin..." /></label>
          <label className="mv-field"><span>Text to save</span><textarea value={content} onChange={(event) => setContent(event.target.value)} rows={8} placeholder="Paste only the relevant pages/section when possible. Smaller sections make AI answers faster and clearer." /></label>
          <button type="button" onClick={saveManual} className="ea-button ea-button-primary"><Plus className="h-4 w-4" /> Save manual</button>
        </section>

        <section className="mv-card">
          <h3><Search className="h-4 w-4" /> Search saved manuals</h3>
          <label className="mv-search"><Search className="h-4 w-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="bearing clearance, alarm reset, purifier water transducer..." /></label>
          <div className="mv-results">
            {search.trim() ? (
              snippets.length ? snippets.map(snippet => (
                <article key={`${snippet.documentId}-${snippet.excerpt.slice(0, 20)}`}>
                  <strong>{snippet.title}</strong>
                  <span>{snippet.source}</span>
                  <p>{snippet.excerpt}</p>
                </article>
              )) : <div className="mv-empty"><Search className="h-5 w-5" /> No matching saved manual text.</div>
            ) : (
              <div className="mv-empty"><Database className="h-5 w-5" /> Search here after saving a manual section.</div>
            )}
          </div>
        </section>
      </div>

      <section className="mv-card">
        <h3><FileText className="h-4 w-4" /> Saved manual sections</h3>
        <div className="mv-manual-list">
          {manuals.length ? manuals.map(manual => (
            <article key={manual.id}>
              <div>
                <strong>{manual.title}</strong>
                <span>{manual.source || "Local note"} • {Math.round(manual.content.length / 1000)}k chars</span>
              </div>
              <button type="button" onClick={() => deleteManual(manual.id)} aria-label={`Delete ${manual.title}`}><Trash2 className="h-4 w-4" /></button>
            </article>
          )) : <div className="mv-empty"><CheckCircle2 className="h-5 w-5" /> No manuals saved yet. The troubleshooting mode still works without them.</div>}
        </div>
      </section>
    </section>
  );
}
