"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="font-semibold text-2xl">Terjadi kesalahan</h1>
          <p className="max-w-md text-muted-foreground text-sm">
            {error.message || "Aplikasi mengalami gangguan. Silakan coba lagi."}
          </p>
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm"
            onClick={() => reset()}
            type="button"
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
