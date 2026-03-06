"use client";

import { useEffect, useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { getRecentPengeluaran } from "@/server/actions/kas-keluar";

type ExpenseItem = {
  id: number;
  waktuTransaksi: Date;
  nominal: number;
  keterangan: string | null;
  namaKategori: string | null;
};

const columns: ColumnDef<ExpenseItem>[] = [
  {
    accessorKey: "waktuTransaksi",
    header: "Tanggal",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground text-sm">
        {formatTanggal(row.original.waktuTransaksi)}
      </span>
    ),
  },
  {
    accessorKey: "namaKategori",
    header: "Kategori",
    cell: ({ row }) => <span className="text-sm">{row.original.namaKategori ?? "-"}</span>,
  },
  {
    accessorKey: "keterangan",
    header: "Keterangan",
    cell: ({ row }) => <span className="max-w-xs truncate text-sm">{row.original.keterangan ?? "-"}</span>,
  },
  {
    accessorKey: "nominal",
    header: "Nominal",
    cell: ({ row }) => <span className="font-medium text-red-500">{formatRupiah(row.original.nominal)}</span>,
  },
];

interface RecentExpensesProps {
  refreshKey?: number;
}

export function RecentExpenses({ refreshKey }: RecentExpensesProps) {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey triggers refetch
  useEffect(() => {
    setLoading(true);
    getRecentPengeluaran()
      .then((res) => setItems(res as ExpenseItem[]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const table = useDataTableInstance({ data: items, columns, enableRowSelection: false, defaultPageSize: 10 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pengeluaran 30 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            {["sk-1", "sk-2", "sk-3", "sk-4"].map((k) => (
              <Skeleton key={k} className="h-8 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">Belum ada pengeluaran tercatat.</p>
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
