"use client";

import { useState } from "react";

import { ExpenseForm } from "./_components/expense-form";
import { RecentExpenses } from "./_components/recent-expenses";

export default function KasKeluarPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Kas Keluar</h1>
        <p className="text-muted-foreground text-sm">Catat pengeluaran operasional RT.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExpenseForm onSuccess={() => setRefreshKey((k) => k + 1)} />
        <RecentExpenses refreshKey={refreshKey} />
      </div>
    </div>
  );
}
