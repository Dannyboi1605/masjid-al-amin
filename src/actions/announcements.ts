"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { formString } from "@/lib/form-fields";
import { requireRole } from "@/lib/auth/roles";
import { createUserClient } from "@/lib/supabase/server";
import { toFieldErrors, type FormState } from "@/lib/validation";

const announcementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Tajuk mesti sekurang-kurangnya 3 aksara.")
    .max(150, "Tajuk tidak boleh melebihi 150 aksara."),
  body: z
    .string()
    .trim()
    .min(1, "Isi pengumuman diperlukan.")
    .max(5000, "Isi pengumuman tidak boleh melebihi 5000 aksara."),
});

const idSchema = z.string().uuid("Pengumuman tidak sah.");

export async function createAnnouncement(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireRole("admin");
  const parsed = announcementSchema.safeParse({
    title: formString(formData, "title"),
    body: formString(formData, "body"),
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
    .from("announcements")
    .insert({
      ...parsed.data,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create announcement.", error?.message);
    return { ok: false, message: "Gagal menyimpan pengumuman." };
  }

  updateTag("announcements");
  updateTag(`announcement-${data.id}`);
  redirect("/admin/pengumuman?berjaya=ditambah");
}

export async function updateAnnouncement(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsedId = idSchema.safeParse(formString(formData, "id"));
  const parsed = announcementSchema.safeParse({
    title: formString(formData, "title"),
    body: formString(formData, "body"),
  });

  if (!parsedId.success) {
    return { ok: false, message: "Pengumuman tidak sah." };
  }

  if (!parsed.success) {
    return {
      ok: false,
      message: "Sila semak medan yang bertanda.",
      errors: toFieldErrors(parsed.error),
    };
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("announcements")
    .update(parsed.data)
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to update announcement.", error?.message);
    return { ok: false, message: "Gagal menyimpan perubahan." };
  }

  updateTag("announcements");
  updateTag(`announcement-${parsedId.data}`);
  redirect("/admin/pengumuman?berjaya=disimpan");
}

export async function deleteAnnouncement(formData: FormData) {
  await requireRole("admin");
  const parsedId = idSchema.safeParse(formString(formData, "id"));

  if (!parsedId.success) {
    redirect("/admin/pengumuman?ralat=tidak-sah");
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to delete announcement.", error?.message);
    redirect("/admin/pengumuman?ralat=padam");
  }

  updateTag("announcements");
  updateTag(`announcement-${parsedId.data}`);
  redirect("/admin/pengumuman?berjaya=dipadam");
}
