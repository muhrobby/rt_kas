import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatWaktu } from "@/lib/utils";

type AksiType = "tambah" | "edit" | "hapus" | "login" | "logout";

interface ActivityItem {
  id: number;
  waktuLog: Date;
  modul: string;
  aksi: AksiType;
  keterangan: string;
  userId: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const AKSI_VARIANT: Record<AksiType, "default" | "secondary" | "destructive" | "outline"> = {
  tambah: "default",
  edit: "secondary",
  hapus: "destructive",
  login: "outline",
  logout: "outline",
};

const AKSI_LABEL: Record<AksiType, string> = {
  tambah: "Tambah",
  edit: "Edit",
  hapus: "Hapus",
  login: "Login",
  logout: "Logout",
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground text-sm">Belum ada aktivitas tercatat.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={AKSI_VARIANT[item.aksi]} className="shrink-0 text-xs">
                      {AKSI_LABEL[item.aksi]}
                    </Badge>
                    <span className="truncate text-muted-foreground text-xs">{item.modul}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm">{item.keterangan}</p>
                </div>
                <span className="shrink-0 text-muted-foreground text-xs">{formatWaktu(item.waktuLog)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
