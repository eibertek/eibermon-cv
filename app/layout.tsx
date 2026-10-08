import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cv } from "../data/cv";
import "./globals.css";

// Metadata estática: se sirve antes de que el toggle de idioma (client-side) exista, así que va en inglés.
export const metadata: Metadata = {
  title: `${cv.profile.name} · Playable CV`,
  description: cv.profile.summary.en,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
