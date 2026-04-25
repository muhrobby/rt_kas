import type { WargaProfile } from "@/server/actions/warga-dashboard";

interface GreetingHeaderProps {
  profile: WargaProfile | null;
}

export function GreetingHeader({ profile }: GreetingHeaderProps) {
  if (!profile) {
    return (
      <section aria-live="polite" className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="font-medium text-sm">Profil warga belum terhubung.</p>
        <p className="mt-1 text-muted-foreground text-sm">Hubungi admin RT agar akun Anda dapat digunakan.</p>
      </section>
    );
  }

  const statusLabel = profile.statusHunian === "tetap" ? "Warga Tetap" : "Warga Kontrak";

  // Domicile expiry warning
  let domicileWarning: string | null = null;
  if (profile.tglBatasDomisili) {
    const expiry = new Date(profile.tglBatasDomisili);
    const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30 && daysLeft > 0) {
      domicileWarning = `Masa domisili berakhir dalam ${daysLeft} hari. Hubungi admin jika perlu perpanjangan.`;
    } else if (daysLeft <= 0) {
      domicileWarning = "Masa domisili sudah berakhir. Hubungi admin untuk memperbarui data.";
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-muted-foreground text-sm">Halo,</p>
      <h2 className="mt-1 font-bold text-xl tracking-tight">Keluarga {profile.namaKepalaKeluarga}</h2>
      <p className="mt-1 text-muted-foreground text-sm">
        {profile.blokRumah} • {statusLabel}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs">
          {statusLabel}
        </span>
        {domicileWarning && (
          <aside
            aria-live="polite"
            className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 text-xs"
          >
            <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
            <span>{domicileWarning}</span>
          </aside>
        )}
      </div>
    </div>
  );
}
