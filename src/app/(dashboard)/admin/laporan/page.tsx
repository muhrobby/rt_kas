"use client";

import { useState } from "react";

import { BULAN_NAMES } from "@/lib/utils";
import type { RekapItem } from "@/server/actions/laporan";
import { getRekapKas, getRekapSummary } from "@/server/actions/laporan";

import { ReportFilters } from "./_components/report-filters";
import { ReportSummary } from "./_components/report-summary";
import { ReportTable } from "./_components/report-table";

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

export default function LaporanPage() {
  const [bulanAwal, setBulanAwal] = useState(1);
  const [bulanAkhir, setBulanAkhir] = useState(CURRENT_MONTH);
  const [tahun, setTahun] = useState(CURRENT_YEAR);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RekapItem[] | null>(null);
  const [summary, setSummary] = useState<{ totalMasuk: number; totalKeluar: number; saldo: number } | null>(null);

  async function handleFilter() {
    setLoading(true);
    try {
      const [rekapData, rekapSummary] = await Promise.all([
        getRekapKas(bulanAwal, bulanAkhir, tahun),
        getRekapSummary(bulanAwal, bulanAkhir, tahun),
      ]);
      setData(rekapData);
      setSummary(rekapSummary);
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadPDF() {
    const url = `/api/laporan/pdf?bulanAwal=${bulanAwal}&bulanAkhir=${bulanAkhir}&tahun=${tahun}`;
    window.open(url, "_blank");
  }

  function handleDownloadExcel() {
    const url = `/api/laporan/excel?bulanAwal=${bulanAwal}&bulanAkhir=${bulanAkhir}&tahun=${tahun}`;
    window.open(url, "_blank");
  }

  const periodLabel =
    bulanAwal === bulanAkhir
      ? `${BULAN_NAMES[bulanAwal - 1]} ${tahun}`
      : `${BULAN_NAMES[bulanAwal - 1]} – ${BULAN_NAMES[bulanAkhir - 1]} ${tahun}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Laporan Keuangan</h1>
        <p className="text-muted-foreground text-sm">Rekap pemasukan dan pengeluaran kas RT per periode.</p>
      </div>

      <ReportFilters
        bulanAwal={bulanAwal}
        bulanAkhir={bulanAkhir}
        tahun={tahun}
        onBulanAwalChange={setBulanAwal}
        onBulanAkhirChange={setBulanAkhir}
        onTahunChange={setTahun}
        onFilter={handleFilter}
        onDownloadPDF={handleDownloadPDF}
        onDownloadExcel={handleDownloadExcel}
        loading={loading}
      />

      {summary && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-sm">Periode: {periodLabel}</h2>
            <span className="text-muted-foreground text-sm">{data?.length ?? 0} transaksi</span>
          </div>
          <ReportSummary totalMasuk={summary.totalMasuk} totalKeluar={summary.totalKeluar} saldo={summary.saldo} />
        </>
      )}

      {data && <ReportTable data={data} />}

      {data === null && (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground text-sm">Pilih periode dan klik "Tampilkan" untuk melihat laporan.</p>
        </div>
      )}
    </div>
  );
}
