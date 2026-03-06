"use client";

import { useEffect } from "react";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function WargaError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[Warga Error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[400px] max-w-lg flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-lg">Terjadi Kesalahan</h2>
        <p className="max-w-sm text-muted-foreground text-sm">Halaman tidak dapat dimuat. Silakan coba lagi.</p>
        {error.digest && <p className="mt-1 font-mono text-muted-foreground text-xs">Kode: {error.digest}</p>}
      </div>
      <Button variant="outline" onClick={reset} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Coba Lagi
      </Button>
    </div>
  );
}
