import { requireRole } from "@/lib/rbac";
import DashboardHeader from "@/components/DashboardHeader";
import NavBar from "@/components/NavBar";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import SlotEditor from "@/components/SlotEditor";

export default async function ProfesionalHome() {
  const gate = await requireRole(["profesional"]);
  if (!gate.allowed) redirect("/");
  const supabase = supabaseServer();
  const { data: todays } = await supabase
    .from("appointments").select("*")
    .eq("professional_id", gate.profile!.id)
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(5);

  return (
    <main className="pb-28">
      <DashboardHeader title={`Bienvenido/a Lic. ${gate.profile!.full_name ?? ""}`} subtitle={todays?.length ? `Hoy/Próximos: ${todays.length}` : "Sin turnos próximos"} />
      <div className="space-y-3">
        <Link href="/profesional/colegas" className="block w-full text-center bg-black text-white py-3 rounded">Buscar turnos de colegas</Link>
        <Link href="/(dashboard)/profesional" className="block w-full text-center border py-3 rounded">Ver mi agenda</Link>
        <Link href="/novedades" className="block w-full text-center border py-3 rounded">Novedades institucionales</Link>
      </div>
      <div className="mt-4">
        <SlotEditor />
      </div>
      <NavBar role="profesional" />
    </main>
  );
}
