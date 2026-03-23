"use client";

import dynamic from "next/dynamic";

const SonnerToaster = dynamic(
  () => import("@/components/ui/sonner").then((module) => module.Toaster),
  {
    ssr: false,
  },
);

export function ToasterClient() {
  return <SonnerToaster />;
}
