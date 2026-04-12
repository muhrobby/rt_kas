"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { formatRupiah } from "@/lib/utils";
import type { TunggakanRow } from "@/server/actions/tunggakan";

function getColumns(tipeTagihan: "bulanan" | "sekali" | null): ColumnDef<TunggakanRow>[] {
  return [
    {
      accessorKey: "blokRumah",
      header: "Blok",
      cell: ({ row }) => <span className="font-medium font-mono">{row.original.blokRumah}</span>,
    },
    {
      accessorKey: "namaKepalaKeluarga",
      header: "Nama Kepala Keluarga",
      cell: ({ row }) => <span>{row.original.namaKepalaKeluarga}</span>,
    },
    {
      accessorKey: "noTelp",
      header: "No. Telp",
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.noTelp}</span>,
    },
    {
      accessorKey: "statusHunian",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.statusHunian === "tetap" ? "default" : "secondary"}>
          {row.original.statusHunian === "tetap" ? "Tetap" : "Kontrak"}
        </Badge>
      ),
    },
    {
      accessorKey: "totalBulanTunggakan",
      header: "Total Bulan Tunggakan",
      cell: ({ row }) => {
        if (tipeTagihan === "sekali") return <span className="text-center">-</span>;
        return <span className="font-medium">{row.original.totalBulanTunggakan} Bulan</span>;
      },
    },
    {
      accessorKey: "sumNominalTunggakan",
      header: "Nominal Tunggakan",
      cell: ({ row }) => (
        <span className="font-bold text-destructive">{formatRupiah(row.original.sumNominalTunggakan)}</span>
      ),
    },
  ];
}

interface TunggakanTableProps {
  data: TunggakanRow[];
  tipeTagihan: "bulanan" | "sekali" | null;
}

export function TunggakanTable({ data, tipeTagihan }: TunggakanTableProps) {
  const columns = getColumns(tipeTagihan);
  const table = useDataTableInstance({
    data,
    columns,
    enableRowSelection: false,
    defaultPageSize: 20,
    getRowId: (row) => String(row.wargaId),
  });

  if (data.length === 0) {
    const emptyMsg =
      tipeTagihan === "sekali"
        ? "Semua warga sudah membayar untuk event ini."
        : "Semua warga sudah membayar untuk bulan dan kategori yang dipilih.";
    return <p className="py-12 text-center text-muted-foreground text-sm">{emptyMsg}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable table={table} columns={columns} />
      <DataTablePagination table={table} />
    </div>
  );
}
