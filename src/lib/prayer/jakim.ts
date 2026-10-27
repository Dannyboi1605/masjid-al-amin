import { z } from "zod";

const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Format waktu tidak sah.");

const jakimDaySchema = z.object({
  hijri: z.string().optional(),
  date: z.string().min(1),
  day: z.string().optional(),
  imsak: timeSchema.optional(),
  fajr: timeSchema,
  syuruk: timeSchema,
  dhuha: timeSchema.optional(),
  dhuhr: timeSchema,
  asr: timeSchema,
  maghrib: timeSchema,
  isha: timeSchema,
});

const jakimResponseSchema = z.object({
  prayerTime: z.array(jakimDaySchema).min(1),
  status: z.string().optional(),
  zone: z.string().optional(),
  periodType: z.string().optional(),
});

const monthNumbers: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  mac: 3,
  apr: 4,
  may: 5,
  mei: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  ogo: 8,
  sep: 9,
  oct: 10,
  okt: 10,
  nov: 11,
  dec: 12,
  dis: 12,
};

export type PrayerDay = {
  date: string;
  hijri?: string;
  subuh: string;
  syuruk: string;
  zohor: string;
  asar: string;
  maghrib: string;
  isyak: string;
};

export const prayerDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hijri: z.string().optional(),
  subuh: z.string().regex(/^\d{2}:\d{2}$/),
  syuruk: z.string().regex(/^\d{2}:\d{2}$/),
  zohor: z.string().regex(/^\d{2}:\d{2}$/),
  asar: z.string().regex(/^\d{2}:\d{2}$/),
  maghrib: z.string().regex(/^\d{2}:\d{2}$/),
  isyak: z.string().regex(/^\d{2}:\d{2}$/),
});

function normalizeDate(value: string) {
  const match = /^(\d{1,2})-([A-Za-z]+)-(\d{4})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const [, day, monthName, year] = match;
  const month = monthNumbers[monthName.toLowerCase()];

  if (!month) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function shortTime(value: string) {
  return value.slice(0, 5);
}

export function normalizeJakimDays(payload: unknown): PrayerDay[] {
  const parsed = jakimResponseSchema.parse(payload);
  const days = new Map<string, PrayerDay>();

  for (const day of parsed.prayerTime) {
    const date = normalizeDate(day.date);

    if (!date) {
      continue;
    }

    days.set(date, {
      date,
      hijri: day.hijri,
      subuh: shortTime(day.fajr),
      syuruk: shortTime(day.syuruk),
      zohor: shortTime(day.dhuhr),
      asar: shortTime(day.asr),
      maghrib: shortTime(day.maghrib),
      isyak: shortTime(day.isha),
    });
  }

  const result = [...days.values()].sort((a, b) => a.date.localeCompare(b.date));

  if (result.length === 0) {
    throw new Error("JAKIM returned no usable prayer days.");
  }

  return result;
}

export async function fetchJakimYear(zone: string): Promise<PrayerDay[]> {
  const url = new URL("https://www.e-solat.gov.my/index.php");
  url.searchParams.set("r", "esolatApi/takwimsolat");
  url.searchParams.set("period", "year");
  url.searchParams.set("zone", zone);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(15_000),
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`JAKIM responded with ${response.status}.`);
  }

  const payload: unknown = await response.json();
  return normalizeJakimDays(payload);
}
