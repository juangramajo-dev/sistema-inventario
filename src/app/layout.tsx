/**
 * Archivo: src/app/layout.tsx
 *
 * ¡ACTUALIZADO! Usa un Sidebar + Header Móvil
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { SidebarNav } from "@/components/sidebar-nav"; // <-- 1. Importar Nav
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // <-- 2. Importar Sheet
import { Menu } from "lucide-react"; // <-- 3. Importar Ícono

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
          <main className="flex-grow p-4 md:p-8">{children}</main>

          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
