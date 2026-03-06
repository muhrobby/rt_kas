"use client";

import { useEffect, useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { formatRupiah } from "@/lib/utils";
import { getRecentPemasukan } from "@/server/actions/kas-masuk";

type RecentItem = {
  id: number;
  waktuTransaksi: Date;
  nominal: number;
  bulanTagihan: string | null;
  tahunTagihan: number | null;
  namaWarga: string | null;
  blokRumah: string | null;
  namaKategori: string | null;
};

const columns: ColumnDef<RecentItem>[] = [
  {
    accessorKey: "waktuTransaksi",
    header: "Waktu",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {new Date(row.original.waktuTransaksi).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    ),
  },
  {
    accessorKey: "namaWarga",
    header: "Warga",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.namaWarga ?? "-"}</div>
        <div className="text-muted-foreground text-xs">{row.original.blokRumah}</div>
      </div>
    ),
  },
  {
    accessorKey: "namaKategori",
    header: "Kategori",
    cell: ({ row }) => <span>{row.original.namaKategori ?? "-"}</span>,
  },
  {
    id: "bulan",
    header: "Bulan",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.bulanTagihan} {row.original.tahunTagihan}
      </span>
    ),
  },
  {
    accessorKey: "nominal",
    header: "Nominal",
    cell: ({ row }) => <span className="font-medium text-green-600">{formatRupiah(row.original.nominal)}</span>,
  },
];

interface RecentHistoryProps {
  refreshKey?: number;
}

export function RecentHistory({ refreshKey }: RecentHistoryProps) {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // refreshKey is intentionally used as a dependency to re-fetch on demand
  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey triggers refetch
  useEffect(() => {
    setLoading(true);
    getRecentPemasukan()
      .then((res) => setItems(res as RecentItem[]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const table = useDataTableInstance({ data: items, columns, enableRowSelection: false, defaultPageSize: 10 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">50 Pembayaran Terakhir</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            {["sk-1", "sk-2", "sk-3"].map((k) => (
              <Skeleton key={k} className="h-8 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">Belum ada riwayat pembayaran.</p>
        ) : (
          <div className="flex flex-col gap-4 py-4">
            <DataTable table={table} columns={columns} />
            <DataTablePagination table={table} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
