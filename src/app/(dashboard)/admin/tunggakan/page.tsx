"use client";

import { useEffect, useState } from "react";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BULAN_NAMES } from "@/lib/utils";
import { getTunggakan, type TunggakanRow } from "@/server/actions/tunggakan";

import { TunggakanFilters } from "./_components/tunggakan-filters";
import { TunggakanTable } from "./_components/tunggakan-table";

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_BULAN = BULAN_NAMES[new Date().getMonth()] ?? "Januari";

export default function TunggakanPage() {
  const [selectedTahunMulai, setSelectedTahunMulai] = useState(CURRENT_YEAR);
  const [selectedBulanMulai, setSelectedBulanMulai] = useState<string>(CURRENT_BULAN);
  const [selectedTahunAkhir, setSelectedTahunAkhir] = useState(CURRENT_YEAR);
  const [selectedBulanAkhir, setSelectedBulanAkhir] = useState<string>(CURRENT_BULAN);
  const [selectedKategoriId, setSelectedKategoriId] = useState(0);
  const [selectedTipeTagihan, setSelectedTipeTagihan] = useState<"bulanan" | "sekali" | null>(null);
  const [data, setData] = useState<TunggakanRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  function handleKategoriChange(id: number, tipe: "bulanan" | "sekali") {
    setSelectedKategoriId(id);
    setSelectedTipeTagihan(tipe);
    setFetched(false);
    setData([]);
  }

  useEffect(() => {
    if (!selectedKategoriId || !selectedTipeTagihan) return;
    setLoading(true);
    setFetched(false);
    getTunggakan({
      kategoriId: selectedKategoriId,
      tipeTagihan: selectedTipeTagihan,
      tahunMulai: selectedTahunMulai,
      bulanMulai: selectedBulanMulai,
      tahunAkhir: selectedTahunAkhir,
      bulanAkhir: selectedBulanAkhir,
    })
      .then((rows) => {
        setData(rows);
        setFetched(true);
      })
      .finally(() => setLoading(false));
  }, [
    selectedTahunMulai,
    selectedBulanMulai,
    selectedTahunAkhir,
    selectedBulanAkhir,
    selectedKategoriId,
    selectedTipeTagihan,
  ]);

  const cardTitle =
    selectedTipeTagihan === "sekali"
      ? "Warga Belum Bayar — Event Sekali Bayar"
      : `Warga Belum Bayar — ${selectedBulanMulai} ${selectedTahunMulai} s/d ${selectedBulanAkhir} ${selectedTahunAkhir}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Tunggakan Iuran</h1>
        <p className="text-muted-foreground text-sm">Daftar warga yang belum membayar iuran untuk periode tertentu.</p>
      </div>

      <TunggakanFilters
        tahunMulai={selectedTahunMulai}
        bulanMulai={selectedBulanMulai}
        tahunAkhir={selectedTahunAkhir}
        bulanAkhir={selectedBulanAkhir}
        kategoriId={selectedKategoriId}
        tipeTagihan={selectedTipeTagihan}
        onTahunMulaiChange={setSelectedTahunMulai}
        onBulanMulaiChange={setSelectedBulanMulai}
        onTahunAkhirChange={setSelectedTahunAkhir}
        onBulanAkhirChange={setSelectedBulanAkhir}
        onKategoriChange={handleKategoriChange}
      />

      {!selectedKategoriId && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {selectedTipeTagihan === "sekali"
              ? "Pilih kategori iuran untuk melihat data tunggakan event."
              : "Pilih periode mulai, periode akhir, dan kategori iuran untuk melihat data tunggakan."}
          </AlertDescription>
        </Alert>
      )}

      {selectedKategoriId > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">{cardTitle}</CardTitle>
            {fetched && !loading && (
              <Badge variant={data.length === 0 ? "default" : "destructive"}>{data.length} warga</Badge>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-2 p-4">
                {["sk-1", "sk-2", "sk-3", "sk-4"].map((k) => (
                  <Skeleton key={k} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="p-4">
                <TunggakanTable data={data} tipeTagihan={selectedTipeTagihan} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
