"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Card, CardContent } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import type { RekapItem } from "@/server/actions/laporan";

interface RekapItemWithBalance extends RekapItem {
  saldo: number;
  no: number;
}

const columns: ColumnDef<RekapItemWithBalance>[] = [
  {
    accessorKey: "no",
    header: "No",
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.no}</span>,
    size: 48,
  },
  {
    accessorKey: "waktuTransaksi",
    header: "Tanggal",
    cell: ({ row }) => <span className="whitespace-nowrap text-sm">{formatTanggal(row.original.waktuTransaksi)}</span>,
  },
  {
    accessorKey: "keterangan",
    header: "Uraian / Keterangan",
    cell: ({ row }) => (
      <div className="max-w-xs text-sm">
        <div>{row.original.keterangan ?? "-"}</div>
        {row.original.namaWarga && (
          <div className="text-muted-foreground text-xs">
            {row.original.namaWarga} — {row.original.blokRumah}
          </div>
        )}
        {row.original.namaKategori && <div className="text-muted-foreground text-xs">{row.original.namaKategori}</div>}
      </div>
    ),
  },
  {
    id: "pemasukan",
    header: "Pemasukan (Rp)",
    cell: ({ row }) => (
      <span className="text-right text-green-600">
        {row.original.tipeArus === "masuk" ? formatRupiah(row.original.nominal) : "-"}
      </span>
    ),
  },
  {
    id: "pengeluaran",
    header: "Pengeluaran (Rp)",
    cell: ({ row }) => (
      <span className="text-right text-red-500">
        {row.original.tipeArus === "keluar" ? formatRupiah(row.original.nominal) : "-"}
      </span>
    ),
  },
  {
    accessorKey: "saldo",
    header: "Saldo (Rp)",
    cell: ({ row }) => (
      <span className={`text-right font-medium ${row.original.saldo >= 0 ? "" : "text-red-500"}`}>
        {formatRupiah(row.original.saldo)}
      </span>
    ),
  },
];

interface ReportTableProps {
  data: RekapItem[];
}

export function ReportTable({ data }: ReportTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Tidak ada transaksi pada periode yang dipilih.</p>
        </CardContent>
      </Card>
    );
  }

  let runningBalance = 0;
  const dataWithBalance: RekapItemWithBalance[] = data.map((item, index) => {
    if (item.tipeArus === "masuk") {
      runningBalance += item.nominal;
    } else {
      runningBalance -= item.nominal;
    }
    return { ...item, saldo: runningBalance, no: index + 1 };
  });

  return <ReportTableInner data={dataWithBalance} />;
}

function ReportTableInner({ data }: { data: RekapItemWithBalance[] }) {
  const table = useDataTableInstance({ data, columns, enableRowSelection: false, defaultPageSize: 20 });

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 py-4">
          <DataTable table={table} columns={columns} />
          <DataTablePagination table={table} />
        </div>
      </CardContent>
    </Card>
  );
}
