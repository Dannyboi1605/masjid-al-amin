import type { Metadata } from "next";
import { OrgChartViewer } from "@/components/public/org-chart-viewer";
import { getOrgChart, orgChartUrl } from "@/lib/org-chart";

export const metadata: Metadata = {
  title: "Carta organisasi",
  description: "Struktur organisasi dan urus setia masjid.",
};

export default async function OrgChartPage() {
  const chart = await getOrgChart();

  return (
    <div className="mx-auto w-full max-w-[70rem] px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-[62rem]">
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">
          Carta organisasi
        </h1>
        <p className="mt-2 text-base text-tinta/75">
          Struktur organisasi dan urus setia masjid.
        </p>
      </div>

      <div className="mt-8 max-w-[56rem]">
        {chart ? (
          <OrgChartViewer
            src={orgChartUrl(chart.image_path)}
            width={chart.image_width}
            height={chart.image_height}
            alt="Carta organisasi masjid."
          />
        ) : (
          <div className="border border-garis bg-putih px-5 py-8">
            <p className="text-base text-tinta/75">
              Carta organisasi belum dimuat naik. Sila semak semula nanti.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
