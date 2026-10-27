import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-16 bg-hijau-malam text-putih">
      <div aria-hidden="true" className="pattern-star h-3 bg-hijau-malam" />
      <div className="mx-auto grid w-full max-w-[70rem] gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="font-heading text-2xl font-bold">{settings.mosque_name}</p>
          {settings.address ? (
            <p className="mt-3 max-w-[48ch] whitespace-pre-line text-base text-putih/85">
              {settings.address}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-1 text-base">
            {settings.phone ? (
              <a
                href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                className="text-emas-cerah focus-visible:outline-emas-cerah"
              >
                {settings.phone}
              </a>
            ) : null}
            {settings.email ? (
              <a
                href={`mailto:${settings.email}`}
                className="text-emas-cerah focus-visible:outline-emas-cerah"
              >
                {settings.email}
              </a>
            ) : null}
          </div>
        </div>

        <div className="md:justify-self-end">
          <nav aria-label="Navigasi footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              <li>
                <Link
                  href="/pengumuman"
                  className="inline-flex min-h-11 items-center text-base text-putih no-underline hover:text-emas-cerah focus-visible:outline-emas-cerah"
                >
                  Pengumuman
                </Link>
              </li>
              <li>
                <Link
                  href="/waktu-solat"
                  className="inline-flex min-h-11 items-center text-base text-putih no-underline hover:text-emas-cerah focus-visible:outline-emas-cerah"
                >
                  Waktu solat
                </Link>
              </li>
              <li>
                <Link
                  href="/program"
                  className="inline-flex min-h-11 items-center text-base text-putih no-underline hover:text-emas-cerah focus-visible:outline-emas-cerah"
                >
                  Program
                </Link>
              </li>
              <li>
                <Link
                  href="/sumbangan"
                  className="inline-flex min-h-11 items-center text-base text-putih no-underline hover:text-emas-cerah focus-visible:outline-emas-cerah"
                >
                  Sumbangan
                </Link>
              </li>
            </ul>
          </nav>

          <p className="mt-4 text-sm text-putih/70">
            Data waktu solat:{" "}
            <a
              href="https://www.e-solat.gov.my"
              target="_blank"
              rel="noreferrer"
              className="text-emas-cerah focus-visible:outline-emas-cerah"
            >
              JAKIM e-Solat
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
