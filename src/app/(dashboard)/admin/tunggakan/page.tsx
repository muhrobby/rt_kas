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
  const [selectedTahun, setSelectedTahun] = useState(CURRENT_YEAR);
  const [selectedBulan, setSelectedBulan] = useState<string>(CURRENT_BULAN);
  const [selectedKategoriId, setSelectedKategoriId] = useState(0);
  const [data, setData] = useState<TunggakanRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!selectedKategoriId) return;
    setLoading(true);
    setFetched(false);
    getTunggakan({ tahunTagihan: selectedTahun, bulanTagihan: selectedBulan, kategoriId: selectedKategoriId })
      .then((rows) => {
        setData(rows);
        setFetched(true);
      })
      .finally(() => setLoading(false));
  }, [selectedTahun, selectedBulan, selectedKategoriId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Tunggakan Iuran</h1>
        <p className="text-muted-foreground text-sm">Daftar warga yang belum membayar iuran untuk periode tertentu.</p>
      </div>

      <TunggakanFilters
        tahun={selectedTahun}
        bulan={selectedBulan}
        kategoriId={selectedKategoriId}
        onTahunChange={setSelectedTahun}
        onBulanChange={setSelectedBulan}
        onKategoriChange={setSelectedKategoriId}
      />

      {!selectedKategoriId && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Pilih tahun, bulan, dan kategori iuran untuk melihat data tunggakan.</AlertDescription>
        </Alert>
      )}

      {selectedKategoriId > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">
              Warga Belum Bayar — {selectedBulan} {selectedTahun}
            </CardTitle>
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
                <TunggakanTable data={data} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
