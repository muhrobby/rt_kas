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
import { Textarea } from "@/components/ui/textarea";
import { type KasKeluarFormValues, kasKeluarFormSchema } from "@/lib/validations/kas-keluar";
import { createPengeluaran } from "@/server/actions/kas-keluar";
import { getKategoriByJenis } from "@/server/actions/kategori-kas";

interface KategoriOption {
  id: number;
  namaKategori: string;
}

interface ExpenseFormProps {
  onSuccess: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [kategoriList, setKategoriList] = useState<KategoriOption[]>([]);

  const form = useForm<KasKeluarFormValues, unknown, KasKeluarFormValues>({
    resolver: zodResolver(kasKeluarFormSchema) as never,
    defaultValues: {
      kategoriId: 0,
      tanggal: new Date().toISOString().slice(0, 10),
      nominal: 0,
      keterangan: "",
    },
  });

  useEffect(() => {
    getKategoriByJenis("keluar").then((k) => setKategoriList(k as KategoriOption[]));
  }, []);

  async function onSubmit(values: KasKeluarFormValues) {
    try {
      await createPengeluaran(values);
      toast.success("Pengeluaran berhasil dicatat");
      onSuccess();
      form.reset({
        kategoriId: 0,
        tanggal: new Date().toISOString().slice(0, 10),
        nominal: 0,
        keterangan: "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mencatat pengeluaran");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Catat Pengeluaran Operasional</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="kategoriId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Pengeluaran</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tanggal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                      <Input type="number" min={0} placeholder="150000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Misal: Beli 2 buah sapu lidi dan pengki untuk pos keamanan"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Pengeluaran"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
