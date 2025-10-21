import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (me?.role !== "profesional") return NextResponse.json({ error: "Solo profesionales" }, { status: 403 });

  const { start_at, end_at } = await req.json();
  if (!start_at || !end_at) return NextResponse.json({ error: "Faltan fechas" }, { status: 400 });

  const { error } = await supabase.from("time_slots").insert({
    professional_id: me.id, start_at, end_at, is_available: true
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
