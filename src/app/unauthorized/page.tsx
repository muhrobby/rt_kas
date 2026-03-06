import Link from "next/link";

import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <ShieldX className="mx-auto size-12 text-destructive" />
        <h1 className="mt-4 font-bold text-3xl tracking-tight sm:text-4xl">Akses Ditolak</h1>
        <p className="mt-4 text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi pengurus RT jika Anda merasa ini adalah
          kesalahan.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow-xs transition-colors hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
