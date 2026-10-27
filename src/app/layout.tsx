import type { Metadata, Viewport } from "next";
import { Alegreya_Sans, Amiri } from "next/font/google";
import { getSiteSettings } from "@/lib/settings";
import "./globals.css";

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["latin", "arabic"],
  weight: ["400", "700"],
  display: "swap",
});

const alegreya = Alegreya_Sans({
  variable: "--font-alegreya",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.mosque_name,
      template: `%s | ${settings.mosque_name}`,
    },
    description: `Waktu solat, pengumuman, program, dan sumbangan ${settings.mosque_name}.`,
    applicationName: settings.mosque_name,
    appleWebApp: {
      capable: true,
      title: settings.mosque_name,
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0B3D2E",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ms"
      className={`${amiri.variable} ${alegreya.variable}`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
