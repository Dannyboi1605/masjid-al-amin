"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createEvent, updateEvent } from "@/actions/events";
import { Alert } from "@/components/ui/alert";
import { buttonClass, inputClass, labelClass } from "@/components/ui/styles";
import { toDateTimeLocalValue } from "@/lib/time";
import type { FormState } from "@/lib/validation";

type Props = {
  event?: {
    id: string;
    title: string;
    description: string | null;
    location: string;
    starts_at: string;
    ends_at: string | null;
  };
};

const initialState: FormState = { ok: false, message: "" };

function fieldError(state: FormState, name: string) {
  return state.errors?.[name];
}

export function EventForm({ event }: Props) {
  const [state, action, pending] = useActionState(
    event ? updateEvent : createEvent,
    initialState,
  );

  return (
    <form action={action} className="flex flex-col gap-6">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}

      {state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="title" className={labelClass}>
          Tajuk
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={150}
          defaultValue={event?.title}
          aria-invalid={fieldError(state, "title") ? true : undefined}
          aria-describedby={
            fieldError(state, "title") ? "title-error" : undefined
          }
          className={inputClass}
        />
        {fieldError(state, "title") ? (
          <p id="title-error" className="text-sm text-ralat">
            {fieldError(state, "title")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="startsAt" className={labelClass}>
            Mula
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={
              event ? toDateTimeLocalValue(event.starts_at) : undefined
            }
            aria-invalid={fieldError(state, "startsAt") ? true : undefined}
            aria-describedby={
              fieldError(state, "startsAt") ? "startsAt-error" : undefined
            }
            className={inputClass}
          />
          {fieldError(state, "startsAt") ? (
            <p id="startsAt-error" className="text-sm text-ralat">
              {fieldError(state, "startsAt")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="endsAt" className={labelClass}>
            Tamat (pilihan)
          </label>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={
              event?.ends_at ? toDateTimeLocalValue(event.ends_at) : undefined
            }
            aria-invalid={fieldError(state, "endsAt") ? true : undefined}
            aria-describedby={
              fieldError(state, "endsAt") ? "endsAt-error" : undefined
            }
            className={inputClass}
          />
          {fieldError(state, "endsAt") ? (
            <p id="endsAt-error" className="text-sm text-ralat">
              {fieldError(state, "endsAt")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="location" className={labelClass}>
          Lokasi
        </label>
        <input
          id="location"
          name="location"
          type="text"
          required
          maxLength={200}
          defaultValue={event?.location}
          aria-invalid={fieldError(state, "location") ? true : undefined}
          aria-describedby={
            fieldError(state, "location") ? "location-error" : undefined
          }
          className={inputClass}
        />
        {fieldError(state, "location") ? (
          <p id="location-error" className="text-sm text-ralat">
            {fieldError(state, "location")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className={labelClass}>
          Keterangan (pilihan)
        </label>
        <textarea
          id="description"
          name="description"
          rows={8}
          maxLength={5000}
          defaultValue={event?.description ?? ""}
          aria-invalid={fieldError(state, "description") ? true : undefined}
          aria-describedby={
            fieldError(state, "description")
              ? "description-error"
              : undefined
          }
          className={`${inputClass} min-h-48 py-3`}
        />
        {fieldError(state, "description") ? (
          <p id="description-error" className="text-sm text-ralat">
            {fieldError(state, "description")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary")}
        >
          {pending
            ? "Sedang menyimpan"
            : event
              ? "Simpan perubahan"
              : "Tambah program"}
        </button>
        <Link
          href="/admin/program"
          className={buttonClass("quiet", "no-underline")}
        >
          Kembali
        </Link>
      </div>
    </form>
  );
}
