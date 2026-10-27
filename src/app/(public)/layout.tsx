import { ServiceWorkerRegister } from "@/components/public/service-worker-register";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getSiteSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#kandungan"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-putih focus:px-4 focus:py-3 focus:text-tinta"
      >
        Langkau ke kandungan
      </a>
      <SiteHeader mosqueName={settings.mosque_name} />
      <main id="kandungan" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
      <ServiceWorkerRegister />
    </div>
  );
}
