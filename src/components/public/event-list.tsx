import type { EventRow } from "@/lib/events";
import {
  formatDayNumber,
  formatEventTime,
  formatShortMonth,
} from "@/lib/time";

export function EventList({ events }: { events: EventRow[] }) {
  return (
    <ul className="flex flex-col gap-7">
      {events.map((event) => {
        const startsAt = new Date(event.starts_at);

        return (
          <li
            key={event.id}
            className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-4"
          >
            <div className="flex h-[4.5rem] flex-col items-center justify-center bg-hijau-malam text-putih">
              <span className="font-heading text-2xl font-bold leading-none tnum">
                {formatDayNumber(startsAt)}
              </span>
              <span className="mt-1 text-sm">{formatShortMonth(startsAt)}</span>
            </div>

            <div>
              <h3 className="text-[1.375rem] font-bold text-hijau-malam sm:text-2xl">
                {event.title}
              </h3>
              <p className="mt-1 text-sm text-tinta/75">
                {formatEventTime(startsAt)}
                {event.ends_at
                  ? ` hingga ${formatEventTime(new Date(event.ends_at))}`
                  : ""}
                {", "}
                {event.location}
              </p>
              {event.description ? (
                <p className="mt-2 whitespace-pre-line text-base text-tinta/80">
                  {event.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
