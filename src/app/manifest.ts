import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Masjid Al-Amin",
    short_name: "Masjid Al-Amin",
    description:
      "Waktu solat, pengumuman, program, dan sumbangan Masjid Al-Amin.",
    lang: "ms",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F3F6F1",
    theme_color: "#0B3D2E",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
