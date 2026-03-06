"use client";

import { useCallback, useState } from "react";

import { getLogList, type LogFilters } from "@/server/actions/log-aktivitas";

import type { LogRow } from "./_components/columns";
import { LogFilters as LogFiltersComponent } from "./_components/log-filters";
import { LogTable } from "./_components/log-table";

const DEFAULT_FILTERS = {
  tanggalMulai: "",
  tanggalAkhir: "",
  modul: "semua",
  aksi: "semua",
};

export default function LogAktivitasPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [data, setData] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchLogs = useCallback(async (activeFilters: typeof DEFAULT_FILTERS) => {
    setLoading(true);
    try {
      const params: LogFilters = {
        tanggalMulai: activeFilters.tanggalMulai || undefined,
        tanggalAkhir: activeFilters.tanggalAkhir || undefined,
        modul: activeFilters.modul !== "semua" ? activeFilters.modul : undefined,
        aksi: activeFilters.aksi !== "semua" ? activeFilters.aksi : undefined,
      };
      const rows = await getLogList(params);
      setData(
        rows.map((r) => ({
          id: r.id,
          waktuLog: r.waktuLog,
          userId: r.userId,
          modul: r.modul,
          aksi: r.aksi,
          keterangan: r.keterangan,
        })),
      );
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilter = () => {
    fetchLogs(filters);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    fetchLogs(DEFAULT_FILTERS);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Log Aktivitas</h1>
        <p className="text-muted-foreground text-sm">Riwayat semua aktivitas admin dalam sistem.</p>
      </div>

      <LogFiltersComponent
        tanggalMulai={filters.tanggalMulai}
        tanggalAkhir={filters.tanggalAkhir}
        modul={filters.modul}
        aksi={filters.aksi}
        onTanggalMulaiChange={(v) => setFilters((f) => ({ ...f, tanggalMulai: v }))}
        onTanggalAkhirChange={(v) => setFilters((f) => ({ ...f, tanggalAkhir: v }))}
        onModulChange={(v) => setFilters((f) => ({ ...f, modul: v }))}
        onAksiChange={(v) => setFilters((f) => ({ ...f, aksi: v }))}
        onFilter={handleFilter}
        onReset={handleReset}
        loading={loading}
      />

      {!hasLoaded ? (
        <div className="rounded-lg border py-16 text-center text-muted-foreground text-sm">
          Klik <strong>Cari</strong> untuk menampilkan log aktivitas.
        </div>
      ) : (
        <LogTable data={data} loading={loading} />
      )}
    </div>
  );
}
