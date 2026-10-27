import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { EventList } from "@/components/public/event-list";
import { getPublicEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Program",
  description: "Program dan aktiviti akan datang di masjid.",
};

export default function EventsPage() {
  return (
    <div className="mx-auto w-full max-w-[70rem] px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-[62rem]">
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">Program</h1>
        <p className="mt-2 text-base text-tinta/75">
          Aktiviti dan majlis yang akan datang.
        </p>
      </div>

      <div className="mt-8 max-w-[56rem]">
        <Suspense fallback={<EventsFallback />}>
          <EventsContent />
        </Suspense>
      </div>
    </div>
  );
}

function EventsFallback() {
  return (
    <p role="status" className="text-base text-tinta/75">
      Memuatkan program.
    </p>
  );
}

async function EventsContent() {
  await connection();
  const events = await getPublicEvents();
  const now = new Date().getTime();
  const upcoming = events
    .filter((event) => new Date(event.starts_at).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
  const past = events
    .filter((event) => new Date(event.starts_at).getTime() < now)
    .sort(
      (a, b) =>
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime(),
    )
    .slice(0, 20);

  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="akan-datang">
        <h2 id="akan-datang" className="text-[1.75rem] text-hijau-malam sm:text-4xl">
          Akan datang
        </h2>
        <div className="mt-5">
          {upcoming.length > 0 ? (
            <EventList events={upcoming} />
          ) : (
            <p className="text-base text-tinta/75">
              Tiada program akan datang buat masa ini.
            </p>
          )}
        </div>
      </section>

      {past.length > 0 ? (
        <details className="border-t border-garis pt-4">
          <summary className="flex min-h-12 cursor-pointer items-center text-lg font-semibold text-hijau-malam">
            Program lepas
          </summary>
          <div className="mt-5">
            <EventList events={past} />
          </div>
        </details>
      ) : null}
    </div>
  );
}
