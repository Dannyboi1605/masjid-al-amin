"use client";

import { useActionState } from "react";
import { updateSettings } from "@/actions/settings";
import { ZoneSelect } from "@/components/public/zone-select";
import { Alert } from "@/components/ui/alert";
import { buttonClass, inputClass, labelClass } from "@/components/ui/styles";
import type { SiteSettings } from "@/lib/settings";
import type { FormState } from "@/lib/validation";

const initialState: FormState = { ok: false, message: "" };

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(
    updateSettings,
    initialState,
  );

  function errorFor(name: string) {
    return state.errors?.[name];
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      {state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="mosqueName" className={labelClass}>
          Nama masjid
        </label>
        <input
          id="mosqueName"
          name="mosqueName"
          type="text"
          required
          maxLength={150}
          defaultValue={settings.mosque_name}
          aria-invalid={errorFor("mosqueName") ? true : undefined}
          aria-describedby={
            errorFor("mosqueName") ? "mosqueName-error" : undefined
          }
          className={inputClass}
        />
        {errorFor("mosqueName") ? (
          <p id="mosqueName-error" className="text-sm text-ralat">
            {errorFor("mosqueName")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="address" className={labelClass}>
          Alamat
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          maxLength={300}
          defaultValue={settings.address ?? ""}
          aria-invalid={errorFor("address") ? true : undefined}
          aria-describedby={errorFor("address") ? "address-error" : undefined}
          className={`${inputClass} py-3`}
        />
        {errorFor("address") ? (
          <p id="address-error" className="text-sm text-ralat">
            {errorFor("address")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className={labelClass}>
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={40}
            defaultValue={settings.phone ?? ""}
            aria-invalid={errorFor("phone") ? true : undefined}
            aria-describedby={errorFor("phone") ? "phone-error" : undefined}
            className={inputClass}
          />
          {errorFor("phone") ? (
            <p id="phone-error" className="text-sm text-ralat">
              {errorFor("phone")}
            </p>
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
            maxLength={200}
            defaultValue={settings.email ?? ""}
            aria-invalid={errorFor("email") ? true : undefined}
            aria-describedby={errorFor("email") ? "email-error" : undefined}
            className={inputClass}
          />
          {errorFor("email") ? (
            <p id="email-error" className="text-sm text-ralat">
              {errorFor("email")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="prayerZone" className={labelClass}>
          Zon solat
        </label>
        <ZoneSelect
          id="prayerZone"
          name="prayerZone"
          defaultValue={settings.prayer_zone}
          className={inputClass}
        />
        {errorFor("prayerZone") ? (
          <p className="text-sm text-ralat">{errorFor("prayerZone")}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="donationNote" className={labelClass}>
          Nota sumbangan
        </label>
        <textarea
          id="donationNote"
          name="donationNote"
          rows={4}
          maxLength={1000}
          defaultValue={settings.donation_note ?? ""}
          aria-invalid={errorFor("donationNote") ? true : undefined}
          aria-describedby={
            errorFor("donationNote") ? "donationNote-error" : undefined
          }
          className={`${inputClass} py-3`}
        />
        {errorFor("donationNote") ? (
          <p id="donationNote-error" className="text-sm text-ralat">
            {errorFor("donationNote")}
          </p>
        ) : null}
      </div>

      <div>
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary")}
        >
          {pending ? "Sedang menyimpan" : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
