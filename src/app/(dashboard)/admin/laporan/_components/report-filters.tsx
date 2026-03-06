"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BULAN_NAMES } from "@/lib/utils";

interface ReportFiltersProps {
  bulanAwal: number;
  bulanAkhir: number;
  tahun: number;
  onBulanAwalChange: (v: number) => void;
  onBulanAkhirChange: (v: number) => void;
  onTahunChange: (v: number) => void;
  onFilter: () => void;
  onDownloadPDF: () => void;
  onDownloadExcel: () => void;
  loading: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];

export function ReportFilters({
  bulanAwal,
  bulanAkhir,
  tahun,
  onBulanAwalChange,
  onBulanAkhirChange,
  onTahunChange,
  onFilter,
  onDownloadPDF,
  onDownloadExcel,
  loading,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
      <div className="space-y-1">
        <Label className="text-xs">Bulan Awal</Label>
        <Select onValueChange={(v) => onBulanAwalChange(Number(v))} value={String(bulanAwal)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BULAN_NAMES.map((b, i) => (
              <SelectItem key={b} value={String(i + 1)}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Bulan Akhir</Label>
        <Select onValueChange={(v) => onBulanAkhirChange(Number(v))} value={String(bulanAkhir)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BULAN_NAMES.map((b, i) => (
              <SelectItem key={b} value={String(i + 1)}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Tahun</Label>
        <Select onValueChange={(v) => onTahunChange(Number(v))} value={String(tahun)}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button onClick={onFilter} disabled={loading}>
          {loading ? "Memuat..." : "Tampilkan"}
        </Button>
        <Button variant="outline" onClick={onDownloadPDF} disabled={loading}>
          Cetak PDF
        </Button>
        <Button variant="outline" onClick={onDownloadExcel} disabled={loading}>
          Export Excel
        </Button>
      </div>
    </div>
  );
}
