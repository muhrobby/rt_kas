"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type KategoriFormValues, kategoriFormSchema } from "@/lib/validations/kategori-kas";
import { createKategori, deleteKategori, updateKategori } from "@/server/actions/kategori-kas";

import type { KategoriRow } from "./columns";

interface KategoriFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: KategoriRow | null;
  onSuccess: () => void;
}

export function KategoriForm({ open, onOpenChange, editData, onSuccess }: KategoriFormProps) {
  const isEdit = !!editData;

  const form = useForm<KategoriFormValues, unknown, KategoriFormValues>({
    resolver: zodResolver(kategoriFormSchema) as never,
    defaultValues: { namaKategori: "", jenisArus: "masuk", nominalDefault: 0, tipeTagihan: "bulanan" },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editData
          ? {
              namaKategori: editData.namaKategori,
              jenisArus: editData.jenisArus,
              nominalDefault: editData.nominalDefault ?? 0,
              tipeTagihan: editData.tipeTagihan,
            }
          : { namaKategori: "", jenisArus: "masuk", nominalDefault: 0, tipeTagihan: "bulanan" },
      );
    }
  }, [open, editData, form]);

  async function onSubmit(values: KategoriFormValues) {
    try {
      if (isEdit && editData) {
        await updateKategori(editData.id, values);
        toast.success("Kategori berhasil diperbarui");
      } else {
        await createKategori(values);
        toast.success("Kategori baru berhasil ditambahkan");
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan kategori");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Kategori Kas" : "Tambah Kategori Kas"}</DialogTitle>
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
                    <Input placeholder="Iuran Keamanan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jenisArus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Arus</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis arus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="masuk">Masuk (Pemasukan)</SelectItem>
                      <SelectItem value="keluar">Keluar (Pengeluaran)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="nominalDefault"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominal Default (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteKategoriDialogProps {
  kategori: KategoriRow | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteKategoriDialog({ kategori, onOpenChange, onSuccess }: DeleteKategoriDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!kategori) return;
    setLoading(true);
    try {
      await deleteKategori(kategori.id);
      toast.success(`Kategori "${kategori.namaKategori}" berhasil dihapus`);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus kategori");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={!!kategori} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kategori Kas</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus kategori <span className="font-semibold">{kategori?.namaKategori}</span>?
            Kategori yang sudah dipakai dalam transaksi tidak dapat dihapus.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
          >
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
