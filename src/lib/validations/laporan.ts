import { z } from "zod";

export const laporanParamsSchema = z
  .object({
    bulanAwal: z.coerce.number().int().min(1, "Bulan awal minimal 1").max(12, "Bulan awal maksimal 12"),
    bulanAkhir: z.coerce.number().int().min(1, "Bulan akhir minimal 1").max(12, "Bulan akhir maksimal 12"),
    tahun: z.coerce.number().int().min(2020, "Tahun minimal 2020").max(2100, "Tahun maksimal 2100"),
  })
  .refine((data) => data.bulanAwal <= data.bulanAkhir, {
    message: "Bulan awal tidak boleh lebih besar dari bulan akhir",
    path: ["bulanAwal"],
  });

export type LaporanParams = z.infer<typeof laporanParamsSchema>;
