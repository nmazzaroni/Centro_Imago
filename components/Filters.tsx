"use client";
export default function Filters({ value, onChange }:{ value: any; onChange: (v:any)=>void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <input className="border p-2 rounded" placeholder="Especialidad" value={value.specialty||""} onChange={e=>onChange({...value, specialty:e.target.value})} />
      <input className="border p-2 rounded" placeholder="Nombre" value={value.name||""} onChange={e=>onChange({...value, name:e.target.value})} />
      <input className="col-span-2 border p-2 rounded" placeholder="Día (AAAA-MM-DD)" value={value.date||""} onChange={e=>onChange({...value, date:e.target.value})} />
    </div>
  );
}
