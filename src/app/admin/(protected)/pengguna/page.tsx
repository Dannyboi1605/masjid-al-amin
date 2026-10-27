import { deleteUser, setUserActive } from "@/actions/users";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { ResetPasswordDialog } from "@/components/admin/reset-password-dialog";
import { roleLabel } from "@/components/admin/nav-items";
import { Alert } from "@/components/ui/alert";
import { FlashToast } from "@/components/admin/flash-toast";
import { requireRole } from "@/lib/auth/roles";
import { listManagedUsers } from "@/lib/users";

export const instant = false;

const successMessages: Record<string, string> = {
  ditambah: "Pengguna ditambah.",
  diaktifkan: "Pengguna diaktifkan.",
  dinyahaktifkan: "Pengguna dinyahaktifkan.",
  dipadam: "Pengguna dipadam.",
  "kata-laluan": "Kata laluan ditetapkan semula.",
};

const errorMessages: Record<string, string> = {
  diri: "Anda tidak boleh mengubah status atau memadam akaun sendiri.",
  padam: "Gagal memadam pengguna.",
  status: "Gagal mengubah status pengguna.",
  sesi: "Status dikemas kini, tetapi sesi pengguna tidak dapat diubah.",
  "tidak-sah": "Pengguna tidak sah.",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ berjaya?: string; ralat?: string }>;
}) {
  const profile = await requireRole("superadmin");
  const params = await searchParams;
  const { users, failed } = await listManagedUsers();
  const success = params.berjaya ? successMessages[params.berjaya] : null;
  const failure = params.ralat ? errorMessages[params.ralat] : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl text-hijau-malam sm:text-5xl">Pengguna</h1>
        <p className="mt-2 text-base text-tinta/75">
          Tambah pentadbir, tetapkan kata laluan, atau nyahaktifkan akses.
        </p>
      </div>

      {success ? <FlashToast message={success} /> : null}
      {failure ? <Alert tone="error">{failure}</Alert> : null}
      {failed ? (
        <Alert tone="error">Gagal membaca senarai pengguna.</Alert>
      ) : null}

      <section className="border border-garis bg-putih p-5 sm:p-6">
        <h2 className="text-2xl text-hijau-malam">Tambah pentadbir</h2>
        <p className="mt-2 text-base text-tinta/75">
          Akaun baharu boleh log masuk serta-merta selepas ditambah.
        </p>
        <div className="mt-5">
          <CreateUserForm />
        </div>
      </section>

      <section>
        <h2 className="text-2xl text-hijau-malam">Senarai pengguna</h2>

        {users.length > 0 ? (
          <div className="mt-4 overflow-x-auto border border-garis bg-putih">
            <table className="w-full min-w-[48rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-garis bg-kapur">
                  <th scope="col" className="px-4 py-3 text-base font-semibold">
                    Nama
                  </th>
                  <th scope="col" className="px-4 py-3 text-base font-semibold">
                    E-mel
                  </th>
                  <th scope="col" className="px-4 py-3 text-base font-semibold">
                    Peranan
                  </th>
                  <th scope="col" className="px-4 py-3 text-base font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-base font-semibold">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {users.map((user) => {
                  const isSelf = user.id === profile.id;
                  const label =
                    user.role === null ? "Tiada profil" : roleLabel(user.role);

                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-3 text-base">
                        {user.fullName}
                        {isSelf ? (
                          <span className="ml-2 text-sm text-tinta/70">
                            (anda)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-base text-tinta/75">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-base">{label}</td>
                      <td className="px-4 py-3 text-base">
                        {user.isActive ? "Aktif" : "Tidak aktif"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {isSelf ? null : (
                            <>
                              <form action={setUserActive}>
                                <input type="hidden" name="id" value={user.id} />
                                <input
                                  type="hidden"
                                  name="active"
                                  value={user.isActive ? "false" : "true"}
                                />
                                <button
                                  type="submit"
                                  className="min-h-11 px-2 text-base font-semibold"
                                >
                                  {user.isActive ? "Nyahaktifkan" : "Aktifkan"}
                                </button>
                              </form>
                              <DeleteDialog
                                id={user.id}
                                action={deleteUser}
                                triggerLabel="Padam"
                                title="Padam pengguna ini?"
                                body="Tindakan ini tidak boleh dibatalkan. Pengguna akan kehilangan akses serta-merta."
                                confirmLabel="Padam pengguna"
                              />
                            </>
                          )}
                          <ResetPasswordDialog
                            id={user.id}
                            fullName={user.fullName}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 border border-garis bg-putih px-5 py-8 text-base text-tinta/75">
            Belum ada pengguna. Tambah pentadbir pertama di atas.
          </p>
        )}
      </section>

    </div>
  );
}
