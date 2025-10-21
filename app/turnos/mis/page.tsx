import { requireRole } from "@/lib/rbac";
import { supabaseServer } from "@/lib/supabaseServer";
import NavBar from "@/components/NavBar";
import { redirect } from "next/navigation";

export default async function MisTurnos() {
  const gate = await requireRole(["paciente","profesional"]);
  if (!gate.allowed) redirect("/");
  const supabase = supabaseServer();
  const role = gate.profile!.role;
  const col = role === "paciente" ? "patient_id" : "professional_id";

  const { data: appts } = await supabase
    .from("appointments")
    .select("*, pro:profiles!appointments_professional_id_fkey(full_name,phone_e164), pat:profiles!appointments_patient_id_fkey(full_name,phone_e164)")
    .eq(col, gate.profile!.id)
    .order("start_at", { ascending: true });

  return (
    <main className="pb-20">
      <h1 className="text-xl font-semibold mb-3">Mis turnos</h1>
      <div className="space-y-3">
        {appts?.map(a=>(
          <div key={a.id} className="border rounded p-3">
            <div className="flex justify-between">
              <div><b>{new Date(a.start_at).toLocaleString()}</b></div>
              <span className="text-sm">{a.status}</span>
            </div>
            <div className="text-sm text-gray-600">
              Con: {role==='paciente' ? a.pro?.full_name : a.pat?.full_name}
            </div>
            {(role==='paciente' ? a.pro?.phone_e164 : a.pat?.phone_e164) && (
              <a className="text-green-700 underline text-sm"
                href={`https://wa.me/${(role==='paciente' ? a.pro!.phone_e164! : a.pat!.phone_e164!).replace('+','')}`}
                target="_blank">Contactar por WhatsApp</a>
            )}
            {a.status !== "canceled" && (
              <form action="/api/appointments/cancel" method="post" className="mt-2">
                <input type="hidden" name="appointment_id" value={a.id} />
                <button className="text-red-600 underline">Cancelar</button>
              </form>
            )}
          </div>
        ))}
      </div>
      <NavBar role={role as any} />
    </main>
  );
}
