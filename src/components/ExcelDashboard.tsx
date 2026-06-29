import React, { useState, useMemo } from "react";
import { Search, Plus, Bot, X } from "lucide-react";
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

export default function ExcelDashboard({ 
  records, 
  onSelectForAi,
  externalSearch = ""
}: ExcelDashboardProps) {

  const [internalSearch, setInternalSearch] = useState("");
  const searchQuery = externalSearch || internalSearch;

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records.slice(0, 12); // Show only first 12 if no search
    const q = searchQuery.toLowerCase();
    return records.filter(r => 
      r.component.toLowerCase().includes(q) ||
      r.makeModel.toLowerCase().includes(q) ||
      r.faultSymptom.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [records, searchQuery]);

  return (
    <div className="p-2">
      {/* Search inside table */}
      {!externalSearch && (
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full bg-[#11223b] border border-slate-700 pl-11 py-2.5 rounded-2xl text-sm"
            />
            {internalSearch && <button onClick={() => setInternalSearch("")} className="absolute right-4 top-3"><X className="w-4 h-4" /></button>}
          </div>
        </div>
      )}

      <div className="max-h-[520px] overflow-y-auto">
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => (
            <div 
              key={record.id} 
              onClick={() => onSelectForAi(record)}
              className="px-5 py-4 border-b border-slate-800 hover:bg-[#11223b] cursor-pointer flex justify-between items-center group"
            >
              <div>
                <div className="font-medium">{record.component}</div>
                <div className="text-sm text-slate-400">{record.makeModel}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs px-3 py-1 bg-[#11223b] rounded-full text-[#22d3ee] border border-slate-700">
                  {record.difficulty}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onSelectForAi(record); }}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-[#22d3ee] text-[#0a111f] rounded-xl"
                >
                  <Bot className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-400">No records found</div>
        )}
      </div>
    </div>
  );
}
