import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { EditIcon, Trash2Icon } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";

export type PengurusRow = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  createdAt: Date;
};

export function getColumns(
  onEdit: (row: PengurusRow) => void,
  onDelete: (row: PengurusRow) => void,
): ColumnDef<PengurusRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Pengurus" />,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
      accessorKey: "username",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
      cell: ({ row }) => row.original.username || "-",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Didaftarkan Pada" />,
      cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM yyyy", { locale: id }),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => onEdit(row.original)}
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(row.original)}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
