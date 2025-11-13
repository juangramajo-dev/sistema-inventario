/**
 * Archivo: src/app/layout.tsx
 *
 * ACTUALIZADO: Añadimos el Toaster
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./auth-provider";
import { Toaster } from "@/components/ui/toaster"; // <-- 1. IMPORTAR

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Inventario",
  description: "Gestión de inventario moderna con Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster /> {/* <-- 2. AÑADIR EL COMPONENTE */}
        </AuthProvider>
      </body>
    </html>
  );
}
