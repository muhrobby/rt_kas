"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { getTodayPemasukan } from "@/server/actions/kas-masuk";

type TodayItem = {
  id: number;
  waktuTransaksi: Date;
  nominal: number;
  bulanTagihan: string | null;
  tahunTagihan: number | null;
  namaWarga: string | null;
  blokRumah: string | null;
  namaKategori: string | null;
};

interface TodayHistoryProps {
  refreshKey?: number;
}

export function TodayHistory({ refreshKey }: TodayHistoryProps) {
  const [items, setItems] = useState<TodayItem[]>([]);
  const [loading, setLoading] = useState(true);

  // refreshKey is intentionally used as a dependency to re-fetch on demand
  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey triggers refetch
  useEffect(() => {
    setLoading(true);
    getTodayPemasukan()
      .then((res) => setItems(res as TodayItem[]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pembayaran Hari Ini</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">Belum ada pembayaran hari ini.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jam</TableHead>
                <TableHead>Warga</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Bulan</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(item.waktuTransaksi).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.namaWarga ?? "-"}</div>
                    <div className="text-muted-foreground text-xs">{item.blokRumah}</div>
                  </TableCell>
                  <TableCell>{item.namaKategori ?? "-"}</TableCell>
                  <TableCell className="text-sm">
                    {item.bulanTagihan} {item.tahunTagihan}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">{formatRupiah(item.nominal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
