"use server";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { kategoriKas, transaksi, user, warga } from "@/db/schema";
import { requireWarga } from "@/lib/auth-helpers";
import { BULAN_NAMES } from "@/lib/utils";

export interface PeriodOption {
  bulan: number; // 1-12
  tahun: number;
  label: string; // e.g. "Maret 2026"
}

export interface PaymentGridItem {
  bulan: number; // 1-12
  lunas: boolean;
  transaksiId: number | null;
  nominal: number | null;
  waktuTransaksi: Date | null;
  keterangan: string | null;
  refNumber: string | null;
}

export interface PaymentGridByKategori {
  kategoriId: number;
  namaKategori: string;
  nominalDefault: number;
  tipeTagihan: "bulanan" | "sekali";
  months: PaymentGridItem[];
  // For sekali-bayar: single payment info (months array will be empty)
  sekaliLunas: boolean;
  sekaliTransaksiId: number | null;
  sekaliNominal: number | null;
  sekaliWaktuTransaksi: Date | null;
}

export interface KuitansiDetail {
  id: number;
  waktuTransaksi: Date;
  namaWarga: string;
  blokRumah: string;
  namaKategori: string;
  bulanTagihan: string | null;
  tahunTagihan: number | null;
  nominal: number;
  keterangan: string | null;
  dicatatOleh: string;
}

export async function getPaymentGrid(bulan: number, tahun: number): Promise<PaymentGridByKategori[]> {
  const { wargaId } = await requireWarga();

  const categories = await db.select().from(kategoriKas).where(eq(kategoriKas.jenisArus, "masuk"));

  const bulanName = BULAN_NAMES[bulan - 1];

  // Bulanan payments for this specific bulan + tahun
  const bulananPayments = await db
    .select({
      id: transaksi.id,
      kategoriId: transaksi.kategoriId,
      bulanTagihan: transaksi.bulanTagihan,
      nominal: transaksi.nominal,
      waktuTransaksi: transaksi.waktuTransaksi,
      keterangan: transaksi.keterangan,
    })
    .from(transaksi)
    .where(
      and(
        eq(transaksi.wargaId, wargaId),
        eq(transaksi.tipeArus, "masuk"),
        eq(transaksi.tahunTagihan, tahun),
        eq(transaksi.bulanTagihan, bulanName ?? ""),
      ),
    )
    .orderBy(asc(transaksi.waktuTransaksi));

  // Sekali-bayar payments (no year/bulan filter)
  const sekaliPayments = await db
    .select({
      id: transaksi.id,
      kategoriId: transaksi.kategoriId,
      nominal: transaksi.nominal,
      waktuTransaksi: transaksi.waktuTransaksi,
    })
    .from(transaksi)
    .where(and(eq(transaksi.wargaId, wargaId), eq(transaksi.tipeArus, "masuk")));

  return categories.map((kat): PaymentGridByKategori => {
    if (kat.tipeTagihan === "sekali") {
      const paid = sekaliPayments.find((p) => p.kategoriId === kat.id);
      return {
        kategoriId: kat.id,
        namaKategori: kat.namaKategori,
        nominalDefault: kat.nominalDefault,
        tipeTagihan: "sekali",
        months: [],
        sekaliLunas: !!paid,
        sekaliTransaksiId: paid?.id ?? null,
        sekaliNominal: paid?.nominal ?? null,
        sekaliWaktuTransaksi: paid?.waktuTransaksi ?? null,
      };
    }

    // For bulanan: single PaymentGridItem for the selected bulan
    const paid = bulananPayments.find((p) => p.kategoriId === kat.id);
    const singleMonth: PaymentGridItem = {
      bulan,
      lunas: !!paid,
      transaksiId: paid?.id ?? null,
      nominal: paid?.nominal ?? null,
      waktuTransaksi: paid?.waktuTransaksi ?? null,
      keterangan: paid?.keterangan ?? null,
      refNumber: null,
    };

    return {
      kategoriId: kat.id,
      namaKategori: kat.namaKategori,
      nominalDefault: kat.nominalDefault,
      tipeTagihan: "bulanan",
      months: [singleMonth],
      sekaliLunas: false,
      sekaliTransaksiId: null,
      sekaliNominal: null,
      sekaliWaktuTransaksi: null,
    };
  });
}

export async function getKuitansiDetail(transaksiId: number): Promise<KuitansiDetail | null> {
  const { wargaId } = await requireWarga();

  const rows = await db
    .select({
      id: transaksi.id,
      waktuTransaksi: transaksi.waktuTransaksi,
      namaWarga: warga.namaKepalaKeluarga,
      blokRumah: warga.blokRumah,
      namaKategori: kategoriKas.namaKategori,
      bulanTagihan: transaksi.bulanTagihan,
      tahunTagihan: transaksi.tahunTagihan,
      nominal: transaksi.nominal,
      keterangan: transaksi.keterangan,
      userId: transaksi.userId,
      wargaId: transaksi.wargaId,
    })
    .from(transaksi)
    .leftJoin(warga, eq(transaksi.wargaId, warga.id))
    .leftJoin(kategoriKas, eq(transaksi.kategoriId, kategoriKas.id))
    .where(eq(transaksi.id, transaksiId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // Verify this transaction belongs to the authenticated warga
  if (row.wargaId !== wargaId) {
    throw new Error("Unauthorized");
  }

  // Get the name of the admin who recorded
  const [adminUser] = await db.select({ name: user.name }).from(user).where(eq(user.id, row.userId)).limit(1);

  return {
    id: row.id,
    waktuTransaksi: row.waktuTransaksi,
    namaWarga: row.namaWarga ?? "-",
    blokRumah: row.blokRumah ?? "-",
    namaKategori: row.namaKategori ?? "-",
    bulanTagihan: row.bulanTagihan,
    tahunTagihan: row.tahunTagihan,
    nominal: row.nominal,
    keterangan: row.keterangan,
    dicatatOleh: adminUser?.name ?? "-",
  };
}

export async function getAvailableMonthsYears(): Promise<PeriodOption[]> {
  const { wargaId } = await requireWarga();

  const rows = await db
    .selectDistinct({ bulanTagihan: transaksi.bulanTagihan, tahunTagihan: transaksi.tahunTagihan })
    .from(transaksi)
    .where(and(eq(transaksi.wargaId, wargaId), eq(transaksi.tipeArus, "masuk")));

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Build period list from bulanan transactions that have bulan+tahun data
  const periodsFromData: PeriodOption[] = rows
    .filter(
      (r): r is { bulanTagihan: string; tahunTagihan: number } => r.bulanTagihan !== null && r.tahunTagihan !== null,
    )
    .map((r) => {
      const bulanIndex = (BULAN_NAMES as readonly string[]).indexOf(r.bulanTagihan);
      const bulan = bulanIndex >= 0 ? bulanIndex + 1 : null;
      if (bulan === null) return null;
      return {
        bulan,
        tahun: r.tahunTagihan,
        label: `${r.bulanTagihan} ${r.tahunTagihan}`,
      };
    })
    .filter((p): p is PeriodOption => p !== null);

  // Ensure current month is always present
  const currentExists = periodsFromData.some((p) => p.bulan === currentMonth && p.tahun === currentYear);
  if (!currentExists) {
    const currentBulanName = BULAN_NAMES[currentMonth - 1];
    if (currentBulanName) {
      periodsFromData.push({ bulan: currentMonth, tahun: currentYear, label: `${currentBulanName} ${currentYear}` });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = periodsFromData.filter((p) => {
    const key = `${p.bulan}-${p.tahun}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort descending (most recent first)
  return unique.sort((a, b) => b.tahun - a.tahun || b.bulan - a.bulan);
}
