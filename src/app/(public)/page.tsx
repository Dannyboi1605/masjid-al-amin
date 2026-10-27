import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { AnnouncementList } from "@/components/public/announcement-list";
import { EventList } from "@/components/public/event-list";
import { MosqueHero } from "@/components/public/mosque-hero";
import {
  PrayerBand,
  PrayerBandFallback,
} from "@/components/public/prayer-band";
import { buttonClass } from "@/components/ui/styles";
import { getLatestAnnouncements } from "@/lib/announcements";
import { getPublicEvents } from "@/lib/events";
import { getSiteSettings } from "@/lib/settings";

export default async function HomePage() {
  const [announcements, settings] = await Promise.all([
    getLatestAnnouncements(3),
    getSiteSettings(),
  ]);

  return (
    <>
      <MosqueHero mosqueName={settings.mosque_name} />

      <Suspense fallback={<PrayerBandFallback />}>
        <PrayerBand />
      </Suspense>

      <div aria-hidden="true" className="pattern-star h-3 bg-hijau-malam" />

      <div className="mx-auto w-full max-w-[70rem] px-4 py-12 sm:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <section aria-labelledby="pengumuman-terkini">
            <h2
              id="pengumuman-terkini"
              className="text-[1.75rem] text-hijau-malam sm:text-4xl"
            >
              Pengumuman terkini
            </h2>
            <Link
              href="/pengumuman"
              className="mt-1 inline-flex min-h-11 items-center text-base font-semibold"
            >
              Lihat semua pengumuman
            </Link>

            <div className="mt-5">
              {announcements.length > 0 ? (
                <AnnouncementList items={announcements} />
              ) : (
                <p className="border-y border-garis py-6 text-base text-tinta/75">
                  Belum ada pengumuman. Sila semak semula nanti.
                </p>
              )}
            </div>
          </section>

          <section aria-labelledby="program-akan-datang">
            <h2
              id="program-akan-datang"
              className="text-[1.75rem] text-hijau-malam sm:text-4xl"
            >
              Program akan datang
            </h2>
            <Link
              href="/program"
              className="mt-1 inline-flex min-h-11 items-center text-base font-semibold"
            >
              Lihat semua program
            </Link>

            <div className="mt-5">
              <Suspense
                fallback={
                  <p role="status" className="text-base text-tinta/75">
                    Memuatkan program.
                  </p>
                }
              >
                <UpcomingEvents />
              </Suspense>
            </div>
          </section>
        </div>

        <section
          aria-labelledby="sumbangan"
          className="mt-14 border-t border-garis pt-10 lg:mt-20"
        >
          <div className="max-w-[60ch]">
            <h2 id="sumbangan" className="text-[1.75rem] text-hijau-malam sm:text-4xl">
              Sumbangan
            </h2>
            <p className="mt-3 text-base text-tinta/80">
              {settings.donation_note ??
                "Sumbangan anda membantu operasi masjid dan program komuniti."}
            </p>
            <div className="mt-5">
              <Link
                href="/sumbangan"
                className={buttonClass("primary", "no-underline")}
              >
                Lihat kod QR
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

async function UpcomingEvents() {
  await connection();
  const events = await getPublicEvents();
  const now = new Date().getTime();
  const upcoming = events
    .filter((event) => new Date(event.starts_at).getTime() >= now)
    .slice(0, 3);

  if (upcoming.length === 0) {
    return (
      <p className="text-base text-tinta/75">
        Tiada program akan datang buat masa ini.
      </p>
    );
  }

  return <EventList events={upcoming} />;
}
