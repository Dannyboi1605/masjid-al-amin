"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import type { AppRole } from "@/types/database";
import { navItemsForRole, roleLabel } from "./nav-items";

type Props = {
  mosqueName: string;
  fullName: string;
  role: AppRole;
};

export function AdminSidebar({ mosqueName, fullName, role }: Props) {
  const pathname = usePathname();
  const items = navItemsForRole(role);

  return (
    <aside className="hidden border-r border-garis bg-putih lg:flex lg:flex-col">
      <div className="border-b border-garis px-6 py-6">
        <p className="font-heading text-xl font-bold text-hijau-malam">
          {mosqueName}
        </p>
        <p className="mt-1 text-sm text-tinta/70">Papan pentadbir</p>
      </div>

      <nav aria-label="Navigasi pentadbir" className="flex-1 px-3 py-5">
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
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center px-3 text-base no-underline transition-colors ${
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

      <div className="border-t border-garis px-6 py-5">
        <p className="text-base font-semibold">{fullName}</p>
        <p className="text-sm text-tinta/70">{roleLabel(role)}</p>
        <form action={signOut} className="mt-4">
          <button
            type="submit"
            className="min-h-11 w-full border border-tinta/50 bg-putih px-3 text-base font-semibold text-tinta transition-colors hover:border-hijau-daun hover:text-hijau-daun"
          >
            Log keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
