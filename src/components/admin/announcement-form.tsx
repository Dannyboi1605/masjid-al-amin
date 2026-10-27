"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createAnnouncement,
  updateAnnouncement,
} from "@/actions/announcements";
import { Alert } from "@/components/ui/alert";
import { buttonClass, inputClass, labelClass } from "@/components/ui/styles";
import type { FormState } from "@/lib/validation";

type Props = {
  announcement?: {
    id: string;
    title: string;
    body: string;
  };
};

const initialState: FormState = { ok: false, message: "" };

export function AnnouncementForm({ announcement }: Props) {
  const [state, action, pending] = useActionState(
    announcement ? updateAnnouncement : createAnnouncement,
    initialState,
  );

  return (
    <form action={action} className="flex flex-col gap-6">
      {announcement ? (
        <input type="hidden" name="id" value={announcement.id} />
      ) : null}

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
          defaultValue={announcement?.title}
          aria-invalid={state.errors?.title ? true : undefined}
          aria-describedby={state.errors?.title ? "title-error" : undefined}
          className={inputClass}
        />
        {state.errors?.title ? (
          <p id="title-error" className="text-sm text-ralat">
            {state.errors.title}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="body" className={labelClass}>
          Isi pengumuman
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={12}
          maxLength={5000}
          defaultValue={announcement?.body}
          aria-invalid={state.errors?.body ? true : undefined}
          aria-describedby={state.errors?.body ? "body-error" : undefined}
          className={`${inputClass} min-h-64 py-3`}
        />
        {state.errors?.body ? (
          <p id="body-error" className="text-sm text-ralat">
            {state.errors.body}
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
            : announcement
              ? "Simpan perubahan"
              : "Tambah pengumuman"}
        </button>
        <Link
          href="/admin/pengumuman"
          className={buttonClass("quiet", "no-underline")}
        >
          Kembali
        </Link>
      </div>
    </form>
  );
}
