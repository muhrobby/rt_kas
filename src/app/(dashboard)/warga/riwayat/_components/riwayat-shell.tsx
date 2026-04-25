"use client";

import { useCallback, useState } from "react";

import type { PaymentGridByKategori, PeriodOption } from "@/server/actions/warga-riwayat";
import { getPaymentGrid } from "@/server/actions/warga-riwayat";

import { EKuitansiView } from "./e-kuitansi-view";
import { PaymentHistory } from "./payment-history";
import { PeriodSelector } from "./period-selector";

interface RiwayatShellProps {
  initialBulan: number;
  initialTahun: number;
  initialPeriods: PeriodOption[];
  initialGrids: PaymentGridByKategori[];
}

export function RiwayatShell({ initialBulan, initialTahun, initialPeriods, initialGrids }: RiwayatShellProps) {
  const [selectedBulan, setSelectedBulan] = useState(initialBulan);
  const [selectedTahun, setSelectedTahun] = useState(initialTahun);
  const [grids, setGrids] = useState<PaymentGridByKategori[]>(initialGrids);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTransaksiId, setSelectedTransaksiId] = useState<number | null>(null);

  const handlePeriodChange = useCallback(async (bulan: number, tahun: number) => {
    setSelectedBulan(bulan);
    setSelectedTahun(tahun);
    setLoading(true);
    setErrorMessage(null);
    try {
      const newGrids = await getPaymentGrid(bulan, tahun);
      setGrids(newGrids);
    } catch {
      setErrorMessage("Gagal memuat data riwayat pembayaran. Coba pilih periode lain atau muat ulang halaman.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <PeriodSelector
        periods={initialPeriods}
        selectedBulan={selectedBulan}
        selectedTahun={selectedTahun}
        onPeriodChange={handlePeriodChange}
        loading={loading}
      />

      {loading ? (
        <PaymentHistory
          grids={grids}
          selectedBulan={selectedBulan}
          selectedTahun={selectedTahun}
          onKuitansiClick={(id: number) => setSelectedTransaksiId(id)}
          loading
        />
      ) : (
        <PaymentHistory
          grids={grids}
          selectedBulan={selectedBulan}
          selectedTahun={selectedTahun}
          onKuitansiClick={(id: number) => setSelectedTransaksiId(id)}
          errorMessage={errorMessage}
        />
      )}

      <EKuitansiView transaksiId={selectedTransaksiId} onClose={() => setSelectedTransaksiId(null)} />
    </>
  );
}
