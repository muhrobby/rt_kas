import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth-helpers";
import { getWargaProfile } from "@/server/actions/warga-dashboard";
import { getAvailableYears, getPaymentGrid } from "@/server/actions/warga-riwayat";

import { RiwayatShell } from "./_components/riwayat-shell";

export default async function RiwayatPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const profile = await getWargaProfile();

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-2 font-bold text-2xl">Riwayat Pembayaran</h1>
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Profil warga tidak ditemukan. Hubungi admin untuk menghubungkan akun Anda.
          </p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const [years, grids] = await Promise.all([getAvailableYears(), getPaymentGrid(currentYear)]);

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
      <div>
        <h1 className="font-bold text-2xl">Riwayat Pembayaran</h1>
        <p className="text-muted-foreground text-sm">Riwayat iuran Keluarga {profile.namaKepalaKeluarga}</p>
      </div>

      <RiwayatShell initialYear={currentYear} initialYears={years} initialGrids={grids} />
    </div>
  );
}
