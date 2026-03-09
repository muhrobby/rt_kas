"use client";

import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deletePengurus } from "@/server/actions/pengurus";

import type { PengurusRow } from "./columns";

interface Props {
  pengurus: PengurusRow | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeletePengurusDialog({ pengurus, onOpenChange, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const confirmDelete = async () => {
    if (!pengurus) return;
    setSubmitting(true);
    try {
      await deletePengurus(pengurus.id);
      toast.success("Akses pengurus berhasil dicabut.");
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Gagal menghapus pengurus");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!pengurus} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Akses Pengurus</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus <strong>{pengurus?.name}</strong> dari daftar pengurus? Akun bersangkutan
            tidak akan dapat lagi masuk ke halaman admin.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Batal
          </Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={submitting}>
            {submitting ? "Menghapus..." : "Hapus Akses"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
