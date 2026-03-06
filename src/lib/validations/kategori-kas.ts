import { z } from "zod";

export const kategoriFormSchema = z.object({
  namaKategori: z.string().min(1, "Nama kategori wajib diisi"),
  jenisArus: z.enum(["masuk", "keluar"]),
  nominalDefault: z.coerce.number().min(0, "Nominal tidak boleh negatif"),
});

export type KategoriFormValues = z.infer<typeof kategoriFormSchema>;
