"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type KasMasukFormValues, kasMasukFormSchema } from "@/lib/validations/kas-masuk";
import { createPembayaran } from "@/server/actions/kas-masuk";
import { getKategoriByJenis } from "@/server/actions/kategori-kas";
import { getWargaForSelect } from "@/server/actions/warga";

import { MonthSelector } from "./month-selector";

interface WargaOption {
  id: number;
  namaKepalaKeluarga: string;
  blokRumah: string;
}

interface KategoriOption {
  id: number;
  namaKategori: string;
  nominalDefault: number | null;
}

interface PaymentResult {
  refNumber: string;
  wargaData: WargaOption;
  kategoriData: KategoriOption;
  inserted: { id: number; bulanTagihan: string | null; nominal: number }[];
  tahunTagihan: number;
  bulanTagihan: string[];
}

interface PaymentFormProps {
  onSuccess: (result: PaymentResult) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const [wargaList, setWargaList] = useState<WargaOption[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriOption[]>([]);

  const form = useForm<KasMasukFormValues>({
    resolver: zodResolver(kasMasukFormSchema),
    defaultValues: {
      wargaId: 0,
      kategoriId: 0,
      nominal: 0,
      bulanTagihan: [],
      tahunTagihan: CURRENT_YEAR,
      keterangan: "",
    },
  });

  useEffect(() => {
    Promise.all([getWargaForSelect(), getKategoriByJenis("masuk")]).then(([w, k]) => {
      setWargaList(w as WargaOption[]);
      setKategoriList(k as KategoriOption[]);
    });
  }, []);

  const selectedKategoriId = form.watch("kategoriId");

  // Auto-fill nominal from kategori default
  useEffect(() => {
    const kategori = kategoriList.find((k) => k.id === selectedKategoriId);
    if (kategori?.nominalDefault && kategori.nominalDefault > 0) {
      form.setValue("nominal", kategori.nominalDefault);
    }
  }, [selectedKategoriId, kategoriList, form]);

  async function onSubmit(values: KasMasukFormValues) {
    try {
      const result = await createPembayaran(values);
      toast.success("Pembayaran berhasil dicatat");
      onSuccess({
        ...result,
        tahunTagihan: values.tahunTagihan,
        bulanTagihan: values.bulanTagihan,
      } as PaymentResult);
      form.reset({
        wargaId: 0,
        kategoriId: 0,
        nominal: 0,
        bulanTagihan: [],
        tahunTagihan: CURRENT_YEAR,
        keterangan: "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mencatat pembayaran");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pembayaran Iuran Warga</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="wargaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Warga</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih warga..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wargaList.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.namaKepalaKeluarga} — {w.blokRumah}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kategoriId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori Iuran</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kategoriList.map((k) => (
                          <SelectItem key={k.id} value={String(k.id)}>
                            {k.namaKategori}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nominal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominal (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="50000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tahunTagihan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YEAR_OPTIONS.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keterangan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Catatan tambahan..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bulanTagihan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bulan Tagihan</FormLabel>
                  <MonthSelector selected={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Pembayaran"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
