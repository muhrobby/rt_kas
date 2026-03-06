import {
  getAvailableLaporanYears,
  getWargaMonthlyChartData,
  getWargaRekapTahun,
  getWargaSaldoKas,
} from "@/server/actions/warga-laporan";

import { LaporanShell } from "./_components/laporan-shell";

export default async function WargaLaporanPage() {
  const now = new Date();
  const currentTahun = now.getFullYear();

  const [years, saldoKas, rekap, monthlyData] = await Promise.all([
    getAvailableLaporanYears(),
    getWargaSaldoKas(),
    getWargaRekapTahun(currentTahun),
    getWargaMonthlyChartData(currentTahun),
  ]);

  const defaultYear = years[0] ?? currentTahun;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Laporan Keuangan RT</h1>
        <p className="text-muted-foreground text-sm">Transparansi keuangan kas RT untuk warga.</p>
      </div>

      <LaporanShell
        initialTahun={defaultYear}
        initialYears={years}
        initialSaldo={saldoKas}
        initialRekap={rekap}
        initialChartData={monthlyData}
      />
    </div>
  );
}
