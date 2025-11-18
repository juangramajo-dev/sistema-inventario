/**
 * * Nuestra barra de navegación principal.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";

const routes = [
  { href: "/", label: "Dashboard (Inventario)" },
  { href: "/management", label: "Gestión (Categorías/Proveedores)" },
  { href: "kardex", label: "Movimientos de Inventario (Kardex)" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b mb-4 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-lg font-bold">INV-SYS</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    pathname === route.href
                      ? "border-indigo-500 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  )}
                >
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
          <Button
            onClick={() => signOut()} // Llama a la función signOut de next-auth
            variant="destructive"
            className="w-50 sm:w-auto sm:ml-6 mt-4"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </nav>
  );
}
