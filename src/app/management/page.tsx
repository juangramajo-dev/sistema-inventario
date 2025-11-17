import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { CategoryManager } from "@/components/category-manager";
import { SupplierManager } from "@/components/supplier-manager";

/**
 * Función de Data Fetching para Categorías
 * Se ejecuta en el SERVIDOR.
 */
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

// --- El Componente de Página ---
export default async function ManagementPage() {
  // 1. Obtener la sesión (necesitamos el userId para buscar)
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    // Esto no debería pasar gracias al middleware, pero es una buena práctica
    return <p>Error: No autorizado. Por favor, inicie sesión de nuevo.</p>;
  }

  // 2. Buscar los datos
  const categories = await fetchCategories(session.user.id);
  const suppliers = await fetchSuppliers(session.user.id);

  // (Aquí también buscaríamos los proveedores en el futuro)
  // const suppliers = await fetchSuppliers(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      {/* Título de la Página */}
      <h1 className="text-3xl font-bold">Panel de Gestión</h1>

      {/* Gestor de Categorías */}
      <CategoryManager initialCategories={categories} />
      <SupplierManager initialSuppliers={suppliers} />

      {/* Gestor de Proveedores (próximamente) */}
      {/* <SupplierManager initialSuppliers={suppliers} /> */}
    </div>
  );
}
