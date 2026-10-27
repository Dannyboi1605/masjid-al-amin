import type { AppRole } from "@/types/database";

export type AdminNavItem = {
  href: string;
  label: string;
  superadminOnly?: boolean;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Utama" },
  { href: "/admin/pengumuman", label: "Pengumuman" },
  { href: "/admin/program", label: "Program" },
  { href: "/admin/carta-organisasi", label: "Carta organisasi" },
  { href: "/admin/tetapan", label: "Tetapan", superadminOnly: true },
  { href: "/admin/pengguna", label: "Pengguna", superadminOnly: true },
  { href: "/admin/log-audit", label: "Log audit", superadminOnly: true },
];

export function navItemsForRole(role: AppRole) {
  return adminNavItems.filter(
    (item) => !item.superadminOnly || role === "superadmin",
  );
}

export function roleLabel(role: AppRole) {
  return role === "superadmin" ? "Pentadbir utama" : "Pentadbir";
}
