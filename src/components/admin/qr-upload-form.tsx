"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { uploadDonationQr } from "@/actions/settings";
import { Alert } from "@/components/ui/alert";
import { buttonClass, inputClass, labelClass } from "@/components/ui/styles";
import type { FormState } from "@/lib/validation";

const initialState: FormState = { ok: false, message: "" };
const maxBytes = 2 * 1024 * 1024;
const allowed = ["image/png", "image/jpeg", "image/webp"];

type Props = {
  currentUrl: string | null;
};

export function QrUploadForm({ currentUrl }: Props) {
  const [state, action, pending] = useActionState(
    uploadDonationQr,
    initialState,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const imageUrl = preview ?? currentUrl;

  return (
    <form action={action} className="flex flex-col gap-5">
      {clientError ? <Alert tone="error">{clientError}</Alert> : null}
      {state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <div>
        <p className={labelClass}>Kod QR semasa</p>
        {imageUrl ? (
          <div className="mt-3 inline-block border border-garis bg-putih p-4">
            <Image
              src={imageUrl}
              alt="Pratonton kod QR DuitNow"
              width={320}
              height={320}
              unoptimized
              className="h-auto w-full max-w-[280px]"
            />
          </div>
        ) : (
          <p className="mt-3 border border-garis bg-kapur px-4 py-5 text-base text-tinta/75">
            Kod QR belum dimuat naik.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="qr" className={labelClass}>
          Fail kod QR
        </label>
        <input
          id="qr"
          name="qr"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          onChange={(event) => {
            const file = event.target.files?.[0];
            setClientError(null);

            if (!file) {
              setPreview(null);
              return;
            }

            if (!allowed.includes(file.type)) {
              setClientError("Fail mesti dalam format PNG, JPG, atau WebP.");
              event.target.value = "";
              setPreview(null);
              return;
            }

            if (file.size > maxBytes) {
              setClientError("Saiz fail tidak boleh melebihi 2 MB.");
              event.target.value = "";
              setPreview(null);
              return;
            }

            setPreview(URL.createObjectURL(file));
          }}
          aria-describedby="qr-hint"
          className={`${inputClass} py-3`}
        />
        <p id="qr-hint" className="text-sm text-tinta/70">
          PNG, JPG, atau WebP. Saiz maksimum 2 MB.
        </p>
      </div>

      <div>
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary")}
        >
          {pending
            ? "Sedang memuat naik"
            : currentUrl
              ? "Ganti kod QR"
              : "Muat naik kod QR"}
        </button>
      </div>
    </form>
  );
}
