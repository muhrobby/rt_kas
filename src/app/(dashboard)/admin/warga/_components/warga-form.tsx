"use client";

import React, { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type WargaFormValues, wargaFormSchema } from "@/lib/validations/warga";
import { createWarga, updateWarga } from "@/server/actions/warga";

import type { WargaRow } from "./columns";

interface WargaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: WargaRow | null;
  onSuccess: () => void;
}

export function WargaForm({ open, onOpenChange, editData, onSuccess }: WargaFormProps) {
  const isEdit = !!editData;

  const form = useForm<WargaFormValues>({
    resolver: zodResolver(wargaFormSchema),
    defaultValues: {
      namaKepalaKeluarga: "",
      blokRumah: "",
      noTelp: "",
      statusHunian: "tetap",
      tglBatasDomisili: null,
    },
  });

  const statusHunian = form.watch("statusHunian");

  useEffect(() => {
    if (open) {
      if (editData) {
        form.reset({
          namaKepalaKeluarga: editData.namaKepalaKeluarga,
          blokRumah: editData.blokRumah,
          noTelp: editData.noTelp,
          statusHunian: editData.statusHunian,
          tglBatasDomisili: editData.tglBatasDomisili ?? null,
        });
      } else {
        form.reset({
          namaKepalaKeluarga: "",
          blokRumah: "",
          noTelp: "",
          statusHunian: "tetap",
          tglBatasDomisili: null,
        });
      }
    }
  }, [open, editData, form]);

  async function onSubmit(values: WargaFormValues) {
    try {
      if (isEdit && editData) {
        await updateWarga(editData.id, values);
        toast.success("Data warga berhasil diperbarui");
      } else {
        const result = await createWarga(values);
        toast.success(
          `Warga baru berhasil ditambahkan. Akun login: username "${result.noTelp}", password "${result.defaultPassword}"`,
          { duration: 8000 },
        );
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan data warga");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Data Warga" : "Tambah Warga Baru"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="namaKepalaKeluarga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kepala Keluarga</FormLabel>
                  <FormControl>
                    <Input placeholder="Bpk. Ahmad Sudarto" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="blokRumah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blok Rumah</FormLabel>
                    <FormControl>
                      <Input placeholder="A1" autoCapitalize="characters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noTelp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Telepon / WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="081234567890" type="tel" inputMode="numeric" autoComplete="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="statusHunian"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Hunian</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status hunian" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tetap">Tetap</SelectItem>
                      <SelectItem value="kontrak">Kontrak / Domisili</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {statusHunian === "kontrak" && (
              <FormField
                control={form.control}
                name="tglBatasDomisili"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Batas Domisili</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
