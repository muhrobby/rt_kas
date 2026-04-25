"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BULAN_NAMES, cn, formatRupiah } from "@/lib/utils";
import type { PaymentGridByKategori } from "@/server/actions/warga-riwayat";

interface PaymentHistoryProps {
  grids: PaymentGridByKategori[];
  selectedBulan: number;
  selectedTahun: number;
  onKuitansiClick: (transaksiId: number) => void;
  loading?: boolean;
  errorMessage?: string | null;
}

export function PaymentHistory({
  grids,
  selectedBulan,
  selectedTahun,
  onKuitansiClick,
  loading = false,
  errorMessage = null,
}: PaymentHistoryProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (loading) {
    return <PaymentHistorySkeleton />;
  }

  if (errorMessage) {
    return <PaymentHistoryError message={errorMessage} />;
  }

  if (grids.length === 0) {
    return <PaymentHistoryEmpty selectedBulan={selectedBulan} selectedTahun={selectedTahun} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="default" className="bg-green-600 text-white hover:bg-green-600">
          Lunas
        </Badge>
        <Badge variant="outline" className="border-red-200 text-red-600">
          Belum bayar
        </Badge>
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Belum jatuh tempo
        </Badge>
      </div>

      {grids.map((grid) => {
        if (grid.tipeTagihan === "sekali") {
          const txId = grid.sekaliTransaksiId;
          return (
            <div key={grid.kategoriId} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-sm">{grid.namaKategori}</h3>
                  <p className="text-muted-foreground text-xs">{formatRupiah(grid.nominalDefault)} · Sekali bayar</p>
                </div>
                <Badge
                  variant={grid.sekaliLunas ? "default" : "outline"}
                  className={
                    grid.sekaliLunas ? "bg-green-600 text-white hover:bg-green-600" : "border-red-200 text-red-600"
                  }
                >
                  {grid.sekaliLunas ? "Lunas" : "Belum dibayar"}
                </Badge>
              </div>

              {grid.sekaliLunas && txId ? (
                <button
                  type="button"
                  onClick={() => onKuitansiClick(txId)}
                  className="flex w-full items-center gap-3 rounded-lg bg-green-50 px-4 py-3 transition-colors hover:bg-green-100"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-green-700 text-sm">Sudah lunas</p>
                    <p className="text-green-600 text-xs">Lihat e-kuitansi</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3">
                  <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                  <div>
                    <p className="font-medium text-red-600 text-sm">Belum dibayar</p>
                    <p className="text-red-500 text-xs">Status belum terbayar untuk kategori ini</p>
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={grid.kategoriId} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-sm">{grid.namaKategori}</h3>
                <p className="text-muted-foreground text-xs">{formatRupiah(grid.nominalDefault)} / bulan</p>
              </div>
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                Bulanan
              </Badge>
            </div>

            <div className="flex flex-col gap-2">
              {grid.months.map((m) => {
                const isFuture =
                  (selectedTahun > currentYear && m.bulan >= selectedBulan) ||
                  (selectedTahun === currentYear && selectedBulan === m.bulan && m.bulan > currentMonth);
                const isCurrentMonth = selectedTahun === currentYear && m.bulan === currentMonth;

                if (isFuture) {
                  return (
                    <div
                      key={m.bulan}
                      className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-4 py-3 opacity-70"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-muted-foreground text-sm">Belum jatuh tempo</p>
                          <p className="text-muted-foreground text-xs">{BULAN_NAMES[m.bulan - 1]}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        Menunggu
                      </Badge>
                    </div>
                  );
                }

                if (m.lunas && m.transaksiId) {
                  const txId = m.transaksiId;
                  return (
                    <button
                      key={m.bulan}
                      type="button"
                      onClick={() => onKuitansiClick(txId)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg bg-green-50 px-4 py-3 transition-colors hover:bg-green-100 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isCurrentMonth && "ring-2 ring-green-400",
                      )}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                        <div>
                          <p className="font-medium text-green-700 text-sm">Sudah lunas</p>
                          <p className="text-green-600 text-xs">{BULAN_NAMES[m.bulan - 1]}</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-600 text-white hover:bg-green-600">
                        Lihat e-kuitansi
                      </Badge>
                    </button>
                  );
                }

                return (
                  <div
                    key={m.bulan}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg bg-red-50 px-4 py-3",
                      isCurrentMonth && "ring-2 ring-red-400",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                      <div>
                        <p className="font-medium text-red-600 text-sm">Belum dibayar</p>
                        <p className="text-red-500 text-xs">{BULAN_NAMES[m.bulan - 1]}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-red-200 text-red-600">
                      Perlu dibayar
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PaymentHistorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

function PaymentHistoryEmpty({ selectedBulan, selectedTahun }: { selectedBulan: number; selectedTahun: number }) {
  return (
    <div className="rounded-xl border bg-card py-12 text-center shadow-sm">
      <p className="font-medium text-sm">Tidak ada data iuran</p>
      <p className="mt-2 text-muted-foreground text-sm">
        Tidak ada data iuran untuk {BULAN_NAMES[selectedBulan - 1]} {selectedTahun}.
      </p>
      <p className="mt-3 text-muted-foreground text-xs">
        Coba pilih periode lain untuk melihat riwayat pembayaran yang tersedia.
      </p>
    </div>
  );
}

function PaymentHistoryError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 py-12 text-center shadow-sm">
      <p className="font-medium text-red-700 text-sm">Data gagal dimuat</p>
      <p className="mt-2 px-6 text-red-600 text-sm">{message}</p>
      <p className="mt-3 text-red-500 text-xs">Silakan pilih periode lain atau coba lagi beberapa saat kemudian.</p>
    </div>
  );
}
