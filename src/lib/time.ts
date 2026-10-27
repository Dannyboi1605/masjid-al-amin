export const KUALA_LUMPUR_TIME_ZONE = "Asia/Kuala_Lumpur";
const OFFSET = "+08:00";

const longDateFormatter = new Intl.DateTimeFormat("ms-MY", {
  timeZone: KUALA_LUMPUR_TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("ms-MY", {
  timeZone: KUALA_LUMPUR_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat("ms-MY", {
  timeZone: KUALA_LUMPUR_TIME_ZONE,
  weekday: "long",
});

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: KUALA_LUMPUR_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dayNumberFormatter = new Intl.DateTimeFormat("ms-MY", {
  timeZone: KUALA_LUMPUR_TIME_ZONE,
  day: "numeric",
});

const shortMonthFormatter = new Intl.DateTimeFormat("ms-MY", {
  timeZone: KUALA_LUMPUR_TIME_ZONE,
  month: "short",
});

const hijriMonths = [
  "Muharram",
  "Safar",
  "Rabiulawal",
  "Rabiulakhir",
  "Jamadilawal",
  "Jamadilakhir",
  "Rejab",
  "Syaaban",
  "Ramadan",
  "Syawal",
  "Zulkaedah",
  "Zulhijjah",
];

export function todayKeyInKL(now: Date = new Date()) {
  return dateKeyFormatter.format(now);
}

export function dateKeyToDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00${OFFSET}`);
}

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidDateKey(value: string) {
  if (!isDateKey(value)) {
    return false;
  }

  const date = dateKeyToDate(value);
  return !Number.isNaN(date.getTime()) && todayKeyInKL(date) === value;
}

export function formatLongDate(dateKey: string) {
  return longDateFormatter.format(dateKeyToDate(dateKey));
}

export function formatShortDate(dateKey: string) {
  return shortDateFormatter.format(dateKeyToDate(dateKey));
}

export function formatWeekday(dateKey: string) {
  return weekdayFormatter.format(dateKeyToDate(dateKey));
}

export function formatEventDate(date: Date) {
  return dateKeyFormatter.format(date);
}

export function formatDayNumber(date: Date) {
  return dayNumberFormatter.format(date);
}

export function formatShortMonth(date: Date) {
  return shortMonthFormatter.format(date);
}

export function formatClockTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: KUALA_LUMPUR_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function formatEventTime(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KUALA_LUMPUR_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  const period =
    hour < 5
      ? "malam"
      : hour < 12
        ? "pagi"
        : hour < 15
          ? "tengah hari"
          : hour < 19
            ? "petang"
            : "malam";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minute} ${period}`;
}

export function formatEventDateTime(date: Date) {
  return `${formatShortDate(formatEventDate(date))}, ${formatEventTime(date)}`;
}

export function parsePrayerTime(dateKey: string, time: string) {
  return new Date(`${dateKey}T${time}:00${OFFSET}`);
}

export function formatHijri(hijri: string | undefined) {
  if (!hijri) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(hijri);
  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const monthName = hijriMonths[Number(month) - 1];

  if (!monthName) {
    return null;
  }

  return `${Number(day)} ${monthName} ${year}`;
}

export function formatCountdown(target: Date, now: Date) {
  const remainingMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `dalam ${hours}j ${minutes}m`;
  }

  if (minutes > 0) {
    return `dalam ${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }

  return `dalam ${seconds}s`;
}

export function addDays(dateKey: string, days: number) {
  const date = dateKeyToDate(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return todayKeyInKL(date);
}

export function toDateTimeLocalValue(iso: string) {
  const date = new Date(iso);
  const dateKey = todayKeyInKL(date);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: KUALA_LUMPUR_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return `${dateKey}T${time}`;
}

export function parseDateTimeLocal(value: string) {
  return new Date(`${value}:00${OFFSET}`);
}

export function isValidDateTimeLocal(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const date = parseDateTimeLocal(value);

  return (
    !Number.isNaN(date.getTime()) &&
    toDateTimeLocalValue(date.toISOString()) === value
  );
}
