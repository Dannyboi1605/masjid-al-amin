"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicNavLinks } from "./nav-links";

export function DesktopNavFallback() {
  return (
    <nav aria-label="Navigasi utama" className="hidden lg:block">
      <ul className="flex items-center gap-5">
        {publicNavLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex min-h-11 items-center border-b-2 border-transparent text-base font-semibold text-putih no-underline hover:text-emas-cerah focus-visible:outline-emas-cerah"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className="hidden lg:block">
      <ul className="flex items-center gap-5">
        {publicNavLinks.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center border-b-2 text-base font-semibold no-underline focus-visible:outline-emas-cerah ${
                  active
                    ? "border-emas-cerah text-emas-cerah"
                    : "border-transparent text-putih hover:text-emas-cerah"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
