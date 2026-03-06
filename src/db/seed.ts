/**
 * Seed script for initial data.
 * Run with: npm run db:seed
 *
 * Creates:
 *   1. Admin user (username: 08123456789, password: from SEED_ADMIN_PASSWORD env or 'admin123')
 *   2. Default kategori kas
 *   3. Sample warga (10 entries)
 *   4. Sample transaksi (15 entries)
 */

import { eq } from "drizzle-orm";

import { auth } from "../lib/auth";
import { db } from "./index";
import { user } from "./schema/auth";
import { kategoriKas } from "./schema/kategori-kas";
import { transaksi } from "./schema/transaksi";
import { warga } from "./schema/warga";

async function main() {
  console.log("Seeding database...");

  const seedPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.warn("WARNING: Using default seed password. Set SEED_ADMIN_PASSWORD env var for production.");
  }

  // 1. Create admin user via Better Auth API
  console.log("Creating admin user...");
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: "Administrator RT",
        email: "admin@kas-rt.local",
        password: seedPassword,
        username: "08123456789",
      },
    });
    if (result) {
      console.log("Admin user created: 08123456789");
    } else {
      console.log("Admin user creation returned empty response.");
    }
  } catch (err) {
    console.log("signUpEmail error (may already exist):", (err as Error).message ?? err);
  }

  // Promote to admin role directly via Drizzle (no HTTP context in seed)
  try {
    const updated = await db.update(user).set({ role: "admin" }).where(eq(user.username, "08123456789")).returning();
    if (updated.length > 0) {
      console.log("Admin role assigned to user:", updated[0].username);
    } else {
      console.log("No user matched username 08123456789 for role update.");
    }
  } catch (err) {
    console.log("Could not set admin role:", (err as Error).message ?? err);
  }

  // 2. Seed kategori kas
  console.log("Seeding kategori kas...");
  await db
    .insert(kategoriKas)
    .values([
      { namaKategori: "Keamanan", jenisArus: "masuk", nominalDefault: 25000 },
      { namaKategori: "Sampah", jenisArus: "masuk", nominalDefault: 15000 },
      { namaKategori: "Donasi 17 Agustus", jenisArus: "masuk", nominalDefault: 0 },
      { namaKategori: "Operasional RT", jenisArus: "keluar", nominalDefault: 0 },
      { namaKategori: "Sosial", jenisArus: "keluar", nominalDefault: 0 },
    ])
    .onConflictDoNothing();
  console.log("Kategori kas seeded.");

  // 3. Seed warga
  console.log("Seeding warga...");
  const insertedWarga = await db
    .insert(warga)
    .values([
      { namaKepalaKeluarga: "Bpk. Ahmad Fauzi", blokRumah: "A1", noTelp: "08111000001", statusHunian: "tetap" },
      { namaKepalaKeluarga: "Bpk. Bambang Sutrisno", blokRumah: "A2", noTelp: "08111000002", statusHunian: "tetap" },
      { namaKepalaKeluarga: "Bpk. Candra Wijaya", blokRumah: "A3", noTelp: "08111000003", statusHunian: "tetap" },
      { namaKepalaKeluarga: "Bpk. Dedi Kurniawan", blokRumah: "B1", noTelp: "08111000004", statusHunian: "tetap" },
      { namaKepalaKeluarga: "Bpk. Eko Prasetyo", blokRumah: "B2", noTelp: "08111000005", statusHunian: "tetap" },
      {
        namaKepalaKeluarga: "Bpk. Fajar Nugroho",
        blokRumah: "B3",
        noTelp: "08111000006",
        statusHunian: "kontrak",
        tglBatasDomisili: "2026-12-31",
      },
      {
        namaKepalaKeluarga: "Bpk. Gunawan Saputra",
        blokRumah: "C1",
        noTelp: "08111000007",
        statusHunian: "kontrak",
        tglBatasDomisili: "2026-06-30",
      },
      { namaKepalaKeluarga: "Bpk. Hendra Susanto", blokRumah: "C2", noTelp: "08111000008", statusHunian: "tetap" },
      { namaKepalaKeluarga: "Bpk. Irwan Hidayat", blokRumah: "C3", noTelp: "08111000009", statusHunian: "tetap" },
      { namaKepalaKeluarga: "Bpk. Joko Purnomo", blokRumah: "D1", noTelp: "08111000010", statusHunian: "tetap" },
    ])
    .returning({ id: warga.id })
    .onConflictDoNothing();
  console.log(`Warga seeded: ${insertedWarga.length} entries.`);

  // 4. Seed sample transaksi
  console.log("Seeding transaksi...");
  // Get admin user id and kategori ids
  const adminUser = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.username, "08123456789"),
  });
  const allKategori = await db.query.kategoriKas.findMany();
  const allWarga = await db.query.warga.findMany();

  if (!adminUser) {
    console.log("Admin user not found, skipping transaksi seed.");
    return;
  }

  const keamanan = allKategori.find((k) => k.namaKategori === "Keamanan");
  const sampah = allKategori.find((k) => k.namaKategori === "Sampah");
  const operasional = allKategori.find((k) => k.namaKategori === "Operasional RT");
  const sosial = allKategori.find((k) => k.namaKategori === "Sosial");

  if (!keamanan || !sampah || !operasional || !sosial) {
    console.log("Kategori not found, skipping transaksi seed.");
    return;
  }

  const bulanList = ["Januari", "Februari", "Maret"];
  const transaksiData: (typeof transaksi.$inferInsert)[] = [];

  // Pemasukan: iuran keamanan & sampah per warga per bulan
  for (const bln of bulanList) {
    for (const w of allWarga.slice(0, 5)) {
      transaksiData.push({
        userId: adminUser.id,
        wargaId: w.id,
        kategoriId: keamanan.id,
        bulanTagihan: bln,
        tahunTagihan: 2026,
        nominal: 25000,
        tipeArus: "masuk",
        keterangan: `Iuran keamanan ${bln} 2026`,
      });
      transaksiData.push({
        userId: adminUser.id,
        wargaId: w.id,
        kategoriId: sampah.id,
        bulanTagihan: bln,
        tahunTagihan: 2026,
        nominal: 15000,
        tipeArus: "masuk",
        keterangan: `Iuran sampah ${bln} 2026`,
      });
    }
  }

  // Pengeluaran
  transaksiData.push({
    userId: adminUser.id,
    wargaId: null,
    kategoriId: operasional.id,
    bulanTagihan: null,
    tahunTagihan: null,
    nominal: 150000,
    tipeArus: "keluar",
    keterangan: "Beli ATK dan perlengkapan kantor RT",
  });
  transaksiData.push({
    userId: adminUser.id,
    wargaId: null,
    kategoriId: sosial.id,
    bulanTagihan: null,
    tahunTagihan: null,
    nominal: 200000,
    tipeArus: "keluar",
    keterangan: "Sumbangan warga sakit - Bpk. Dedi",
  });
  transaksiData.push({
    userId: adminUser.id,
    wargaId: null,
    kategoriId: operasional.id,
    bulanTagihan: null,
    tahunTagihan: null,
    nominal: 75000,
    tipeArus: "keluar",
    keterangan: "Bayar listrik pos ronda",
  });

  await db.insert(transaksi).values(transaksiData);
  console.log(`Transaksi seeded: ${transaksiData.length} entries.`);

  console.log("\nSeed complete.");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
