import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getAnnouncement } from "@/lib/announcements";
import { formatEventDate, formatLongDate } from "@/lib/time";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const announcement = await getAnnouncement(id);

  if (!announcement) {
    return { title: "Pengumuman" };
  }

  return {
    title: announcement.title,
    description: announcement.body.replace(/\s+/g, " ").slice(0, 150),
  };
}

export default function AnnouncementPage({ params }: { params: Params }) {
  return (
    <>
      <Suspense fallback={null}>
        <DynamicMarker />
      </Suspense>
      <Suspense fallback={<AnnouncementFallback />}>
        <AnnouncementArticle params={params} />
      </Suspense>
    </>
  );
}

async function DynamicMarker() {
  await connection();
  return null;
}

function AnnouncementFallback() {
  return (
    <div className="mx-auto w-full max-w-[70rem] px-4 py-12 sm:px-6 lg:py-16">
      <p role="status" className="text-base text-tinta/75">
        Memuatkan pengumuman.
      </p>
    </div>
  );
}

async function AnnouncementArticle({ params }: { params: Params }) {
  const { id } = await params;
  const announcement = await getAnnouncement(id);

  if (!announcement) {
    notFound();
  }

  const dateKey = formatEventDate(new Date(announcement.created_at));

  return (
    <article className="mx-auto w-full max-w-[70rem] px-4 py-12 sm:px-6 lg:py-16">
      <Link href="/pengumuman" className="text-base font-semibold">
        Kembali ke pengumuman
      </Link>

      <div className="mt-8 max-w-[68ch]">
        <p className="text-sm text-tinta/70">
          {formatLongDate(dateKey)}
        </p>
        <h1 className="mt-2 text-4xl text-hijau-malam sm:text-5xl">
          {announcement.title}
        </h1>
        <div className="mt-6 whitespace-pre-line text-base leading-[1.7] text-tinta">
          {announcement.body}
        </div>
      </div>
    </article>
  );
}
