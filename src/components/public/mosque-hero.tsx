import Image from "next/image";

const location = "Kg Serigai Putatan";

export function MosqueHero({ mosqueName }: { mosqueName: string }) {
  const nameIncludesLocation = mosqueName
    .toLowerCase()
    .includes("serigai");

  return (
    <section className="relative isolate min-h-[26rem] overflow-hidden bg-hijau-malam text-putih sm:min-h-[30rem] lg:min-h-[32rem]">
      <Image
        src="/pic/gambar-masjid.jpg"
        alt={`Bangunan ${mosqueName}${
          nameIncludesLocation ? "" : ` ${location}`
        } pada waktu siang.`}
        fill
        preload
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "68% 52%" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-end px-4 pb-12 text-center sm:px-6 lg:pb-20">
        <p className="text-[1rem] font-semibold text-putih/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.65)] sm:text-base">
          Selamat datang ke
        </p>
        <h1 className="mx-auto mt-2 max-w-[20ch] font-heading text-[3rem] font-bold leading-[1.05] text-putih [text-shadow:0_1px_3px_rgba(0,0,0,0.65)] sm:text-6xl lg:text-[5rem]">
          {mosqueName}
          {nameIncludesLocation ? null : (
            <span className="mt-1 block text-[1.75rem] leading-tight text-putih/90 sm:text-4xl lg:text-5xl">
              {location}
            </span>
          )}
        </h1>
      </div>
    </section>
  );
}
