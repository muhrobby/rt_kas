import type { ReactNode } from "react";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    session = null;
  }
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/unauthorized");

  return <>{children}</>;
}
