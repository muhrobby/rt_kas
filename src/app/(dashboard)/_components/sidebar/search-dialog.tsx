"use client";
import * as React from "react";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  Receipt,
  Search,
  Tags,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const searchItems = [
  { group: "Admin", icon: LayoutDashboard, label: "Dashboard", url: "/admin/dashboard" },
  { group: "Admin", icon: Users, label: "Data Warga", url: "/admin/warga" },
  { group: "Admin", icon: Tags, label: "Kategori Kas", url: "/admin/kategori-kas" },
  { group: "Transaksi", icon: ArrowDownCircle, label: "Kas Masuk", url: "/admin/kas-masuk" },
  { group: "Transaksi", icon: ArrowUpCircle, label: "Kas Keluar", url: "/admin/kas-keluar" },
  { group: "Pelaporan", icon: FileText, label: "Laporan Keuangan", url: "/admin/laporan" },
  { group: "Pelaporan", icon: ClipboardList, label: "Log Aktivitas", url: "/admin/log-aktivitas" },
  { group: "Warga", icon: Home, label: "Dashboard Warga", url: "/warga/dashboard" },
  { group: "Warga", icon: Receipt, label: "Riwayat Pembayaran", url: "/warga/riwayat" },
];

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="link"
        className="!px-0 font-normal text-muted-foreground hover:no-underline"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        Cari
        <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-[10px]">
          <span className="text-xs">⌘</span>J
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Cari halaman…" />
        <CommandList>
          <CommandEmpty>Tidak ada hasil.</CommandEmpty>
          {[...new Set(searchItems.map((item) => item.group))].map((group, i) => (
            <React.Fragment key={group}>
              {i !== 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {searchItems
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <CommandItem className="!py-1.5" key={item.label} onSelect={() => setOpen(false)}>
                      {item.icon && <item.icon />}
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
