import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { APP_CONFIG } from "@/config/app-config";
import { auth } from "@/lib/auth";

import { LoginForm } from "./_components/login-form";

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl tracking-tight">{APP_CONFIG.name}</h1>
        <p className="text-muted-foreground text-sm">
          Masuk dengan nomor telepon dan password Anda
        </p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
