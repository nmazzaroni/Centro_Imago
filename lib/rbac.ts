import { supabaseServer } from "./supabaseServer";

type Profile = {
  id: string;
  role: "paciente" | "profesional" | "admin";
  full_name?: string;
  phone_e164?: string;
  specialty?: string | null;
  tags?: string[];
};

type SessionResult = {
  user: { id: string } | null;
  profile: Profile | null;
};

export async function getSessionAndProfile(): Promise<SessionResult> {
  const supabase = supabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { user: null, profile: null };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return { user, profile: null };
  return { user, profile };
}

export async function requireRole(roles: Profile["role"][]): Promise<
  | { allowed: true; user: NonNullable<SessionResult["user"]>; profile: Profile }
  | { allowed: false; redirect: "/" }
> {
  const { user, profile } = await getSessionAndProfile();
  if (!user || !profile || !roles.includes(profile.role)) {
    return { allowed: false, redirect: "/" };
  }
  return { allowed: true, user, profile };
}