"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PencilIcon, TrashIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";

export interface KategoriRow {
  id: number;
  namaKategori: string;
  jenisArus: "masuk" | "keluar";
  nominalDefault: number | null;
  createdAt: Date;
}

export function getColumns(
  onEdit: (row: KategoriRow) => void,
  onDelete: (row: KategoriRow) => void,
): ColumnDef<KategoriRow>[] {
  return [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.index + 1}</span>,
      size: 48,
    },
    {
      accessorKey: "namaKategori",
      header: "Nama Kategori",
      cell: ({ row }) => <span className="font-medium">{row.original.namaKategori}</span>,
    },
    {
      accessorKey: "jenisArus",
      header: "Jenis Arus",
      cell: ({ row }) => (
        <Badge variant={row.original.jenisArus === "masuk" ? "default" : "destructive"}>
          {row.original.jenisArus === "masuk" ? "Masuk" : "Keluar"}
        </Badge>
      ),
    },
    {
      accessorKey: "nominalDefault",
      header: "Nominal Default",
      cell: ({ row }) => {
        const val = row.original.nominalDefault;
        return val ? formatRupiah(val) : <span className="text-muted-foreground text-sm">-</span>;
      },
    },
    {
      id: "aksi",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)} title="Edit">
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original)}
            title="Hapus"
            className="text-red-500 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
