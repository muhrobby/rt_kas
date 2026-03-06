"use client";

import { useCallback, useState } from "react";

import { getWargaMonthlyChartData, getWargaRekapTahun, getWargaSaldoKas } from "@/server/actions/warga-laporan";

import { LaporanChart } from "./laporan-chart";
import { LaporanStatCards } from "./laporan-stat-cards";
import { LaporanSummaryTable } from "./laporan-summary-table";

interface LaporanShellProps {
  initialTahun: number;
  initialYears: number[];
  initialSaldo: number;
  initialRekap: { totalMasuk: number; totalKeluar: number };
  initialChartData: { bulan: number; masuk: number; keluar: number }[];
}

export function LaporanShell({
  initialTahun,
  initialYears,
  initialSaldo,
  initialRekap,
  initialChartData,
}: LaporanShellProps) {
  const [selectedTahun, setSelectedTahun] = useState(initialTahun);
  const [saldo, setSaldo] = useState(initialSaldo);
  const [rekap, setRekap] = useState(initialRekap);
  const [chartData, setChartData] = useState(initialChartData);
  const [loading, setLoading] = useState(false);

  const handleYearChange = useCallback(async (tahun: number) => {
    setSelectedTahun(tahun);
    setLoading(true);
    try {
      const [newSaldo, newRekap, newChart] = await Promise.all([
        getWargaSaldoKas(),
        getWargaRekapTahun(tahun),
        getWargaMonthlyChartData(tahun),
      ]);
      setSaldo(newSaldo);
      setRekap(newRekap);
      setChartData(newChart);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Period selector pills */}
      <div className="flex flex-wrap gap-2">
        {initialYears.map((tahun) => {
          const isSelected = tahun === selectedTahun;
          return (
            <button
              key={tahun}
              type="button"
              onClick={() => handleYearChange(tahun)}
              className={`rounded-full px-4 py-1.5 font-medium text-sm transition-colors ${
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Tahun {tahun}
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
            periodLabel={`Tahun ${selectedTahun}`}
          />

          <LaporanChart data={chartData} tahun={selectedTahun} />

          <div className="pt-4">
            <LaporanSummaryTable data={chartData} tahun={selectedTahun} />
          </div>
        </>
      )}
    </div>
  );
}
