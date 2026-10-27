import type { Metadata } from "next";
import Image from "next/image";
import { QrDownloadButton } from "@/components/public/qr-download-button";
import { donationQrUrl, getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Sumbangan",
  description: "Kod QR DuitNow untuk sumbangan kepada masjid.",
};

export default async function DonationPage() {
  const settings = await getSiteSettings();
  const qrUrl = donationQrUrl(settings.donation_qr_path);
  const note =
    settings.donation_note ??
    "Sumbangan anda membantu operasi masjid dan program komuniti.";

  return (
    <div className="mx-auto w-full max-w-[40rem] px-3 py-12 text-center sm:px-6 lg:py-16">
      <h1 className="text-4xl text-hijau-malam sm:text-5xl">Sumbangan</h1>
      <p className="mx-auto mt-3 max-w-[52ch] text-base text-tinta/80">
        {note}
      </p>

      {qrUrl ? (
        <>
          <div className="mx-auto mt-8 inline-block w-full max-w-[22rem] border-2 border-emas-tua bg-putih p-6">
            <Image
              src={qrUrl}
              alt="Kod QR DuitNow untuk sumbangan"
              width={512}
              height={512}
              unoptimized
              className="mx-auto h-auto w-full max-w-[20rem]"
            />
          </div>
          <div className="mt-6">
            <QrDownloadButton url={qrUrl} />
          </div>
        </>
      ) : (
        <div className="mt-8 border border-garis bg-putih px-5 py-10">
          <p className="text-base text-tinta/75">
            Kod QR belum dimuat naik. Sila hubungi pihak masjid.
          </p>
        </div>
      )}
    </div>
  );
}
