"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTanggal, getWhatsAppLink } from "@/lib/utils";

export interface WargaRow {
  id: number;
  namaKepalaKeluarga: string;
  blokRumah: string;
  noTelp: string;
  statusHunian: "tetap" | "kontrak";
  tglBatasDomisili: string | null;
  createdAt: Date;
  isAdmin: boolean;
}

function isDomicileExpiringSoon(tgl: string | null): boolean {
  if (!tgl) return false;
  const exp = new Date(tgl);
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  return exp <= threeMonthsLater && exp >= new Date();
}

export function getColumns(onEdit: (row: WargaRow) => void, onDelete: (row: WargaRow) => void): ColumnDef<WargaRow>[] {
  return [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.index + 1}</span>,
      size: 48,
    },
    {
      accessorKey: "namaKepalaKeluarga",
      header: "Nama Kepala Keluarga",
      cell: ({ row }) => <span className="font-medium">{row.original.namaKepalaKeluarga}</span>,
    },
    {
      id: "peran",
      header: "Peran",
      cell: ({ row }) => (
        <Badge
          variant={row.original.isAdmin ? "default" : "outline"}
          className={
            row.original.isAdmin
              ? "border-transparent bg-amber-500 text-white hover:bg-amber-600"
              : "text-muted-foreground"
          }
        >
          {row.original.isAdmin ? "Pengurus RT" : "Warga Biasa"}
        </Badge>
      ),
    },
    {
      accessorKey: "blokRumah",
      header: "Blok Rumah",
    },
    {
      accessorKey: "noTelp",
      header: "No. Telepon",
      cell: ({ row }) => (
        <a
          href={getWhatsAppLink(row.original.noTelp)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-green-600 hover:underline"
        >
          {row.original.noTelp}
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
      ),
    },
    {
      accessorKey: "statusHunian",
      header: "Status Hunian",
      cell: ({ row }) => (
        <Badge variant={row.original.statusHunian === "tetap" ? "default" : "secondary"}>
          {row.original.statusHunian === "tetap" ? "Tetap" : "Kontrak"}
        </Badge>
      ),
    },
    {
      accessorKey: "tglBatasDomisili",
      header: "Batas Domisili",
      cell: ({ row }) => {
        const tgl = row.original.tglBatasDomisili;
        if (!tgl) return <span className="text-muted-foreground text-sm">-</span>;
        const expiringSoon = isDomicileExpiringSoon(tgl);
        return (
          <span className={expiringSoon ? "font-medium text-red-500" : ""}>
            {formatTanggal(tgl)}
            {expiringSoon && (
              <Badge variant="destructive" className="ml-2 text-xs">
                Segera Berakhir
              </Badge>
            )}
          </span>
        );
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
