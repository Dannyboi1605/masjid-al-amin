import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import { FALLBACK_ZONE } from "@/lib/prayer/zones";
import type { Database } from "@/types/database";

export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

export const fallbackSettings: SiteSettings = {
  id: true,
  mosque_name: "Masjid Al-Amin",
  address: null,
  phone: null,
  email: null,
  prayer_zone: FALLBACK_ZONE,
  donation_qr_path: null,
  donation_note: null,
  updated_at: new Date(0).toISOString(),
};

export function donationQrUrl(path: string | null) {
  if (!path) {
    return null;
  }

  const supabase = createPublicClient();
  return supabase.storage.from("donation").getPublicUrl(path).data.publicUrl;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings");
  cacheLife("days");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to read site settings.", error.message);
    return fallbackSettings;
  }

  return data ?? fallbackSettings;
}
