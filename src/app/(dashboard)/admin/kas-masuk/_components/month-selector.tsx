"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BULAN_NAMES } from "@/lib/utils";

interface MonthSelectorProps {
  selected: string[];
  onChange: (months: string[]) => void;
}

export function MonthSelector({ selected, onChange }: MonthSelectorProps) {
  function toggle(bulanName: string) {
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
        return (
          <div
            key={bulan}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted ${checked ? "border-primary bg-primary/5" : ""}`}
          >
            <Checkbox id={id} checked={checked} onCheckedChange={() => toggle(bulan)} />
            <Label htmlFor={id} className="cursor-pointer font-normal">
              {bulan.slice(0, 3)}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
