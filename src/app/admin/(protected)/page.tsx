import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/styles";
import { requireRole } from "@/lib/auth/roles";
import { createUserClient } from "@/lib/supabase/server";
import { formatEventDate, formatShortDate } from "@/lib/time";

export const instant = false;

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ ralat?: string }>;
}) {
  const { ralat } = await searchParams;
  const profile = await requireRole("admin");
  const supabase = await createUserClient();
  const now = new Date().toISOString();

  const [announcementCount, upcomingCount, pastCount, recent] =
    await Promise.all([
      supabase
        .from("announcements")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .gte("starts_at", now),
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .lt("starts_at", now),
      supabase
        .from("announcements")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const loadFailed = [
    announcementCount.error,
    upcomingCount.error,
    pastCount.error,
    recent.error,
  ].some(Boolean);

  const stats = [
    {
      label: "Pengumuman",
      value: announcementCount.count ?? 0,
      href: "/admin/pengumuman",
    },
    {
      label: "Program akan datang",
      value: upcomingCount.count ?? 0,
      href: "/admin/program",
    },
    {
      label: "Program lepas",
      value: pastCount.count ?? 0,
      href: "/admin/program",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">Utama</h1>
        <p className="mt-2 text-base text-tinta/75">
          Selamat kembali, {profile.full_name}.
        </p>
      </div>

      {ralat === "kebenaran" ? (
        <Alert tone="error">
          Anda tidak mempunyai kebenaran untuk halaman ini.
        </Alert>
      ) : null}

      {loadFailed ? (
        <Alert tone="error">Gagal membaca sebahagian data.</Alert>
      ) : null}

      <section aria-labelledby="ringkasan">
        <h2 id="ringkasan" className="sr-only">
          Ringkasan kandungan
        </h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-garis bg-putih p-5">
              <dt className="text-base text-tinta/75">{stat.label}</dt>
              <dd className="mt-2 font-heading text-4xl font-bold text-hijau-malam tnum">
                {stat.value}
              </dd>
              <Link
                href={stat.href}
                className="mt-4 inline-block text-base font-semibold"
              >
                Lihat senarai
              </Link>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="tindakan">
        <h2 id="tindakan" className="text-2xl text-hijau-malam">
          Tindakan pantas
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/pengumuman/baru"
            className={buttonClass("primary", "no-underline")}
          >
            Tambah pengumuman
          </Link>
          <Link
            href="/admin/program/baru"
            className={buttonClass("secondary", "no-underline")}
          >
            Tambah program
          </Link>
          {profile.role === "superadmin" ? (
            <Link
              href="/admin/tetapan"
              className={buttonClass("quiet", "no-underline")}
            >
              Tetapan masjid
            </Link>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="terkini">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="terkini" className="text-2xl text-hijau-malam">
            Pengumuman terkini
          </h2>
          <Link href="/admin/pengumuman" className="text-base font-semibold">
            Lihat semua
          </Link>
        </div>

        {recent.data && recent.data.length > 0 ? (
          <ul className="mt-4 divide-y divide-garis border-y border-garis bg-putih">
            {recent.data.map((announcement) => (
              <li
                key={announcement.id}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3"
              >
                <Link
                  href={`/admin/pengumuman/${announcement.id}/sunting`}
                  className="font-semibold"
                >
                  {announcement.title}
                </Link>
                <span className="text-sm text-tinta/70 tnum">
                  {formatShortDate(formatEventDate(new Date(announcement.created_at)))}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 border border-garis bg-putih px-4 py-6 text-base text-tinta/75">
            Belum ada pengumuman. Sila semak semula nanti.
          </p>
        )}
      </section>
    </div>
  );
}
