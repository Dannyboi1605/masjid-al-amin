"use client";

import { useActionState } from "react";
import { createUser } from "@/actions/users";
import { Alert } from "@/components/ui/alert";
import { buttonClass, inputClass, labelClass } from "@/components/ui/styles";
import type { FormState } from "@/lib/validation";

const initialState: FormState = { ok: false, message: "" };

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, initialState);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className={labelClass}>
            Nama penuh
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            maxLength={150}
            aria-invalid={state.errors?.fullName ? true : undefined}
            className={inputClass}
          />
          {state.errors?.fullName ? (
            <p className="text-sm text-ralat">{state.errors.fullName}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={labelClass}>
            E-mel
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            aria-invalid={state.errors?.email ? true : undefined}
            className={inputClass}
          />
          {state.errors?.email ? (
            <p className="text-sm text-ralat">{state.errors.email}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="new-user-password" className={labelClass}>
            Kata laluan
          </label>
          <input
            id="new-user-password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            aria-invalid={state.errors?.password ? true : undefined}
            className={inputClass}
          />
          {state.errors?.password ? (
            <p className="text-sm text-ralat">{state.errors.password}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="role" className={labelClass}>
            Peranan
          </label>
          <select id="role" name="role" className={inputClass} defaultValue="admin">
            <option value="admin">Pentadbir</option>
            <option value="superadmin">Pentadbir utama</option>
          </select>
          {state.errors?.role ? (
            <p className="text-sm text-ralat">{state.errors.role}</p>
          ) : null}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary")}
        >
          {pending ? "Sedang menambah" : "Tambah pentadbir"}
        </button>
      </div>
    </form>
  );
}
