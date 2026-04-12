import { z } from "zod";

export const wargaFormSchema = z.object({
  namaKepalaKeluarga: z.string().min(1, "Nama wajib diisi"),
  blokRumah: z.string().min(1, "Blok rumah wajib diisi"),
  noTelp: z.string().min(10, "Nomor telepon minimal 10 digit").max(15),
  statusHunian: z.enum(["tetap", "kontrak"]),
  jumlahAnggota: z.coerce.number().int().min(1, "Jumlah anggota KK minimal 1 orang"),
  tglBatasDomisili: z.string().optional().nullable(),
  tglPindah: z.string().optional().nullable(),
  isAdmin: z.boolean(),
});

export type WargaFormValues = z.infer<typeof wargaFormSchema>;
