import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get("specialty")?.trim();
    const name = searchParams.get("name")?.trim();
    const dateStr = searchParams.get("date")?.trim();

    const supabase = supabaseServer();

    let q = supabase
      .from("professionals_public")
      .select("id, full_name, specialty, phone_e164");

    if (specialty) q = q.ilike("specialty", `%${specialty.replace(/%/g, "")}%`);
    if (name) q = q.ilike("full_name", `%${name.replace(/%/g, "")}%`);

    const { data: pros, error: prosError } = await q.limit(20);
    if (prosError || !pros) {
      return NextResponse.json({ professionals: [], slots: {}, error: prosError?.message }, { status: 500 });
    }

    const dayStart = dateStr ? new Date(`${dateStr}T00:00:00Z`) : new Date();
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const slots: Record<string, any[]> = {};

    for (const p of pros) {
      const { data: s, error: slotError } = await supabase
        .from("available_slots")
        .select("*")
        .eq("professional_id", p.id)
        .gte("start_at", dayStart.toISOString())
        .lt("start_at", dayEnd.toISOString())
        .order("start_at", { ascending: true });

      if (!slotError && s) {
        slots[p.id] = s;
      } else {
        slots[p.id] = [];
      }
    }

    return NextResponse.json({ professionals: pros, slots });
  } catch (err: any) {
    return NextResponse.json({ professionals: [], slots: {}, error: err.message }, { status: 500 });
  }
}