import type { PrayerDay } from "./jakim";

export type PrayerTimeKey = Exclude<keyof PrayerDay, "date" | "hijri">;

export const prayerTimes: { key: PrayerTimeKey; label: string }[] = [
  { key: "subuh", label: "Subuh" },
  { key: "syuruk", label: "Syuruk" },
  { key: "zohor", label: "Zohor" },
  { key: "asar", label: "Asar" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isyak", label: "Isyak" },
];
