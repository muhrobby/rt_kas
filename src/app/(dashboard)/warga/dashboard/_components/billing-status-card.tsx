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
  const unpaidCount = items.filter((item) => !item.lunas).length;
  const bulanLabel = BULAN_NAMES[month - 1] ?? "";

  if (items.length === 0) {
    return (
      <section aria-live="polite" className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="font-medium text-sm">Status iuran warga</p>
        <p className="mt-1 text-muted-foreground text-sm">
          {bulanLabel} {year}
        </p>
        <p className="mt-3 rounded-lg border border-dashed px-3 py-2 text-muted-foreground text-sm">
          Belum ada kategori iuran aktif untuk ditampilkan.
        </p>
      </section>
    );
  }

  return (
    <section aria-live="polite" className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="font-medium text-sm">Status iuran warga</p>
      <p className="mt-1 text-muted-foreground text-sm">
        {bulanLabel} {year}
      </p>

      <div
        className={cn(
          "mt-3 rounded-xl border px-3 py-3",
          allLunas ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50",
        )}
      >
        <div className="flex items-center gap-2">
          {allLunas ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <XCircle className="h-5 w-5 text-amber-700" />
          )}
          <span className={cn("font-semibold text-sm", allLunas ? "text-emerald-800" : "text-amber-900")}>
            {allLunas ? "Semua iuran sudah lunas" : `Masih ada ${unpaidCount} iuran belum dibayar`}
          </span>
        </div>
      </div>

      <ul className="mt-4 space-y-2 border-t pt-3" aria-label="Daftar status iuran per kategori">
        {items.map((item) => (
          <li key={item.kategoriId} className="flex items-start justify-between gap-3 rounded-lg border px-3 py-2">
            <div className="flex items-start gap-2">
              {item.lunas ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              )}
              <div>
                <p className="font-medium text-foreground text-sm">{item.namaKategori}</p>
                <p className="text-muted-foreground text-xs">{item.lunas ? "Lunas" : "Belum dibayar"}</p>
              </div>
            </div>
            <span
              className={cn(
                "whitespace-nowrap font-medium text-sm",
                item.lunas ? "text-emerald-700" : "text-amber-700",
              )}
            >
              {formatRupiah(item.nominalDefault)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
