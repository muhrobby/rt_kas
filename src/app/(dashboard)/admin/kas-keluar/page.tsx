"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { ExpenseForm } from "./_components/expense-form";
import { RecentExpenses } from "./_components/recent-expenses";

export default function KasKeluarPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSuccess() {
    setDialogOpen(false);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Kas Keluar</h1>
          <p className="text-muted-foreground text-sm">Catat pengeluaran operasional RT.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pengeluaran
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Catat Pengeluaran Operasional</DialogTitle>
            </DialogHeader>
            <ExpenseForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <RecentExpenses refreshKey={refreshKey} />
    </div>
  );
}
