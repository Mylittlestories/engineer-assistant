import React from "react";

const references = [
  { label: "Scavenge Air Temp", value: "< 45–50°C (normal)" },
  { label: "Main LO Pressure", value: "3.5 – 4.5 bar" },
  { label: "Cylinder Oil BN", value: "40–70 (check manual)" },
  { label: "OWS Limit", value: "15 ppm" },
  { label: "Boiler Water pH", value: "10.5 – 11.5" },
  { label: "Crankcase Pressure", value: "Slightly negative" },
  { label: "ME Jacket Water", value: "75–85°C" },
  { label: "Fuel Viscosity", value: "10–15 cSt @ 50°C" },
];

export default function QuickReference() {
  return (
    <div className="bg-[#0b1424] border border-slate-700 rounded-3xl p-5">
      <div className="text-sm font-semibold mb-4 text-[#22d3ee]">Quick Reference (Common Limits)</div>
      <div className="grid grid-cols-1 gap-3 text-sm">
        {references.map((ref, i) => (
          <div key={i} className="flex justify-between border-b border-slate-800 pb-2 last:border-0">
            <span className="text-slate-400">{ref.label}</span>
            <span className="font-mono text-right text-[#22d3ee]">{ref.value}</span>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-slate-500 mt-4">Always verify with vessel-specific manuals</div>
    </div>
  );
}
