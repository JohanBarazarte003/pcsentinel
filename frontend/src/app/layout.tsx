// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PC Sentinel | Monitoreo, Protección y Rendimiento",
  description: "Plataforma SaaS de diagnóstico preventivo de hardware y mantenimiento para PCs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased selection:bg-sentinel-emerald selection:text-sentinel-dark">
        {children}
      </body>
    </html>
  );
}