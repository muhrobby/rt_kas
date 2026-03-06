"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Card, CardContent } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import type { LaporanTransaksiItem } from "@/server/actions/warga-laporan";

const columns: ColumnDef<LaporanTransaksiItem>[] = [
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
        {row.original.namaWarga && (
          <div className="text-muted-foreground text-xs">
            {row.original.namaWarga}
            {row.original.blokRumah ? ` — ${row.original.blokRumah}` : ""}
          </div>
        )}
        <div className="text-muted-foreground text-xs">{row.original.namaKategori}</div>
      </div>
    ),
  },
  {
    id: "pemasukan",
    header: "Pemasukan (Rp)",
    cell: ({ row }) => (
      <span className="text-right text-green-600 text-sm">
        {row.original.tipeArus === "masuk" ? formatRupiah(row.original.nominal) : "-"}
      </span>
    ),
  },
  {
    id: "pengeluaran",
    header: "Pengeluaran (Rp)",
    cell: ({ row }) => (
      <span className="text-right text-red-500 text-sm">
        {row.original.tipeArus === "keluar" ? formatRupiah(row.original.nominal) : "-"}
      </span>
    ),
  },
];

interface LaporanTableProps {
  data: LaporanTransaksiItem[];
}

export function LaporanTable({ data }: LaporanTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">Tidak ada transaksi pada periode yang dipilih.</p>
        </CardContent>
      </Card>
    );
  }

  return <LaporanTableInner data={data} />;
}

function LaporanTableInner({ data }: { data: LaporanTransaksiItem[] }) {
  const table = useDataTableInstance({
    data,
    columns,
    enableRowSelection: false,
    defaultPageSize: 20,
    getRowId: (row) => (row as { id: number }).id.toString(),
  });

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
