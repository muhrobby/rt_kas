"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { BULAN_NAMES, formatRupiah, formatTanggal } from "@/lib/utils";
import { getWargaPengeluaranBulan, type LaporanTransaksiItem } from "@/server/actions/warga-laporan";

const pengeluaranColumns: ColumnDef<LaporanTransaksiItem>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.index + 1}</span>,
    size: 48,
  },
  {
    accessorKey: "waktuTransaksi",
    header: "Tanggal",
    cell: ({ row }) => <span className="whitespace-nowrap text-sm">{formatTanggal(row.original.waktuTransaksi)}</span>,
  },
  {
    id: "uraian",
    header: "Uraian / Keterangan",
    cell: ({ row }) => (
      <div className="max-w-xs text-sm">
        <div>{row.original.keterangan ?? "-"}</div>
        <div className="text-muted-foreground text-xs">{row.original.namaKategori}</div>
      </div>
    ),
  },
  {
    id: "pengeluaran",
    header: "Pengeluaran (Rp)",
    cell: ({ row }) => (
      <span className="text-right font-semibold text-red-500 text-sm">{formatRupiah(row.original.nominal)}</span>
    ),
  },
];

interface LaporanSummaryTableProps {
  data: { bulan: number; masuk: number; keluar: number }[];
  tahun: number;
}

export function LaporanSummaryTable({ data, tahun }: LaporanSummaryTableProps) {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<{ bulan: number; nama: string } | null>(null);
  const [details, setDetails] = useState<LaporanTransaksiItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRowClick = async (bulanNum: number, namaBulan: string, pengeluaranBulanIni: number) => {
    // Only fetch and show dialog if there are expenses
    if (pengeluaranBulanIni <= 0) return;

    setSelectedMonth({ bulan: bulanNum, nama: namaBulan });
    setOpen(true);
    setLoading(true);
    try {
      const results = await getWargaPengeluaranBulan(bulanNum, tahun);
      setDetails(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tableInstance = useDataTableInstance({
    data: details,
    columns: pengeluaranColumns,
    enableRowSelection: false,
    defaultPageSize: 10, // keep the popup manageable
    getRowId: (row) => (row as { id: number }).id.toString(),
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Rekapitulasi Bulanan — Tahun {tahun}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* DESKTOP VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[150px] font-bold text-base text-foreground">Bulan</TableHead>
                  <TableHead className="font-bold text-base text-foreground text-right">Pemasukan</TableHead>
                  <TableHead className="font-bold text-base text-foreground text-right">Pengeluaran</TableHead>
                  <TableHead className="font-bold text-base text-foreground text-right">Sisa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => {
                  const sisa = row.masuk - row.keluar;
                  const isNegative = sisa < 0;
                  const namaBulan = BULAN_NAMES[row.bulan - 1] ?? `Bulan ${row.bulan}`;
                  const hasExpenses = row.keluar > 0;

                  return (
                    <TableRow
                      key={row.bulan}
                      className={`hover:bg-muted/30 ${hasExpenses ? "cursor-pointer transition-colors hover:bg-muted/60" : ""}`}
                      onClick={() => handleRowClick(row.bulan, namaBulan, row.keluar)}
                    >
                      <TableCell className="font-medium text-base">{namaBulan}</TableCell>
                      <TableCell className="text-right text-base font-semibold text-green-600">
                        {row.masuk > 0 ? formatRupiah(row.masuk) : "-"}
                      </TableCell>
                      <TableCell
                        className={`text-right text-base font-semibold ${hasExpenses ? "text-red-500 underline decoration-red-500/30 underline-offset-4" : "text-muted-foreground"}`}
                      >
                        {hasExpenses ? formatRupiah(row.keluar) : "-"}
                      </TableCell>
                      <TableCell
                        className={`text-right text-base font-bold ${
                          isNegative ? "text-red-600" : sisa > 0 ? "text-emerald-700" : "text-muted-foreground"
                        }`}
                      >
                        {isNegative ? `-${formatRupiah(Math.abs(sisa))}` : sisa > 0 ? formatRupiah(sisa) : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="md:hidden flex flex-col gap-3 p-4">
            {data.map((row) => {
              const sisa = row.masuk - row.keluar;
              const isNegative = sisa < 0;
              const namaBulan = BULAN_NAMES[row.bulan - 1] ?? `Bulan ${row.bulan}`;
              const hasExpenses = row.keluar > 0;

              return (
                <div
                  key={row.bulan}
                  className={`rounded-xl border bg-card p-4 shadow-sm ${hasExpenses ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}`}
                  onClick={() => handleRowClick(row.bulan, namaBulan, row.keluar)}
                >
                  <div className="flex items-center justify-between mb-3 border-b pb-2">
                    <h3 className="font-semibold text-base">{namaBulan}</h3>
                    <span
                      className={`text-sm font-bold ${
                        isNegative ? "text-red-600" : sisa > 0 ? "text-emerald-700" : "text-muted-foreground"
                      }`}
                    >
                      Sisa: {isNegative ? `-${formatRupiah(Math.abs(sisa))}` : sisa > 0 ? formatRupiah(sisa) : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Pemasukan</span>
                    <span className="font-medium text-green-600">{row.masuk > 0 ? formatRupiah(row.masuk) : "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pengeluaran</span>
                    <span
                      className={`font-medium ${hasExpenses ? "text-red-500 underline decoration-red-500/30 underline-offset-4" : "text-muted-foreground"}`}
                    >
                      {hasExpenses ? formatRupiah(row.keluar) : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Rincian Pengeluaran — {selectedMonth?.nama} {tahun}
            </DialogTitle>
            <DialogDescription>Transparansi aliran dana keluar pada kas RT.</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Menarik rincian data...</div>
          ) : details.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Tidak ada data ditemukan.</div>
          ) : (
            <div className="flex flex-col gap-4 py-4">
              <div className="rounded-md border">
                <DataTable table={tableInstance} columns={pengeluaranColumns} />
              </div>
              <DataTablePagination table={tableInstance} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
