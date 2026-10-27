import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminMobileMenu } from "@/components/admin/admin-mobile-menu";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireUser } from "@/lib/auth/roles";
import { getSiteSettings } from "@/lib/settings";

export const instant = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await connection();
  const profile = await requireUser();
  const settings = await getSiteSettings();

  return (
    <div className="min-h-dvh bg-kapur lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <a
        href="#kandungan-admin"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-putih focus:px-4 focus:py-3 focus:text-tinta"
      >
        Langkau ke kandungan
      </a>
      <AdminSidebar
        mosqueName={settings.mosque_name}
        fullName={profile.full_name}
        role={profile.role}
      />

      <div className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-garis bg-putih lg:hidden">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4">
            <p className="font-heading text-xl font-bold text-hijau-malam">
              {settings.mosque_name}
            </p>
            <AdminMobileMenu
              fullName={profile.full_name}
              role={profile.role}
            />
          </div>
        </header>

        <main
          id="kandungan-admin"
          className="mx-auto w-full max-w-[70rem] px-4 py-8 sm:px-6 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
