import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (str: string): string => {
  if (typeof str !== "string" || !str.trim()) return "?";

  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
};

// ── Kas RT utilities ────────────────────────────────────────────────────────

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatTanggal(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatWaktu(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

export const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export function getWhatsAppLink(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "");
  const international = cleaned.startsWith("0") ? `62${cleaned.slice(1)}` : cleaned;
  return `https://wa.me/${international}`;
}

export function generateRefNumber(prefix = "TRX"): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}-${dateStr}-${random}`;
}

export interface PeriodeTagihan {
  bulan: string;
  tahun: number;
}

export function getPeriodsInRange(
  startBulan: string,
  startTahun: number,
  endBulan: string,
  endTahun: number,
): PeriodeTagihan[] {
  const periods: PeriodeTagihan[] = [];
  const startIndex = BULAN_NAMES.indexOf(startBulan as (typeof BULAN_NAMES)[number]);
  const endIndex = BULAN_NAMES.indexOf(endBulan as (typeof BULAN_NAMES)[number]);

  if (startIndex === -1 || endIndex === -1) return periods;

  let currentMonth = startIndex;
  let currentYear = startTahun;

  while (currentYear < endTahun || (currentYear === endTahun && currentMonth <= endIndex)) {
    periods.push({
      bulan: BULAN_NAMES[currentMonth] ?? "Januari",
      tahun: currentYear,
    });

    currentMonth += 1;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear += 1;
    }
  }

  return periods;
}

// ── Legacy template utility ──────────────────────────────────────────────────

export function formatCurrency(
  amount: number,
  opts?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    noDecimals?: boolean;
  },
) {
  const { currency = "USD", locale = "en-US", minimumFractionDigits, maximumFractionDigits, noDecimals } = opts ?? {};

  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: noDecimals ? 0 : minimumFractionDigits,
    maximumFractionDigits: noDecimals ? 0 : maximumFractionDigits,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}
