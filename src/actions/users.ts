"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { formString } from "@/lib/form-fields";
import { writeAudit } from "@/lib/audit";
import { requireRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createUserClient } from "@/lib/supabase/server";
import { toFieldErrors, type FormState } from "@/lib/validation";

const idSchema = z.string().uuid("Pengguna tidak sah.");

const createUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Nama penuh diperlukan.")
    .max(150, "Nama penuh tidak boleh melebihi 150 aksara."),
  email: z.string().email("Sila masukkan e-mel yang sah."),
  password: z
    .string()
    .min(8, "Kata laluan mesti sekurang-kurangnya 8 aksara.")
    .max(72, "Kata laluan tidak boleh melebihi 72 aksara."),
  role: z.enum(["admin", "superadmin"]),
});

const passwordSchema = z
  .string()
  .min(8, "Kata laluan mesti sekurang-kurangnya 8 aksara.")
  .max(72, "Kata laluan tidak boleh melebihi 72 aksara.");

export async function createUser(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireRole("superadmin");
  const parsed = createUserSchema.safeParse({
    fullName: formString(formData, "fullName"),
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    role: formString(formData, "role"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Sila semak medan yang bertanda.",
      errors: toFieldErrors(parsed.error),
    };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName },
  });

  if (error || !data.user) {
    console.error("Failed to create auth user.", error?.message);
    return {
      ok: false,
      message: "Gagal menambah pengguna. Semak sama ada e-mel sudah digunakan.",
    };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    full_name: parsed.data.fullName,
    role: parsed.data.role,
  });

  if (profileError) {
    console.error("Failed to create profile.", profileError.message);
    await admin.auth.admin.deleteUser(data.user.id);
    return { ok: false, message: "Gagal menambah pengguna." };
  }

  await writeAudit({
    actorId: profile.id,
    action: "user.create",
    entity: "profiles",
    entityId: data.user.id,
    meta: { role: parsed.data.role },
  });

  redirect("/admin/pengguna?berjaya=ditambah");
}

export async function setUserActive(formData: FormData) {
  const actor = await requireRole("superadmin");
  const parsedId = idSchema.safeParse(formString(formData, "id"));
  const active = formString(formData, "active") === "true";

  if (!parsedId.success) {
    redirect("/admin/pengguna?ralat=tidak-sah");
  }

  if (parsedId.data === actor.id) {
    redirect("/admin/pengguna?ralat=diri");
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_active: active })
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to update user status.", error?.message);
    redirect("/admin/pengguna?ralat=status");
  }

  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(
    parsedId.data,
    { ban_duration: active ? "none" : "876000h" },
  );

  if (authError) {
    console.error("Failed to update auth ban.", authError.message);
    redirect("/admin/pengguna?ralat=sesi");
  }

  await writeAudit({
    actorId: actor.id,
    action: active ? "user.enable" : "user.disable",
    entity: "profiles",
    entityId: parsedId.data,
  });

  redirect(`/admin/pengguna?berjaya=${active ? "diaktifkan" : "dinyahaktifkan"}`);
}

export async function deleteUser(formData: FormData) {
  const actor = await requireRole("superadmin");
  const parsedId = idSchema.safeParse(formString(formData, "id"));

  if (!parsedId.success) {
    redirect("/admin/pengguna?ralat=tidak-sah");
  }

  if (parsedId.data === actor.id) {
    redirect("/admin/pengguna?ralat=diri");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(parsedId.data);

  if (error) {
    console.error("Failed to delete user.", error.message);
    redirect("/admin/pengguna?ralat=padam");
  }

  await writeAudit({
    actorId: actor.id,
    action: "user.delete",
    entity: "profiles",
    entityId: parsedId.data,
  });

  redirect("/admin/pengguna?berjaya=dipadam");
}

export async function resetUserPassword(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireRole("superadmin");
  const parsedId = idSchema.safeParse(formString(formData, "id"));
  const parsedPassword = passwordSchema.safeParse(
    formString(formData, "password"),
  );

  if (!parsedId.success) {
    return { ok: false, message: "Pengguna tidak sah." };
  }

  if (!parsedPassword.success) {
    return {
      ok: false,
      message: parsedPassword.error.issues[0]?.message ?? "Kata laluan tidak sah.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(parsedId.data, {
    password: parsedPassword.data,
  });

  if (error) {
    console.error("Failed to reset password.", error.message);
    return { ok: false, message: "Gagal menetapkan kata laluan." };
  }

  await writeAudit({
    actorId: actor.id,
    action: "user.reset_password",
    entity: "profiles",
    entityId: parsedId.data,
  });

  redirect("/admin/pengguna?berjaya=kata-laluan");
}
