import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { to, body } = await req.json();
  if (!to || !body) return NextResponse.json({ error: "to y body requeridos" }, { status: 400 });
  await sendWhatsAppMessage(to, body);
  return NextResponse.json({ ok: true });
}
