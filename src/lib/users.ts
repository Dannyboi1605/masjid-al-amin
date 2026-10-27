import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createUserClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";

export type ManagedUser = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole | null;
  isActive: boolean;
  createdAt: string;
};

export async function listManagedUsers(): Promise<{
  users: ManagedUser[];
  failed: boolean;
}> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });

  if (error) {
    console.error("Failed to list auth users.", error.message);
    return { users: [], failed: true };
  }

  const supabase = await createUserClient();
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*");

  if (profileError) {
    console.error("Failed to list profiles.", profileError.message);
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  const users = data.users
    .map((user) => {
      const profile = profileMap.get(user.id);

      return {
        id: user.id,
        email: user.email ?? "Tiada e-mel",
        fullName: profile?.full_name ?? "Tiada profil",
        role: profile?.role ?? null,
        isActive: profile?.is_active ?? false,
        createdAt: user.created_at,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { users, failed: false };
}
