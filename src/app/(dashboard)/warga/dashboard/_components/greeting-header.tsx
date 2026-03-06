import type { WargaProfile } from "@/server/actions/warga-dashboard";

interface GreetingHeaderProps {
  profile: WargaProfile | null;
}

export function GreetingHeader({ profile }: GreetingHeaderProps) {
  if (!profile) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-muted-foreground text-sm">
          Profil warga tidak ditemukan. Hubungi admin untuk menghubungkan akun Anda.
        </p>
      </div>
    );
  }

  const statusLabel = profile.statusHunian === "tetap" ? "Warga Tetap" : "Warga Kontrak";

  // Domicile expiry warning
  let domicileWarning: string | null = null;
  if (profile.tglBatasDomisili) {
    const expiry = new Date(profile.tglBatasDomisili);
    const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30 && daysLeft > 0) {
      domicileWarning = `Surat domisili berakhir dalam ${daysLeft} hari`;
    } else if (daysLeft <= 0) {
      domicileWarning = "Surat domisili telah berakhir";
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-muted-foreground text-sm">Selamat datang,</p>
      <h2 className="mt-1 font-bold text-xl">Keluarga {profile.namaKepalaKeluarga}</h2>
      <p className="mt-1 text-sm">{profile.blokRumah}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs">
          {statusLabel}
        </span>
        {domicileWarning && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-800 text-xs">
            {domicileWarning}
          </span>
        )}
      </div>
    </div>
  );
}
