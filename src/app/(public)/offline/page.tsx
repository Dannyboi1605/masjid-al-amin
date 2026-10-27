import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Tiada sambungan internet",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="mx-auto w-full max-w-[70rem] px-4 py-16 sm:px-6">
      <div className="max-w-[52ch]">
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">
          Tiada sambungan internet
        </h1>
        <p className="mt-3 text-base text-tinta/75">
          Sambungan internet tidak tersedia. Sila semak sambungan anda dan cuba
          lagi.
        </p>
        <div className="mt-6">
          <Link href="/" className={buttonClass("primary", "no-underline")}>
            Cuba lagi
          </Link>
        </div>
      </div>
    </div>
  );
}
