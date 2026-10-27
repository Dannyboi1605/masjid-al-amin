import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AnnouncementList } from "@/components/public/announcement-list";
import { buttonClass } from "@/components/ui/styles";
import { getAnnouncementsPage } from "@/lib/announcements";

export const metadata: Metadata = {
  title: "Pengumuman",
  description: "Pengumuman dan makluman terkini daripada pihak masjid.",
};

const perPage = 10;

export default function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={<AnnouncementsFallback />}>
      <AnnouncementsContent searchParams={searchParams} />
    </Suspense>
  );
}

function AnnouncementsFallback() {
  return (
    <div className="mx-auto w-full max-w-[70rem] px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-4xl text-hijau-malam sm:text-5xl">Pengumuman</h1>
      <p role="status" className="mt-4 text-base text-tinta/75">
        Memuatkan pengumuman.
      </p>
    </div>
  );
}

async function AnnouncementsContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { items, total } = await getAnnouncementsPage(page, perPage);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="mx-auto w-full max-w-[70rem] px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-[62rem]">
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">Pengumuman</h1>
        <p className="mt-2 text-base text-tinta/75">
          Berita dan makluman daripada pihak masjid.
        </p>
      </div>

      <div className="mt-8 max-w-[56rem]">
        {items.length > 0 ? (
          <>
            <AnnouncementList items={items} />

            {totalPages > 1 ? (
              <nav
                aria-label="Navigasi halaman"
                className="mt-8 flex flex-wrap items-center justify-between gap-3"
              >
                {page > 1 ? (
                  <Link
                    href={`/pengumuman?page=${page - 1}`}
                    className={buttonClass("secondary", "no-underline")}
                  >
                    Sebelumnya
                  </Link>
                ) : (
                  <span className={buttonClass("quiet", "opacity-50")}>
                    Sebelumnya
                  </span>
                )}
                <p className="text-base text-tinta/75 tnum">
                  Halaman {page} daripada {totalPages}
                </p>
                {page < totalPages ? (
                  <Link
                    href={`/pengumuman?page=${page + 1}`}
                    className={buttonClass("secondary", "no-underline")}
                  >
                    Seterusnya
                  </Link>
                ) : (
                  <span className={buttonClass("quiet", "opacity-50")}>
                    Seterusnya
                  </span>
                )}
              </nav>
            ) : null}
          </>
        ) : total > 0 ? (
          <div className="border border-garis bg-putih px-5 py-8">
            <p className="text-base text-tinta/75">
              Halaman ini tiada pengumuman.
            </p>
            <Link
              href="/pengumuman"
              className="mt-3 inline-block text-base font-semibold"
            >
              Kembali ke halaman pertama
            </Link>
          </div>
        ) : (
          <div className="border border-garis bg-putih px-5 py-8">
            <p className="text-base text-tinta/75">
              Belum ada pengumuman. Sila semak semula nanti.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
