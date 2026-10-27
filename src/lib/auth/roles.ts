import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createUserClient } from "@/lib/supabase/server";
import type { AppRole, Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type Profile = ProfileRow & {
  email: string | null;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createUserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    return null;
  }

  return {
    ...profile,
    email: user.email ?? null,
  };
}

export async function requireUser(): Promise<Profile> {
  await connection();
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/admin/log-masuk?sebab=sesi");
  }

  return profile;
}

export async function requireRole(role: AppRole): Promise<Profile> {
  const profile = await requireUser();

  if (role === "superadmin" && profile.role !== "superadmin") {
    redirect("/admin?ralat=kebenaran");
  }

  return profile;
}

export function isSuperadmin(role: AppRole) {
  return role === "superadmin";
}
