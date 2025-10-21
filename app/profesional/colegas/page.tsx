import { requireRole } from "@/lib/rbac";
import BookingFlow from "@/components/BookingFlow";
import NavBar from "@/components/NavBar";
import { redirect } from "next/navigation";

export default async function BuscarColegas() {
  const gate = await requireRole(["profesional"]);
  if (!gate.allowed) redirect("/");
  return (
    <main className="pb-20">
      <h1 className="text-xl font-semibold mb-2">Turnos disponibles de colegas</h1>
      <BookingFlow mode="profesional-derivar" />
      <NavBar role="profesional" />
    </main>
  );
}
