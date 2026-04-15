import type { ReactNode } from "react";

import type { Metadata } from "next";

import { APP_CONFIG } from "@/config/app-config";
import { fontVars } from "@/lib/fonts/registry";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { ThemeBootScript } from "@/scripts/theme-boot";

import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { theme_mode, theme_preset, content_layout, navbar_style, sidebar_variant, sidebar_collapsible, font } =
    PREFERENCE_DEFAULTS;
  return (
    <html
      lang="en"
      data-theme-mode={theme_mode}
      data-theme-preset={theme_preset}
      data-content-layout={content_layout}
      data-navbar-style={navbar_style}
      data-sidebar-variant={sidebar_variant}
      data-sidebar-collapsible={sidebar_collapsible}
      data-font={font}
      suppressHydrationWarning
    >
      <head>
        {/* Applies theme and layout preferences on load to avoid flicker and unnecessary server rerenders. */}
        <ThemeBootScript />
        <script
          suppressHydrationWarning
          // biome-ignore lint/security/noDangerouslySetInnerHtml: bootstrap script must execute before hydration
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var tpl = document.getElementById("theme-boot-template");
                  if (!tpl) return;

                  var encoded = tpl.getAttribute("data-theme-boot-code") || "";
                  var code = decodeURIComponent(encoded);
                  if (!code) return;

                  var s = document.createElement("script");
                  s.id = "theme-boot-script";
                  s.text = code;
                  document.head.appendChild(s);
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${fontVars} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}
