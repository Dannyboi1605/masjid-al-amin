import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];

export async function getPublicEvents() {
  "use cache";
  cacheTag("events");
  cacheLife("hours");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true })
    .limit(200);

  if (error) {
    console.error("Failed to read events.", error.message);
    return [];
  }

  return data;
}
