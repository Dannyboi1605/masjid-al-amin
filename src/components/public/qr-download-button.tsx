"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/styles";

export function QrDownloadButton({ url }: { url: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function download() {
    setMessage(null);
    setPending(true);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Download failed.");
      }

      const blob = await response.blob();
      const extension =
        new URL(url).pathname.split(".").pop()?.toLowerCase() || "png";
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `kod-qr-duitnow.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setMessage("Gagal memuat turun kod QR. Sila cuba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={download}
        disabled={pending}
        className={buttonClass("secondary")}
      >
        {pending ? "Sedang memuat turun" : "Muat turun kod QR"}
      </button>
      {message ? (
        <p role="status" className="text-base text-ralat">
          {message}
        </p>
      ) : null}
    </div>
  );
}
