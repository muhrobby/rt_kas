"use client";

import type { PeriodOption } from "@/server/actions/warga-riwayat";

interface PeriodSelectorProps {
  periods: PeriodOption[];
  selectedBulan: number;
  selectedTahun: number;
  onPeriodChange: (bulan: number, tahun: number) => void;
}

export function PeriodSelector({ periods, selectedBulan, selectedTahun, onPeriodChange }: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((p) => {
        const isSelected = p.bulan === selectedBulan && p.tahun === selectedTahun;
        return (
          <button
            key={`${p.bulan}-${p.tahun}`}
            type="button"
            onClick={() => onPeriodChange(p.bulan, p.tahun)}
            className={`rounded-full px-4 py-1.5 font-medium text-sm transition-colors ${
              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
