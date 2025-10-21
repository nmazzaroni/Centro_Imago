import { requireRole } from "@/lib/rbac";
import DashboardHeader from "@/components/DashboardHeader";
import NavBar from "@/components/NavBar";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function PacienteHome() {
  const gate = await requireRole(["paciente"]);
  if (!gate.allowed) redirect("/");
  const supabase = supabaseServer();
  const { data: upcomings } = await supabase
    .from("appointments")
    .select("id,status,start_at,professional_id")
    .eq("patient_id", gate.profile!.id)
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(3);

  return (
    <main className="pb-20">
      <DashboardHeader title={`Bienvenido/a ${gate.profile!.full_name ?? ""}`} subtitle={upcomings?.length ? `Tienes ${upcomings.length} turnos próximos` : "No tienes turnos próximos"} />
      <div className="space-y-3">
        <Link href="/paciente/buscar" className="block w-full text-center bg-black text-white py-3 rounded">Solicitar turno</Link>
        <Link href="/turnos/mis" className="block w-full text-center border py-3 rounded">Ver mis turnos</Link>
        <Link href="/paciente/perfil" className="block w-full text-center border py-3 rounded">Mi perfil</Link>
      </div>
      <NavBar role="paciente" />
    </main>
  );
}
