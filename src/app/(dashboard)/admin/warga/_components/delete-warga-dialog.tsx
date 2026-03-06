"use client";

import { useState } from "react";

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
import { deleteWarga } from "@/server/actions/warga";

import type { WargaRow } from "./columns";

interface DeleteWargaDialogProps {
  warga: WargaRow | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteWargaDialog({ warga, onOpenChange, onSuccess }: DeleteWargaDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!warga) return;
    setLoading(true);
    try {
      await deleteWarga(warga.id);
      toast.success(`Data warga ${warga.namaKepalaKeluarga} berhasil dihapus`);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus warga");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={!!warga} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Data Warga</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data warga{" "}
            <span className="font-semibold">{warga?.namaKepalaKeluarga}</span> ({warga?.blokRumah})? Tindakan ini tidak
            dapat dibatalkan.
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
