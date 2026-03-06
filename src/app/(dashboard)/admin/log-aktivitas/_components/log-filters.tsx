"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MODUL_OPTIONS = [
  { value: "semua", label: "Semua Modul" },
  { value: "Data Warga", label: "Data Warga" },
  { value: "Kategori Kas", label: "Kategori Kas" },
  { value: "Kas Masuk", label: "Kas Masuk" },
  { value: "Kas Keluar", label: "Kas Keluar" },
  { value: "Laporan", label: "Laporan" },
  { value: "Login", label: "Login" },
  { value: "Logout", label: "Logout" },
] as const;

const AKSI_OPTIONS = [
  { value: "semua", label: "Semua Aksi" },
  { value: "tambah", label: "Tambah" },
  { value: "edit", label: "Edit" },
  { value: "hapus", label: "Hapus" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
] as const;

export interface AdminOption {
  id: string;
  name: string;
}

interface LogFiltersProps {
  tanggalMulai: string;
  tanggalAkhir: string;
  modul: string;
  aksi: string;
  petugas: string;
  petugasList: AdminOption[];
  onTanggalMulaiChange: (v: string) => void;
  onTanggalAkhirChange: (v: string) => void;
  onModulChange: (v: string) => void;
  onAksiChange: (v: string) => void;
  onPetugasChange: (v: string) => void;
  onFilter: () => void;
  onReset: () => void;
  loading: boolean;
}

export function LogFilters({
  tanggalMulai,
  tanggalAkhir,
  modul,
  aksi,
  petugas,
  petugasList,
  onTanggalMulaiChange,
  onTanggalAkhirChange,
  onModulChange,
  onAksiChange,
  onPetugasChange,
  onFilter,
  onReset,
  loading,
}: LogFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
      <div className="space-y-1">
        <Label className="text-xs">Tanggal Mulai</Label>
        <Input
          type="date"
          value={tanggalMulai}
          onChange={(e) => onTanggalMulaiChange(e.target.value)}
          className="w-36"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Tanggal Akhir</Label>
        <Input
          type="date"
          value={tanggalAkhir}
          onChange={(e) => onTanggalAkhirChange(e.target.value)}
          className="w-36"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Modul</Label>
        <Select onValueChange={onModulChange} value={modul}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODUL_OPTIONS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Aksi</Label>
        <Select onValueChange={onAksiChange} value={aksi}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AKSI_OPTIONS.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Petugas</Label>
        <Select onValueChange={onPetugasChange} value={petugas}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Petugas</SelectItem>
            {petugasList.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button onClick={onFilter} disabled={loading}>
          {loading ? "Memuat..." : "Cari"}
        </Button>
        <Button variant="outline" onClick={onReset} disabled={loading}>
          Reset
        </Button>
      </div>
    </div>
  );
}
