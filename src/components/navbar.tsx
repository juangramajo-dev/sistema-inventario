/**
 * Archivo: src/components/navbar.tsx
 * * Nuestra barra de navegación principal.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const routes = [
  { href: "/", label: "Dashboard (Inventario)" },
  { href: "/management", label: "Gestión (Categorías/Proveedores)" },
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
          {/* Aquí podríamos poner el botón de 'Cerrar Sesión'
              moviéndolo desde session-display, pero por ahora lo dejamos simple */}
        </div>
      </div>
    </nav>
  );
}
