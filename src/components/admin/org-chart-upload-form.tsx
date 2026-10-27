"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { uploadOrgChart } from "@/actions/org-chart";
import { Alert } from "@/components/ui/alert";
import { buttonClass, inputClass, labelClass } from "@/components/ui/styles";
import type { FormState } from "@/lib/validation";

const initialState: FormState = { ok: false, message: "" };
const maxBytes = 4 * 1024 * 1024;
const allowed = ["image/png", "image/jpeg", "image/webp"];

type Dimensions = {
  width: number;
  height: number;
};

type Props = {
  currentUrl: string | null;
};

export function OrgChartUploadForm({ currentUrl }: Props) {
  const [state, action, pending] = useActionState(uploadOrgChart, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const previewUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl.current) {
        URL.revokeObjectURL(previewUrl.current);
      }
    };
  }, []);

  function clearPreview() {
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    }

    setPreview(null);
    setDimensions(null);
  }

  const imageUrl = preview ?? currentUrl;

  return (
    <form action={action} className="flex flex-col gap-5">
      {clientError ? <Alert tone="error">{clientError}</Alert> : null}
      {state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <div>
        <p className={labelClass}>
          {preview ? "Pratonton carta" : "Carta organisasi semasa"}
        </p>
        {imageUrl ? (
          <div className="mt-3 inline-block w-full max-w-[30rem] border border-garis bg-putih p-3">
            <Image
              src={imageUrl}
              alt={preview ? "Pratonton carta organisasi" : "Carta organisasi semasa"}
              width={640}
              height={640}
              unoptimized
              className="h-auto max-h-[28rem] w-full object-contain"
            />
          </div>
        ) : (
          <p className="mt-3 border border-garis bg-kapur px-4 py-5 text-base text-tinta/75">
            Carta organisasi belum dimuat naik.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="org-chart" className={labelClass}>
          Fail carta organisasi
        </label>
        <input
          id="org-chart"
          name="file"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          onChange={(event) => {
            const file = event.target.files?.[0];
            setClientError(null);

            if (!file) {
              clearPreview();
              return;
            }

            if (!allowed.includes(file.type)) {
              setClientError("Fail mesti dalam format PNG, JPG, atau WebP.");
              event.target.value = "";
              clearPreview();
              return;
            }

            if (file.size > maxBytes) {
              setClientError("Saiz fail tidak boleh melebihi 4 MB.");
              event.target.value = "";
              clearPreview();
              return;
            }

            clearPreview();
            const url = URL.createObjectURL(file);
            previewUrl.current = url;
            setPreview(url);

            const image = new window.Image();
            image.onload = () => {
              if (previewUrl.current !== url) {
                return;
              }

              setDimensions({
                width: image.naturalWidth,
                height: image.naturalHeight,
              });
            };
            image.onerror = () => {
              if (previewUrl.current !== url) {
                return;
              }

              setClientError("Gagal membaca imej. Sila pilih fail lain.");
              event.target.value = "";
              clearPreview();
            };
            image.src = url;
          }}
          aria-describedby="org-chart-hint"
          className={`${inputClass} py-3`}
        />
        <p id="org-chart-hint" className="text-sm text-tinta/70">
          PNG, JPG, atau WebP. Saiz maksimum 4 MB. Gunakan imej beresolusi
          tinggi supaya senang dibaca apabila dizum.
        </p>
      </div>

      <input
        type="hidden"
        name="width"
        value={dimensions?.width ?? ""}
        readOnly
      />
      <input
        type="hidden"
        name="height"
        value={dimensions?.height ?? ""}
        readOnly
      />

      <div>
        <button
          type="submit"
          disabled={pending || !dimensions}
          className={buttonClass("primary")}
        >
          {pending
            ? "Sedang memuat naik"
            : currentUrl
              ? "Ganti carta"
              : "Muat naik carta"}
        </button>
      </div>
    </form>
  );
}
