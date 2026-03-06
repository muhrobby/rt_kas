/**
 * Seed script for initial data.
 * Run with: npm run db:seed
 *
 * Creates:
 *   1. Admin user (username: 08123456789, password: from SEED_ADMIN_PASSWORD env or 'admin123')
 *   2. Default kategori kas
 *   3. Sample warga (10 entries) — each with an auto-created login account
 *   4. Sample transaksi (15 entries)
 */

import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";

import { db } from "./index";
import { account, user } from "./schema/auth";
import { kategoriKas } from "./schema/kategori-kas";
import { transaksi } from "./schema/transaksi";
import { warga } from "./schema/warga";

async function main() {
  console.log("Seeding database...");

  const seedPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.warn("WARNING: Using default seed password. Set SEED_ADMIN_PASSWORD env var for production.");
  }

  // 1. Create admin user directly via Drizzle (bypasses disableSignUp)
  console.log("Creating admin user...");
  const adminId = generateId();
  const adminPasswordHash = await hashPassword(seedPassword);
  await db
    .insert(user)
    .values({
      id: adminId,
      name: "Administrator RT",
      email: "admin@kas-rt.local",
      emailVerified: true,
      username: "08123456789",
      displayUsername: "08123456789",
      role: "admin",
    })
    .onConflictDoNothing();

  // Retrieve the actual user id (in case it already existed)
  const [adminUser] = await db.select().from(user).where(eq(user.username, "08123456789"));
  if (!adminUser) {
    console.error("Failed to create admin user. Aborting.");
    process.exit(1);
  }

  // Create credential account (email-password) for admin
  await db
    .insert(account)
    .values({
      id: generateId(),
      userId: adminUser.id,
      accountId: adminUser.id,
      providerId: "credential",
      password: adminPasswordHash,
    })
    .onConflictDoNothing();
  console.log(`Admin user ready: 08123456789 / ${seedPassword}`);

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

  // 3. Seed warga + auto-create login accounts
  console.log("Seeding warga...");
  const wargaData = [
    { namaKepalaKeluarga: "Bpk. Ahmad Fauzi", blokRumah: "A1", noTelp: "08111000001", statusHunian: "tetap" as const },
    {
      namaKepalaKeluarga: "Bpk. Bambang Sutrisno",
      blokRumah: "A2",
      noTelp: "08111000002",
      statusHunian: "tetap" as const,
    },
    {
      namaKepalaKeluarga: "Bpk. Candra Wijaya",
      blokRumah: "A3",
      noTelp: "08111000003",
      statusHunian: "tetap" as const,
    },
    {
      namaKepalaKeluarga: "Bpk. Dedi Kurniawan",
      blokRumah: "B1",
      noTelp: "08111000004",
      statusHunian: "tetap" as const,
    },
    { namaKepalaKeluarga: "Bpk. Eko Prasetyo", blokRumah: "B2", noTelp: "08111000005", statusHunian: "tetap" as const },
    {
      namaKepalaKeluarga: "Bpk. Fajar Nugroho",
      blokRumah: "B3",
      noTelp: "08111000006",
      statusHunian: "kontrak" as const,
      tglBatasDomisili: "2026-12-31",
    },
    {
      namaKepalaKeluarga: "Bpk. Gunawan Saputra",
      blokRumah: "C1",
      noTelp: "08111000007",
      statusHunian: "kontrak" as const,
      tglBatasDomisili: "2026-06-30",
    },
    {
      namaKepalaKeluarga: "Bpk. Hendra Susanto",
      blokRumah: "C2",
      noTelp: "08111000008",
      statusHunian: "tetap" as const,
    },
    {
      namaKepalaKeluarga: "Bpk. Irwan Hidayat",
      blokRumah: "C3",
      noTelp: "08111000009",
      statusHunian: "tetap" as const,
    },
    { namaKepalaKeluarga: "Bpk. Joko Purnomo", blokRumah: "D1", noTelp: "08111000010", statusHunian: "tetap" as const },
  ];

  const insertedWarga = await db.insert(warga).values(wargaData).returning().onConflictDoNothing();
  console.log(`Warga seeded: ${insertedWarga.length} entries.`);

  // Create login accounts for each warga (username = noTelp, password = noTelp)
  console.log("Creating warga login accounts...");
  for (const w of insertedWarga) {
    const wargaInfo = wargaData.find((d) => d.noTelp === w.noTelp);
    if (!wargaInfo) continue;
    const pwHash = await hashPassword(wargaInfo.noTelp);
    const uid = generateId();
    await db
      .insert(user)
      .values({
        id: uid,
        name: wargaInfo.namaKepalaKeluarga,
        email: `${wargaInfo.noTelp}@kas-rt.local`,
        emailVerified: true,
        username: wargaInfo.noTelp,
        displayUsername: wargaInfo.noTelp,
        role: "user",
        wargaId: w.id,
      })
      .onConflictDoNothing();
    const [newUser] = await db.select({ id: user.id }).from(user).where(eq(user.username, wargaInfo.noTelp));
    if (newUser) {
      await db
        .insert(account)
        .values({
          id: generateId(),
          userId: newUser.id,
          accountId: newUser.id,
          providerId: "credential",
          password: pwHash,
        })
        .onConflictDoNothing();
    }
  }
  console.log("Warga login accounts created.");

  // 4. Seed sample transaksi
  console.log("Seeding transaksi...");
  const allKategori = await db.query.kategoriKas.findMany();
  const allWarga = await db.query.warga.findMany();

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
