import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { LocationButton } from "@/components/public/location-button";
import { PrayerDateNav } from "@/components/public/prayer-date-nav";
import { PrayerTimesTable } from "@/components/public/prayer-times-table";
import { ZoneSelect } from "@/components/public/zone-select";
import { buttonClass, inputClass, labelClass } from "@/components/ui/styles";
import { getPrayerDay } from "@/lib/prayer/cache";
import { prayerTimes } from "@/lib/prayer/labels";
import { getNextPrayer } from "@/lib/prayer/next-prayer";
import {
  FALLBACK_ZONE,
  findZone,
  type PrayerZone,
} from "@/lib/prayer/zones";
import { getSiteSettings } from "@/lib/settings";
import {
  addDays,
  formatEventDate,
  formatHijri,
  formatShortDate,
  isValidDateKey,
  todayKeyInKL,
} from "@/lib/time";

export const metadata: Metadata = {
  title: "Waktu solat",
  description:
    "Waktu solat harian untuk zon masjid, termasuk Subuh, Syuruk, Zohor, Asar, Maghrib, dan Isyak.",
};

export default async function PrayerTimesPage({
  searchParams,
}: {
  searchParams: Promise<{ tarikh?: string; zon?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const now = new Date();
  const todayKey = todayKeyInKL(now);
  const settings = await getSiteSettings();

  const zone =
    findZone(params.zon) ??
    findZone(settings.prayer_zone) ??
    findZone(FALLBACK_ZONE)!;
  const selectedDate =
    params.tarikh && isValidDateKey(params.tarikh) ? params.tarikh : todayKey;
  const isToday = selectedDate === todayKey;

  return (
    <div className="mx-auto w-full max-w-[56rem] px-4 py-12 sm:px-6 lg:py-20">
      <header className="border-b border-garis pb-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div>
            <h1 className="text-4xl text-hijau-malam sm:text-5xl">
              Waktu solat
            </h1>
            <p className="mt-2 text-base text-tinta/75">
              Zon{" "}
              <span className="font-semibold text-tinta tnum">{zone.code}</span>{" "}
              &middot; {zone.state}
            </p>
          </div>
          <Link
            href="#zon-lokasi"
            className="ml-auto inline-flex min-h-11 items-center text-base font-semibold"
          >
            Tukar zon
          </Link>
        </div>
      </header>

      <PrayerDateNav
        zoneCode={zone.code}
        selectedDate={selectedDate}
        isToday={isToday}
      />

      <Suspense fallback={<PrayerTimesFallback />}>
        <PrayerTimesBody
          zone={zone}
          selectedDate={selectedDate}
          todayKey={todayKey}
          isToday={isToday}
          now={now}
        />
      </Suspense>

      <ZoneLocationSection zone={zone} selectedDate={selectedDate} />
    </div>
  );
}

function PrayerTimesFallback() {
  return (
    <div className="mt-1">
      <p role="status" className="text-base text-tinta/75">
        Memuatkan waktu solat.
      </p>
      <div aria-hidden="true" className="mt-6 border-t border-garis">
        {prayerTimes.map((prayer) => (
          <div
            key={prayer.key}
            className="flex items-baseline justify-between border-b border-l-[3px] border-garis border-l-transparent py-4 pl-4 pr-4"
          >
            <span className="font-heading text-xl text-tinta/70 sm:text-2xl">
              {prayer.label}
            </span>
            <span className="h-5 w-14 bg-garis/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function PrayerTimesBody({
  zone,
  selectedDate,
  todayKey,
  isToday,
  now,
}: {
  zone: PrayerZone;
  selectedDate: string;
  todayKey: string;
  isToday: boolean;
  now: Date;
}) {
  const [result, tomorrow] = await Promise.all([
    getPrayerDay(zone.code, selectedDate),
    isToday
      ? getPrayerDay(zone.code, addDays(selectedDate, 1))
      : Promise.resolve(null),
  ]);

  const next =
    isToday && result.status !== "unavailable"
      ? getNextPrayer(
          result.day,
          tomorrow && tomorrow.status !== "unavailable" ? tomorrow.day : null,
          now,
        )
      : null;
  const hijri =
    result.status === "unavailable" ? null : formatHijri(result.day.hijri);

  return (
    <>
      {hijri ? <p className="mt-1 text-sm text-tinta/70">{hijri}</p> : null}

      {result.status === "stale" ? (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 border border-emas-tua/50 bg-putih px-4 py-3"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="mt-0.5 size-5 shrink-0 text-emas-tua"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 3.5 18 17H2L10 3.5Z" />
            <path d="M10 8v4" />
            <path d="M10 14.5v.01" />
          </svg>
          <p className="text-base text-tinta">
            Waktu solat tidak dapat dikemas kini. Memaparkan data yang disimpan
            pada{" "}
            {formatShortDate(formatEventDate(new Date(result.fetchedAt)))}.
          </p>
        </div>
      ) : null}

      {result.status === "unavailable" ? (
        <div className="mt-6 border border-garis bg-putih px-5 py-8">
          <p className="text-base font-semibold text-tinta">
            Waktu solat untuk tarikh ini belum tersedia.
          </p>
          <p className="mt-2 text-base text-tinta/75">
            {isToday
              ? "Sila cuba sebentar lagi."
              : "Pilih tarikh lain, atau lihat waktu solat hari ini."}
          </p>
          {!isToday ? (
            <Link
              href={`/waktu-solat?tarikh=${todayKey}&zon=${zone.code}`}
              className={buttonClass("secondary", "mt-5 no-underline")}
            >
              Lihat hari ini
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="mt-6">
          <PrayerTimesTable
            day={result.day}
            next={next}
            isToday={isToday}
            selectedDate={selectedDate}
            now={now}
          />
        </div>
      )}
    </>
  );
}

function ZoneLocationSection({
  zone,
  selectedDate,
}: {
  zone: PrayerZone;
  selectedDate: string;
}) {
  return (
    <section
      id="zon-lokasi"
      aria-labelledby="zon-lokasi-tajuk"
      className="mt-14 border-t border-garis pt-8 lg:mt-20"
    >
      <h2
        id="zon-lokasi-tajuk"
        className="text-[1.75rem] text-hijau-malam sm:text-4xl"
      >
        Zon dan lokasi
      </h2>

      <div className="mt-6 grid gap-0 md:grid-cols-2">
        <div className="md:pr-10">
          <LocationButton dateKey={selectedDate} />
          <p className="mt-3 max-w-[45ch] text-sm text-tinta/70">
            Lokasi digunakan sekali untuk menentukan zon dan tidak disimpan.
          </p>
        </div>

        <div className="mt-8 border-t border-garis pt-8 md:mt-0 md:border-l md:border-t-0 md:pl-10 md:pt-0">
          <form
            method="get"
            action="/waktu-solat"
            className="flex flex-col gap-3"
          >
            <input type="hidden" name="tarikh" value={selectedDate} />
            <label htmlFor="zon" className={labelClass}>
              Pilih zon
            </label>
            <div className="flex flex-wrap items-end gap-3">
              <ZoneSelect
                key={zone.code}
                id="zon"
                name="zon"
                defaultValue={zone.code}
                className={`${inputClass} min-w-0 flex-1`}
              />
              <button type="submit" className={buttonClass("secondary")}>
                Tukar zon
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
