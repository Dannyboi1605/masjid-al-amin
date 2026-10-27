"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createUserClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/validation";

const maxBytes = 4 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const fileSchema = z
  .instanceof(File, { message: "Sila pilih fail carta organisasi." })
  .refine((file) => file.size > 0, "Sila pilih fail carta organisasi.")
  .refine(
    (file) => file.size <= maxBytes,
    "Saiz fail tidak boleh melebihi 4 MB.",
  )
  .refine(
    (file) => Object.hasOwn(allowedTypes, file.type),
    "Fail mesti dalam format PNG, JPG, atau WebP.",
  );

const dimensionsSchema = z.object({
  width: z.coerce.number().int().min(1).max(20000),
  height: z.coerce.number().int().min(1).max(20000),
});

export async function uploadOrgChart(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireRole("admin");
  const parsedFile = fileSchema.safeParse(formData.get("file"));

  if (!parsedFile.success) {
    return {
      ok: false,
      message:
        parsedFile.error.issues[0]?.message ??
        "Fail carta organisasi tidak sah.",
    };
  }

  const parsedDimensions = dimensionsSchema.safeParse({
    width: formData.get("width"),
    height: formData.get("height"),
  });

  if (!parsedDimensions.success) {
    return {
      ok: false,
      message: "Saiz imej tidak sah. Sila pilih fail semula.",
    };
  }

  const file = parsedFile.data;
  const extension = allowedTypes[file.type];
  const supabase = await createUserClient();
  const { data: current, error: readError } = await supabase
    .from("org_chart")
    .select("image_path")
    .eq("id", true)
    .maybeSingle();

  if (readError) {
    console.error("Failed to read org chart.", readError.message);
    return { ok: false, message: "Gagal membaca carta organisasi." };
  }

  const path = `carta/${Date.now()}-${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("org-chart")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Failed to upload org chart.", uploadError.message);
    return { ok: false, message: "Gagal memuat naik carta organisasi." };
  }

  const { error: saveError } = await supabase.from("org_chart").upsert(
    {
      id: true,
      image_path: path,
      image_width: parsedDimensions.data.width,
      image_height: parsedDimensions.data.height,
      updated_by: profile.id,
    },
    { onConflict: "id" },
  );

  if (saveError) {
    console.error("Failed to save org chart.", saveError.message);
    await supabase.storage.from("org-chart").remove([path]);
    return { ok: false, message: "Gagal menyimpan carta organisasi." };
  }

  if (current?.image_path) {
    const { error: removeError } = await supabase.storage
      .from("org-chart")
      .remove([current.image_path]);

    if (removeError) {
      console.error(
        "Failed to remove previous org chart.",
        removeError.message,
      );
    }
  }

  updateTag("org-chart");
  redirect("/admin/carta-organisasi?berjaya=disimpan");
}

export async function deleteOrgChart() {
  await requireRole("admin");
  const supabase = await createUserClient();
  const { data: current, error: readError } = await supabase
    .from("org_chart")
    .select("image_path")
    .eq("id", true)
    .maybeSingle();

  if (readError) {
    console.error("Failed to read org chart.", readError.message);
    redirect("/admin/carta-organisasi?ralat=padam");
  }

  if (!current) {
    redirect("/admin/carta-organisasi");
  }

  const { error: deleteError } = await supabase
    .from("org_chart")
    .delete()
    .eq("id", true);

  if (deleteError) {
    console.error("Failed to delete org chart.", deleteError.message);
    redirect("/admin/carta-organisasi?ralat=padam");
  }

  const { error: removeError } = await supabase.storage
    .from("org-chart")
    .remove([current.image_path]);

  if (removeError) {
    console.error("Failed to remove org chart file.", removeError.message);
  }

  updateTag("org-chart");
  redirect("/admin/carta-organisasi?berjaya=dipadam");
}
