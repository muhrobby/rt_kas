"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { QuickAddKategoriDialog } from "@/components/quick-add-kategori-dialog";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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
  const [kategoriOpen, setKategoriOpen] = useState(false);

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

  function handleKategoriCreated(kategori: { id: number; namaKategori: string; nominalDefault: number | null }) {
    setKategoriList((prev) => [...prev, { id: kategori.id, namaKategori: kategori.namaKategori }]);
    form.setValue("kategoriId", kategori.id);
  }

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Kategori combobox */}
        <FormField
          control={form.control}
          name="kategoriId"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Kategori Pengeluaran</FormLabel>
                <QuickAddKategoriDialog jenisArus="keluar" onCreated={handleKategoriCreated} />
              </div>
              <Popover open={kategoriOpen} onOpenChange={setKategoriOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value
                        ? (kategoriList.find((k) => k.id === field.value)?.namaKategori ?? "Pilih kategori...")
                        : "Pilih kategori..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Cari kategori..." />
                    <CommandList>
                      <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {kategoriList.map((k) => (
                          <CommandItem
                            key={k.id}
                            value={k.namaKategori}
                            onSelect={() => {
                              field.onChange(k.id);
                              setKategoriOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", field.value === k.id ? "opacity-100" : "opacity-0")} />
                            {k.namaKategori}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
  );
}
