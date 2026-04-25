"use client";

import { ChevronDown } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PeriodOption } from "@/server/actions/warga-riwayat";

interface PeriodSelectorProps {
  periods: PeriodOption[];
  selectedBulan: number;
  selectedTahun: number;
  onPeriodChange: (bulan: number, tahun: number) => void;
  loading?: boolean;
}

export function PeriodSelector({
  periods,
  selectedBulan,
  selectedTahun,
  onPeriodChange,
  loading = false,
}: PeriodSelectorProps) {
  const selectedPeriod = periods.find((p) => p.bulan === selectedBulan && p.tahun === selectedTahun);

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-sm">Pilih periode</p>
          <p className="text-muted-foreground text-xs">{periods.length} periode tersedia</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground text-xs">
          {selectedPeriod ? selectedPeriod.label : "Periode aktif"}
        </span>
      </div>

      <Select
        value={selectedPeriod ? `${selectedPeriod.bulan}-${selectedPeriod.tahun}` : undefined}
        onValueChange={(value) => {
          const [bulan, tahun] = value.split("-").map(Number);
          onPeriodChange(bulan, tahun);
        }}
        disabled={loading}
      >
        <SelectTrigger aria-label="Pilih periode riwayat pembayaran" className={cn("w-full")}>
          <SelectValue placeholder="Pilih bulan dan tahun" />
        </SelectTrigger>
        <SelectContent>
          {periods.map((p) => (
            <SelectItem key={`${p.bulan}-${p.tahun}`} value={`${p.bulan}-${p.tahun}`}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
        <span>Pilih satu periode untuk melihat status dan e-kuitansi.</span>
      </div>
    </div>
  );
}
