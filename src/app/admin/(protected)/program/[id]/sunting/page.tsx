import { notFound } from "next/navigation";
import { z } from "zod";
import { EventForm } from "@/components/admin/event-form";
import { requireRole } from "@/lib/auth/roles";
import { createUserClient } from "@/lib/supabase/server";

export const instant = false;

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;

  if (!z.string().uuid().safeParse(id).success) {
    notFound();
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, description, location, starts_at, ends_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">
          Sunting program
        </h1>
        <p className="mt-2 text-base text-tinta/75">
          Masukkan waktu mengikut waktu Malaysia.
        </p>
      </div>
      <EventForm key={data.id} event={data} />
    </div>
  );
}
