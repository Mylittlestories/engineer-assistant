import React, { useState, useMemo } from "react";
import { AlertTriangle, Bot, ChevronDown, ChevronUp, Search, ShieldCheck, Wrench, X } from "lucide-react";
import { TroubleshootingRecord } from "../types";

interface ExcelDashboardProps {
  records: TroubleshootingRecord[];
  onAddRecord: (record: TroubleshootingRecord) => void;
  onUpdateRecord: (record: TroubleshootingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSelectForAi: (record: TroubleshootingRecord) => void;
  forceOpenRecordId?: string | null;
  onClearForceOpenRecordId?: () => void;
  language?: "EN" | "GR";
  externalSearch?: string;
}

function difficultyClass(difficulty?: string) {
  const level = difficulty?.toLowerCase() || "";
  if (level.includes("high")) return "bg-red-950/70 text-red-200 border-red-800";
  if (level.includes("medium")) return "bg-amber-950/70 text-amber-200 border-amber-800";
  return "bg-emerald-950/70 text-emerald-200 border-emerald-800";
}

function recordText(record: TroubleshootingRecord) {
  return [
    record.category,
    record.makeModel,
    record.component,
    record.faultSymptom,
    ...(record.possibleCauses || []),
    ...(record.troubleshootingSteps || []),
    ...(record.safetyPrecautions || [])
  ].filter(Boolean).join(" ").toLowerCase();
}

function shortList(items: string[] = [], limit = 3) {
  return items.filter(Boolean).slice(0, limit);
}

export default function ExcelDashboard({
  records,
  onSelectForAi,
  externalSearch = ""
}: ExcelDashboardProps) {
  const [internalSearch, setInternalSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const searchQuery = externalSearch || internalSearch;

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(records.map(record => record.category).filter(Boolean)))];
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return records
      .filter(record => activeCategory === "All" || record.category === activeCategory)
      .filter(record => !query || recordText(record).includes(query))
      .slice(0, query ? 30 : 18);
  }, [records, searchQuery, activeCategory]);

  const hasActiveSearch = Boolean(searchQuery || activeCategory !== "All");

  return (
    <div className="p-3 md:p-4">
      {!externalSearch && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by fault, maker, symptom, system, or safety action..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full bg-[#11223b] border border-slate-700 pl-11 pr-11 py-3 rounded-2xl text-sm focus:outline-none focus:border-[#22d3ee]"
            />
            {internalSearch && (
              <button onClick={() => setInternalSearch("")} className="absolute right-4 top-3.5 text-slate-400 hover:text-white" aria-label="Clear search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-thin">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`shrink-0 px-3 py-2 rounded-full border text-xs font-semibold transition-colors ${
              activeCategory === category
                ? "bg-[#22d3ee] border-[#22d3ee] text-[#071524]"
                : "bg-[#11223b] border-slate-700 text-slate-300 hover:border-[#22d3ee]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1 mb-3">
        <span>{filteredRecords.length} shown{hasActiveSearch ? " from filtered database" : " — most common first"}</span>
        <span>Tap a card to ask AI</span>
      </div>

      <div className="max-h-[560px] overflow-y-auto pr-1 space-y-3">
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => {
            const expanded = expandedRecordId === record.id;
            return (
              <article
                key={record.id}
                onClick={() => onSelectForAi(record)}
                className="group rounded-3xl border border-slate-700/80 bg-[#0f1d33] hover:bg-[#13243d] hover:border-cyan-800/70 transition-all shadow-sm overflow-hidden cursor-pointer"
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-200 text-[10px] font-bold uppercase tracking-wide">
                          {record.category}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${difficultyClass(record.difficulty)}`}>
                          {record.difficulty || "Standard"}
                        </span>
                      </div>
                      <h3 className="font-semibold text-base md:text-lg text-slate-100 leading-snug">{record.component}</h3>
                      <p className="text-xs text-slate-400 mt-1">{record.makeModel}</p>
                    </div>
                    <button
                      onClick={(event) => { event.stopPropagation(); onSelectForAi(record); }}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-[#22d3ee] text-[#071524] text-xs font-bold shrink-0 hover:bg-cyan-300"
                    >
                      <Bot className="w-4 h-4" /> Ask AI
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-700/70 bg-[#071524]/70 p-3">
                    <div className="flex items-start gap-2 text-sm text-slate-100">
                      <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                      <span>{record.faultSymptom}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#071524]/45 border border-slate-800 p-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cyan-200 mb-2">
                        <Wrench className="w-3.5 h-3.5" /> Likely causes
                      </div>
                      <ul className="space-y-1 text-xs text-slate-300 leading-relaxed list-disc pl-4">
                        {shortList(record.possibleCauses, expanded ? 8 : 2).map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-[#071524]/45 border border-slate-800 p-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-200 mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" /> Safety first
                      </div>
                      <ul className="space-y-1 text-xs text-slate-300 leading-relaxed list-disc pl-4">
                        {shortList(record.safetyPrecautions, expanded ? 8 : 2).map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-3 rounded-2xl bg-[#071524]/45 border border-slate-800 p-3">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-300 mb-2">Step-by-step checks</div>
                      <ol className="space-y-1 text-xs text-slate-300 leading-relaxed list-decimal pl-4">
                        {shortList(record.troubleshootingSteps, 10).map((item, index) => <li key={index}>{item}</li>)}
                      </ol>
                    </div>
                  )}

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpandedRecordId(expanded ? null : record.id);
                    }}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-[#11223b] py-2 text-xs font-semibold text-slate-200 hover:border-cyan-700"
                  >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {expanded ? "Show less" : "View checklist"}
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="p-10 text-center rounded-3xl border border-dashed border-slate-700 bg-[#0f1d33]">
            <Search className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <div className="font-semibold text-slate-200">No records found</div>
            <p className="text-sm text-slate-400 mt-1">Try searching a maker, component, alarm, pressure, temperature, or symptom.</p>
          </div>
        )}
      </div>
    </div>
  );
}
