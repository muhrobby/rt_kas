import { sql } from "drizzle-orm";
import { check, integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { kategoriKas } from "./kategori-kas";
import { warga } from "./warga";

export const tipeArusEnum = pgEnum("tipe_arus", ["masuk", "keluar"]);

export const transaksi = pgTable(
  "transaksi",
  {
    id: serial("id").primaryKey(),
    waktuTransaksi: timestamp("waktu_transaksi").notNull().defaultNow(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    wargaId: integer("warga_id").references(() => warga.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    kategoriId: integer("kategori_id")
      .notNull()
      .references(() => kategoriKas.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    bulanTagihan: varchar("bulan_tagihan", { length: 20 }),
    tahunTagihan: integer("tahun_tagihan"),
    nominal: integer("nominal").notNull(),
    tipeArus: tipeArusEnum("tipe_arus").notNull(),
    keterangan: text("keterangan"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_transaksi_masuk_bulanan")
      .on(table.wargaId, table.kategoriId, table.tahunTagihan, table.bulanTagihan)
      .where(
        sql`${table.tipeArus} = 'masuk' and ${table.bulanTagihan} is not null and ${table.tahunTagihan} is not null`,
      ),
    uniqueIndex("uq_transaksi_masuk_sekali")
      .on(table.wargaId, table.kategoriId)
      .where(sql`${table.tipeArus} = 'masuk' and ${table.bulanTagihan} is null and ${table.tahunTagihan} is null`),
    check("transaksi_ck_nominal_pos", sql`${table.nominal} > 0`),
    check("transaksi_ck_tahun", sql`${table.tahunTagihan} is null or ${table.tahunTagihan} between 2000 and 2100`),
    check(
      "transaksi_ck_masuk_keluar_shape",
      sql`(
      (${table.tipeArus} = 'keluar' and ${table.wargaId} is null and ${table.bulanTagihan} is null and ${table.tahunTagihan} is null)
      or
      (${table.tipeArus} = 'masuk' and ${table.wargaId} is not null)
    )`,
    ),
  ],
);

export type Transaksi = typeof transaksi.$inferSelect;
export type NewTransaksi = typeof transaksi.$inferInsert;
