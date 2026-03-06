import { CheckCircle2, XCircle } from "lucide-react";

import { cn, formatRupiah } from "@/lib/utils";
import type { BillingStatusItem } from "@/server/actions/warga-dashboard";

interface BillingStatusCardProps {
  items: BillingStatusItem[];
  month: number;
  year: number;
}

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export function BillingStatusCard({ items, month, year }: BillingStatusCardProps) {
  const allLunas = items.length > 0 && items.every((i) => i.lunas);
  const bulanLabel = BULAN_NAMES[month - 1] ?? "";

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="font-medium text-sm">
          Tagihan {bulanLabel} {year}
        </p>
        <p className="mt-2 text-muted-foreground text-sm">Belum ada kategori iuran yang aktif.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm",
        allLunas ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50",
      )}
    >
      <p className={cn("font-medium text-sm", allLunas ? "text-green-800" : "text-red-800")}>
        Tagihan {bulanLabel} {year}
      </p>

      <div className="mt-3 flex items-center gap-2">
        {allLunas ? <CheckCircle2 className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-red-600" />}
        <span className={cn("font-bold text-2xl tracking-tight", allLunas ? "text-green-700" : "text-red-700")}>
          {allLunas ? "LUNAS" : "BELUM LUNAS"}
        </span>
      </div>

      <div className="mt-4 space-y-2 border-t pt-3">
        {items.map((item) => (
          <div key={item.kategoriId} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.lunas ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-red-500" />
              )}
              <span className={cn("text-sm", allLunas ? "text-green-800" : "text-gray-700")}>{item.namaKategori}</span>
            </div>
            <span className={cn("font-medium text-sm", item.lunas ? "text-green-700" : "text-red-600")}>
              {formatRupiah(item.nominalDefault)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
