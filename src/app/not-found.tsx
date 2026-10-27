import Link from "next/link";
import { buttonClass } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[70rem] flex-col justify-center px-4 py-16">
      <p className="font-heading text-xl text-hijau-daun">404</p>
      <h1 className="mt-3 text-4xl text-hijau-malam sm:text-5xl">
        Halaman tidak ditemui
      </h1>
      <p className="mt-3 max-w-[60ch] text-base text-tinta/75">
        Halaman ini mungkin telah dipindahkan atau tidak wujud.
      </p>
      <div className="mt-6">
        <Link href="/" className={buttonClass("primary", "no-underline")}>
          Kembali ke utama
        </Link>
      </div>
    </main>
  );
}
