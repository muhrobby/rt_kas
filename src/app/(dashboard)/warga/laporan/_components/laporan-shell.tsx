"use client";

import { useCallback, useState } from "react";

import type { LaporanPeriodOption, LaporanTransaksiItem } from "@/server/actions/warga-laporan";
import {
  getWargaLaporanTransaksi,
  getWargaMonthlyChartData,
  getWargaRekapBulanIni,
  getWargaSaldoKas,
} from "@/server/actions/warga-laporan";

import { LaporanChart } from "./laporan-chart";
import { LaporanStatCards } from "./laporan-stat-cards";
import { LaporanTable } from "./laporan-table";

interface LaporanShellProps {
  initialBulan: number;
  initialTahun: number;
  initialPeriods: LaporanPeriodOption[];
  initialSaldo: number;
  initialRekap: { totalMasuk: number; totalKeluar: number };
  initialTransaksi: LaporanTransaksiItem[];
  initialChartData: { bulan: number; masuk: number; keluar: number }[];
}

export function LaporanShell({
  initialBulan,
  initialTahun,
  initialPeriods,
  initialSaldo,
  initialRekap,
  initialTransaksi,
  initialChartData,
}: LaporanShellProps) {
  const [selectedBulan, setSelectedBulan] = useState(initialBulan);
  const [selectedTahun, setSelectedTahun] = useState(initialTahun);
  const [saldo, setSaldo] = useState(initialSaldo);
  const [rekap, setRekap] = useState(initialRekap);
  const [transaksiData, setTransaksiData] = useState<LaporanTransaksiItem[]>(initialTransaksi);
  const [chartData, setChartData] = useState(initialChartData);
  const [loading, setLoading] = useState(false);

  const handlePeriodChange = useCallback(async (bulan: number, tahun: number) => {
    setSelectedBulan(bulan);
    setSelectedTahun(tahun);
    setLoading(true);
    try {
      const [newSaldo, newRekap, newTransaksi, newChart] = await Promise.all([
        getWargaSaldoKas(),
        getWargaRekapBulanIni(bulan, tahun),
        getWargaLaporanTransaksi(bulan, tahun),
        getWargaMonthlyChartData(tahun),
      ]);
      setSaldo(newSaldo);
      setRekap(newRekap);
      setTransaksiData(newTransaksi);
      setChartData(newChart);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectedPeriod = initialPeriods.find((p) => p.bulan === selectedBulan && p.tahun === selectedTahun);
  const periodLabel = selectedPeriod?.label ?? `${selectedBulan}/${selectedTahun}`;

  return (
    <div className="space-y-6">
      {/* Period selector pills */}
      <div className="flex flex-wrap gap-2">
        {initialPeriods.map((p) => {
          const isSelected = p.bulan === selectedBulan && p.tahun === selectedTahun;
          return (
            <button
              key={`${p.bulan}-${p.tahun}`}
              type="button"
              onClick={() => handlePeriodChange(p.bulan, p.tahun)}
              className={`rounded-full px-4 py-1.5 font-medium text-sm transition-colors ${
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground text-sm">Memuat data...</div>
      ) : (
        <>
          <LaporanStatCards
            saldoKas={saldo}
            pemasukanBulanIni={rekap.totalMasuk}
            pengeluaranBulanIni={rekap.totalKeluar}
            periodLabel={periodLabel}
          />

          <LaporanChart data={chartData} tahun={selectedTahun} />

          <div>
            <h2 className="mb-3 font-semibold text-base">Detail Transaksi — {periodLabel}</h2>
            <LaporanTable data={transaksiData} />
          </div>
        </>
      )}
    </div>
  );
}
