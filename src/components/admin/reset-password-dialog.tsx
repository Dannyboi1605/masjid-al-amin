"use client";

import { useActionState, useId, useRef } from "react";
import { resetUserPassword } from "@/actions/users";
import { Alert } from "@/components/ui/alert";
import { buttonClass, inputClass, labelClass } from "@/components/ui/styles";
import type { FormState } from "@/lib/validation";

const initialState: FormState = { ok: false, message: "" };

type Props = {
  id: string;
  fullName: string;
};

export function ResetPasswordDialog({ id, fullName }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const inputId = useId();
  const [state, action, pending] = useActionState(
    resetUserPassword,
    initialState,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        className="min-h-11 px-2 text-base font-semibold"
      >
        Kata laluan
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
          Tukar kata laluan
        </h2>
        <p className="mt-2 text-base text-tinta/75">
          Tetapkan kata laluan baharu untuk {fullName}.
        </p>

        <form action={action} className="mt-5 flex flex-col gap-4">
          <input type="hidden" name="id" value={id} />

          {state.message ? <Alert tone="error">{state.message}</Alert> : null}

          <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className={labelClass}>
              Kata laluan baharu
            </label>
            <input
              id={inputId}
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className={buttonClass("primary")}
            >
              {pending ? "Sedang menyimpan" : "Tetapkan kata laluan"}
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className={buttonClass("quiet")}
            >
              Batal
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
