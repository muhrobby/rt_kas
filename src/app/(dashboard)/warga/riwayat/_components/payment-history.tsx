"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";

import { BULAN_NAMES, cn, formatRupiah } from "@/lib/utils";
import type { PaymentGridByKategori } from "@/server/actions/warga-riwayat";

interface PaymentHistoryProps {
  grids: PaymentGridByKategori[];
  selectedBulan: number;
  selectedTahun: number;
  onKuitansiClick: (transaksiId: number) => void;
}

export function PaymentHistory({ grids, selectedBulan, selectedTahun, onKuitansiClick }: PaymentHistoryProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (grids.length === 0) {
    return (
      <div className="rounded-xl border py-12 text-center text-muted-foreground text-sm">
        Tidak ada data iuran untuk {BULAN_NAMES[selectedBulan - 1]} {selectedTahun}.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grids.map((grid) => {
        // ── Sekali Bayar card ──────────────────────────────────────────
        if (grid.tipeTagihan === "sekali") {
          const txId = grid.sekaliTransaksiId;
          return (
            <div key={grid.kategoriId} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{grid.namaKategori}</h3>
                <span className="text-muted-foreground text-xs">
                  {formatRupiah(grid.nominalDefault)} · Sekali Bayar
                </span>
              </div>

              {grid.sekaliLunas && txId ? (
                <button
                  type="button"
                  onClick={() => onKuitansiClick(txId)}
                  className="flex w-full items-center gap-3 rounded-lg bg-green-50 px-4 py-3 transition-colors hover:bg-green-100"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-green-700 text-sm">Sudah Lunas</p>
                    <p className="text-green-600 text-xs">Tap untuk lihat kuitansi</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3">
                  <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                  <p className="font-medium text-red-600 text-sm">Belum Dibayar</p>
                </div>
              )}
            </div>
          );
        }

        // ── Bulanan grid ───────────────────────────────────────────────
        return (
          <div key={grid.kategoriId} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{grid.namaKategori}</h3>
              <span className="text-muted-foreground text-xs">{formatRupiah(grid.nominalDefault)} / bulan</span>
            </div>

            <div className="flex flex-col gap-2">
              {grid.months.map((m) => {
                const isFuture = selectedTahun === currentYear && selectedBulan === m.bulan && m.bulan > currentMonth;
                const isCurrentMonth = selectedTahun === currentYear && m.bulan === currentMonth;

                if (isFuture) {
                  return (
                    <div key={m.bulan} className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-3 opacity-50">
                      <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <p className="font-medium text-muted-foreground text-sm">Belum jatuh tempo</p>
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
                        "flex w-full items-center gap-3 rounded-lg bg-green-50 px-4 py-3 transition-colors hover:bg-green-100",
                        isCurrentMonth && "ring-2 ring-green-400",
                      )}
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                      <div className="text-left">
                        <p className="font-medium text-green-700 text-sm">Sudah Lunas</p>
                        <p className="text-green-600 text-xs">Tap untuk lihat kuitansi</p>
                      </div>
                    </button>
                  );
                }

                return (
                  <div
                    key={m.bulan}
                    className={cn(
                      "flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3",
                      isCurrentMonth && "ring-2 ring-red-400",
                    )}
                  >
                    <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                    <p className="font-medium text-red-600 text-sm">Belum Dibayar</p>
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
