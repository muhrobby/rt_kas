import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Kas RT",
  version: packageJson.version,
  copyright: `© ${currentYear}, Kas RT.`,
  meta: {
    title: "Kas RT - Sistem Manajemen Keuangan RT",
    description:
      "Kas RT adalah aplikasi manajemen keuangan RT (Rukun Tetangga) berbasis web untuk mencatat iuran warga, pengeluaran, dan laporan keuangan secara transparan.",
  },
};
