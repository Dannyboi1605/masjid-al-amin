"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui/styles";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[70rem] flex-col justify-center px-4 py-16">
      <h1 className="text-4xl text-hijau-malam sm:text-5xl">
        Sesuatu tidak berjalan lancar
      </h1>
      <p className="mt-3 max-w-[60ch] text-base text-tinta/75">
        Sila cuba lagi. Jika masalah berterusan, hubungi pihak masjid.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className={buttonClass("primary")}
        >
          Cuba lagi
        </button>
        <Link href="/" className={buttonClass("quiet", "no-underline")}>
          Kembali ke utama
        </Link>
      </div>
    </main>
  );
}
