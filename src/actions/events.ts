"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { formString } from "@/lib/form-fields";
import { requireRole } from "@/lib/auth/roles";
import { createUserClient } from "@/lib/supabase/server";
import { isValidDateTimeLocal, parseDateTimeLocal } from "@/lib/time";
import { toFieldErrors, type FormState } from "@/lib/validation";

const dateTimeLocalSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
    "Sila masukkan tarikh dan masa yang sah.",
  )
  .refine(isValidDateTimeLocal, {
    message: "Sila masukkan tarikh dan masa yang sah.",
  });

const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Tajuk mesti sekurang-kurangnya 3 aksara.")
    .max(150, "Tajuk tidak boleh melebihi 150 aksara."),
  location: z
    .string()
    .trim()
    .min(1, "Lokasi diperlukan.")
    .max(200, "Lokasi tidak boleh melebihi 200 aksara."),
  description: z
    .string()
    .trim()
    .max(5000, "Keterangan tidak boleh melebihi 5000 aksara."),
  startsAt: dateTimeLocalSchema,
  endsAt: z.union([z.literal(""), dateTimeLocalSchema]),
});

const idSchema = z.string().uuid("Program tidak sah.");

function readEventForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formString(formData, "title"),
    location: formString(formData, "location"),
    description: formString(formData, "description"),
    startsAt: formString(formData, "startsAt"),
    endsAt: formString(formData, "endsAt"),
  });
}

function buildTimes(data: z.infer<typeof eventSchema>) {
  const startsAt = parseDateTimeLocal(data.startsAt);
  const endsAt = data.endsAt ? parseDateTimeLocal(data.endsAt) : null;
  const errors: Record<string, string> = {};

  if (endsAt && endsAt.getTime() <= startsAt.getTime()) {
    errors.endsAt = "Masa tamat mesti selepas masa mula.";
  }

  return {
    startsAt,
    endsAt,
    errors,
  };
}

export async function createEvent(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireRole("admin");
  const parsed = readEventForm(formData);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Sila semak medan yang bertanda.",
      errors: toFieldErrors(parsed.error),
    };
  }

  const times = buildTimes(parsed.data);

  if (Object.keys(times.errors).length > 0) {
    return {
      ok: false,
      message: "Sila semak medan yang bertanda.",
      errors: times.errors,
    };
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      title: parsed.data.title,
      location: parsed.data.location,
      description: parsed.data.description || null,
      starts_at: times.startsAt.toISOString(),
      ends_at: times.endsAt ? times.endsAt.toISOString() : null,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create event.", error?.message);
    return { ok: false, message: "Gagal menyimpan program." };
  }

  updateTag("events");
  redirect("/admin/program?berjaya=ditambah");
}

export async function updateEvent(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsedId = idSchema.safeParse(formString(formData, "id"));
  const parsed = readEventForm(formData);

  if (!parsedId.success) {
    return { ok: false, message: "Program tidak sah." };
  }

  if (!parsed.success) {
    return {
      ok: false,
      message: "Sila semak medan yang bertanda.",
      errors: toFieldErrors(parsed.error),
    };
  }

  const times = buildTimes(parsed.data);

  if (Object.keys(times.errors).length > 0) {
    return {
      ok: false,
      message: "Sila semak medan yang bertanda.",
      errors: times.errors,
    };
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("events")
    .update({
      title: parsed.data.title,
      location: parsed.data.location,
      description: parsed.data.description || null,
      starts_at: times.startsAt.toISOString(),
      ends_at: times.endsAt ? times.endsAt.toISOString() : null,
    })
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to update event.", error?.message);
    return { ok: false, message: "Gagal menyimpan perubahan." };
  }

  updateTag("events");
  redirect("/admin/program?berjaya=disimpan");
}

export async function deleteEvent(formData: FormData) {
  await requireRole("admin");
  const parsedId = idSchema.safeParse(formString(formData, "id"));

  if (!parsedId.success) {
    redirect("/admin/program?ralat=tidak-sah");
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to delete event.", error?.message);
    redirect("/admin/program?ralat=padam");
  }

  updateTag("events");
  redirect("/admin/program?berjaya=dipadam");
}
