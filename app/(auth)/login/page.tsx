"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const onSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    router.push("/");
  };
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-xl font-semibold">Iniciar sesión</h1>
      <input className="w-full border p-3 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border p-3 rounded" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <p className="text-red-600">{error}</p>}
      <button className="w-full bg-black text-white py-3 rounded">Entrar</button>
      <button type="button" onClick={async()=>{
        if(!email) return setError("Ingresá tu email para recuperar.");
        const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, { redirectTo: "https://ykgmelcivomymctafvcj.supabase.co/auth/login"
 });
        if (error) setError(error.message);
        else alert("Si el correo existe, enviamos un mail de recuperación.");
      }} className="w-full text-sm text-gray-700 underline">Olvidé mi contraseña</button>
    </form>
  );
}
