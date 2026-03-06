"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { formatWaktu } from "@/lib/utils";

type AksiType = "tambah" | "edit" | "hapus" | "login" | "logout";

export interface LogRow {
  id: number;
  waktuLog: Date;
  userId: string;
  petugasName: string;
  modul: string;
  aksi: AksiType;
  keterangan: string;
}

const AKSI_VARIANT: Record<AksiType, "default" | "secondary" | "destructive" | "outline"> = {
  tambah: "default",
  edit: "secondary",
  hapus: "destructive",
  login: "outline",
  logout: "outline",
};

const AKSI_LABEL: Record<AksiType, string> = {
  tambah: "Tambah",
  edit: "Edit",
  hapus: "Hapus",
  login: "Login",
  logout: "Logout",
};

export const logColumns: ColumnDef<LogRow>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.index + 1}</span>,
    size: 48,
  },
  {
    accessorKey: "waktuLog",
    header: "Waktu",
    cell: ({ row }) => <span className="whitespace-nowrap text-sm">{formatWaktu(row.original.waktuLog)}</span>,
  },
  {
    accessorKey: "petugasName",
    header: "Petugas",
    cell: ({ row }) => <span className="text-sm">{row.original.petugasName}</span>,
  },
  {
    accessorKey: "modul",
    header: "Modul",
    cell: ({ row }) => <span className="text-sm">{row.original.modul}</span>,
  },
  {
    accessorKey: "aksi",
    header: "Aksi",
    cell: ({ row }) => <Badge variant={AKSI_VARIANT[row.original.aksi]}>{AKSI_LABEL[row.original.aksi]}</Badge>,
  },
  {
    accessorKey: "keterangan",
    header: "Deskripsi",
    cell: ({ row }) => <span className="text-sm">{row.original.keterangan}</span>,
  },
];
