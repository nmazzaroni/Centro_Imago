"use client";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
export default function NavBar({ role }:{ role: 'paciente'|'profesional'|'admin' }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex gap-2 justify-around max-w-md mx-auto">
      {role==='paciente' && (
        <>
          <Link href="/paciente/buscar" className="px-3 py-2 rounded border">Solicitar turno</Link>
          <Link href="/turnos/mis" className="px-3 py-2 rounded border">Ver mis turnos</Link>
          <Link href="/paciente/perfil" className="px-3 py-2 rounded border">Mi perfil</Link>
        </>
      )}
      {role==='profesional' && (
        <>
          <Link href="/profesional/colegas" className="px-3 py-2 rounded border">Buscar turnos de colegas</Link>
          <Link href="/(dashboard)/profesional" className="px-3 py-2 rounded border">Ver mi agenda</Link>
        </>
      )}
      {role==='admin' && (
        <>
          <Link href="/(dashboard)/admin" className="px-3 py-2 rounded border">Panel</Link>
        </>
      )}
      <button onClick={async()=>{ await supabaseBrowser.auth.signOut(); location.href="/";}} className="px-3 py-2 rounded">Salir</button>
    </nav>
  );
}
