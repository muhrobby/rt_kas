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
  tahunMulai: number;
  bulanMulai: string;
  tahunAkhir: number;
  bulanAkhir: string;
  kategoriId: number;
  tipeTagihan: "bulanan" | "sekali" | null;
  onTahunMulaiChange: (v: number) => void;
  onBulanMulaiChange: (v: string) => void;
  onTahunAkhirChange: (v: number) => void;
  onBulanAkhirChange: (v: string) => void;
  onKategoriChange: (id: number, tipe: "bulanan" | "sekali") => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1] as const;

export function TunggakanFilters({
  tahunMulai,
  bulanMulai,
  tahunAkhir,
  bulanAkhir,
  kategoriId,
  tipeTagihan,
  onTahunMulaiChange,
  onBulanMulaiChange,
  onTahunAkhirChange,
  onBulanAkhirChange,
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
          <Label className="text-sm">Tahun Mulai</Label>
          <Select value={String(tahunMulai)} onValueChange={(v) => onTahunMulaiChange(Number(v))}>
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
          <Label className="text-sm">Bulan Mulai</Label>
          <Select value={bulanMulai} onValueChange={onBulanMulaiChange}>
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

      {!isSekali && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Tahun Akhir</Label>
          <Select value={String(tahunAkhir)} onValueChange={(v) => onTahunAkhirChange(Number(v))}>
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
          <Label className="text-sm">Bulan Akhir</Label>
          <Select value={bulanAkhir} onValueChange={onBulanAkhirChange}>
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
