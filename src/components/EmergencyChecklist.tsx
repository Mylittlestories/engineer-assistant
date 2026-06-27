import React from "react";

const checklist = [
  "Apply LOTO and verify zero energy state",
  "Wear appropriate PPE (gloves, goggles, safety shoes)",
  "Notify bridge / chief engineer before starting work",
  "Ensure adequate ventilation in the space",
  "Have fire extinguisher and first aid ready",
  "Double-check isolation before touching any equipment",
];

export default function EmergencyChecklist() {
  return (
    <div className="bg-red-950/20 border border-red-500/30 rounded-3xl p-5">
      <div className="text-red-400 text-sm font-semibold mb-4 flex items-center gap-2">
        ⚠️ EMERGENCY CHECKLIST
      </div>
      <ul className="space-y-2 text-sm text-red-200">
        {checklist.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-red-400">•</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
