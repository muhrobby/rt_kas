"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { type LogRow, logColumns } from "./columns";

interface LogTableProps {
  data: LogRow[];
  loading: boolean;
}

export function LogTable({ data, loading }: LogTableProps) {
  const table = useDataTableInstance({ data, columns: logColumns, enableRowSelection: false });

  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton is static
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4">
            <DataTable table={table} columns={logColumns} />
            <DataTablePagination table={table} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
