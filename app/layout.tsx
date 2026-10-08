import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { cv } from "../data/cv";
import "./globals.css";

// Metadata estática: se sirve antes de que el toggle de idioma (client-side) exista, así que va en inglés.
export const metadata: Metadata = {
  title: `${cv.profile.name} · Playable CV`,
  description: cv.profile.summary.en,
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
      <body>{children}</body>
    </html>
  );
}
