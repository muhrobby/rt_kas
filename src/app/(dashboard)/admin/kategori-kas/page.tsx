"use client";

import { useCallback, useEffect, useState } from "react";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getKategoriList } from "@/server/actions/kategori-kas";

import { getColumns, type KategoriRow } from "./_components/columns";
import { DeleteKategoriDialog, KategoriForm } from "./_components/kategori-form";

export default function KategoriKasPage() {
  const [data, setData] = useState<KategoriRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<KategoriRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KategoriRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getKategoriList();
      setData(result as KategoriRow[]);
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Kategori Kas</h1>
          <p className="text-muted-foreground text-sm">Kelola kategori pemasukan dan pengeluaran kas RT.</p>
        </div>
        <Button
          onClick={() => {
            setEditData(null);
            setFormOpen(true);
          }}
        >
          + Tambah Kategori
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
                      <p className="text-muted-foreground">Belum ada kategori kas.</p>
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

      <KategoriForm open={formOpen} onOpenChange={setFormOpen} editData={editData} onSuccess={load} />

      <DeleteKategoriDialog
        kategori={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onSuccess={load}
      />
    </div>
  );
}
