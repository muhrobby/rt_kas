"use client";

import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BULAN_NAMES } from "@/lib/utils";
import { getKategoriMasukForSelect } from "@/server/actions/tunggakan";

interface KategoriOption {
  id: number;
  namaKategori: string;
  tipeTagihan: "bulanan" | "sekali";
}

interface TunggakanFiltersProps {
  tahun: number;
  bulan: string;
  kategoriId: number;
  tipeTagihan: "bulanan" | "sekali" | null;
  onTahunChange: (v: number) => void;
  onBulanChange: (v: string) => void;
  onKategoriChange: (id: number, tipe: "bulanan" | "sekali") => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1] as const;

export function TunggakanFilters({
  tahun,
  bulan,
  kategoriId,
  tipeTagihan,
  onTahunChange,
  onBulanChange,
  onKategoriChange,
}: TunggakanFiltersProps) {
  const [kategoriList, setKategoriList] = useState<KategoriOption[]>([]);

  useEffect(() => {
    getKategoriMasukForSelect().then((k) => setKategoriList(k as KategoriOption[]));
  }, []);

  const isSekali = tipeTagihan === "sekali";

  return (
    <div className="flex flex-wrap items-end gap-4">
      {!isSekali && (
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
      )}

      {!isSekali && (
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
      )}

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm">Kategori Iuran</Label>
        <Select
          value={kategoriId > 0 ? String(kategoriId) : ""}
          onValueChange={(v) => {
            const selected = kategoriList.find((k) => k.id === Number(v));
            if (selected) onKategoriChange(selected.id, selected.tipeTagihan);
          }}
        >
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
