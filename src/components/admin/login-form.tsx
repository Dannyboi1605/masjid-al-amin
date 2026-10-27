"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/actions/auth";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="flex flex-col gap-6">
      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-3 border border-ralat/30 bg-ralat/5 px-4 py-3 text-base text-ralat"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="mt-1 size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v5" strokeLinecap="round" />
            <path d="M10 14h.01" strokeLinecap="round" />
          </svg>
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-base font-semibold">
          E-mel
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 border border-garis bg-putih px-3 text-base focus-visible:border-hijau-daun"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-base font-semibold">
          Kata laluan
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 border border-garis bg-putih px-3 text-base focus-visible:border-hijau-daun"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-12 bg-hijau-malam px-5 text-base font-semibold text-putih transition-colors hover:bg-hijau-daun disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sedang log masuk" : "Log masuk"}
      </button>
    </form>
  );
}
