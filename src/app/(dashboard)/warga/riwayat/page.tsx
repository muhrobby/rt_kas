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
      <div className="px-4 py-6">
        <div className="mb-4 space-y-1">
          <h1 className="font-bold text-2xl tracking-tight">Status iuran per periode</h1>
          <p className="text-muted-foreground text-sm">
            Lihat status pembayaran, periode tagihan, dan e-kuitansi dalam satu tempat.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
          <p className="font-medium text-sm">Profil warga belum terhubung</p>
          <p className="mt-2 text-muted-foreground text-sm">
            Akun Anda belum tersambung ke data warga. Silakan hubungi admin agar riwayat pembayaran bisa ditampilkan.
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const currentBulan = now.getMonth() + 1;
  const currentTahun = now.getFullYear();

  const periods = await getAvailableMonthsYears();

  // Default to latest period that has data, or current month if none
  const defaultPeriod = periods[0] ?? {
    bulan: currentBulan,
    tahun: currentTahun,
    label: `${BULAN_NAMES[currentBulan - 1]} ${currentTahun}`,
  };

  const grids = await getPaymentGrid(defaultPeriod.bulan, defaultPeriod.tahun);

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="font-bold text-2xl tracking-tight">Status iuran per periode</h1>
        <p className="text-muted-foreground text-sm">
          Riwayat pembayaran Keluarga {profile.namaKepalaKeluarga}.
          <br />
          Pilih periode untuk melihat status lunas, belum bayar, dan e-kuitansi.
        </p>
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
