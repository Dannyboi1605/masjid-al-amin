import Link from "next/link";
import { formatEventDate, formatShortDate } from "@/lib/time";

type Item = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

function excerpt(body: string) {
  const plain = body.replace(/\s+/g, " ").trim();

  if (plain.length <= 150) {
    return plain;
  }

  return `${plain.slice(0, 150).trimEnd()}...`;
}

export function AnnouncementList({
  items,
  showExcerpt = true,
}: {
  items: Item[];
  showExcerpt?: boolean;
}) {
  return (
    <ul className="divide-y divide-garis border-y border-garis">
      {items.map((item) => (
        <li
          key={item.id}
          className="grid gap-x-6 gap-y-2 py-4 sm:grid-cols-[7rem_minmax(0,1fr)]"
        >
          <p className="text-sm text-tinta/70 tnum">
            {formatShortDate(formatEventDate(new Date(item.created_at)))}
          </p>
          <div>
            <Link
              href={`/pengumuman/${item.id}`}
              className="font-heading text-[1.375rem] font-bold text-hijau-malam underline-offset-4 sm:text-2xl"
            >
              {item.title}
            </Link>
            {showExcerpt ? (
              <p className="mt-1 text-base text-tinta/75">{excerpt(item.body)}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
