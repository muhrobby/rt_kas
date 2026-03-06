import { z } from "zod";

export const kasMasukFormSchema = z.object({
  wargaId: z.number({ required_error: "Pilih warga" }),
  kategoriId: z.number({ required_error: "Pilih kategori" }),
  nominal: z.coerce.number().min(1, "Nominal wajib diisi"),
  bulanTagihan: z.array(z.string()).min(1, "Pilih minimal satu bulan"),
  tahunTagihan: z.coerce.number().min(2020),
  keterangan: z.string().optional(),
});

export type KasMasukFormValues = z.infer<typeof kasMasukFormSchema>;
