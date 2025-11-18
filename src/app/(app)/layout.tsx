/**
 * Archivo: src/app/(app)/layout.tsx
 *
 * ¡NUEVO! Este es el layout SÓLO para las páginas de la app.
 * Contiene nuestro Sidebar y el header móvil.
 */

import { SidebarNav } from "@/components/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// Este layout recibe {children} (que serán tus páginas:
// Dashboard, Kardex, Management)
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Esta es la estructura de grid que ya teníamos
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* --- SIDEBAR (Desktop) --- */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <span className="text-lg font-bold">INV-SYS</span>
          </div>
          <SidebarNav />
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL (Incluye Header Móvil) --- */}
      <div className="flex flex-col">
        {/* --- HEADER (Móvil) --- */}
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
              <SidebarNav />
            </SheetContent>
          </Sheet>
        </header>

        {/* --- PÁGINA ACTUAL ({children}) --- */}
        <main className="flex-grow p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
