"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"paciente"|"profesional">("paciente");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const onSubmit = async (e:any)=>{
    e.preventDefault();
    setError(null);
    const { data, error } = await supabaseBrowser.auth.signUp({ email, password });
    if (error) return setError(error.message);
    const user = data.user;
    if (!user) return setError("No se pudo crear el usuario.");
    const { error: e2 } = await supabaseBrowser.from("profiles").insert({
      id: user.id, role, full_name: fullName, phone_e164: phone, specialty: role==="profesional"? specialty : null
    });
    if (e2) return setError(e2.message);
    alert("Registro exitoso. Iniciá sesión.");
    router.push("https://ykgmelcivomymctafvcj.supabase.co/auth/login");
  };
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-xl font-semibold">Registrarse</h1>
      <input className="w-full border p-3 rounded" placeholder="Nombre completo" value={fullName} onChange={e=>setFullName(e.target.value)} />
      <input className="w-full border p-3 rounded" placeholder="Teléfono (E.164, ej +54911...)" value={phone} onChange={e=>setPhone(e.target.value)} />
      <select className="w-full border p-3 rounded" value={role} onChange={e=>setRole(e.target.value as any)}>
        <option value="paciente">Paciente</option>
        <option value="profesional">Profesional</option>
      </select>
      {role === "profesional" && (
        <input className="w-full border p-3 rounded" placeholder="Especialidad (ej. Psicología)" value={specialty} onChange={e=>setSpecialty(e.target.value)} />
      )}
      <input className="w-full border p-3 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border p-3 rounded" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <p className="text-red-600">{error}</p>}
      <button className="w-full bg-black text-white py-3 rounded">Crear cuenta</button>
    </form>
  );
}
