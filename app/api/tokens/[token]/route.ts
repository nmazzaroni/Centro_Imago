import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const admin = supabaseAdmin();
  const { data: tok } = await admin.from("action_tokens").select("*").eq("token", params.token).is("used_at", null).single();
  if (!tok) return NextResponse.json({ error: "Token inválido o usado" }, { status: 400 });
  if (new Date(tok.expires_at) < new Date()) return NextResponse.json({ error: "Token expirado" }, { status: 400 });

  const appointmentId = tok.data.appointment_id as string;
  const { data: appt } = await admin
    .from("appointments")
    .select("*, pat:profiles!appointments_patient_id_fkey(full_name,phone_e164), pro:profiles!appointments_professional_id_fkey(full_name,phone_e164)")
    .eq("id", appointmentId).single();
  if (!appt) return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });

  await admin.from("appointments").update({ status: "confirmed" }).eq("id", appointmentId);
  await admin.from("action_tokens").update({ used_at: new Date().toISOString() }).eq("id", tok.id);

  if (appt.pat?.phone_e164) {
    const msgP = `Tu turno fue confirmado:
- Profesional: ${appt.pro?.full_name ?? ""}
- Fecha/Hora: ${new Date(appt.start_at).toLocaleString()}
¡Gracias!`;
    await sendWhatsAppMessage(appt.pat.phone_e164, msgP);
  }

  return new Response(
    `<html><body style="font-family:sans-serif"><h3>Turno confirmado ✅</h3><p>El turno fue confirmado y se notificó al paciente por WhatsApp.</p></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
