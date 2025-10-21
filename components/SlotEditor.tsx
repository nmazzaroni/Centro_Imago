"use client";
import { useState } from "react";

export default function SlotEditor() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [msg, setMsg] = useState<string|null>(null);

  const create = async () => {
    setMsg(null);
    if (!start || !end) return setMsg("Completá ambas fechas");
    const res = await fetch("/api/slots/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        start_at: new Date(start).toISOString(),
        end_at: new Date(end).toISOString()
      })
    });
    const j = await res.json();
    setMsg(res.ok ? "Disponibilidad cargada ✅" : (j.error || "Error"));
  };

  return (
    <div className="border rounded p-3 space-y-2">
      <div className="font-semibold">Cargar disponibilidad</div>
      <input type="datetime-local" className="w-full border p-2 rounded" value={start} onChange={e=>setStart(e.target.value)} />
      <input type="datetime-local" className="w-full border p-2 rounded" value={end} onChange={e=>setEnd(e.target.value)} />
      <button className="bg-black text-white px-3 py-2 rounded" onClick={create}>Guardar</button>
      {msg && <div className="text-sm">{msg}</div>}
    </div>
  );
}
