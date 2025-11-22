/**
 * Archivo: src/app/(app)/management/page.tsx
 *
 * ¡ACTUALIZADO! Incluye la gestión de Clientes.
 * Reorganiza el orden de los gestores.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { CategoryManager } from "@/components/category-manager";
import { SupplierManager } from "@/components/supplier-manager";
import { MovementReasonManager } from "@/components/movement-reason-manager";
import { ClientManager } from "@/components/client-manager"; // <-- 1. NUEVO IMPORT

// Tipos... (MovementReason sigue igual)
type MovementReason = { id: string; name: string; type: "IN" | "OUT" };

// (fetchCategories y fetchSuppliers siguen igual)
async function fetchCategories(userId: string) {
  try {
    const categories = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id, name FROM Category
        WHERE authorId = ${userId}
        ORDER BY name ASC
      `
    );
    return categories as any[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
async function fetchSuppliers(userId: string) {
  try {
    const suppliers = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id, name, contactName, phone, email 
        FROM Supplier
        WHERE authorId = ${userId}
        ORDER BY name ASC
      `
    );
    return suppliers as any[];
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
}
async function fetchMovementReasons(userId: string) {
  try {
    const reasons = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id, name, type FROM MovementReason
        WHERE authorId = ${userId}
        ORDER BY name ASC
      `
    );
    return reasons as MovementReason[]; // Usamos el tipo definido
  } catch (error) {
    console.error("Error fetching movement reasons:", error);
    return [];
  }
}

// --- 2. NUEVA FUNCIÓN fetchClients ---
async function fetchClients(userId: string) {
  try {
    const clients = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id, name, contactName, phone, email 
        FROM Client
        WHERE authorId = ${userId}
        ORDER BY name ASC
      `
    );
    return clients as any[];
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

// --- El Componente de Página ---
export default async function ManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <p>Error: No autorizado. Por favor, inicie sesión de nuevo.</p>;
  }
  const userId = session.user.id;

  // 3. Llamamos a TODAS las funciones de fetching
  const [categories, suppliers, reasons, clients] = await Promise.all([
    fetchCategories(userId),
    fetchSuppliers(userId),
    fetchMovementReasons(userId),
    fetchClients(userId), // <-- NUEVO FETCH
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Panel de Gestión</h1>
      {/* Gestor de Clientes (NUEVO) */}
      <ClientManager initialClients={clients} />{" "}
      {/* <-- RENDERIZAMOS PRIMERO */}
      {/* Gestor de Proveedores */}
      <SupplierManager initialSuppliers={suppliers} />
      {/* Gestor de Categorías */}
      <CategoryManager initialCategories={categories} />
      {/* Gestor de Motivos de Movimiento */}
      <MovementReasonManager initialReasons={reasons} />
    </div>
  );
}
