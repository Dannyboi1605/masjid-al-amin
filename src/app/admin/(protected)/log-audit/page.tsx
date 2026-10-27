import { Alert } from "@/components/ui/alert";
import { requireRole } from "@/lib/auth/roles";
import { createUserClient } from "@/lib/supabase/server";
import { formatEventDateTime } from "@/lib/time";

export const instant = false;

const actionLabels: Record<string, string> = {
  "qr.replace": "Kod QR diganti",
  "settings.update": "Tetapan dikemas kini",
  "user.create": "Pengguna ditambah",
  "user.disable": "Pengguna dinyahaktifkan",
  "user.enable": "Pengguna diaktifkan",
  "user.delete": "Pengguna dipadam",
  "user.reset_password": "Kata laluan ditetapkan semula",
};

export default async function AuditLogPage() {
  await requireRole("superadmin");
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const actorIds = [
    ...new Set(
      (data ?? [])
        .map((entry) => entry.actor_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const { data: actors } =
    actorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", actorIds)
      : { data: [] };

  const actorMap = new Map(
    (actors ?? []).map((actor) => [actor.id, actor.full_name]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">Log audit</h1>
        <p className="mt-2 text-base text-tinta/75">
          Rekod perubahan kod QR, tetapan, dan pengguna.
        </p>
      </div>

      {error ? (
        <Alert tone="error">Gagal membaca log audit.</Alert>
      ) : data && data.length > 0 ? (
        <div className="overflow-x-auto border border-garis bg-putih">
          <table className="w-full min-w-[48rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-garis bg-kapur">
                <th scope="col" className="px-4 py-3 text-base font-semibold">
                  Masa
                </th>
                <th scope="col" className="px-4 py-3 text-base font-semibold">
                  Pelaku
                </th>
                <th scope="col" className="px-4 py-3 text-base font-semibold">
                  Tindakan
                </th>
                <th scope="col" className="px-4 py-3 text-base font-semibold">
                  Butiran
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {data.map((entry) => {
                const label = actionLabels[entry.action] ?? entry.action;
                const actor = entry.actor_id
                  ? (actorMap.get(entry.actor_id) ?? "Pengguna dipadam")
                  : "Sistem";

                return (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-sm text-tinta/75 tnum">
                      {formatEventDateTime(new Date(entry.created_at))}
                    </td>
                    <td className="px-4 py-3 text-base">{actor}</td>
                    <td className="px-4 py-3 text-base">{label}</td>
                    <td className="px-4 py-3 text-sm text-tinta/75">
                      {entry.meta ? (
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(entry.meta)}
                        </pre>
                      ) : (
                        <span>{entry.entity}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="border border-garis bg-putih px-5 py-8 text-base text-tinta/75">
          Belum ada catatan audit.
        </p>
      )}
    </div>
  );
}
