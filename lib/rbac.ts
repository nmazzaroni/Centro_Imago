import { supabaseServer } from "./supabaseServer";

export async function getSessionAndProfile() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { user, profile };
}

export async function requireRole(roles: string[]) {
  const { user, profile } = await getSessionAndProfile();
  if (!user || !profile || !roles.includes(profile.role)) {
    return { allowed: false, redirect: "/" as const };
  }
  return { allowed: true, user, profile };
}
