import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { DesktopNav, DesktopNavFallback } from "./desktop-nav";
import { MobileNav, MobileNavFallback } from "./mobile-nav";

export function SiteHeader({ mosqueName }: { mosqueName: string }) {
  return (
    <header className="bg-hijau-malam text-putih">
      <div className="mx-auto flex min-h-20 w-full max-w-[70rem] items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 text-putih no-underline focus-visible:outline-emas-cerah"
        >
          <Image
            src="/pic/logo.png"
            alt=""
            width={32}
            height={33}
            className="size-8 shrink-0"
          />
          <span className="font-heading text-xl font-bold leading-tight">
            {mosqueName}
          </span>
        </Link>

        <Suspense fallback={<DesktopNavFallback />}>
          <DesktopNav />
        </Suspense>
        <Suspense fallback={<MobileNavFallback />}>
          <MobileNav />
        </Suspense>
      </div>
    </header>
  );
}
