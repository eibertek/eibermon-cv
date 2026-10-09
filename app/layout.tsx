import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { cv } from "../data/cv";
import "./globals.css";

const SITE_URL = "https://eibermon.eibertek.com.ar";
const SITE_TITLE = `${cv.profile.name} · Playable CV`;

// Metadata estática: se sirve antes de que el toggle de idioma (client-side) exista, así que va en inglés.
// La imagen de opengraph-image.tsx/twitter-image.tsx se linkea sola (convención de archivo de Next.js).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: cv.profile.summary.en,
  openGraph: {
    title: SITE_TITLE,
    description: cv.profile.summary.en,
    url: SITE_URL,
    siteName: SITE_TITLE,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: cv.profile.summary.en,
  },
};

// Es un juego, no un documento: el pellizco/zoom de página corre el contenido y
// descentra los modales (quedan pegados a su posición absoluta mientras el resto
// de la página se mueve por debajo). Lo deshabilitamos.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
