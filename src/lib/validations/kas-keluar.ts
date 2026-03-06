import { z } from "zod";

export const kasKeluarFormSchema = z.object({
  kategoriId: z.number({ required_error: "Pilih kategori" }),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  nominal: z.coerce.number().min(1, "Nominal wajib diisi"),
  keterangan: z.string().min(1, "Keterangan wajib diisi"),
});

export type KasKeluarFormValues = z.infer<typeof kasKeluarFormSchema>;
