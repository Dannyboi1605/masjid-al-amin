import Link from "next/link";
import { addDays, formatLongDate, formatWeekday } from "@/lib/time";

type Props = {
  zoneCode: string;
  selectedDate: string;
  isToday: boolean;
};

export function PrayerDateNav({ zoneCode, selectedDate, isToday }: Props) {
  const previousDate = addDays(selectedDate, -1);
  const nextDate = addDays(selectedDate, 1);
  const year = Number(selectedDate.slice(0, 4));

  return (
    <div className="mt-8 w-full max-w-[28rem]">
      <form
        method="get"
        action="/waktu-solat"
        className="flex flex-col gap-3 border border-garis bg-putih p-3 min-[400px]:flex-row min-[400px]:items-center"
      >
        <input type="hidden" name="zon" value={zoneCode} />

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            href={`/waktu-solat?tarikh=${previousDate}&zon=${zoneCode}`}
            aria-label="Hari sebelum"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-[8px] border border-garis bg-putih text-hijau-daun no-underline transition-colors hover:bg-kapur hover:text-hijau-malam focus-visible:outline-emas-tua active:bg-garis/40"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.5 4.5 7 10l5.5 5.5" />
            </svg>
          </Link>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label
              htmlFor="tarikh"
              className="text-sm leading-tight text-tinta/70"
            >
              Tarikh
            </label>
            <input
              key={selectedDate}
              id="tarikh"
              name="tarikh"
              type="date"
              defaultValue={selectedDate}
              min={`${year}-01-01`}
              max={`${year}-12-31`}
              className="min-h-11 w-full min-w-0 rounded-[8px] border border-garis bg-putih py-2.5 pl-3 pr-12 text-[16px] leading-tight text-tinta focus-visible:border-hijau-daun [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:[filter:invert(30%)_sepia(74%)_saturate(201%)_hue-rotate(72deg)_brightness(135%)]"
            />
          </div>

          <Link
            href={`/waktu-solat?tarikh=${nextDate}&zon=${zoneCode}`}
            aria-label="Hari berikutnya"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-[8px] border border-garis bg-putih text-hijau-daun no-underline transition-colors hover:bg-kapur hover:text-hijau-malam focus-visible:outline-emas-tua active:bg-garis/40"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7.5 4.5 13 10l-5.5 5.5" />
            </svg>
          </Link>
        </div>

        <button
          type="submit"
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-[8px] bg-hijau-malam px-4 py-2.5 text-[16px] font-semibold text-putih transition-colors hover:bg-hijau-daun focus-visible:outline-emas-tua active:bg-hijau-malam/90 min-[400px]:w-auto"
        >
          Papar
        </button>
      </form>

      <p className="mt-4 font-heading text-2xl font-bold text-hijau-malam">
        {isToday ? <span className="text-hijau-daun">Hari ini, </span> : null}
        {formatWeekday(selectedDate)}, {formatLongDate(selectedDate)}
      </p>
    </div>
  );
}
