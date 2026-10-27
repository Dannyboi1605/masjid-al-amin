import { deleteOrgChart } from "@/actions/org-chart";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { FlashToast } from "@/components/admin/flash-toast";
import { OrgChartUploadForm } from "@/components/admin/org-chart-upload-form";
import { Alert } from "@/components/ui/alert";
import { requireRole } from "@/lib/auth/roles";
import { orgChartUrl } from "@/lib/org-chart";
import { createUserClient } from "@/lib/supabase/server";

export const instant = false;

const successMessages: Record<string, string> = {
  disimpan: "Carta organisasi disimpan.",
  dipadam: "Carta organisasi dipadam.",
};

const errorMessages: Record<string, string> = {
  padam: "Gagal memadam carta organisasi.",
};

export default async function AdminOrgChartPage({
  searchParams,
}: {
  searchParams: Promise<{ berjaya?: string; ralat?: string }>;
}) {
  await requireRole("admin");
  const params = await searchParams;
  const supabase = await createUserClient();
  const { data: chart, error } = await supabase
    .from("org_chart")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  const success = params.berjaya ? successMessages[params.berjaya] : null;
  const failure = params.ralat ? errorMessages[params.ralat] : null;
  const currentUrl = chart ? orgChartUrl(chart.image_path) : null;

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">
          Carta organisasi
        </h1>
        <p className="mt-2 text-base text-tinta/75">
          Muat naik gambar carta organisasi untuk dipaparkan kepada jemaah.
        </p>
      </div>

      {success ? <FlashToast message={success} /> : null}
      {failure ? <Alert tone="error">{failure}</Alert> : null}
      {error ? (
        <Alert tone="error">Gagal membaca carta organisasi.</Alert>
      ) : null}

      <section className="border border-garis bg-putih p-5 sm:p-6">
        <h2 className="text-2xl text-hijau-malam">Gambar carta</h2>
        <p className="mt-2 text-base text-tinta/75">
          Gambar ini dipaparkan pada halaman Carta organisasi. Jemaah boleh
          mengetik carta untuk melihatnya dengan lebih besar.
        </p>
        <div className="mt-5">
          <OrgChartUploadForm currentUrl={currentUrl} />
        </div>

        {chart ? (
          <div className="mt-6 border-t border-garis pt-5">
            <p className="text-base text-tinta/75 tnum">
              Saiz imej: {chart.image_width} × {chart.image_height} piksel.
            </p>
            <div className="mt-3">
              <DeleteDialog
                id="true"
                action={deleteOrgChart}
                triggerLabel="Padam carta"
                title="Padam carta organisasi ini?"
                body="Tindakan ini tidak boleh dibatalkan."
                confirmLabel="Padam carta organisasi"
              />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
