import Link from "next/link";
import { connection } from "next/server";
import { NextPrayerCountdown } from "./next-prayer-countdown";
import { getPrayerDay } from "@/lib/prayer/cache";
import type { PrayerDay } from "@/lib/prayer/jakim";
import { prayerTimes } from "@/lib/prayer/labels";
import {
  getNextPrayer,
  type NextPrayer,
} from "@/lib/prayer/next-prayer";
import { FALLBACK_ZONE, findZone } from "@/lib/prayer/zones";
import { getSiteSettings } from "@/lib/settings";
import {
  addDays,
  formatClockTime,
  formatCountdown,
  formatEventDate,
  formatHijri,
  formatLongDate,
  formatShortDate,
  formatWeekday,
  todayKeyInKL,
} from "@/lib/time";

export function PrayerBandFallback() {
  return (
    <section className="relative overflow-hidden border-t border-emas-cerah/40 bg-hijau-malam text-putih">
      <div
        aria-hidden="true"
        className="pattern-star absolute inset-0 opacity-[0.08]"
      />
      <div className="relative mx-auto min-h-[44rem] w-full max-w-[70rem] px-4 py-10 sm:px-6 lg:min-h-[28rem] lg:pb-14 lg:pt-10">
        <h2 className="text-[1.75rem] text-putih sm:text-4xl">
          Waktu solat hari ini
        </h2>
        <p role="status" className="mt-2 text-base text-putih/80">
          Memuatkan waktu solat.
        </p>
      </div>
    </section>
  );
}

export async function PrayerBand() {
  await connection();

  const now = new Date();
  const settings = await getSiteSettings();
  const zone = findZone(settings.prayer_zone) ?? findZone(FALLBACK_ZONE)!;
  const todayKey = todayKeyInKL(now);
  const tomorrowKey = addDays(todayKey, 1);

  const [today, tomorrow] = await Promise.all([
    getPrayerDay(zone.code, todayKey),
    getPrayerDay(zone.code, tomorrowKey),
  ]);

  if (today.status === "unavailable") {
    return (
      <section className="border-t border-emas-cerah/40 bg-hijau-malam text-putih">
        <div className="mx-auto w-full max-w-[70rem] px-4 py-10 sm:px-6 lg:py-14">
          <p className="text-base font-semibold text-emas-cerah">
            Waktu solat
          </p>
          <p className="mt-3 max-w-[52ch] font-heading text-3xl font-bold leading-[1.15] sm:text-4xl">
            Waktu solat untuk tarikh ini belum tersedia.
          </p>
          <p className="mt-3 text-base text-putih/85">
            Sila cuba sebentar lagi atau semak halaman waktu solat.
          </p>
          <Link
            href="/waktu-solat"
            className="mt-6 inline-flex min-h-12 items-center border border-emas-cerah px-5 text-base font-semibold text-emas-cerah no-underline hover:bg-emas-cerah hover:text-hijau-malam focus-visible:outline-emas-cerah"
          >
            Lihat waktu solat
          </Link>
        </div>
      </section>
    );
  }

  const hijri = formatHijri(today.day.hijri);
  const next = getNextPrayer(
    today.day,
    tomorrow.status === "unavailable" ? null : tomorrow.day,
    now,
  );

  return (
    <section
      aria-labelledby="waktu-solat-hari-ini"
      className="border-t border-emas-cerah/40 bg-hijau-malam text-putih"
    >
      <div className="mx-auto w-full max-w-[70rem] px-4 py-10 sm:px-6 lg:pb-14 lg:pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <div>
            <h2
              id="waktu-solat-hari-ini"
              className="text-[1.75rem] text-putih sm:text-4xl"
            >
              Waktu solat hari ini
            </h2>
            <p className="mt-1 text-base text-putih/80">
              {formatWeekday(todayKey)}, {formatLongDate(todayKey)}
            </p>
            {hijri ? (
              <p className="mt-1 text-sm text-putih/70">{hijri}</p>
            ) : null}
          </div>
          <p className="text-sm text-putih/70">Zon {zone.code}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:mt-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-12">
          <div>
            {next ? (
              <p className="text-base font-semibold text-emas-cerah">
                Seterusnya
              </p>
            ) : null}
            <NextPrayerSummary next={next} todayKey={todayKey} now={now} />

            <Link
              href="/waktu-solat"
              className="mt-6 inline-flex min-h-12 items-center border border-emas-cerah px-5 text-base font-semibold text-emas-cerah no-underline hover:bg-emas-cerah hover:text-hijau-malam focus-visible:outline-emas-cerah"
            >
              Lihat waktu solat penuh
            </Link>

            {today.status === "stale" ? (
              <p className="mt-5 max-w-[48ch] border-l-2 border-emas-cerah pl-3 text-sm text-putih/80">
                Waktu solat tidak dapat dikemas kini. Memaparkan data yang
                disimpan pada{" "}
                {formatShortDate(formatEventDate(new Date(today.fetchedAt)))}.
              </p>
            ) : null}
          </div>

          <PrayerGrid today={today.day} next={next} />
        </div>
      </div>
    </section>
  );
}

type NextPrayerSummaryProps = {
  next: NextPrayer | null;
  todayKey: string;
  now: Date;
};

function NextPrayerSummary({ next, todayKey, now }: NextPrayerSummaryProps) {
  if (!next) {
    return (
      <p className="mt-2 font-heading text-3xl font-bold">
        Waktu solat hari ini
      </p>
    );
  }

  const isTomorrow = next.dateKey !== todayKey;

  return (
    <>
      <p className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
        {next.name}
      </p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <p className="font-heading text-[3rem] font-bold leading-[1.05] tnum sm:text-[4.5rem]">
          {formatClockTime(next.at)}
        </p>
        <NextPrayerCountdown
          targetIso={next.at.toISOString()}
          initialLabel={formatCountdown(next.at, now)}
        />
      </div>
      {isTomorrow ? (
        <p className="mt-2 text-base text-putih/80">
          Esok, {formatWeekday(next.dateKey)}
        </p>
      ) : null}
    </>
  );
}

type PrayerGridProps = {
  today: PrayerDay;
  next: NextPrayer | null;
};

function PrayerGrid({ today, next }: PrayerGridProps) {

  return (
    <div>
      <h3 className="sr-only">Enam waktu solat hari ini</h3>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:gap-x-8">
        {prayerTimes.map((prayer) => {
          const isNext =
            next?.dateKey === today.date && next.name === prayer.label;

          return (
            <li
              key={prayer.key}
              className={`border-t pt-3 ${
                isNext
                  ? "border-emas-cerah text-emas-cerah"
                  : "border-putih/20 text-putih"
              }`}
            >
              <p className="text-sm font-semibold">
                {prayer.label}
                {isNext ? (
                  <span className="ml-1.5 font-normal">Seterusnya</span>
                ) : null}
              </p>
              <p className="mt-1 font-heading text-xl tnum sm:text-2xl">
                {today[prayer.key]}
              </p>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm text-putih/70">
        Tukar zon di halaman waktu solat.
      </p>
    </div>
  );
}
