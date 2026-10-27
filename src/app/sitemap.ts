import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

const routes = [
  { path: "", priority: 1 },
  { path: "/pengumuman", priority: 0.8 },
  { path: "/waktu-solat", priority: 0.9 },
  { path: "/program", priority: 0.7 },
  { path: "/carta-organisasi", priority: 0.5 },
  { path: "/sumbangan", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    changeFrequency: "weekly",
    priority: route.priority,
  }));
}
