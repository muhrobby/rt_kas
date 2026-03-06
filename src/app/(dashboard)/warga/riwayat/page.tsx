import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth-helpers";
import { BULAN_NAMES } from "@/lib/utils";
import { getWargaProfile } from "@/server/actions/warga-dashboard";
import { getAvailableMonthsYears, getPaymentGrid } from "@/server/actions/warga-riwayat";

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

  const now = new Date();
  const currentBulan = now.getMonth() + 1;
  const currentTahun = now.getFullYear();

  const [periods, grids] = await Promise.all([getAvailableMonthsYears(), getPaymentGrid(currentBulan, currentTahun)]);

  // Default to latest period that has data, or current month if none
  const defaultPeriod = periods[0] ?? {
    bulan: currentBulan,
    tahun: currentTahun,
    label: `${BULAN_NAMES[currentBulan - 1]} ${currentTahun}`,
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
      <div>
        <h1 className="font-bold text-2xl">Riwayat Pembayaran</h1>
        <p className="text-muted-foreground text-sm">Riwayat iuran Keluarga {profile.namaKepalaKeluarga}</p>
      </div>

      <RiwayatShell
        initialBulan={defaultPeriod.bulan}
        initialTahun={defaultPeriod.tahun}
        initialPeriods={periods}
        initialGrids={grids}
      />
    </div>
  );
}
