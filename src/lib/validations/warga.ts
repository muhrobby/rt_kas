import { z } from "zod";

export const wargaFormSchema = z.object({
  namaKepalaKeluarga: z.string().min(1, "Nama wajib diisi"),
  blokRumah: z.string().min(1, "Blok rumah wajib diisi"),
  noTelp: z.string().min(10, "Nomor telepon minimal 10 digit").max(15),
  statusHunian: z.enum(["tetap", "kontrak"]),
  tglBatasDomisili: z.string().nullable().optional(),
});

export type WargaFormValues = z.infer<typeof wargaFormSchema>;
