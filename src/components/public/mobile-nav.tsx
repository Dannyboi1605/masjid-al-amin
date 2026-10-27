"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { publicNavLinks } from "./nav-links";

export function MobileNavFallback() {
  return (
    <div className="relative lg:hidden">
      <span className="flex min-h-11 items-center gap-2 border border-putih/25 px-3 text-base font-semibold text-putih">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M3 6h14M3 10h14M3 14h14" />
        </svg>
        Menu
      </span>
    </div>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="public-mobile-nav"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 items-center gap-2 border border-putih/25 px-3 text-base font-semibold text-putih focus-visible:outline-emas-cerah"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M3 6h14M3 10h14M3 14h14" />
        </svg>
        Menu
      </button>

      {open ? (
        <nav
          id="public-mobile-nav"
          aria-label="Navigasi utama"
          className="absolute right-0 z-20 mt-2 w-60 border border-emas-cerah/40 bg-hijau-malam p-2"
        >
          <ul className="flex flex-col">
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
                    onClick={() => setOpen(false)}
                    className={`flex min-h-11 items-center px-3 text-base no-underline focus-visible:outline-emas-cerah ${
                      active
                        ? "text-emas-cerah"
                        : "text-putih hover:text-emas-cerah"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
