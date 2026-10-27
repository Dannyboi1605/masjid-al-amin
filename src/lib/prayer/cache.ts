import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isValidDateKey, todayKeyInKL } from "@/lib/time";
import { fetchJakimYear, prayerDaySchema, type PrayerDay } from "./jakim";
import { findZone } from "./zones";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FAILURE_COOLDOWN_MS = 60 * 1000;

const lastFailureByZone = new Map<string, number>();

type CachedYear = {
  days: PrayerDay[];
  fetchedAt: string;
  stale: boolean;
};

export type PrayerDayResult =
  | { status: "ok"; day: PrayerDay; fetchedAt: string }
  | { status: "stale"; day: PrayerDay; fetchedAt: string }
  | { status: "unavailable" };

async function readCache(zone: string, year: number): Promise<CachedYear | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("prayer_times_cache")
    .select("data, fetched_at")
    .eq("zone", zone)
    .eq("year", year)
    .maybeSingle();

  if (error) {
    console.error("Failed to read prayer cache.", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const parsed = prayerDaySchema.array().safeParse(data.data);

  if (!parsed.success) {
    console.error("Prayer cache has an unexpected shape.", parsed.error.message);
    return null;
  }

  const age = Date.now() - new Date(data.fetched_at).getTime();

  return {
    days: parsed.data,
    fetchedAt: data.fetched_at,
    stale: age >= CACHE_TTL_MS,
  };
}

async function writeCache(zone: string, year: number, days: PrayerDay[]) {
  const supabase = createAdminClient();
  const fetchedAt = new Date().toISOString();
  const { error } = await supabase.from("prayer_times_cache").upsert(
    {
      zone,
      year,
      data: days,
      fetched_at: fetchedAt,
    },
    { onConflict: "zone,year" },
  );

  if (error) {
    console.error("Failed to write prayer cache.", error.message);
    return null;
  }

  return fetchedAt;
}

async function loadYear(zone: string, year: number): Promise<CachedYear | null> {
  const cached = await readCache(zone, year);

  if (cached && !cached.stale) {
    return cached;
  }

  const currentYear = Number(todayKeyInKL().slice(0, 4));

  if (year !== currentYear) {
    return cached;
  }

  const lastFailure = lastFailureByZone.get(zone) ?? 0;

  if (Date.now() - lastFailure < FAILURE_COOLDOWN_MS) {
    return cached;
  }

  try {
    const days = await fetchJakimYear(zone);
    const fetchedAt = (await writeCache(zone, year, days)) ?? new Date().toISOString();
    lastFailureByZone.delete(zone);

    return {
      days,
      fetchedAt,
      stale: false,
    };
  } catch (error) {
    lastFailureByZone.set(zone, Date.now());
    console.error(`JAKIM fetch failed for zone ${zone}.`, error);

    return cached;
  }
}

export async function getPrayerDay(
  zone: string,
  dateKey: string,
): Promise<PrayerDayResult> {
  if (!findZone(zone) || !isValidDateKey(dateKey)) {
    return { status: "unavailable" };
  }

  const year = Number(dateKey.slice(0, 4));
  const cached = await loadYear(zone, year);

  if (!cached) {
    return { status: "unavailable" };
  }

  const day = cached.days.find((item) => item.date === dateKey);

  if (!day) {
    return { status: "unavailable" };
  }

  return {
    status: cached.stale ? "stale" : "ok",
    day,
    fetchedAt: cached.fetchedAt,
  };
}
