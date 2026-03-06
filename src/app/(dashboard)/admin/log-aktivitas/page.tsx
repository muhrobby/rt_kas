"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getAdminList, getLogList, type LogFilters } from "@/server/actions/log-aktivitas";

import type { LogRow } from "./_components/columns";
import type { AdminOption } from "./_components/log-filters";
import { LogFilters as LogFiltersComponent } from "./_components/log-filters";
import { LogTable } from "./_components/log-table";

const DEFAULT_FILTERS = {
  tanggalMulai: "",
  tanggalAkhir: "",
  modul: "semua",
  aksi: "semua",
  petugas: "semua",
};

export default function LogAktivitasPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [data, setData] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [adminList, setAdminList] = useState<AdminOption[]>([]);

  useEffect(() => {
    getAdminList().then(setAdminList);
  }, []);

  const fetchLogs = useCallback(
    async (activeFilters: typeof DEFAULT_FILTERS) => {
      setLoading(true);
      try {
        const params: LogFilters = {
          tanggalMulai: activeFilters.tanggalMulai || undefined,
          tanggalAkhir: activeFilters.tanggalAkhir || undefined,
          modul: activeFilters.modul !== "semua" ? activeFilters.modul : undefined,
          aksi: activeFilters.aksi !== "semua" ? activeFilters.aksi : undefined,
          userId: activeFilters.petugas !== "semua" ? activeFilters.petugas : undefined,
        };
        const rows = await getLogList(params);
        setData(
          rows.map((r) => ({
            id: r.id,
            waktuLog: r.waktuLog,
            userId: r.userId,
            petugasName: adminList.find((a) => a.id === r.userId)?.name ?? r.userId,
            modul: r.modul,
            aksi: r.aksi,
            keterangan: r.keterangan,
          })),
        );
        setHasLoaded(true);
      } finally {
        setLoading(false);
      }
    },
    [adminList],
  );

  const handleFilter = () => {
    fetchLogs(filters);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    fetchLogs(DEFAULT_FILTERS);
  };

  const buildExportUrl = (format: "pdf" | "excel") => {
    const params = new URLSearchParams();
    if (filters.tanggalMulai) params.set("tanggalMulai", filters.tanggalMulai);
    if (filters.tanggalAkhir) params.set("tanggalAkhir", filters.tanggalAkhir);
    if (filters.modul !== "semua") params.set("modul", filters.modul);
    if (filters.aksi !== "semua") params.set("aksi", filters.aksi);
    if (filters.petugas !== "semua") params.set("userId", filters.petugas);
    return `/api/log-aktivitas/${format}?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-2xl">Log Aktivitas</h1>
          <p className="text-muted-foreground text-sm">Riwayat semua aktivitas admin dalam sistem.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(buildExportUrl("pdf"), "_blank")}>
            Ekspor PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(buildExportUrl("excel"), "_blank")}>
            Ekspor Excel
          </Button>
        </div>
      </div>

      <LogFiltersComponent
        tanggalMulai={filters.tanggalMulai}
        tanggalAkhir={filters.tanggalAkhir}
        modul={filters.modul}
        aksi={filters.aksi}
        petugas={filters.petugas}
        petugasList={adminList}
        onTanggalMulaiChange={(v) => setFilters((f) => ({ ...f, tanggalMulai: v }))}
        onTanggalAkhirChange={(v) => setFilters((f) => ({ ...f, tanggalAkhir: v }))}
        onModulChange={(v) => setFilters((f) => ({ ...f, modul: v }))}
        onAksiChange={(v) => setFilters((f) => ({ ...f, aksi: v }))}
        onPetugasChange={(v) => setFilters((f) => ({ ...f, petugas: v }))}
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
