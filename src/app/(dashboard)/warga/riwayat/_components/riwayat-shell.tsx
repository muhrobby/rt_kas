"use client";

import { useCallback, useState } from "react";

import type { PaymentGridByKategori } from "@/server/actions/warga-riwayat";
import { getPaymentGrid } from "@/server/actions/warga-riwayat";

import { EKuitansiView } from "./e-kuitansi-view";
import { PaymentHistory } from "./payment-history";
import { YearSelector } from "./year-selector";

interface RiwayatShellProps {
  initialYear: number;
  initialYears: number[];
  initialGrids: PaymentGridByKategori[];
}

export function RiwayatShell({ initialYear, initialYears, initialGrids }: RiwayatShellProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [grids, setGrids] = useState<PaymentGridByKategori[]>(initialGrids);
  const [loading, setLoading] = useState(false);
  const [selectedTransaksiId, setSelectedTransaksiId] = useState<number | null>(null);

  const handleYearChange = useCallback(async (year: number) => {
    setSelectedYear(year);
    setLoading(true);
    try {
      const newGrids = await getPaymentGrid(year);
      setGrids(newGrids);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <YearSelector years={initialYears} selectedYear={selectedYear} onYearChange={handleYearChange} />

      {loading ? (
        <div className="py-8 text-center text-muted-foreground text-sm">Memuat data...</div>
      ) : (
        <PaymentHistory
          grids={grids}
          selectedYear={selectedYear}
          onKuitansiClick={(id: number) => setSelectedTransaksiId(id)}
        />
      )}

      <EKuitansiView transaksiId={selectedTransaksiId} onClose={() => setSelectedTransaksiId(null)} />
    </>
  );
}
