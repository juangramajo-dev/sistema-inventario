/**
 * Archivo: src/app/layout.tsx
 *
 * Este es el layout raíz de TODA la aplicación.
 * Es un "Server Component" por defecto.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./auth-provider"; // <-- 1. Importamos nuestro proveedor

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
        {/* 2. Envolvemos {children} con el AuthProvider */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
