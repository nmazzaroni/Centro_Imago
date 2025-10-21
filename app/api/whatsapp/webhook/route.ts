import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const from = String(form.get("From")||"");
  const body = String(form.get("Body")||"").trim().toUpperCase();
  console.log("WhatsApp IN:", { from, body });
  return new NextResponse("OK");
}
