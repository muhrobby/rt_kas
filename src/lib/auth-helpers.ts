import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await getServerSession();
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireWarga(): Promise<{ session: Awaited<ReturnType<typeof requireAuth>>; wargaId: number }> {
  const session = await requireAuth();
  const wargaId = (session.user as { wargaId?: number | null }).wargaId;
  if (!wargaId) {
    throw new Error("Akun tidak terhubung dengan data warga");
  }
  return { session, wargaId };
}
