"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";

import { cn, formatRupiah } from "@/lib/utils";
import type { PaymentGridByKategori } from "@/server/actions/warga-riwayat";

const BULAN_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"] as const;

interface PaymentHistoryProps {
  grids: PaymentGridByKategori[];
  selectedYear: number;
  onKuitansiClick: (transaksiId: number) => void;
}

export function PaymentHistory({ grids, selectedYear, onKuitansiClick }: PaymentHistoryProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (grids.length === 0) {
    return (
      <div className="rounded-xl border py-12 text-center text-muted-foreground text-sm">
        Tidak ada data iuran untuk tahun {selectedYear}.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grids.map((grid) => (
        <div key={grid.kategoriId} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">{grid.namaKategori}</h3>
            <span className="text-muted-foreground text-xs">{formatRupiah(grid.nominalDefault)} / bulan</span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {grid.months.map((m) => {
              const isFuture = selectedYear === currentYear && m.bulan > currentMonth;
              const isCurrentMonth = selectedYear === currentYear && m.bulan === currentMonth;

              if (isFuture) {
                return (
                  <div
                    key={m.bulan}
                    className="flex flex-col items-center gap-1 rounded-lg bg-muted/40 px-1 py-2 opacity-50"
                  >
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">{BULAN_SHORT[m.bulan - 1]}</span>
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
                      "flex flex-col items-center gap-1 rounded-lg bg-green-50 px-1 py-2 transition-colors hover:bg-green-100",
                      isCurrentMonth && "ring-2 ring-green-400",
                    )}
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700 text-xs">{BULAN_SHORT[m.bulan - 1]}</span>
                  </button>
                );
              }

              return (
                <div
                  key={m.bulan}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg bg-red-50 px-1 py-2",
                    isCurrentMonth && "ring-2 ring-red-400",
                  )}
                >
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-600 text-xs">{BULAN_SHORT[m.bulan - 1]}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 border-t pt-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <span className="text-muted-foreground text-xs">Lunas (tap untuk kuitansi)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-red-500" />
              <span className="text-muted-foreground text-xs">Belum bayar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">Belum jatuh tempo</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
