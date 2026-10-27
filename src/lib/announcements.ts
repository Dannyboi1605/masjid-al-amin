import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const idSchema = z.string().uuid();

export type Announcement =
  Database["public"]["Tables"]["announcements"]["Row"];

const listFields = "id, title, body, created_at";

export async function getLatestAnnouncements(limit = 3) {
  "use cache";
  cacheTag("announcements");
  cacheLife("hours");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("announcements")
    .select(listFields)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to read announcements.", error.message);
    return [];
  }

  return data;
}

export async function getAnnouncementsPage(page: number, perPage = 10) {
  "use cache";
  cacheTag("announcements");
  cacheLife("hours");

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const supabase = createPublicClient();
  const { data, count, error } = await supabase
    .from("announcements")
    .select(listFields, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Failed to read announcement page.", error.message);
    return { items: [], total: 0 };
  }

  return { items: data ?? [], total: count ?? 0 };
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  "use cache";

  if (!idSchema.safeParse(id).success) {
    return null;
  }

  cacheTag("announcements");
  cacheTag(`announcement-${id}`);
  cacheLife("hours");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to read announcement.", error.message);
    return null;
  }

  return data;
}
