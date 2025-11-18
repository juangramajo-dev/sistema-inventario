"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
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
      
      <div className="flex-1"></div>

      <Button
        onClick={() => signOut()}
        variant="destructive"
      >
        Cerrar Sesión
      </Button>
    </header>
  );
}