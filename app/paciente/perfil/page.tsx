import { requireRole } from "@/lib/rbac";
import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function PerfilPaciente() {
  const gate = await requireRole(["paciente"]);
  if (!gate.allowed) redirect("/");
  const supabase = supabaseServer();
  const { data: me } = await supabase.from("profiles").select("*").eq("id", gate.profile!.id).single();

  return (
    <main className="pb-20 space-y-3">
      <h1 className="text-xl font-semibold">Mi perfil</h1>
      <div className="border rounded p-3">
        <div><b>Nombre:</b> {me?.full_name ?? "-"}</div>
        <div><b>Teléfono:</b> {me?.phone_e164 ?? "-"}</div>
        <div><b>Email:</b> {/* completar en cliente si querés */}</div>
      </div>
    </main>
  );
}
