import { QrUploadForm } from "@/components/admin/qr-upload-form";
import { SettingsForm } from "@/components/admin/settings-form";
import { Alert } from "@/components/ui/alert";
import { FlashToast } from "@/components/admin/flash-toast";
import { requireRole } from "@/lib/auth/roles";
import { donationQrUrl } from "@/lib/settings";
import { createUserClient } from "@/lib/supabase/server";

export const instant = false;

const successMessages: Record<string, string> = {
  disimpan: "Perubahan disimpan.",
  qr: "Kod QR diganti.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ berjaya?: string }>;
}) {
  await requireRole("superadmin");
  const { berjaya } = await searchParams;
  const supabase = await createUserClient();
  const { data: settings, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  const success = berjaya ? successMessages[berjaya] : null;

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">Tetapan</h1>
        <p className="mt-2 text-base text-tinta/75">
          Maklumat masjid, zon solat, dan kod QR sumbangan.
        </p>
      </div>

      {success ? <FlashToast message={success} /> : null}

      {error || !settings ? (
        <Alert tone="error">Gagal membaca tetapan masjid.</Alert>
      ) : (
        <>
          <section className="border border-garis bg-putih p-5 sm:p-6">
            <h2 className="text-2xl text-hijau-malam">Maklumat masjid</h2>
            <div className="mt-5">
              <SettingsForm settings={settings} />
            </div>
          </section>

          <section className="border border-garis bg-putih p-5 sm:p-6">
            <h2 className="text-2xl text-hijau-malam">Kod QR sumbangan</h2>
            <p className="mt-2 text-base text-tinta/75">
              Kod QR ini dipaparkan pada halaman Sumbangan.
            </p>
            <div className="mt-5">
              <QrUploadForm
                currentUrl={donationQrUrl(settings.donation_qr_path)}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
