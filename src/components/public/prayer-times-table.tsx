import { NextPrayerCountdown } from "./next-prayer-countdown";
import type { PrayerDay } from "@/lib/prayer/jakim";
import { prayerTimes } from "@/lib/prayer/labels";
import type { NextPrayer } from "@/lib/prayer/next-prayer";
import {
  formatClockTime,
  formatCountdown,
  formatLongDate,
  formatWeekday,
} from "@/lib/time";

type Props = {
  day: PrayerDay;
  next: NextPrayer | null;
  isToday: boolean;
  selectedDate: string;
  now: Date;
};

export function PrayerTimesTable({
  day,
  next,
  isToday,
  selectedDate,
  now,
}: Props) {
  const nextIsToday = next?.dateKey === selectedDate;

  return (
    <table className="w-full border-t border-garis">
      <caption className="sr-only">
        Waktu solat untuk {formatLongDate(selectedDate)}
      </caption>
      <tbody>
        {prayerTimes.map((prayer) => {
          const highlighted =
            isToday && nextIsToday && next?.name === prayer.label;

          return (
            <tr
              key={prayer.key}
              className={highlighted ? "bg-hijau-malam/[0.06]" : undefined}
            >
              <th
                scope="row"
                className={`border-b border-l-[3px] border-garis py-4 pl-4 text-left align-middle font-heading text-xl font-bold sm:text-2xl ${
                  highlighted
                    ? "border-l-hijau-malam text-hijau-malam"
                    : "border-l-transparent text-tinta"
                }`}
              >
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  {prayer.label}
                  {highlighted ? (
                    <span className="font-sans text-sm font-semibold text-hijau-daun">
                      Seterusnya
                    </span>
                  ) : null}
                </span>
              </th>
              <td
                className={`border-b border-garis py-4 pr-4 text-right align-middle font-heading text-xl tnum sm:text-2xl ${
                  highlighted ? "text-hijau-malam" : "text-tinta"
                }`}
              >
                <span className="block">{day[prayer.key]}</span>
                {highlighted && next ? (
                  <NextPrayerCountdown
                    targetIso={next.at.toISOString()}
                    initialLabel={formatCountdown(next.at, now)}
                    className="mt-0.5 block font-sans text-sm text-tinta/70 tnum"
                  />
                ) : null}
              </td>
            </tr>
          );
        })}
      </tbody>
      {isToday && next && !nextIsToday ? (
        <tfoot>
          <tr className="bg-hijau-malam/[0.06]">
            <td
              colSpan={2}
              className="border-b border-l-[3px] border-garis border-l-hijau-malam py-4 pl-4 pr-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-base text-tinta">
                  <span className="font-semibold text-hijau-malam">
                    Seterusnya: {next.name}
                  </span>{" "}
                  <span className="tnum">{formatClockTime(next.at)}</span>{" "}
                  <span className="text-tinta/70">
                    esok, {formatWeekday(next.dateKey)}
                  </span>
                </p>
                <NextPrayerCountdown
                  targetIso={next.at.toISOString()}
                  initialLabel={formatCountdown(next.at, now)}
                  className="text-sm text-tinta/70 tnum"
                />
              </div>
            </td>
          </tr>
        </tfoot>
      ) : null}
    </table>
  );
}
