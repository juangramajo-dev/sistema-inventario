/**
 * * Contiene los enlaces de navegación para el sidebar.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, // Icono para Dashboard
  Package, // Icono para Kardex
  Settings, // Icono para Gestión
  Package2,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
// 2. Definimos las rutas de nuestra aplicación
const routes = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/product",
    label: "Productos",
    icon: Package2,
  },
  {
    href: "/kardex",
    label: "Movimientos (Kardex)",
    icon: Package,
  },
  {
    href: "/management",
    label: "Gestión",
    icon: Settings,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 p-4">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            buttonVariants({
              variant: pathname === route.href ? "default" : "ghost",
            }),
            "justify-start gap-2" // Alinear ícono y texto
          )}
        >
          <route.icon className="h-4 w-4" />
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
