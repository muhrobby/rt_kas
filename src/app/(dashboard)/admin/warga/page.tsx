"use client";

import { useCallback, useEffect, useState } from "react";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getWargaList } from "@/server/actions/warga";

import { getColumns, type WargaRow } from "./_components/columns";
import { DeleteWargaDialog } from "./_components/delete-warga-dialog";
import { WargaForm } from "./_components/warga-form";
import { WargaTableToolbar } from "./_components/warga-table-toolbar";

export default function WargaPage() {
  const [data, setData] = useState<WargaRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<WargaRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WargaRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getWargaList(search || undefined);
      setData(result as WargaRow[]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const columns = getColumns(
    (row) => {
      setEditData(row);
      setFormOpen(true);
    },
    (row) => setDeleteTarget(row),
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-semibold text-2xl">Data Warga</h1>
        <p className="text-muted-foreground text-sm">Kelola data kepala keluarga di lingkungan RT.</p>
      </div>

      <WargaTableToolbar
        search={search}
        onSearchChange={setSearch}
        onAdd={() => {
          setEditData(null);
          setFormOpen(true);
        }}
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="py-10 text-center">
                      <p className="text-muted-foreground">Tidak ada data warga ditemukan.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">
        Menampilkan {data.length} warga{search ? ` untuk pencarian "${search}"` : ""}
      </p>

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
