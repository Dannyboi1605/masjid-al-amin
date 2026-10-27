"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createUserClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
};

const loginSchema = z.object({
  email: z.string().email("Sila masukkan e-mel yang sah."),
  password: z.string().min(1, "Sila masukkan kata laluan."),
});

export async function signIn(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Sila semak maklumat log masuk.",
    };
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (/banned/i.test(error.message)) {
      return { error: "Akaun ini tidak aktif. Sila hubungi pentadbir." };
    }

    return { error: "E-mel atau kata laluan tidak betul." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return { error: "Akaun ini tidak aktif. Sila hubungi pentadbir." };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createUserClient();
  await supabase.auth.signOut();
  redirect("/admin/log-masuk");
}
