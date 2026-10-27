"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { formString } from "@/lib/form-fields";
import { writeAudit } from "@/lib/audit";
import { requireRole } from "@/lib/auth/roles";
import { findZone } from "@/lib/prayer/zones";
import { createUserClient } from "@/lib/supabase/server";
import { toFieldErrors, type FormState } from "@/lib/validation";

const settingsSchema = z.object({
  mosqueName: z
    .string()
    .trim()
    .min(1, "Nama masjid diperlukan.")
    .max(150, "Nama masjid tidak boleh melebihi 150 aksara."),
  address: z
    .string()
    .trim()
    .max(300, "Alamat tidak boleh melebihi 300 aksara."),
  phone: z
    .string()
    .trim()
    .max(40, "Nombor telefon tidak boleh melebihi 40 aksara."),
  email: z.union([
    z.literal(""),
    z.string().email("Sila masukkan e-mel yang sah."),
  ]),
  prayerZone: z
    .string()
    .refine((value) => findZone(value) !== null, "Zon solat tidak sah."),
  donationNote: z
    .string()
    .trim()
    .max(1000, "Nota sumbangan tidak boleh melebihi 1000 aksara."),
});

const maxQrBytes = 2 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function updateSettings(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireRole("superadmin");
  const parsed = settingsSchema.safeParse({
    mosqueName: formString(formData, "mosqueName"),
    address: formString(formData, "address"),
    phone: formString(formData, "phone"),
    email: formString(formData, "email"),
    prayerZone: formString(formData, "prayerZone"),
    donationNote: formString(formData, "donationNote"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Sila semak medan yang bertanda.",
      errors: toFieldErrors(parsed.error),
    };
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("site_settings")
    .update({
      mosque_name: parsed.data.mosqueName,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      prayer_zone: parsed.data.prayerZone,
      donation_note: parsed.data.donationNote || null,
    })
    .eq("id", true)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to update site settings.", error?.message);
    return { ok: false, message: "Gagal menyimpan tetapan." };
  }

  await writeAudit({
    actorId: profile.id,
    action: "settings.update",
    entity: "site_settings",
    entityId: "true",
    meta: { prayer_zone: parsed.data.prayerZone },
  });

  updateTag("settings");
  redirect("/admin/tetapan?berjaya=disimpan");
}

export async function uploadDonationQr(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireRole("superadmin");
  const value = formData.get("qr");

  if (!(value instanceof File) || value.size === 0) {
    return { ok: false, message: "Sila pilih fail kod QR." };
  }

  if (value.size > maxQrBytes) {
    return { ok: false, message: "Saiz fail tidak boleh melebihi 2 MB." };
  }

  const extension = allowedTypes[value.type];

  if (!extension) {
    return {
      ok: false,
      message: "Fail mesti dalam format PNG, JPG, atau WebP.",
    };
  }

  const supabase = await createUserClient();
  const { data: current, error: readError } = await supabase
    .from("site_settings")
    .select("donation_qr_path")
    .eq("id", true)
    .maybeSingle();

  if (readError || !current) {
    console.error("Failed to read QR path.", readError?.message);
    return { ok: false, message: "Gagal membaca tetapan sumbangan." };
  }

  const path = `qr/${Date.now()}-${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("donation")
    .upload(path, value, {
      contentType: value.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Failed to upload QR.", uploadError.message);
    return { ok: false, message: "Gagal memuat naik kod QR." };
  }

  const { error: updateError } = await supabase
    .from("site_settings")
    .update({ donation_qr_path: path })
    .eq("id", true);

  if (updateError) {
    console.error("Failed to save QR path.", updateError.message);
    await supabase.storage.from("donation").remove([path]);
    return { ok: false, message: "Gagal menyimpan kod QR." };
  }

  if (current.donation_qr_path) {
    const { error: removeError } = await supabase.storage
      .from("donation")
      .remove([current.donation_qr_path]);

    if (removeError) {
      console.error("Failed to remove previous QR.", removeError.message);
    }
  }

  await writeAudit({
    actorId: profile.id,
    action: "qr.replace",
    entity: "site_settings",
    entityId: "true",
    meta: { path },
  });

  updateTag("settings");
  redirect("/admin/tetapan?berjaya=qr");
}
