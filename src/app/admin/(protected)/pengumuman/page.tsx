import Link from "next/link";
import { deleteAnnouncement } from "@/actions/announcements";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { Alert } from "@/components/ui/alert";
import { FlashToast } from "@/components/admin/flash-toast";
import { buttonClass } from "@/components/ui/styles";
import { requireRole } from "@/lib/auth/roles";
import { createUserClient } from "@/lib/supabase/server";
import { formatEventDate, formatShortDate } from "@/lib/time";

export const instant = false;

const perPage = 20;

const successMessages: Record<string, string> = {
  ditambah: "Pengumuman ditambah.",
  disimpan: "Perubahan disimpan.",
  dipadam: "Pengumuman dipadam.",
};

const errorMessages: Record<string, string> = {
  padam: "Gagal memadam pengumuman.",
  "tidak-sah": "Pengumuman tidak sah.",
};

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; berjaya?: string; ralat?: string }>;
}) {
  await requireRole("admin");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const supabase = await createUserClient();
  const { data, count, error } = await supabase
    .from("announcements")
    .select("id, title, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const success = params.berjaya ? successMessages[params.berjaya] : null;
  const failure = params.ralat ? errorMessages[params.ralat] : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">Pengumuman</h1>
        <Link
          href="/admin/pengumuman/baru"
          className={buttonClass("primary", "no-underline")}
        >
          Tambah pengumuman
        </Link>
      </div>

      {success ? <FlashToast message={success} /> : null}
      {failure ? <Alert tone="error">{failure}</Alert> : null}

      {error ? (
        <Alert tone="error">Gagal membaca senarai pengumuman.</Alert>
      ) : null}

      {data && data.length > 0 ? (
        <>
          <div className="overflow-x-auto border border-garis bg-putih">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-garis bg-kapur">
                  <th scope="col" className="px-4 py-3 text-base font-semibold">
                    Tajuk
                  </th>
                  <th scope="col" className="px-4 py-3 text-base font-semibold">
                    Tarikh
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-base font-semibold">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {data.map((announcement) => (
                  <tr key={announcement.id}>
                    <td className="px-4 py-3 text-base">
                      {announcement.title}
                    </td>
                    <td className="px-4 py-3 text-base text-tinta/75 tnum">
                      {formatShortDate(
                        formatEventDate(new Date(announcement.created_at)),
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/admin/pengumuman/${announcement.id}/sunting`}
                          className="min-h-11 px-2 text-base font-semibold"
                        >
                          Sunting
                        </Link>
                        <DeleteDialog
                          id={announcement.id}
                          action={deleteAnnouncement}
                          triggerLabel="Padam"
                          title="Padam pengumuman ini?"
                          body="Tindakan ini tidak boleh dibatalkan."
                          confirmLabel="Padam pengumuman"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <nav
              aria-label="Navigasi halaman"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              {page > 1 ? (
                <Link
                  href={`/admin/pengumuman?page=${page - 1}`}
                  className={buttonClass("quiet", "no-underline")}
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
                  href={`/admin/pengumuman?page=${page + 1}`}
                  className={buttonClass("quiet", "no-underline")}
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
      ) : (
        <div className="border border-garis bg-putih px-5 py-8">
          <p className="text-base text-tinta/75">
            Belum ada pengumuman. Sila semak semula nanti.
          </p>
          <Link
            href="/admin/pengumuman/baru"
            className={buttonClass("primary", "mt-5 no-underline")}
          >
            Tambah pengumuman
          </Link>
        </div>
      )}
    </div>
  );
}
