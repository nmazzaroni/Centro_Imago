"use client";
import { useEffect, useState } from "react";
import Filters from "./Filters";
import { format } from "date-fns";
type Profile = { id:string; full_name:string; specialty:string|null };
type Slot = { id:string; start_at:string; end_at:string };

export default function BookingFlow({ mode }:{ mode: 'paciente'|'profesional-derivar' }) {
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);
  const [slots, setSlots] = useState<Record<string, Slot[]>>({});

  useEffect(()=>{
    const fetchData = async()=>{
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.specialty) params.set("specialty", filters.specialty);
      if (filters.name) params.set("name", filters.name);
      if (filters.date) params.set("date", filters.date);
      const res = await fetch(`/api/search?${params.toString()}`, { cache: "no-store" }).catch(()=>null);
      if (res?.ok) {
        const data = await res.json();
        setResults(data.professionals);
        setSlots(data.slots);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters]);

  return (
    <div className="space-y-4">
      <Filters value={filters} onChange={setFilters} />
      {loading && <p>Cargando...</p>}
      {!loading && results.map(p=>(
        <div key={p.id} className="border rounded p-3">
          <div className="font-semibold">{p.full_name} {p.specialty ? `· ${p.specialty}` : ""}</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(slots[p.id] ?? []).map(s=>(
              <button key={s.id} onClick={async()=>{
                const okay = confirm(`Confirmar solicitud para ${p.full_name} - ${format(new Date(s.start_at), "dd/MM HH:mm")}?`);
                if (!okay) return;
                const res = await fetch("/api/appointments/create", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ professional_id: p.id, slot_id: s.id, mode })
                });
                const data = await res.json();
                if (res.ok) alert("Solicitud enviada. Te confirmaremos por WhatsApp.");
                else alert(data.error || "Error");
              }} className="px-3 py-2 rounded border">
                {format(new Date(s.start_at), "dd/MM HH:mm")}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
