"use client";

import { useId, useRef } from "react";
import { buttonClass } from "@/components/ui/styles";

type Props = {
  id: string;
  action: (formData: FormData) => Promise<void>;
  triggerLabel: string;
  title: string;
  body: string;
  confirmLabel: string;
};

export function DeleteDialog({
  id,
  action,
  triggerLabel,
  title,
  body,
  confirmLabel,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        className="min-h-11 px-2 text-base font-semibold text-ralat underline underline-offset-4"
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto border border-garis bg-putih p-6 backdrop:bg-tinta/60"
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            dialogRef.current?.close();
          }
        }}
      >
        <h2 id={titleId} className="text-2xl text-hijau-malam">
          {title}
        </h2>
        <p className="mt-3 text-base text-tinta/80">{body}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className={buttonClass("danger")}>
              {confirmLabel}
            </button>
          </form>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={buttonClass("quiet")}
          >
            Batal
          </button>
        </div>
      </dialog>
    </>
  );
}
