import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { kategoriKas } from "./kategori-kas";
import { warga } from "./warga";

export const tipeArusEnum = pgEnum("tipe_arus", ["masuk", "keluar"]);

export const transaksi = pgTable("transaksi", {
  id: serial("id").primaryKey(),
  waktuTransaksi: timestamp("waktu_transaksi").notNull().defaultNow(),
  userId: text("user_id").notNull(), // FK → Better Auth user.id (admin who recorded)
  wargaId: integer("warga_id").references(() => warga.id, {
    onDelete: "set null",
  }),
  kategoriId: integer("kategori_id")
    .notNull()
    .references(() => kategoriKas.id, {
      onDelete: "restrict",
    }),
  bulanTagihan: varchar("bulan_tagihan", { length: 20 }),
  tahunTagihan: integer("tahun_tagihan"),
  nominal: integer("nominal").notNull(),
  tipeArus: tipeArusEnum("tipe_arus").notNull(),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Transaksi = typeof transaksi.$inferSelect;
export type NewTransaksi = typeof transaksi.$inferInsert;
