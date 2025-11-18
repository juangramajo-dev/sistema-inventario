/**
 * Archivo: src/app/(app)/management/page.tsx
 *
 * ¡ACTUALIZADO! Ahora incluye la gestión de Motivos de Movimiento.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { CategoryManager } from "@/components/category-manager";
import { SupplierManager } from "@/components/supplier-manager";
import { MovementReasonManager } from "@/components/movement-reason-manager"; // <-- NUEVO

// Tipo para el nuevo modelo
type MovementReason = {
  id: string;
  name: string;
  type: "IN" | "OUT";
};

// (Función fetchCategories sigue igual)
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

// (Función fetchSuppliers sigue igual)
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

// --- NUEVA FUNCIÓN fetchMovementReasons ---
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

// --- El Componente de Página ---
export default async function ManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <p>Error: No autorizado. Por favor, inicie sesión de nuevo.</p>;
  }
  const userId = session.user.id;

  // 1. Llamamos a TODAS las funciones de fetching
  const [categories, suppliers, reasons] = await Promise.all([
    fetchCategories(userId),
    fetchSuppliers(userId),
    fetchMovementReasons(userId), // <-- NUEVO FETCH
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Panel de Gestión</h1>
      {/* Gestor de Categorías */}
      <CategoryManager initialCategories={categories} />
      {/* Gestor de Proveedores */}
      <SupplierManager initialSuppliers={suppliers} />
      {/* Gestor de Motivos de Movimiento */}
      <MovementReasonManager initialReasons={reasons} />{" "}
      {/* <-- NUEVO GESTOR */}
    </div>
  );
}
