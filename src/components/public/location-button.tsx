"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { resolvePrayerZone } from "@/actions/prayer";
import { buttonClass } from "@/components/ui/styles";

export function LocationButton({ dateKey }: { dateKey: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function detect() {
    setMessage(null);

    if (!navigator.geolocation) {
      setMessage(
        "Pelayar ini tidak menyokong lokasi. Sila pilih zon secara manual.",
      );
      return;
    }

    setPending(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const result = await resolvePrayerZone(
          position.coords.latitude,
          position.coords.longitude,
        );

        setPending(false);

        if (!result.ok) {
          setMessage(result.message);
          return;
        }

        router.push(
          `/waktu-solat?zon=${encodeURIComponent(result.zone)}&tarikh=${dateKey}`,
        );
      },
      (error) => {
        setPending(false);
        setMessage(
          error.code === error.PERMISSION_DENIED
            ? "Kebenaran lokasi tidak diberikan. Sila pilih zon secara manual."
            : "Lokasi tidak dapat dikesan. Sila pilih zon secara manual.",
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 0 },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={detect}
        disabled={pending}
        aria-busy={pending}
        aria-describedby={message ? "lokasi-mesej" : undefined}
        className={buttonClass("secondary", "self-start")}
      >
        {pending ? "Mengesan lokasi" : "Guna lokasi saya"}
      </button>
      {message ? (
        <p
          id="lokasi-mesej"
          role="alert"
          className="flex items-start gap-2 text-base text-ralat"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="mt-0.5 size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 3.5 18 17H2L10 3.5Z" />
            <path d="M10 8v4" />
            <path d="M10 14.5v.01" />
          </svg>
          <span>{message}</span>
        </p>
      ) : null}
    </div>
  );
}
