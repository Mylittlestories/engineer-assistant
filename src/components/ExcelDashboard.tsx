import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Bot, 
  Search,
  X
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

  // Form states
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

  // Filter records
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

  // Open form
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

    if (editingRecord) {
      onUpdateRecord(record);
    } else {
      onAddRecord(record);
    }
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
        <div className="bg-[#0b1424] border border-slate-700 p-4 rounded-2xl">
          <div className="text-xs text-slate-400">TOTAL RECORDS</div>
          <div className="text-3xl font-semibold mt-1">{stats.total}</div>
        </div>
        <div className="bg-[#0b1424] border border-slate-700 p-4 rounded-2xl">
          <div className="text-xs text-slate-400">2-STROKE</div>
          <div className="text-3xl font-semibold mt-1 text-[#22d3ee]">{stats.twoStroke}</div>
        </div>
        <div className="bg-[#0b1424] border border-slate-700 p-4 rounded-2xl">
          <div className="text-xs text-slate-400">4-STROKE</div>
          <div className="text-3xl font-semibold mt-1 text-amber-400">{stats.fourStroke}</div>
        </div>
        <div className="bg-[#0b1424] border border-slate-700 p-4 rounded-2xl">
          <div className="text-xs text-slate-400">AUXILIARY</div>
          <div className="text-3xl font-semibold mt-1 text-teal-400">{stats.auxiliary}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 items-center justify-between">
        {/* Category Tabs */}
        {!isExternalSearch && (
          <div className="flex bg-[#0b1424] border border-slate-700 rounded-2xl p-1">
            {(["2-Stroke Propulsion", "4-Stroke Generator", "Auxiliary Machinery"] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-sm rounded-xl transition-all ${activeCategory === cat 
                  ? "bg-[#22d3ee] text-[#0a111f] font-medium" 
                  : "hover:bg-[#11223b]"}`}
              >
                {cat.replace(" Propulsion", "").replace(" Generator", "")}
              </button>
            ))}
          </div>
        )}

        {/* Search + Filters */}
        <div className="flex gap-3 w-full md:w-auto">
          {!isExternalSearch && (
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search in current category..."
                value={internalSearch}
                onChange={(e) => setInternalSearch(e.target.value)}
                className="w-full bg-[#0b1424] border border-slate-700 pl-10 py-2.5 rounded-2xl text-sm"
              />
              {internalSearch && (
                <button onClick={() => setInternalSearch("")} className="absolute right-3 top-3">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="bg-[#0b1424] border border-slate-700 px-4 py-2.5 rounded-2xl text-sm"
          >
            <option value="All">All Risk Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <button onClick={() => openForm()} className="flex items-center gap-2 px-5 bg-[#22d3ee] text-[#0a111f] font-medium rounded-2xl hover:bg-[#06b6d4]">
            <Plus className="w-4 h-4" /> Add Record
          </button>

          <button onClick={handleExport} className="flex items-center gap-2 px-5 border border-slate-700 rounded-2xl hover:bg-[#11223b]">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-700 rounded-2xl overflow-hidden bg-[#0b1424]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-[#0b1424]">
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-400">COMPONENT</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-400">MAKE / MODEL</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-400">SYMPTOM</th>
              <th className="text-center px-6 py-4 text-xs font-medium text-slate-400">RISK</th>
              <th className="text-right px-6 py-4 text-xs font-medium text-slate-400 w-48">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-[#11223b] group">
                  <td className="px-6 py-4 font-medium">{record.component}</td>
                  <td className="px-6 py-4 text-slate-400">{record.makeModel}</td>
                  <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{record.faultSymptom}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-0.5 text-xs rounded-full border ${
                      record.difficulty === "High" ? "border-red-500/40 text-red-400" :
                      record.difficulty === "Medium" ? "border-amber-500/40 text-amber-400" :
                      "border-emerald-500/40 text-emerald-400"
                    }`}>
                      {record.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100">
                      <button onClick={() => onSelectForAi(record)} className="p-2 hover:bg-[#1e293b] rounded-xl" title="Ask AI">
                        <Bot className="w-4 h-4" />
                      </button>
                      <button onClick={() => setSelectedRecord(record)} className="p-2 hover:bg-[#1e293b] rounded-xl" title="View">
                        <Search className="w-4 h-4" />
                      </button>
                      <button onClick={() => openForm(record)} className="p-2 hover:bg-[#1e293b] rounded-xl" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => {
                        if (confirm("Delete this record?")) onDeleteRecord(record.id);
                      }} className="p-2 hover:bg-red-900/30 text-red-400 rounded-xl" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1424] border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between">
              <div>
                <h3 className="text-xl font-semibold">{selectedRecord.component}</h3>
                <p className="text-slate-400">{selectedRecord.makeModel}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)}><X /></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              <div>
                <div className="text-xs text-[#f59e0b] mb-1">SYMPTOM</div>
                <p>{selectedRecord.faultSymptom}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-[#22d3ee] mb-2">POSSIBLE CAUSES</div>
                  <ul className="space-y-1.5 text-sm">
                    {selectedRecord.possibleCauses.map((c, i) => <li key={i}>• {c}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-[#22d3ee] mb-2">RECOMMENDED ACTIONS</div>
                  <ol className="space-y-1.5 text-sm list-decimal pl-5">
                    {selectedRecord.troubleshootingSteps.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
              </div>

              {selectedRecord.safetyPrecautions.length > 0 && (
                <div className="bg-red-950/30 border border-red-500/30 p-5 rounded-2xl">
                  <div className="text-red-400 text-xs mb-2">SAFETY PRECAUTIONS</div>
                  <ul className="text-sm space-y-1 text-red-200">
                    {selectedRecord.safetyPrecautions.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-700 flex gap-3 justify-end">
              <button onClick={() => { onSelectForAi(selectedRecord); setSelectedRecord(null); }} className="px-6 py-2.5 bg-[#22d3ee] text-[#0a111f] rounded-2xl font-medium flex items-center gap-2">
                <Bot className="w-4 h-4" /> Ask AI
              </button>
              <button onClick={() => setSelectedRecord(null)} className="px-6 py-2.5 border border-slate-700 rounded-2xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1424] border border-slate-700 rounded-2xl w-full max-w-lg">
            <div className="p-5 border-b border-slate-700 flex justify-between">
              <div className="font-semibold">{editingRecord ? "Edit Record" : "New Record"}</div>
              <button onClick={() => setIsFormOpen(false)}><X /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full mt-1 bg-[#11223b] border border-slate-700 rounded-xl p-2.5">
                    <option value="2-Stroke Propulsion">2-Stroke Propulsion</option>
                    <option value="4-Stroke Generator">4-Stroke Generator</option>
                    <option value="Auxiliary Machinery">Auxiliary Machinery</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Risk Level</label>
                  <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value as any})} className="w-full mt-1 bg-[#11223b] border border-slate-700 rounded-xl p-2.5">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <input placeholder="Make / Model" value={formData.makeModel} onChange={e => setFormData({...formData, makeModel: e.target.value})} className="w-full bg-[#11223b] border border-slate-700 rounded-xl p-3" required />
              <input placeholder="Component" value={formData.component} onChange={e => setFormData({...formData, component: e.target.value})} className="w-full bg-[#11223b] border border-slate-700 rounded-xl p-3" required />
              <input placeholder="Symptom" value={formData.faultSymptom} onChange={e => setFormData({...formData, faultSymptom: e.target.value})} className="w-full bg-[#11223b] border border-slate-700 rounded-xl p-3" required />

              <textarea placeholder="Possible Causes (one per line)" value={formData.possibleCauses} onChange={e => setFormData({...formData, possibleCauses: e.target.value})} className="w-full bg-[#11223b] border border-slate-700 rounded-xl p-3 h-24" />
              <textarea placeholder="Troubleshooting Steps (one per line)" value={formData.troubleshootingSteps} onChange={e => setFormData({...formData, troubleshootingSteps: e.target.value})} className="w-full bg-[#11223b] border border-slate-700 rounded-xl p-3 h-24" />
              <textarea placeholder="Safety Precautions (one per line)" value={formData.safetyPrecautions} onChange={e => setFormData({...formData, safetyPrecautions: e.target.value})} className="w-full bg-[#11223b] border border-slate-700 rounded-xl p-3 h-20" />

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-3 border border-slate-700 rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#22d3ee] text-[#0a111f] font-medium rounded-2xl">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
