import { relations } from "drizzle-orm";

import { kategoriKas } from "./kategori-kas";
import { transaksi } from "./transaksi";
import { warga } from "./warga";

// Warga has many transaksi
export const wargaRelations = relations(warga, ({ many }) => ({
  transaksi: many(transaksi),
}));

// KategoriKas has many transaksi
export const kategoriKasRelations = relations(kategoriKas, ({ many }) => ({
  transaksi: many(transaksi),
}));

// Transaksi belongs to warga (optional) and kategoriKas
export const transaksiRelations = relations(transaksi, ({ one }) => ({
  warga: one(warga, {
    fields: [transaksi.wargaId],
    references: [warga.id],
  }),
  kategori: one(kategoriKas, {
    fields: [transaksi.kategoriId],
    references: [kategoriKas.id],
  }),
}));

// Note: Relations to Better Auth's user table use raw userId text fields.
// Queries use joins rather than Drizzle relations to avoid tight coupling.
