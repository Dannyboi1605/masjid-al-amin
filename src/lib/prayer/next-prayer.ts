import { parsePrayerTime } from "@/lib/time";
import type { PrayerDay } from "./jakim";

export type PrayerName = "Subuh" | "Zohor" | "Asar" | "Maghrib" | "Isyak";

export type NextPrayer = {
  name: PrayerName;
  at: Date;
  dateKey: string;
};

const prayerOrder: { key: keyof PrayerDay; name: PrayerName }[] = [
  { key: "subuh", name: "Subuh" },
  { key: "zohor", name: "Zohor" },
  { key: "asar", name: "Asar" },
  { key: "maghrib", name: "Maghrib" },
  { key: "isyak", name: "Isyak" },
];

export function getNextPrayer(
  today: PrayerDay,
  tomorrow: PrayerDay | null,
  now: Date,
): NextPrayer | null {
  for (const prayer of prayerOrder) {
    const time = today[prayer.key];

    if (typeof time !== "string") {
      continue;
    }

    const at = parsePrayerTime(today.date, time);

    if (at.getTime() > now.getTime()) {
      return { name: prayer.name, at, dateKey: today.date };
    }
  }

  if (!tomorrow) {
    return null;
  }

  return {
    name: "Subuh",
    at: parsePrayerTime(tomorrow.date, tomorrow.subuh),
    dateKey: tomorrow.date,
  };
}


