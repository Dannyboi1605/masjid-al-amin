import { AnnouncementForm } from "@/components/admin/announcement-form";
import { requireRole } from "@/lib/auth/roles";

export default async function NewAnnouncementPage() {
  await requireRole("admin");

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">
          Tambah pengumuman
        </h1>
        <p className="mt-2 text-base text-tinta/75">
          Tulis tajuk yang jelas dan isi yang ringkas.
        </p>
      </div>
      <AnnouncementForm />
    </div>
  );
}
