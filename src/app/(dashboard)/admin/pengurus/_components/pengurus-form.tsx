"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createPengurus, updatePengurus } from "@/server/actions/pengurus";

import type { PengurusRow } from "./columns";

const formSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  username: z.string().min(5, "Username minimal 5 karakter").max(20, "Username maksimal 20 karakter"),
  password: z.string(), // Conditional validation is handled dynamically in Form component setup
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData: PengurusRow | null;
  onSuccess: () => void;
}

export function PengurusForm({ open, onOpenChange, editData, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const dynamicFormSchema = formSchema.superRefine((data, ctx) => {
    if (!editData && data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password wajib diisi untuk pengguna baru (min. 8 karakter)",
      });
    }
    if (editData && data.password.length > 0 && data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Jika diubah, password minimal 8 karakter",
      });
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (editData) {
        form.reset({
          name: editData.name,
          email: editData.email,
          username: editData.username || "",
          password: "",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          username: "",
          password: "",
        });
      }
    }
  }, [open, editData, form]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      if (editData) {
        await updatePengurus(editData.id, values);
        toast.success("Pengurus berhasil diubah.");
      } else {
        await createPengurus(values);
        toast.success("Pengurus baru berhasil ditambahkan.");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Gagal menyimpan pengurus");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Pengurus" : "Tambah Pengurus"}</DialogTitle>
          <DialogDescription>
            {editData ? "Ubah detail pengurus." : "Data admin digunakan untuk login ke web."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" disabled={submitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@contoh.com" disabled={submitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe123" disabled={submitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password{" "}
                    {editData && (
                      <span className="font-normal text-muted-foreground text-xs">
                        (Abaikan jika tidak ingin diubah)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Min. 8 karakter" disabled={submitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
