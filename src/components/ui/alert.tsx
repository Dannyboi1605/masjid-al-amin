import { cx } from "./styles";

type Tone = "success" | "error" | "info";

const toneClasses: Record<Tone, string> = {
  success: "border-hijau-daun/35 bg-hijau-daun/5 text-hijau-malam",
  error: "border-ralat/35 bg-ralat/5 text-ralat",
  info: "border-emas-tua/35 bg-emas-tua/5 text-tinta",
};

export function Alert({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "flex items-start gap-3 border px-4 py-3 text-base",
        toneClasses[tone],
      )}
    >
      {tone === "error" ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="mt-1 size-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="10" cy="10" r="8" />
          <path d="M10 6v5" strokeLinecap="round" />
          <path d="M10 14h.01" strokeLinecap="round" />
        </svg>
      ) : null}
      <span>{children}</span>
    </p>
  );
}
