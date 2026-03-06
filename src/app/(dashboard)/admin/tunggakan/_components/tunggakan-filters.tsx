"use client";

import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BULAN_NAMES } from "@/lib/utils";
import { getKategoriMasukForSelect } from "@/server/actions/tunggakan";

interface KategoriOption {
  id: number;
  namaKategori: string;
}

interface TunggakanFiltersProps {
  tahun: number;
  bulan: string;
  kategoriId: number;
  onTahunChange: (v: number) => void;
  onBulanChange: (v: string) => void;
  onKategoriChange: (v: number) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1] as const;

export function TunggakanFilters({
  tahun,
  bulan,
  kategoriId,
  onTahunChange,
  onBulanChange,
  onKategoriChange,
}: TunggakanFiltersProps) {
  const [kategoriList, setKategoriList] = useState<KategoriOption[]>([]);

  useEffect(() => {
    getKategoriMasukForSelect().then((k) => setKategoriList(k as KategoriOption[]));
  }, []);

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm">Tahun</Label>
        <Select value={String(tahun)} onValueChange={(v) => onTahunChange(Number(v))}>
          <SelectTrigger className="w-32">
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

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm">Bulan</Label>
        <Select value={bulan} onValueChange={onBulanChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BULAN_NAMES.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm">Kategori Iuran</Label>
        <Select value={kategoriId > 0 ? String(kategoriId) : ""} onValueChange={(v) => onKategoriChange(Number(v))}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Pilih kategori..." />
          </SelectTrigger>
          <SelectContent>
            {kategoriList.map((k) => (
              <SelectItem key={k.id} value={String(k.id)}>
                {k.namaKategori}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
