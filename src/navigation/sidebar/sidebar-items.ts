import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  type LucideIcon,
  Receipt,
  Tags,
  Users,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const adminSidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Menu Utama",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Data Warga", url: "/admin/warga", icon: Users },
      { title: "Kategori Kas", url: "/admin/kategori-kas", icon: Tags },
    ],
  },
  {
    id: 2,
    label: "Transaksi",
    items: [
      { title: "Kas Masuk", url: "/admin/kas-masuk", icon: ArrowDownCircle },
      { title: "Kas Keluar", url: "/admin/kas-keluar", icon: ArrowUpCircle },
      { title: "Tunggakan", url: "/admin/tunggakan", icon: AlertCircle },
    ],
  },
  {
    id: 3,
    label: "Pelaporan",
    items: [
      { title: "Laporan Keuangan", url: "/admin/laporan", icon: FileText },
      { title: "Log Aktivitas", url: "/admin/log-aktivitas", icon: ClipboardList },
    ],
  },
];

export const wargaSidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Menu",
    items: [
      { title: "Dashboard", url: "/warga/dashboard", icon: Home },
      { title: "Riwayat Pembayaran", url: "/warga/riwayat", icon: Receipt },
    ],
  },
];
