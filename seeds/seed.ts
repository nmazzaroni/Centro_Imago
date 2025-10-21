import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  const supa = createClient(url, service);

  const pEmail = "profesional+demo@imago.local";
  const cEmail = "paciente+demo@imago.local";

  const { data: proUser } = await supa.auth.admin.createUser({
    email: pEmail, password: "Test1234!", email_confirm: true, user_metadata: {}
  });
  const { data: patUser } = await supa.auth.admin.createUser({
    email: cEmail, password: "Test1234!", email_confirm: true, user_metadata: {}
  });

  if (!proUser?.user || !patUser?.user) throw new Error("No se pudieron crear usuarios");

  await supa.from("profiles").upsert([
    { id: proUser.user.id, role: "profesional", full_name: "Lic. Demo", phone_e164: "+5491100000000", specialty: "Psicología", tags: ["cognitivo","adultos"] },
    { id: patUser.user.id, role: "paciente", full_name: "Paciente Demo", phone_e164: "+5491100000001" }
  ]);

  const now = new Date();
  const slots = [1, 2, 3].map(d => {
    const start = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 45 * 60 * 1000);
    return { professional_id: proUser.user!.id, start_at: start.toISOString(), end_at: end.toISOString(), is_available: true };
  });

  await supa.from("time_slots").insert(slots);

  console.log("Seed listo:");
  console.log("- Profesional:", pEmail, "pass: Test1234!");
  console.log("- Paciente:", cEmail, "pass: Test1234!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
