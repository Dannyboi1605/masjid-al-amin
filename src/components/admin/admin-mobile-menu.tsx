"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/actions/auth";
import type { AppRole } from "@/types/database";
import { navItemsForRole, roleLabel } from "./nav-items";

type Props = {
  fullName: string;
  role: AppRole;
};

export function AdminMobileMenu({ fullName, role }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = navItemsForRole(role);

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 items-center gap-2 border border-garis bg-putih px-3 text-base font-semibold"
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
        <div
          id="admin-mobile-nav"
          className="absolute right-0 z-20 mt-2 w-64 border border-garis bg-putih p-3 shadow-none"
        >
          <nav aria-label="Navigasi pentadbir">
            <ul className="flex flex-col gap-1">
              {items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center px-3 text-base no-underline ${
                        active
                          ? "bg-kapur font-semibold text-hijau-malam"
                          : "text-tinta hover:bg-kapur"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-3 border-t border-garis pt-3">
            <p className="px-3 text-sm font-semibold">{fullName}</p>
            <p className="px-3 text-sm text-tinta/70">{roleLabel(role)}</p>
            <form action={signOut} className="mt-3">
              <button
                type="submit"
                className="min-h-11 w-full border border-tinta/50 bg-putih px-3 text-base font-semibold"
              >
                Log keluar
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
