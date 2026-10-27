import { EventForm } from "@/components/admin/event-form";
import { requireRole } from "@/lib/auth/roles";

export default async function NewEventPage() {
  await requireRole("admin");

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">
          Tambah program
        </h1>
        <p className="mt-2 text-base text-tinta/75">
          Masukkan waktu mengikut waktu Malaysia.
        </p>
      </div>
      <EventForm />
    </div>
  );
}
