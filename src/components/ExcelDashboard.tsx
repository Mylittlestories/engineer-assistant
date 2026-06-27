import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Bot, 
  Search,
  X,
  ExternalLink
} from "lucide-react";
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

type CategoryType = "2-Stroke Propulsion" | "4-Stroke Generator" | "Auxiliary Machinery";

export default function ExcelDashboard({ 
  records, 
  onAddRecord, 
  onUpdateRecord, 
  onDeleteRecord, 
  onSelectForAi,
  forceOpenRecordId,
  onClearForceOpenRecordId,
  language = "EN",
  externalSearch = ""
}: ExcelDashboardProps) {

  const [activeCategory, setActiveCategory] = useState<CategoryType>("2-Stroke Propulsion");
  const [internalSearch, setInternalSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | "Easy" | "Medium" | "High">("All");
  const [selectedRecord, setSelectedRecord] = useState<TroubleshootingRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TroubleshootingRecord | null>(null);

  const [formData, setFormData] = useState({
    category: "2-Stroke Propulsion" as CategoryType,
    makeModel: "",
    component: "",
    faultSymptom: "",
    possibleCauses: "",
    troubleshootingSteps: "",
    safetyPrecautions: "",
    difficulty: "Medium" as "Easy" | "Medium" | "High"
  });

  const searchQuery = externalSearch || internalSearch;
  const isExternalSearch = !!externalSearch;

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (!isExternalSearch && record.category !== activeCategory) return false;
      if (difficultyFilter !== "All" && record.difficulty !== difficultyFilter) return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        record.component.toLowerCase().includes(q) ||
        record.makeModel.toLowerCase().includes(q) ||
        record.faultSymptom.toLowerCase().includes(q) ||
        record.possibleCauses.some(c => c.toLowerCase().includes(q))
      );
    });
  }, [records, activeCategory, difficultyFilter, searchQuery, isExternalSearch]);

  const stats = useMemo(() => ({
    total: records.length,
    twoStroke: records.filter(r => r.category === "2-Stroke Propulsion").length,
    fourStroke: records.filter(r => r.category === "4-Stroke Generator").length,
    auxiliary: records.filter(r => r.category === "Auxiliary Machinery").length,
  }), [records]);

  const openForm = (record?: TroubleshootingRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        category: record.category,
        makeModel: record.makeModel,
        component: record.component,
        faultSymptom: record.faultSymptom,
        possibleCauses: record.possibleCauses.join("\n"),
        troubleshootingSteps: record.troubleshootingSteps.join("\n"),
        safetyPrecautions: record.safetyPrecautions.join("\n"),
        difficulty: record.difficulty
      });
    } else {
      setEditingRecord(null);
      setFormData({
        category: activeCategory,
        makeModel: "",
        component: "",
        faultSymptom: "",
        possibleCauses: "",
        troubleshootingSteps: "",
        safetyPrecautions: "",
        difficulty: "Medium"
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.makeModel || !formData.component || !formData.faultSymptom) {
      alert("Please fill in all required fields");
      return;
    }

    const record: TroubleshootingRecord = {
      id: editingRecord ? editingRecord.id : `custom-${Date.now()}`,
      category: formData.category,
      makeModel: formData.makeModel,
      component: formData.component,
      faultSymptom: formData.faultSymptom,
      possibleCauses: formData.possibleCauses.split("\n").filter(Boolean),
      troubleshootingSteps: formData.troubleshootingSteps.split("\n").filter(Boolean),
      safetyPrecautions: formData.safetyPrecautions.split("\n").filter(Boolean),
      difficulty: formData.difficulty
    };

    if (editingRecord) onUpdateRecord(record);
    else onAddRecord(record);
    setIsFormOpen(false);
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const rows = filteredRecords.map((r, i) => ({
      "#": i + 1,
      "Component": r.component,
      "Make / Model": r.makeModel,
      "Symptom": r.faultSymptom,
      "Causes": r.possibleCauses.join(" | "),
      "Actions": r.troubleshootingSteps.join(" | "),
      "Safety": r.safetyPrecautions.join(" | "),
      "Risk": r.difficulty
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Troubleshooting");
    XLSX.writeFile(wb, "Marine_Engineering_Database.xlsx");
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL RECORDS", value: stats.total, color: "text-white" },
          { label: "2-STROKE", value: stats.twoStroke, color: "text-[#22d3ee]" },
          { label: "4-STROKE", value: stats.fourStroke, color: "text-amber-400" },
          { label: "AUXILIARY", value: stats.auxiliary, color: "text-teal-400" },
        ].map((stat, index) => (
          <div key={index} className="bg-[#0b1424] border border-slate-700 p-5 rounded-2xl">
            <div className="text-xs tracking-wider text-slate-400">{stat.label}</div>
            <div className={`text-4xl font-semibold mt-2 ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-5 items-center justify-between">
        {!isExternalSearch && (
          <div className="flex bg-[#0b1424] border border-slate-700 rounded-2xl p-1 text-sm">
            {(["2-Stroke Propulsion", "4-Stroke Generator", "Auxiliary Machinery"] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-xl transition-all ${activeCategory === cat 
                  ? "bg-[#22d3ee] text-[#0a111f] font-medium shadow-sm" 
                  : "hover:bg-[#11223b]"}`}
              >
                {cat.replace(" Propulsion", "").replace(" Generator", "")}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 w-full lg:w-auto">
          {!isExternalSearch && (
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={internalSearch}
                onChange={(e) => setInternalSearch(e.target.value)}
                className="w-full bg-[#0b1424] border border-slate-700 pl-11 py-2.5 rounded-2xl text-sm focus:border-[#22d3ee]"
              />
              {internalSearch && <button onClick={() => setInternalSearch("")} className="absolute right-4 top-3"><X className="w-4 h-4" /></button>}
            </div>
          )}

          <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value as any)} className="bg-[#0b1424] border border-slate-700 px-4 rounded-2xl text-sm">
            <option value="All">All Risks</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <button onClick={() => openForm()} className="flex items-center gap-2 px-5 bg-[#22d3ee] hover:bg-[#06b6d4] text-[#0a111f] font-medium rounded-2xl">
            <Plus className="w-4 h-4" /> New Record
          </button>

          <button onClick={handleExport} className="flex items-center gap-2 px-5 border border-slate-700 rounded-2xl hover:bg-[#11223b]">
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-700 rounded-3xl overflow-hidden bg-[#0b1424]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-xs text-slate-400">
              <th className="text-left px-6 py-4 font-medium">COMPONENT</th>
              <th className="text-left px-6 py-4 font-medium">MAKE / MODEL</th>
              <th className="text-left px-6 py-4 font-medium">SYMPTOM</th>
              <th className="text-center px-6 py-4 font-medium w-24">RISK</th>
              <th className="text-right px-6 py-4 font-medium w-48">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredRecords.length > 0 ? filteredRecords.map(record => (
              <tr key={record.id} className="hover:bg-[#11223b] group">
                <td className="px-6 py-4 font-medium">{record.component}</td>
                <td className="px-6 py-4 text-slate-400">{record.makeModel}</td>
                <td className="px-6 py-4 text-slate-300 max-w-xs truncate pr-4">{record.faultSymptom}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-0.5 text-xs rounded-full border font-medium ${
                    record.difficulty === "High" ? "border-red-500/40 text-red-400" :
                    record.difficulty === "Medium" ? "border-amber-500/40 text-amber-400" :
                    "border-emerald-500/40 text-emerald-400"
                  }`}>
                    {record.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100">
                    <button onClick={() => onSelectForAi(record)} className="p-2 hover:bg-[#1e293b] rounded-xl" title="Ask AI"><Bot className="w-4 h-4" /></button>
                    <button onClick={() => setSelectedRecord(record)} className="p-2 hover:bg-[#1e293b] rounded-xl" title="View Details"><Search className="w-4 h-4" /></button>
                    <button onClick={() => openForm(record)} className="p-2 hover:bg-[#1e293b] rounded-xl" title="Edit"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => confirm("Delete record?") && onDeleteRecord(record.id)} className="p-2 hover:bg-red-900/30 text-red-400 rounded-xl" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">No records found matching your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Professional Record Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1424] border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-xs bg-[#11223b] text-[#22d3ee] rounded-full border border-[#22d3ee]/30">{selectedRecord.category}</span>
                  <span className={`px-3 py-1 text-xs rounded-full border font-medium ${
                    selectedRecord.difficulty === "High" ? "border-red-500/40 text-red-400" : 
                    selectedRecord.difficulty === "Medium" ? "border-amber-500/40 text-amber-400" : "border-emerald-500/40 text-emerald-400"
                  }`}>{selectedRecord.difficulty} RISK</span>
                </div>
                <h3 className="text-2xl font-semibold mt-3 tracking-tight">{selectedRecord.component}</h3>
                <p className="text-slate-400 mt-1">{selectedRecord.makeModel}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-2"><X /></button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-8">
              <div>
                <div className="uppercase text-xs tracking-widest text-[#f59e0b] mb-2">Observed Symptom</div>
                <p className="text-lg">{selectedRecord.faultSymptom}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="uppercase text-xs tracking-widest text-[#22d3ee] mb-3">Possible Causes</div>
                  <ul className="space-y-2 text-sm">
                    {selectedRecord.possibleCauses.map((cause, i) => <li key={i} className="flex gap-2"><span className="text-[#22d3ee]">•</span> {cause}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="uppercase text-xs tracking-widest text-[#22d3ee] mb-3">Recommended Actions</div>
                  <ol className="space-y-2 text-sm list-decimal pl-5">
                    {selectedRecord.troubleshootingSteps.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </div>
              </div>

              {selectedRecord.safetyPrecautions.length > 0 && (
                <div className="bg-red-950/30 border-l-4 border-red-500 p-5 rounded-r-2xl">
                  <div className="text-red-400 text-xs tracking-wider mb-2">SAFETY CRITICAL</div>
                  <ul className="text-sm text-red-200 space-y-1">
                    {selectedRecord.safetyPrecautions.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-700 flex gap-3 justify-end">
              <button onClick={() => { onSelectForAi(selectedRecord); setSelectedRecord(null); }} className="px-6 py-3 bg-[#22d3ee] text-[#0a111f] rounded-2xl flex items-center gap-2 font-medium">
                <Bot className="w-4 h-4" /> Send to AI Assistant
              </button>
              <button onClick={() => setSelectedRecord(null)} className="px-6 py-3 border border-slate-700 rounded-2xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1424] border border-slate-700 rounded-3xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-700 flex justify-between">
              <div className="font-semibold text-lg">{editingRecord ? "Edit Record" : "Create New Record"}</div>
              <button onClick={() => setIsFormOpen(false)}><X /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="mt-1 w-full bg-[#11223b] border border-slate-700 rounded-2xl p-3">
                    <option value="2-Stroke Propulsion">2-Stroke Propulsion</option>
                    <option value="4-Stroke Generator">4-Stroke Generator</option>
                    <option value="Auxiliary Machinery">Auxiliary Machinery</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Risk Level</label>
                  <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value as any})} className="mt-1 w-full bg-[#11223b] border border-slate-700 rounded-2xl p-3">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <input placeholder="Make / Model" value={formData.makeModel} onChange={e => setFormData({...formData, makeModel: e.target.value})} className="w-full bg-[#11223b] border border-slate-700 rounded-2xl p-3" required />
              <input placeholder="Component Name" value={formData.component} onChange={e => setFormData({...formData, component: e.target.value})} className="w-full bg-[#11223b] border border-slate-700 rounded-2xl p-3" required />
              <input placeholder="Fault Symptom" value={formData.faultSymptom} onChange={e => setFormData({...formData, faultSymptom: e.target.value})} className="w-full bg-[#11223b] border border-slate-700 rounded-2xl p-3" required />

              <div>
                <label className="text-xs text-slate-400">Possible Causes (one per line)</label>
                <textarea value={formData.possibleCauses} onChange={e => setFormData({...formData, possibleCauses: e.target.value})} className="mt-1 w-full bg-[#11223b] border border-slate-700 rounded-2xl p-3 h-20" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Troubleshooting Steps (one per line)</label>
                <textarea value={formData.troubleshootingSteps} onChange={e => setFormData({...formData, troubleshootingSteps: e.target.value})} className="mt-1 w-full bg-[#11223b] border border-slate-700 rounded-2xl p-3 h-20" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Safety Precautions (one per line)</label>
                <textarea value={formData.safetyPrecautions} onChange={e => setFormData({...formData, safetyPrecautions: e.target.value})} className="mt-1 w-full bg-[#11223b] border border-slate-700 rounded-2xl p-3 h-20" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-3 border border-slate-700 rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#22d3ee] text-[#0a111f] font-semibold rounded-2xl">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
