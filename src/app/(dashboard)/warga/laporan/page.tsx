import {
  getAvailableLaporanPeriods,
  getWargaLaporanTransaksi,
  getWargaMonthlyChartData,
  getWargaRekapBulanIni,
  getWargaSaldoKas,
} from "@/server/actions/warga-laporan";

import { LaporanShell } from "./_components/laporan-shell";

export default async function WargaLaporanPage() {
  const now = new Date();
  const currentBulan = now.getMonth() + 1;
  const currentTahun = now.getFullYear();

  const [periods, saldoKas, rekap, transaksiData, monthlyData] = await Promise.all([
    getAvailableLaporanPeriods(),
    getWargaSaldoKas(),
    getWargaRekapBulanIni(currentBulan, currentTahun),
    getWargaLaporanTransaksi(currentBulan, currentTahun),
    getWargaMonthlyChartData(currentTahun),
  ]);

  // Default to the most recent period with data, or current month
  const defaultPeriod = periods[0] ?? { bulan: currentBulan, tahun: currentTahun };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Laporan Keuangan RT</h1>
        <p className="text-muted-foreground text-sm">Transparansi keuangan kas RT untuk warga.</p>
      </div>

      <LaporanShell
        initialBulan={defaultPeriod.bulan}
        initialTahun={defaultPeriod.tahun}
        initialPeriods={periods}
        initialSaldo={saldoKas}
        initialRekap={rekap}
        initialTransaksi={transaksiData}
        initialChartData={monthlyData}
      />
    </div>
  );
}
