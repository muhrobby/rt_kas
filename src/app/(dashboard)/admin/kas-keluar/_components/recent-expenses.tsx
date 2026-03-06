"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { getRecentPengeluaran } from "@/server/actions/kas-keluar";

type ExpenseItem = {
  id: number;
  waktuTransaksi: Date;
  nominal: number;
  keterangan: string | null;
  namaKategori: string | null;
};

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pengeluaran 30 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">Belum ada pengeluaran tercatat.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                    {formatTanggal(item.waktuTransaksi)}
                  </TableCell>
                  <TableCell className="text-sm">{item.namaKategori ?? "-"}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{item.keterangan ?? "-"}</TableCell>
                  <TableCell className="text-right font-medium text-red-500">{formatRupiah(item.nominal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
