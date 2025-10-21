import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const form = await req.formData();
  const appointment_id = String(form.get("appointment_id"));
  const supabase = supabaseServer();
  const admin = supabaseAdmin();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: appt } = await supabase.from("appointments").select("*").eq("id", appointment_id).single();
  if (!appt) return NextResponse.json({ error: "No existe" }, { status: 404 });
  if (![appt.patient_id, appt.professional_id].includes(me!.id)) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  await supabase.from("appointments").update({ status: "canceled" }).eq("id", appointment_id);

  if (appt.slot_id && new Date(appt.start_at) > new Date()) {
    await admin.from("time_slots").update({ is_available: true }).eq("id", appt.slot_id);
  }

  return NextResponse.json({ ok: true });
}
