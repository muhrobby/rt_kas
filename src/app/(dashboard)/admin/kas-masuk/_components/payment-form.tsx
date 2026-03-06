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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type KasMasukFormValues, kasMasukFormSchema } from "@/lib/validations/kas-masuk";
import { createPembayaran, getAlreadyPaidBulans } from "@/server/actions/kas-masuk";
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
  const [paidBulans, setPaidBulans] = useState<string[]>([]);
  const [wargaOpen, setWargaOpen] = useState(false);
  const [kategoriOpen, setKategoriOpen] = useState(false);

  const form = useForm<KasMasukFormValues, unknown, KasMasukFormValues>({
    resolver: zodResolver(kasMasukFormSchema) as never,
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

  const selectedWargaId = form.watch("wargaId");
  const selectedKategoriId = form.watch("kategoriId");
  const selectedTahun = form.watch("tahunTagihan");

  // Auto-fill nominal from kategori default
  useEffect(() => {
    const kategori = kategoriList.find((k) => k.id === selectedKategoriId);
    if (kategori?.nominalDefault && kategori.nominalDefault > 0) {
      form.setValue("nominal", kategori.nominalDefault);
    }
  }, [selectedKategoriId, kategoriList, form]);

  // Fetch already-paid months whenever warga, kategori, or tahun changes
  useEffect(() => {
    if (selectedWargaId && selectedKategoriId && selectedTahun) {
      getAlreadyPaidBulans(selectedWargaId, selectedKategoriId, selectedTahun).then((paid) => {
        setPaidBulans(paid);
        // Auto-deselect any selected months that are already paid
        const current = form.getValues("bulanTagihan");
        const filtered = current.filter((b) => !paid.includes(b));
        if (filtered.length !== current.length) {
          form.setValue("bulanTagihan", filtered);
        }
      });
    } else {
      setPaidBulans([]);
    }
  }, [selectedWargaId, selectedKategoriId, selectedTahun, form]);

  function handleKategoriCreated(kategori: { id: number; namaKategori: string; nominalDefault: number | null }) {
    setKategoriList((prev) => [...prev, kategori]);
    form.setValue("kategoriId", kategori.id);
  }

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
      setPaidBulans([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mencatat pembayaran");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Warga combobox */}
        <FormField
          control={form.control}
          name="wargaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pilih Warga</FormLabel>
              <Popover open={wargaOpen} onOpenChange={setWargaOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value
                        ? (() => {
                            const w = wargaList.find((x) => x.id === field.value);
                            return w ? `${w.namaKepalaKeluarga} — ${w.blokRumah}` : "Pilih warga...";
                          })()
                        : "Pilih warga..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Cari nama / blok..." />
                    <CommandList>
                      <CommandEmpty>Warga tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {wargaList.map((w) => (
                          <CommandItem
                            key={w.id}
                            value={`${w.namaKepalaKeluarga} ${w.blokRumah}`}
                            onSelect={() => {
                              field.onChange(w.id);
                              setWargaOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", field.value === w.id ? "opacity-100" : "opacity-0")} />
                            {w.namaKepalaKeluarga} — {w.blokRumah}
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
          {/* Kategori combobox */}
          <FormField
            control={form.control}
            name="kategoriId"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Kategori Iuran</FormLabel>
                  <QuickAddKategoriDialog jenisArus="masuk" onCreated={handleKategoriCreated} />
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
                              <Check
                                className={cn("mr-2 h-4 w-4", field.value === k.id ? "opacity-100" : "opacity-0")}
                              />
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
              <FormLabel>
                Bulan Tagihan
                {paidBulans.length > 0 && (
                  <span className="ml-2 font-normal text-green-600 text-xs dark:text-green-400">
                    ({paidBulans.length} bulan sudah dibayar)
                  </span>
                )}
              </FormLabel>
              <MonthSelector selected={field.value} onChange={field.onChange} paidBulans={paidBulans} />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Pembayaran"}
        </Button>
      </form>
    </Form>
  );
}
