"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import type { TunggakanRow } from "@/server/actions/tunggakan";

const columns: ColumnDef<TunggakanRow>[] = [
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
];

interface TunggakanTableProps {
  data: TunggakanRow[];
  tipeTagihan: "bulanan" | "sekali" | null;
}

export function TunggakanTable({ data, tipeTagihan }: TunggakanTableProps) {
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
