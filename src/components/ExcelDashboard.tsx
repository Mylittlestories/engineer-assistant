import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Bot, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Activity,
  Droplet,
  Zap,
  Anchor,
  Flame,
  Gauge,
  Settings,
  X,
  Filter,
  Wrench
} from "lucide-react";
import { TroubleshootingRecord } from "../types";
import { uiTranslations, recordTranslations } from "../translations";

interface ExcelDashboardProps {
  records: TroubleshootingRecord[];
  onAddRecord: (record: TroubleshootingRecord) => void;
  onUpdateRecord: (record: TroubleshootingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSelectForAi: (record: TroubleshootingRecord) => void;
  forceOpenRecordId?: string | null;
  onClearForceOpenRecordId?: () => void;
  language?: "EN" | "GR";
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
  language = "EN"
}: ExcelDashboardProps) {

  const t = uiTranslations[language];
  
  const [activeSheet, setActiveSheet] = useState<CategoryType>("2-Stroke Propulsion");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [selectedRecordDetails, setSelectedRecordDetails] = useState<TroubleshootingRecord | null>(null);

  // Sync with interactive schematics selection
  React.useEffect(() => {
    if (forceOpenRecordId) {
      const match = records.find(r => r.id === forceOpenRecordId);
      if (match) {
        setSelectedRecordDetails(match);
        setActiveSheet(match.category);
      }
      if (onClearForceOpenRecordId) {
        onClearForceOpenRecordId();
      }
    }
  }, [forceOpenRecordId, records, onClearForceOpenRecordId]);
  
  // States for adding / editing modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TroubleshootingRecord | null>(null);

  // Form Field States
  const [formCategory, setFormCategory] = useState<CategoryType>("2-Stroke Propulsion");
  const [formMakeModel, setFormMakeModel] = useState("");
  const [formComponent, setFormComponent] = useState("");
  const [formFaultSymptom, setFormFaultSymptom] = useState("");
  const [formCauses, setFormCauses] = useState("");
  const [formSteps, setFormSteps] = useState("");
  const [formSafety, setFormSafety] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "High">("Medium");

  const isCurrentlySearching = searchQuery.trim().length > 0;

  // Filter records based on Active Sheet (Category) and Search input
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      // Bypasses the active tab filter ONLY during search query, allowing direct global lookup
      if (!isCurrentlySearching) {
        if (rec.category !== activeSheet) return false;
      }
      if (difficultyFilter !== "All" && rec.difficulty !== difficultyFilter) return false;
      
      const searchLower = searchQuery.toLowerCase();
      
      // Support matching in translated Greek strings as well
      const translation = recordTranslations[rec.id];
      const matchGr = translation ? (
        translation.component.toLowerCase().includes(searchLower) ||
        translation.makeModel.toLowerCase().includes(searchLower) ||
        translation.faultSymptom.toLowerCase().includes(searchLower) ||
        translation.possibleCauses.some(cause => cause.toLowerCase().includes(searchLower)) ||
        translation.troubleshootingSteps.some(step => step.toLowerCase().includes(searchLower))
      ) : false;

      return (
        rec.id.toLowerCase().includes(searchLower) ||
        rec.makeModel.toLowerCase().includes(searchLower) ||
        rec.component.toLowerCase().includes(searchLower) ||
        rec.faultSymptom.toLowerCase().includes(searchLower) ||
        rec.possibleCauses.some(cause => cause.toLowerCase().includes(searchLower)) ||
        rec.troubleshootingSteps.some(step => step.toLowerCase().includes(searchLower)) ||
        matchGr
      );
    });
  }, [records, activeSheet, searchQuery, difficultyFilter, isCurrentlySearching]);

  // Overall statistics for the engine room database
  const stats = useMemo(() => {
    const total = records.length;
    const mechanicalTwoStroke = records.filter(r => r.category === "2-Stroke Propulsion").length;
    const fourStrokeGens = records.filter(r => r.category === "4-Stroke Generator").length;
    const auxiliary = records.filter(r => r.category === "Auxiliary Machinery").length;
    const criticalCount = records.filter(r => r.difficulty === "High" || r.faultSymptom.toLowerCase().includes("fire") || r.faultSymptom.toLowerCase().includes("explosion")).length;
    
    return { total, mechanicalTwoStroke, fourStrokeGens, auxiliary, criticalCount };
  }, [records]);

  // Handle Exporting directly to multi-sheet real Microsoft Excel file!
  const handleExportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const categories: CategoryType[] = ["2-Stroke Propulsion", "4-Stroke Generator", "Auxiliary Machinery"];

      categories.forEach(cat => {
        const catRecords = records.filter(r => r.category === cat);
        
        // Transform our structured records into tabular keys for spreadsheet rows
        const rows = catRecords.map((item, index) => ({
          "No.": index + 1,
          "Database ID": item.id,
          "Machinery Component": item.component,
          "Maker / Model Range": item.makeModel,
          "Fault / Error Symptom": item.faultSymptom,
          "Possible Mechanical Causes": item.possibleCauses.map((c, i) => `${i + 1}. ${c}`).join("\n"),
          "Troubleshooting Action Steps": item.troubleshootingSteps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
          "Crucial Safety Precautions": item.safetyPrecautions.map((p, i) => `⚠ ${p}`).join("\n"),
          "Task Difficulty": item.difficulty
        }));

        const ws = XLSX.utils.json_to_sheet(rows);

        // Define premium table styling layout width properties
        ws["!cols"] = [
          { wch: 6 },   // No
          { wch: 14 },  // ID
          { wch: 25 },  // Equipment
          { wch: 25 },  // Engine Make
          { wch: 35 },  // Problem
          { wch: 45 },  // Root Cause
          { wch: 55 },  // Action Steps
          { wch: 45 },  // Safety
          { wch: 15 }   // Class
        ];

        // Format Excel row alignment and line breaks compatibility
        const sheetName = cat.replace(" Propulsion", "").replace(" Generator", "");
        XLSX.utils.book_append_sheet(wb, ws, `${sheetName} Manual`);
      });

      // Write and trigger download trigger
      XLSX.writeFile(wb, "Ship_Engine_Room_Troubleshooting_Database.xlsx");
    } catch (e) {
      console.error("Exporting excel file failed: ", e);
      alert("Fail to export database. Please verify standard XLSX capabilities.");
    }
  };

  // Open the add/edit form modal
  const openForm = (recordToEdit: TroubleshootingRecord | null = null) => {
    if (recordToEdit) {
      setEditingRecord(recordToEdit);
      setFormCategory(recordToEdit.category);
      setFormMakeModel(recordToEdit.makeModel);
      setFormComponent(recordToEdit.component);
      setFormFaultSymptom(recordToEdit.faultSymptom);
      setFormCauses(recordToEdit.possibleCauses.join("\n"));
      setFormSteps(recordToEdit.troubleshootingSteps.join("\n"));
      setFormSafety(recordToEdit.safetyPrecautions.join("\n"));
      setFormDifficulty(recordToEdit.difficulty);
    } else {
      setEditingRecord(null);
      setFormCategory(activeSheet);
      setFormMakeModel("");
      setFormComponent("");
      setFormFaultSymptom("");
      setFormCauses("");
      setFormSteps("");
      setFormSafety("");
      setFormDifficulty("Medium");
    }
    setIsFormOpen(true);
  };

  // Handle saving record
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMakeModel || !formComponent || !formFaultSymptom) {
      alert("Please fill in machinery maker, component, and symptom fields.");
      return;
    }

    const compiledRecord: TroubleshootingRecord = {
      id: editingRecord ? editingRecord.id : `custom-${Date.now()}`,
      category: formCategory,
      makeModel: formMakeModel,
      component: formComponent,
      faultSymptom: formFaultSymptom,
      possibleCauses: formCauses.split("\n").map(line => line.trim()).filter(Boolean),
      troubleshootingSteps: formSteps.split("\n").map(line => line.trim()).filter(Boolean),
      safetyPrecautions: formSafety.split("\n").map(line => line.trim()).filter(Boolean),
      difficulty: formDifficulty
    };

    if (editingRecord) {
      onUpdateRecord(compiledRecord);
    } else {
      onAddRecord(compiledRecord);
    }
    setIsFormOpen(false);
  };

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case "2-Stroke Propulsion": return <Anchor className="w-5 h-5 text-cyan-400" />;
      case "4-Stroke Generator": return <Zap className="w-5 h-5 text-amber-400" />;
      case "Auxiliary Machinery": return <Settings className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6" id="excel-dashboard-container">
      {/* Dynamic Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="stats-grid">
        <div className="bg-[#05070a] border border-slate-800 p-4 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-cyan-950/60 p-3 rounded-lg border border-cyan-800/30">
            <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{t.statsTotal}</p>
            <p className="text-xl font-bold text-white">{stats.total}</p>
          </div>
        </div>

        <div className="bg-[#05070a] border border-slate-800 p-4 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-cyan-950/60 p-3 rounded-lg border border-cyan-800/30">
            <Anchor className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{language === "GR" ? "2-Stroke Κύρια" : "2-Stroke Propulsion"}</p>
            <p className="text-xl font-bold text-white">{stats.mechanicalTwoStroke}</p>
          </div>
        </div>

        <div className="bg-[#05070a] border border-slate-800 p-4 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-800/30">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{language === "GR" ? "4-Stroke Γενν." : "4-Stroke Generator"}</p>
            <p className="text-xl font-bold text-white">{stats.fourStrokeGens}</p>
          </div>
        </div>

        <div className="bg-[#05070a] border border-slate-800 p-4 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-red-950/40 p-3 rounded-lg border border-red-800/30">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{t.statsRisks}</p>
            <p className="text-xl font-bold text-red-500">{stats.criticalCount}</p>
          </div>
        </div>
      </div>

      {/* Main Database Sheet Area */}
      <div className="bg-[#0a0d16] border-2 border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col" id="spreadsheet-cabinet">
        
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-800 bg-[#0d101a] flex flex-col md:flex-row gap-4 justify-between items-center" id="controls-section">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            <div className="relative flex-1 md:flex-initial">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 animate-pulse" />
              <input
                id="db-search"
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-10 py-2.5 border-2 border-cyan-800/50 bg-[#04060c] rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 w-full md:w-96 placeholder-slate-500 font-bold font-mono"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 border border-slate-700 py-2.5 px-3 rounded-lg text-xs bg-slate-900 text-slate-200" id="filter-difficulty-block">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <select
                id="difficulty-select"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-transparent focus:outline-none text-xs text-slate-200 font-bold cursor-pointer"
              >
                <option value="All" className="bg-[#0d1425]">{t.difficultyFilterAll}</option>
                <option value="Easy" className="bg-[#0d1425]">{t.difficultyFilterEasy}</option>
                <option value="Medium" className="bg-[#0d1425]">{t.difficultyFilterMedium}</option>
                <option value="High" className="bg-[#0d1425]">{t.difficultyFilterHigh}</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full md:w-auto" id="spreadsheet-actions">
            <button
              id="add-entry-btn"
              onClick={() => openForm(null)}
              className="flex-1 md:flex-initial border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-150 px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-cyan-400 font-black" />
              <span>{t.buttonLogFault}</span>
            </button>

            <button
              id="export-excel-btn"
              onClick={handleExportToExcel}
              className="flex-1 md:flex-initial bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              title="Download Microsoft Excel multi-sheet spreadsheet"
            >
              <Download className="w-4 h-4" />
              <span>{t.buttonExportExcel}</span>
            </button>
          </div>
        </div>

        {/* Global Live Query Badge when search matches are shown */}
        {isCurrentlySearching && (
          <div className="bg-cyan-950/80 border-b border-cyan-800/40 p-3 px-5 text-cyan-300 font-mono text-[11px] font-bold flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span>
                {language === "GR" 
                  ? `🔍 ΑΜΕΣΗ ΠΡΟΣΒΑΣΗ: Βρέθηκαν ${filteredRecords.length} αποτελέσματα για "${searchQuery}" σε ολόκληρο τον κατάλογο` 
                  : `🔍 DIRECT ACCESS SEARCH: Found ${filteredRecords.length} matches for "${searchQuery}" in vast offline database`}
              </span>
            </div>
            <span className="text-[10px] text-cyan-500 font-semibold uppercase">
              {language === "GR" ? "Παράκαμψη καρτελών για άμεσο αποτέλεσμα" : "TAB CONSTRAINT BYPASS IS ACTIVE"}
            </span>
          </div>
        )}

        {/* Microsoft Excel Styled Active Sheet Tabs */}
        <div className="bg-[#111827] flex border-b border-slate-800 select-none overflow-x-auto" id="excel-sheet-tabs-bar">
          <div className="bg-[#0f172a] px-4 py-2.5 border-r border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.worksheetsLabel}</span>
          </div>
          {(["2-Stroke Propulsion", "4-Stroke Generator", "Auxiliary Machinery"] as CategoryType[]).map((catName) => {
            const isActive = activeSheet === catName;
            const tabLabel = language === "GR" ? (
              catName === "2-Stroke Propulsion" ? "2-Stroke Πρόωση" :
              catName === "4-Stroke Generator" ? "4-Stroke Γεννήτρια" : "Βοηθητικά Μηχανήματα"
            ) : catName;
            return (
              <button
                key={catName}
                id={`tab-${catName.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => {
                  setActiveSheet(catName);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border-r border-slate-800 transition-colors focus:outline-none ${
                  isActive 
                    ? "bg-[#0d1425] text-cyan-400 border-t-2 border-t-cyan-400 text-white scale-100" 
                    : "bg-[#0f172a]/40 text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                }`}
              >
                {getCategoryIcon(catName)}
                <span>{tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Spreadsheet Data Grid */}
        <div className="overflow-x-auto" id="spreadsheet-grid-wrapper">
          <table className="w-full border-collapse" id="excel-table">
            <thead>
              <tr className="bg-[#111827] text-slate-400 font-mono text-[10px] tracking-wider uppercase border-b border-slate-800 text-left">
                <th className="py-2.5 px-4 border-r border-slate-800 w-12 text-center bg-[#0f172a]/50">{t.tableHash}</th>
                <th className="py-2.5 px-4 border-r border-slate-800 w-32">{t.tableId}</th>
                <th className="py-2.5 px-4 border-r border-slate-800 w-44">{t.tableComponent}</th>
                <th className="py-2.5 px-4 border-r border-slate-800 w-44">{t.tableModel}</th>
                <th className="py-2.5 px-4 border-r border-slate-800 w-64">{t.tableSymptom}</th>
                <th className="py-2.5 px-4 border-r border-slate-800">{t.tableCauses}</th>
                <th className="py-2.5 px-4 border-r border-slate-800 w-28 text-center">{t.tableRisk}</th>
                <th className="py-2.5 px-4 w-44 text-right pr-4">{t.tableOps}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((item, index) => {
                  const riskColor = 
                    item.difficulty === "High" 
                      ? "text-red-400 bg-red-950/50 border border-red-500/30" 
                      : item.difficulty === "Medium"
                        ? "text-amber-400 bg-amber-950/50 border border-amber-500/30"
                        : "text-cyan-400 bg-cyan-950/50 border border-cyan-500/30";

                  // Check if a Greek translation exists for this specific ID
                  const gIndex = recordTranslations[item.id];
                  const dComponent = (language === "GR" && gIndex) ? gIndex.component : item.component;
                  const dMakeModel = (language === "GR" && gIndex) ? gIndex.makeModel : item.makeModel;
                  const dFaultSymptom = (language === "GR" && gIndex) ? gIndex.faultSymptom : item.faultSymptom;
                  const dCauses = (language === "GR" && gIndex) ? gIndex.possibleCauses.join(" | ") : item.possibleCauses.join(" | ");

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-800/40 group/row border-b border-slate-850/60 transition-colors"
                      id={`row-${item.id}`}
                    >
                      <td className="py-3 px-4 font-mono text-center text-xs text-slate-500 bg-[#111827]/30 border-r border-slate-800">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-800 font-mono text-cyan-400 font-semibold flex flex-col gap-0.5">
                        <span>{item.id}</span>
                        {isCurrentlySearching && (
                          <span className="text-[8px] opacity-60 text-slate-400 font-normal uppercase truncate bg-slate-900/60 px-1 rounded max-w-fit">
                            {item.category.replace(" Propulsion", "").replace(" Generator", "")}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-800 font-semibold text-white">
                        {dComponent}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-800 text-slate-300">
                        {dMakeModel}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-800 font-medium text-slate-100">
                        {dFaultSymptom}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-800 max-w-xs truncate text-xs text-slate-400 font-mono">
                        {dCauses}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-800 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold font-mono tracking-wider ${riskColor}`}>
                          {item.difficulty.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right pr-4">
                        <div className="flex justify-end gap-1 px-1">
                          <button
                            id={`btn-ai-assist-${item.id}`}
                            onClick={() => onSelectForAi(item)}
                            className="bg-cyan-950/70 text-cyan-400 border border-cyan-700/50 px-2 py-1.5 rounded hover:bg-cyan-900/40 transition-colors flex items-center gap-1 text-[11px] font-bold"
                            title="Analyze with AI Chief Engineer"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{language === "GR" ? "AI ΣΥΜΒΟΥΛΗ" : "AI ADVISE"}</span>
                          </button>

                          <button
                            id={`btn-view-${item.id}`}
                            onClick={() => setSelectedRecordDetails(item)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                            title="Interactive Step-by-Step Offline Guide"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </button>

                          <button
                            id={`btn-edit-${item.id}`}
                            onClick={() => openForm(item)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                            title="Edit Record Parameters"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            id={`btn-delete-${item.id}`}
                            onClick={() => {
                              if (window.confirm(`Permanently wipe ID ${item.id} from the local active sheet database?`)) {
                                onDeleteRecord(item.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                            title="Wipe Fault Log from Active Sheet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    No marine diagnostics match filter context. Click "Add Fault Log" to create custom records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Active Sheet Footer */}
        <div className="p-3 bg-[#111827] border-t border-slate-800 text-[10px] text-slate-500 font-mono flex flex-wrap justify-between items-center" id="excel-sheet-footer">
          <div>
            <span>SYSTEM: EXCEL ENGINE PRO ENGINE RUN INTEL // LOCK STATUS: SECURE</span>
          </div>
          <div>
            <span>ACTIVE DATATABLE GLANCE ROWS: {filteredRecords.length} / CATEGORY LIMIT: NORMAL</span>
          </div>
        </div>
      </div>

      {/* MODAL 1: INTERACTIVE STEP-BY-STEP OFFLINE USER MANUAL */}
      {selectedRecordDetails && (() => {
        const gIndex = recordTranslations[selectedRecordDetails.id];
        const mComponent = (language === "GR" && gIndex) ? gIndex.component : selectedRecordDetails.component;
        const mModel = (language === "GR" && gIndex) ? gIndex.makeModel : selectedRecordDetails.makeModel;
        const mSymptom = (language === "GR" && gIndex) ? gIndex.faultSymptom : selectedRecordDetails.faultSymptom;
        const mCauses = (language === "GR" && gIndex) ? gIndex.possibleCauses : selectedRecordDetails.possibleCauses;
        const mSteps = (language === "GR" && gIndex) ? gIndex.troubleshootingSteps : selectedRecordDetails.troubleshootingSteps;
        const mSafety = (language === "GR" && gIndex && gIndex.safetyPrecautions) ? gIndex.safetyPrecautions : selectedRecordDetails.safetyPrecautions;

        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-55 animate-fade-in" id="doc-modal">
            <div className="bg-[#050914] rounded-xl shadow-2xl border-2 border-cyan-500/50 w-full max-w-3xl overflow-hidden flex flex-col max-h-[88vh] text-slate-100">
              
              {/* Attention Industrial Yellow/Black Warning Bar */}
              <div className="bg-gradient-to-r from-amber-500 via-yellow-450 to-amber-500 text-slate-950 font-mono font-black py-1.5 px-4 text-[10px] tracking-widest flex items-center justify-between uppercase shrink-0 border-b border-cyan-950" id="industrial-strip-local">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-4 h-4 text-slate-900 animate-pulse" />
                  <span>{language === "GR" ? "[ΕΓΧΕΙΡΙΔΙΟ ΣΥΜΜΟΡΦΩΣΗΣ STCW-95] ΚΡΙΣΙΜΗ ΚΑΡΤΑ ΕΞΩΦΥΛΛΟΥ" : "[STCW-95 COMPLIANT MANUAL] CRITICAL FIELD REPAIR CARD // READ OPERATION ONLY"}</span>
                </div>
                <span className="hidden sm:inline bg-slate-900 text-amber-400 font-bold px-1.5 py-0.5 rounded text-[8px] tracking-normal border border-amber-500/30">
                  {language === "GR" ? "ΤΟΠΙΚΗ ΜΝΗΜΗ" : "OFFLINE CACHED"}
                </span>
              </div>

              {/* Header */}
              <div className="p-5 border-b border-slate-800 bg-[#0d1425] flex justify-between items-start shrink-0" id="doc-modal-header">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/20 tracking-wider">
                      {selectedRecordDetails.category}
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase py-0.5 px-2 rounded tracking-wider border ${
                      selectedRecordDetails.difficulty === "High"
                        ? "text-red-400 bg-red-950/70 border-red-800/40"
                        : selectedRecordDetails.difficulty === "Medium"
                          ? "text-amber-400 bg-amber-950/70 border-amber-800/40"
                          : "text-cyan-400 bg-cyan-950/70 border-cyan-850"
                    }`}>
                      {language === "GR" ? "ΕΠΙΠΕΔΟ ΚΙΝΔΥΝΟΥ" : "RISK LEVEL"}: {selectedRecordDetails.difficulty.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase">
                      SYS-ID: {selectedRecordDetails.id}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-display text-white mt-1.5 uppercase border-b border-cyan-950 pb-2 flex items-center gap-2">
                    <span className="text-cyan-400 font-mono font-bold tracking-widest">⚙</span>
                    {mComponent}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-2 font-medium">
                    {language === "GR" ? "Κατασκευαστής / Μοντέλο" : "Equipment Standard"}: <strong className="text-slate-200">{mModel}</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedRecordDetails(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-805/50 rounded-lg transition-colors border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content optimized for poor ship control-room lighting */}
              <div className="p-6 overflow-y-auto space-y-5 bg-[#050914]" id="doc-modal-content">
                {/* Symptom Panel */}
                <div className="bg-amber-950/40 p-4 rounded-lg border border-amber-700/30 shadow-inner">
                  <h4 className="font-mono font-bold text-amber-400 flex items-center gap-1.5 text-[11px] tracking-wider uppercase mb-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    {language === "GR" ? "Παρατηρηθέν Σύμπτωμα / Κατάσταση Συναγερμού" : "Observed Vessel Symptom / Alert Condition"}
                  </h4>
                  <p className="text-white text-sm font-bold font-mono tracking-tight leading-relaxed">
                    {mSymptom}
                  </p>
                </div>

                {/* Safety Precautions - EXTREMELY CRITICAL IN SHIP */}
                {mSafety && mSafety.length > 0 && (
                  <div className="bg-red-950/50 p-4 rounded-lg border-2 border-red-600/40">
                    <h4 className="font-mono font-black text-red-400 flex items-center gap-1.5 text-[11px] tracking-wider uppercase mb-2">
                      <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
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
                    <ul className="list-decimal pl-5 text-slate-350 flex flex-col gap-2 text-xs font-semibold font-mono leading-relaxed">
                      {mCauses.map((cause, i) => (
                        <li key={i} className="pl-1 text-slate-200">{cause}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Technical Procedures Column */}
                  <div className="bg-[#0b1120] p-4 rounded-lg border border-slate-800">
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

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 bg-[#0d1425] flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0" id="doc-modal-footer">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onSelectForAi(selectedRecordDetails);
                      setSelectedRecordDetails(null);
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
                  onClick={() => setSelectedRecordDetails(null)}
                  className="w-full sm:w-auto border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all focus:outline-none"
                >
                  {language === "GR" ? "ΚΛΕΙΣΙΜΟ ΚΑΡΤΑΣ" : "CLOSE ACTIVE CARD"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: ADD OR EDIT TROUBLESHOOT DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="form-modal">
          <div className="bg-[#0f172a] rounded-xl shadow-2xl border border-slate-700 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 bg-[#111827] flex justify-between items-center" id="form-modal-header">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                {editingRecord ? `Modify Active Row [${editingRecord.id}]` : "Insert Custom Troubleshooting Row"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-6 overflow-y-auto flex flex-col gap-4 text-sm" id="record-form">
              <div>
                <label className="block text-3xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Target Worksheet Tab</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as CategoryType)}
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="2-Stroke Propulsion" className="bg-[#0d1425]">2-Stroke Propulsion</option>
                  <option value="4-Stroke Generator" className="bg-[#0d1425]">4-Stroke Generator</option>
                  <option value="Auxiliary Machinery" className="bg-[#0d1425]">Auxiliary Machinery</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Cylinder / System Maker</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yanmar EY26, Aalborg Boiler"
                    value={formMakeModel}
                    onChange={(e) => setFormMakeModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Specific Component</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scavenge Air Blower, Photocell"
                    value={formComponent}
                    onChange={(e) => setFormComponent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-3xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Error/Symptom Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High pressure leakage or frequency hunting during grid load exchange"
                  value={formFaultSymptom}
                  onChange={(e) => setFormFaultSymptom(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-3xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Possible Mechanical Causes (one cause per line)</label>
                <textarea
                  placeholder="e.g. Broken tension spring&#10;Clogged spray nozzle tips"
                  value={formCauses}
                  onChange={(e) => setFormCauses(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-xs h-20 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-3xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Step-by-step Corrective Action (one step per line)</label>
                <textarea
                  placeholder="e.g. Close cooling valves&#10;Drape fire blanket over burner shield"
                  value={formSteps}
                  onChange={(e) => setFormSteps(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-xs h-20 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-3xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Ship Safety Warnings (one precaution per line)</label>
                <textarea
                  placeholder="e.g. Isolate circuit breakers (LOTO)&#10;Let block temperature cool to 40°C"
                  value={formSafety}
                  onChange={(e) => setFormSafety(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-xs h-20 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-3xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Operational/Risk Difficulty</label>
                <select
                  value={formDifficulty}
                  onChange={(e) => setFormDifficulty(e.target.value as "Easy" | "Medium" | "High")}
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-sm text-slate-200 focus:outline-none focus:border-cyan-500 text-slate-200"
                >
                  <option value="Easy" className="bg-[#0d1425]">Routine Maintenance (Easy)</option>
                  <option value="Medium" className="bg-[#0d1425]">Standard Engine Overhaul (Medium)</option>
                  <option value="High" className="bg-[#0d1425]">Dangerous / Emergency (High Risks)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800" id="form-actions">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="border border-slate-700 text-slate-350 px-4 py-2 rounded text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded text-xs font-bold transition-colors"
                >
                  Save to Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
