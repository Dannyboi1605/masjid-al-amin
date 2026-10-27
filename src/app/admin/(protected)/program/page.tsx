import Link from "next/link";
import { deleteEvent } from "@/actions/events";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { Alert } from "@/components/ui/alert";
import { FlashToast } from "@/components/admin/flash-toast";
import { buttonClass } from "@/components/ui/styles";
import { requireRole } from "@/lib/auth/roles";
import { createUserClient } from "@/lib/supabase/server";
import { formatEventDateTime } from "@/lib/time";

export const instant = false;

const perPage = 20;

const successMessages: Record<string, string> = {
  ditambah: "Program ditambah.",
  disimpan: "Perubahan disimpan.",
  dipadam: "Program dipadam.",
};

const errorMessages: Record<string, string> = {
  padam: "Gagal memadam program.",
  "tidak-sah": "Program tidak sah.",
};

export default async function AdminEventsPage({
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
    .from("events")
    .select("id, title, starts_at, location", { count: "exact" })
    .order("starts_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const success = params.berjaya ? successMessages[params.berjaya] : null;
  const failure = params.ralat ? errorMessages[params.ralat] : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">Program</h1>
        <Link
          href="/admin/program/baru"
          className={buttonClass("primary", "no-underline")}
        >
          Tambah program
        </Link>
      </div>

      {success ? <FlashToast message={success} /> : null}
      {failure ? <Alert tone="error">{failure}</Alert> : null}

      {error ? (
        <Alert tone="error">Gagal membaca senarai program.</Alert>
      ) : null}

      {data && data.length > 0 ? (
        <>
          <div className="overflow-x-auto border border-garis bg-putih">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-garis bg-kapur">
                  <th scope="col" className="px-4 py-3 text-base font-semibold">
                    Tajuk
                  </th>
                  <th scope="col" className="px-4 py-3 text-base font-semibold">
                    Mula
                  </th>
                  <th scope="col" className="px-4 py-3 text-base font-semibold">
                    Lokasi
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-base font-semibold">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {data.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-3 text-base">{event.title}</td>
                    <td className="px-4 py-3 text-base text-tinta/75 tnum">
                      {formatEventDateTime(new Date(event.starts_at))}
                    </td>
                    <td className="px-4 py-3 text-base text-tinta/75">
                      {event.location}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/admin/program/${event.id}/sunting`}
                          className="min-h-11 px-2 text-base font-semibold"
                        >
                          Sunting
                        </Link>
                        <DeleteDialog
                          id={event.id}
                          action={deleteEvent}
                          triggerLabel="Padam"
                          title="Padam program ini?"
                          body="Tindakan ini tidak boleh dibatalkan."
                          confirmLabel="Padam program"
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
                  href={`/admin/program?page=${page - 1}`}
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
                  href={`/admin/program?page=${page + 1}`}
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
            Belum ada program.
          </p>
          <Link
            href="/admin/program/baru"
            className={buttonClass("primary", "mt-5 no-underline")}
          >
            Tambah program
          </Link>
        </div>
      )}
    </div>
  );
}
