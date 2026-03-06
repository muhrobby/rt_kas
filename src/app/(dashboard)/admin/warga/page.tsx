"use client";

import { useCallback, useEffect, useState } from "react";

import { SearchIcon, XIcon } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getWargaList } from "@/server/actions/warga";

import { getColumns, type WargaRow } from "./_components/columns";
import { DeleteWargaDialog } from "./_components/delete-warga-dialog";
import { WargaForm } from "./_components/warga-form";

export default function WargaPage() {
  const [data, setData] = useState<WargaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<WargaRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WargaRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getWargaList();
      setData(result as WargaRow[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns = getColumns(
    (row) => {
      setEditData(row);
      setFormOpen(true);
    },
    (row) => setDeleteTarget(row),
  );

  const table = useDataTableInstance({ data, columns, enableRowSelection: false });

  const searchValue = (table.getColumn("namaKepalaKeluarga")?.getFilterValue() as string) ?? "";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-semibold text-2xl">Data Warga</h1>
        <p className="text-muted-foreground text-sm">Kelola data kepala keluarga di lingkungan RT.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama kepala keluarga..."
            value={searchValue}
            onChange={(e) => table.getColumn("namaKepalaKeluarga")?.setFilterValue(e.target.value)}
            className="pr-9 pl-9"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => table.getColumn("namaKepalaKeluarga")?.setFilterValue("")}
              className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          onClick={() => {
            setEditData(null);
            setFormOpen(true);
          }}
        >
          + Tambah Warga
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-4">
              <DataTable table={table} columns={columns} />
              <DataTablePagination table={table} />
            </div>
          )}
        </CardContent>
      </Card>

      <WargaForm open={formOpen} onOpenChange={setFormOpen} editData={editData} onSuccess={load} />

      <DeleteWargaDialog
        warga={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onSuccess={load}
      />
    </div>
  );
}
