import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = supabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (user && !userError) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profileError && profile?.role === "paciente") redirect("/(dashboard)/paciente");
    if (!profileError && profile?.role === "profesional") redirect("/(dashboard)/profesional");
    if (!profileError && profile?.role === "admin") redirect("/(dashboard)/admin");
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Imago</h1>
      <p className="text-gray-600">Gestioná turnos y agendas. Acceso directo desde tu Linktree.</p>
      <div className="space-y-2">
        <Link href="/(auth)/login" className="block w-full text-center bg-black text-white py-3 rounded">
          Iniciar sesión
        </Link>
        <Link href="/(auth)/register" className="block w-full text-center border py-3 rounded">
          Registrarse
        </Link>
      </div>
      <small className="text-gray-500 block text-center">
        ¿Olvidaste tu contraseña? Recuperala desde el login.
      </small>
    </main>
  );
}