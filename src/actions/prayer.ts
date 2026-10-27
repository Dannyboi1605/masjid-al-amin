"use server";

import { z } from "zod";
import { findZone } from "@/lib/prayer/zones";

const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const zoneResponseSchema = z.object({
  zone: z.string().min(1),
  state: z.string().min(1),
  district: z.string().min(1),
});

export type ZoneLookupResult =
  | { ok: true; zone: string }
  | { ok: false; message: string };

export async function resolvePrayerZone(
  lat: number,
  lng: number,
): Promise<ZoneLookupResult> {
  const parsed = coordinateSchema.safeParse({ lat, lng });

  if (!parsed.success) {
    return { ok: false, message: "Lokasi tidak sah." };
  }

  try {
    const response = await fetch(
      `https://api.waktusolat.app/zones/${parsed.data.lat}/${parsed.data.lng}`,
      {
        signal: AbortSignal.timeout(8_000),
        headers: { Accept: "application/json" },
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        message: "Zon tidak dapat dikesan. Sila pilih zon secara manual.",
      };
    }

    const result = zoneResponseSchema.safeParse(await response.json());

    if (!result.success || !findZone(result.data.zone)) {
      return {
        ok: false,
        message: "Zon tidak dapat dikesan. Sila pilih zon secara manual.",
      };
    }

    return { ok: true, zone: result.data.zone };
  } catch {
    return {
      ok: false,
      message: "Zon tidak dapat dikesan. Sila pilih zon secara manual.",
    };
  }
}
