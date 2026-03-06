"use client";

import { SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WargaTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
}

export function WargaTableToolbar({ search, onSearchChange, onAdd }: WargaTableToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative max-w-sm flex-1">
        <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau blok rumah..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-9 pl-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button onClick={onAdd}>+ Tambah Warga</Button>
    </div>
  );
}
