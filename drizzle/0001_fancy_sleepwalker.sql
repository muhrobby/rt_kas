ALTER TABLE "transaksi" DROP CONSTRAINT "transaksi_warga_id_warga_id_fk";
--> statement-breakpoint
ALTER TABLE "transaksi" DROP CONSTRAINT "transaksi_kategori_id_kategori_kas_id_fk";
--> statement-breakpoint
ALTER TABLE "log_aktivitas" ADD CONSTRAINT "log_aktivitas_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_warga_id_warga_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."warga"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_kategori_id_kategori_kas_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori_kas"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_warga_id_nonnull" ON "user" USING btree ("warga_id") WHERE "user"."warga_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_transaksi_masuk_bulanan" ON "transaksi" USING btree ("warga_id","kategori_id","tahun_tagihan","bulan_tagihan") WHERE "transaksi"."tipe_arus" = 'masuk' and "transaksi"."bulan_tagihan" is not null and "transaksi"."tahun_tagihan" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_transaksi_masuk_sekali" ON "transaksi" USING btree ("warga_id","kategori_id") WHERE "transaksi"."tipe_arus" = 'masuk' and "transaksi"."bulan_tagihan" is null and "transaksi"."tahun_tagihan" is null;--> statement-breakpoint
ALTER TABLE "warga" ADD CONSTRAINT "warga_no_telp_unique" UNIQUE("no_telp");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_ck_role" CHECK ("user"."role" in ('admin', 'user'));--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_ck_nominal_pos" CHECK ("transaksi"."nominal" > 0);--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_ck_tahun" CHECK ("transaksi"."tahun_tagihan" is null or "transaksi"."tahun_tagihan" between 2000 and 2100);--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_ck_masuk_keluar_shape" CHECK ((
      ("transaksi"."tipe_arus" = 'keluar' and "transaksi"."warga_id" is null and "transaksi"."bulan_tagihan" is null and "transaksi"."tahun_tagihan" is null)
      or
      ("transaksi"."tipe_arus" = 'masuk' and "transaksi"."warga_id" is not null)
    ));--> statement-breakpoint
ALTER TABLE "warga" ADD CONSTRAINT "warga_ck_status_domisili" CHECK ((
      ("warga"."status_hunian" = 'tetap' and "warga"."tgl_batas_domisili" is null)
      or
      ("warga"."status_hunian" = 'kontrak' and "warga"."tgl_batas_domisili" is not null)
    ));