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
  const [selectedTransaksiId, setSelectedTransaksiId] = useState<number | null>(null);

  const handlePeriodChange = useCallback(async (bulan: number, tahun: number) => {
    setSelectedBulan(bulan);
    setSelectedTahun(tahun);
    setLoading(true);
    try {
      const newGrids = await getPaymentGrid(bulan, tahun);
      setGrids(newGrids);
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
      />

      {loading ? (
        <div className="py-8 text-center text-muted-foreground text-sm">Memuat data...</div>
      ) : (
        <PaymentHistory
          grids={grids}
          selectedBulan={selectedBulan}
          selectedTahun={selectedTahun}
          onKuitansiClick={(id: number) => setSelectedTransaksiId(id)}
        />
      )}

      <EKuitansiView transaksiId={selectedTransaksiId} onClose={() => setSelectedTransaksiId(null)} />
    </>
  );
}
