import React, { useState, useEffect } from "react";

interface VaultItem {
  id: number;
  question: string;
  answer: string;
  timestamp: string;
  relatedTo: string;
}

export default function MyVault() {
  const [vault, setVault] = useState<VaultItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("marine_ai_vault");
    if (saved) setVault(JSON.parse(saved));
  }, []);

  const deleteItem = (id: number) => {
    const newVault = vault.filter(item => item.id !== id);
    setVault(newVault);
    localStorage.setItem("marine_ai_vault", JSON.stringify(newVault));
  };

  if (vault.length === 0) {
    return (
      <div className="bg-[#0b1424] border border-slate-700 rounded-3xl p-8 text-center">
        <div className="text-slate-400">Your saved AI answers will appear here.</div>
        <div className="text-xs text-slate-500 mt-2">Click the bookmark icon in the AI chat to save useful responses.</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b1424] border border-slate-700 rounded-3xl p-5">
      <div className="text-sm font-semibold mb-4 text-[#22d3ee]">My Saved Lessons ({vault.length})</div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {vault.map((item) => (
          <div key={item.id} className="bg-[#11223b] p-4 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-[#22d3ee] mb-1">{item.relatedTo}</div>
                <div className="font-medium text-sm">{item.question}</div>
              </div>
              <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-500 text-xs">Delete</button>
            </div>
            <div className="mt-3 text-sm text-slate-300 whitespace-pre-wrap border-t border-slate-700 pt-3">
              {item.answer.substring(0, 400)}{item.answer.length > 400 ? "..." : ""}
            </div>
            <div className="text-[10px] text-slate-500 mt-2">{new Date(item.timestamp).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
