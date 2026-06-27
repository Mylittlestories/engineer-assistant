import React, { useState } from "react";

const lotoSteps = [
  "Notify all affected personnel",
  "Identify all energy sources",
  "Shut down equipment using normal procedures",
  "Isolate all energy sources (electrical, mechanical, hydraulic, pneumatic, thermal)",
  "Apply personal locks and tags",
  "Release or restrain stored energy",
  "Verify zero energy state (try to start equipment)",
  "Perform work safely",
];

export default function LOTOChecklist() {
  const [checked, setChecked] = useState<number[]>([]);

  const toggle = (index: number) => {
    if (checked.includes(index)) {
      setChecked(checked.filter(i => i !== index));
    } else {
      setChecked([...checked, index]);
    }
  };

  const reset = () => setChecked([]);

  return (
    <div className="bg-[#0b1424] border border-slate-700 rounded-3xl p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-semibold text-[#f59e0b]">LOTO Checklist</div>
        <button onClick={reset} className="text-xs px-3 py-1 border border-slate-700 rounded-full hover:bg-[#11223b]">Reset</button>
      </div>
      <div className="space-y-2 text-sm">
        {lotoSteps.map((step, index) => (
          <label key={index} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checked.includes(index)}
              onChange={() => toggle(index)}
              className="mt-1 accent-[#22d3ee]"
            />
            <span className={checked.includes(index) ? "line-through text-slate-400" : ""}>{step}</span>
          </label>
        ))}
      </div>
      <div className="mt-4 text-xs text-slate-500">Always follow vessel-specific LOTO procedures</div>
    </div>
  );
}
