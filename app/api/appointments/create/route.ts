import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabaseServer";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { inXHours } from "@/lib/utils";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { professional_id, slot_id, mode } = body as { professional_id:string; slot_id:string; mode:'paciente'|'profesional-derivar' };

    const supabase = supabaseServer();
    const admin = supabaseAdmin();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (!me) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 400 });
    if (!["paciente","profesional"].includes(me.role)) return NextResponse.json({ error: "Rol no permitido" }, { status: 403 });

    const { data: apptId, error: eRpc } = await supabase.rpc("book_slot", {
      slot: slot_id, patient: me.id, professional: professional_id, created_by: me.id
    });
    if (eRpc || !apptId) return NextResponse.json({ error: eRpc?.message || "Slot no disponible" }, { status: 409 });

    const { data: appt } = await admin
      .from("appointments")
      .select("*, pat:profiles!appointments_patient_id_fkey(full_name,phone_e164), pro:profiles!appointments_professional_id_fkey(full_name,phone_e164)")
      .eq("id", apptId).single();

    if (!appt?.pro?.phone_e164) return NextResponse.json({ error: "Profesional sin teléfono válido" }, { status: 400 });

    const token = crypto.randomUUID();
    await admin.from("action_tokens").insert({
      token,
      type: "appointment_confirm",
      data: { appointment_id: apptId, actor: "professional" },
      expires_at: inXHours(24).toISOString()
    });

    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/tokens/${token}`;
    const msg = `Nueva solicitud de turno:
- Paciente: ${appt.pat?.full_name ?? "Paciente"}
- Fecha/Hora: ${new Date(appt.start_at).toLocaleString()}
- Para confirmar, abrí: ${confirmUrl}`;

    await sendWhatsAppMessage(appt.pro.phone_e164, msg);

    if (mode === "profesional-derivar") {
      await admin.from("appointments").update({ notes: `Solicitud de derivación por ${me.full_name ?? "Profesional"}` }).eq("id", apptId);
    }

    return NextResponse.json({ ok: true, appointment_id: apptId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error" }, { status: 500 });
  }
}
