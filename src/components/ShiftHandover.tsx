import React, { useState } from "react";

export default function ShiftHandover() {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const saveNote = () => {
    if (!note.trim()) return;
    const handover = JSON.parse(localStorage.getItem("marine_handover_notes") || "[]");
    handover.unshift({
      id: Date.now(),
      note: note.trim(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("marine_handover_notes", JSON.stringify(handover.slice(0, 20)));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setNote("");
  };

  return (
    <div className="bg-[#0b1424] border border-slate-700 rounded-3xl p-5">
      <div className="text-sm font-semibold mb-3 text-[#22d3ee]">Shift Handover Note</div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note any ongoing issues, alarms, or work in progress for the next watch..."
        className="w-full bg-[#11223b] border border-slate-700 rounded-2xl p-3 h-24 text-sm"
      />
      <button 
        onClick={saveNote} 
        disabled={!note.trim()}
        className="mt-3 w-full py-2.5 bg-[#22d3ee] text-[#0a111f] rounded-2xl font-medium disabled:opacity-50"
      >
        {saved ? "Saved ✓" : "Save for Next Watch"}
      </button>
    </div>
  );
}
