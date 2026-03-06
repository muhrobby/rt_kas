import { z } from "zod";

export const kasMasukFormSchema = z.object({
  wargaId: z.number({ error: "Pilih warga" }),
  kategoriId: z.number({ error: "Pilih kategori" }),
  nominal: z.coerce.number().min(1, "Nominal wajib diisi"),
  bulanTagihan: z.array(z.string()),
  tahunTagihan: z.coerce.number().min(2020),
  keterangan: z.string().optional(),
});

export type KasMasukFormValues = z.infer<typeof kasMasukFormSchema>;
