import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type OrgChart = Database["public"]["Tables"]["org_chart"]["Row"];

export function orgChartUrl(path: string) {
  const supabase = createPublicClient();
  return supabase.storage.from("org-chart").getPublicUrl(path).data.publicUrl;
}

export async function getOrgChart(): Promise<OrgChart | null> {
  "use cache";
  cacheTag("org-chart");
  cacheLife("days");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("org_chart")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to read org chart.", error.message);
    return null;
  }

  return data;
}
