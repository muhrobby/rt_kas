"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type KategoriFormValues, kategoriFormSchema } from "@/lib/validations/kategori-kas";
import { createKategori } from "@/server/actions/kategori-kas";

interface QuickAddKategoriDialogProps {
  /** "masuk" untuk Kas Masuk, "keluar" untuk Kas Keluar */
  jenisArus: "masuk" | "keluar";
  /** Dipanggil setelah kategori berhasil dibuat, membawa id, nama, nominal, dan tipeTagihan */
  onCreated: (kategori: {
    id: number;
    namaKategori: string;
    nominalDefault: number | null;
    tipeTagihan: "bulanan" | "sekali";
  }) => void;
}

export function QuickAddKategoriDialog({ jenisArus, onCreated }: QuickAddKategoriDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<KategoriFormValues, unknown, KategoriFormValues>({
    resolver: zodResolver(kategoriFormSchema) as never,
    defaultValues: {
      namaKategori: "",
      jenisArus,
      nominalDefault: 0,
      tipeTagihan: "bulanan",
    },
  });

  async function onSubmit(values: KategoriFormValues) {
    try {
      const created = await createKategori(values);
      if (!created) throw new Error("Gagal membuat kategori");
      toast.success(`Kategori "${created.namaKategori}" berhasil ditambahkan`);
      onCreated({
        id: created.id,
        namaKategori: created.namaKategori,
        nominalDefault: created.nominalDefault ?? null,
        tipeTagihan: created.tipeTagihan,
      });
      setOpen(false);
      form.reset({ namaKategori: "", jenisArus, nominalDefault: 0, tipeTagihan: "bulanan" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat kategori");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
          <Plus className="h-3 w-3" />
          Kategori Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Tambah Kategori {jenisArus === "masuk" ? "Iuran" : "Pengeluaran"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="namaKategori"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kategori</FormLabel>
                  <FormControl>
                    <Input placeholder={jenisArus === "masuk" ? "Iuran Kebersihan" : "Biaya Listrik Pos"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {jenisArus === "masuk" && (
              <FormField
                control={form.control}
                name="tipeTagihan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Tagihan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe tagihan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bulanan">Bulanan (Iuran Rutin)</SelectItem>
                        <SelectItem value="sekali">Sekali Bayar (Event / Insidental)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="nominalDefault"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominal Default (Rp) — Opsional</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
