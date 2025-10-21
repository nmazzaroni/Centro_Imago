import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const specialty = searchParams.get("specialty");
  const name = searchParams.get("name");
  const dateStr = searchParams.get("date");

  const supabase = supabaseServer();

  let q = supabase.from("professionals_public").select("*");
  if (specialty) q = q.ilike("specialty", `%${specialty}%`);
  if (name) q = q.ilike("full_name", `%${name}%`);
  const { data: pros } = await q.limit(20);

  const dayStart = dateStr ? new Date(`${dateStr}T00:00:00Z`) : new Date();
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);

  const slots: Record<string, any[]> = {};
  for (const p of pros ?? []) {
    const { data: s } = await supabase
      .from("available_slots")
      .select("*")
      .eq("professional_id", p.id)
      .gte("start_at", dayStart.toISOString())
      .lt("start_at", dayEnd.toISOString())
      .order("start_at", { ascending: true });
    slots[p.id] = s ?? [];
  }

  return NextResponse.json({ professionals: pros ?? [], slots });
}
