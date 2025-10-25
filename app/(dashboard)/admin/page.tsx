import { requireRole } from "@/lib/rbac";
import DashboardHeader from "@/components/DashboardHeader";
import NavBar from "@/components/NavBar";
import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function Admin() {
  const gate = await requireRole(["admin"]);
  if (!gate.allowed) redirect("/");

  const supabase = supabaseServer();
  const { data: pros, error } = await supabase
    .from("profiles")
    .select("id, full_name, specialty") // ✅ especificado
    .eq("role", "profesional");

  return (
    <main className="pb-20">
      <DashboardHeader
        title="Panel Admin"
        subtitle="Alta de profesionales, etiquetas y novedades"
      />
      <div className="space-y-2">
        <h2 className="font-semibold">
          Profesionales ({pros?.length ?? 0})
        </h2>
        {/* Podés mapear `pros` acá si querés mostrar nombres o especialidades */}
      </div>
      <NavBar role="admin" />
    </main>
  );
}