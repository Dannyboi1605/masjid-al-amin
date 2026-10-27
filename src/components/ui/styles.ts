export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-2 px-5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const buttonStyles = {
  primary:
    "bg-hijau-malam text-putih hover:bg-hijau-daun disabled:hover:bg-hijau-malam",
  secondary:
    "border border-hijau-daun bg-transparent text-hijau-daun hover:bg-hijau-daun hover:text-putih",
  danger: "bg-ralat text-putih hover:bg-ralat/90",
  quiet:
    "border border-tinta/50 bg-putih text-tinta hover:border-hijau-daun hover:text-hijau-daun",
};

export function buttonClass(
  variant: keyof typeof buttonStyles = "primary",
  extra?: string,
) {
  return cx(buttonBase, buttonStyles[variant], extra);
}

export const inputClass =
  "min-h-12 w-full border border-garis bg-putih px-3 text-base text-tinta placeholder:text-tinta/70 focus-visible:border-hijau-daun";

export const labelClass = "text-base font-semibold text-tinta";
