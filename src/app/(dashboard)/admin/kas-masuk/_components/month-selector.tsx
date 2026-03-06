"use client";

import { CheckCircle } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BULAN_NAMES } from "@/lib/utils";

interface MonthSelectorProps {
  selected: string[];
  onChange: (months: string[]) => void;
  /** Months already paid — shown as disabled with a check icon */
  paidBulans?: string[];
}

export function MonthSelector({ selected, onChange, paidBulans = [] }: MonthSelectorProps) {
  function toggle(bulanName: string) {
    if (paidBulans.includes(bulanName)) return; // ignore clicks on paid months
    if (selected.includes(bulanName)) {
      onChange(selected.filter((b) => b !== bulanName));
    } else {
      onChange([...selected, bulanName]);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      {BULAN_NAMES.map((bulan) => {
        const id = `bulan-check-${bulan}`;
        const checked = selected.includes(bulan);
        const paid = paidBulans.includes(bulan);
        return (
          <div
            key={bulan}
            title={paid ? `Sudah dibayar` : undefined}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
              paid
                ? "cursor-not-allowed border-green-300 bg-green-50 opacity-70 dark:border-green-700 dark:bg-green-950"
                : checked
                  ? "border-primary bg-primary/5 hover:bg-muted"
                  : "hover:bg-muted"
            }`}
          >
            {paid ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
            ) : (
              <Checkbox id={id} checked={checked} onCheckedChange={() => toggle(bulan)} disabled={paid} />
            )}
            <Label
              htmlFor={paid ? undefined : id}
              className={`cursor-pointer font-normal ${paid ? "cursor-not-allowed text-green-700 dark:text-green-300" : ""}`}
            >
              {bulan.slice(0, 3)}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
