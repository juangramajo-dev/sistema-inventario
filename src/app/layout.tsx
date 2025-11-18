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
          {/* --- 1. El Grid de 2 Columnas --- */}
          {/* Define 1 columna en móvil, y 2 columnas en desktop ('md') */}
          <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            {/* --- 2. SIDEBAR (Solo para Desktop) --- */}
            {/* 'hidden' en móvil, 'md:block' (visible) en desktop */}
            <div className="hidden border-r bg-muted/40 md:block">
              <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                  <span className="text-lg font-bold">INV-SYS</span>
                </div>
                {/* Renderizamos los enlaces de navegación aquí */}
                <SidebarNav />
              </div>
            </div>

            {/* --- 3. CONTENIDO PRINCIPAL (Incluye Header Móvil) --- */}
            <div className="flex flex-col">
              {/* --- HEADER (Solo para Móvil) --- */}
              {/* 'flex' en móvil, 'md:hidden' (oculto) en desktop */}
              <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="flex flex-col p-0">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                      <span className="text-lg font-bold">INV-SYS</span>
                    </div>
                    {/* Reutilizamos los mismos enlaces en el "drawer" */}
                    <SidebarNav />
                  </SheetContent>
                </Sheet>
                {/* (Espacio para 'SessionDisplay' en el header móvil si quisiéramos) */}
              </header>

              {/* --- PÁGINA ACTUAL ({children}) --- */}
              {/* Añadimos el padding aquí */}
              <main className="flex-grow p-4 md:p-8">{children}</main>
            </div>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
