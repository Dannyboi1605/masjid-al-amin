import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { getSiteSettings } from "@/lib/settings";

export const instant = false;

export const metadata: Metadata = {
  title: "Log masuk",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sebab?: string }>;
}) {
  const { sebab } = await searchParams;
  const settings = await getSiteSettings();

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border border-garis bg-putih p-6 sm:p-8">
        <p className="font-heading text-2xl font-bold text-hijau-malam">
          {settings.mosque_name}
        </p>
        <h1 className="mt-6 text-4xl text-hijau-malam">Log masuk</h1>
        <p className="mt-2 text-base text-tinta/75">
          Untuk kakitangan masjid.
        </p>

        {sebab === "sesi" ? (
          <p
            role="status"
            className="mt-6 border-l-2 border-emas-tua bg-kapur px-4 py-3 text-base"
          >
            Sesi anda telah tamat. Sila log masuk semula.
          </p>
        ) : null}

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
