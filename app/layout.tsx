import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cv } from "../data/cv";
import "./globals.css";

export const metadata: Metadata = {
  title: `${cv.profile.name} · CV jugable`,
  description: cv.profile.summary,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
