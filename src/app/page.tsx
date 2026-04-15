import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function RootPage() {
  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    session = null;
  }

  if (!session) redirect("/login");
  if (session.user.role === "admin") redirect("/admin/dashboard");
  redirect("/warga/dashboard");
}
