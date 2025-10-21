import { requireRole } from "@/lib/rbac";
import BookingFlow from "@/components/BookingFlow";
import NavBar from "@/components/NavBar";
import { redirect } from "next/navigation";

export default async function BuscarPaciente() {
  const gate = await requireRole(["paciente"]);
  if (!gate.allowed) redirect("/");
  return (
    <main className="pb-20">
      <h1 className="text-xl font-semibold mb-2">Buscar turno</h1>
      <BookingFlow mode="paciente" />
      <NavBar role="paciente" />
    </main>
  );
}
