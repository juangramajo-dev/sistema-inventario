/**
 * Archivo: src/app/(app)/product/page.tsx
 *
 * Página de gestión de productos.
 * Muestra el título y el botón de crear arriba, y la tabla abajo.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

import { NewProductForm } from "@/components/new-product-form";
import { ProductList } from "@/components/product-list";

// --- Funciones de Data Fetching (Igual que antes) ---
async function fetchProductData(userId: string) {
  try {
    const allProductsPromise = prisma.$queryRaw(
      Prisma.sql`
        SELECT 
          id, name, sku, price, quantity, description, createdAt,
          categoryId, supplierId
        FROM Product 
        WHERE authorId = ${userId}
        ORDER BY createdAt DESC
      `
    );

    const categoriesPromise = prisma.$queryRaw(
      Prisma.sql`SELECT id, name FROM Category WHERE authorId = ${userId} ORDER BY name`
    );

    const suppliersPromise = prisma.$queryRaw(
      Prisma.sql`SELECT id, name FROM Supplier WHERE authorId = ${userId} ORDER BY name`
    );

    const [allProducts, categories, suppliers] = await Promise.all([
      allProductsPromise,
      categoriesPromise,
      suppliersPromise,
    ]);

    return {
      allProducts: allProducts as any[],
      categories: categories as any[],
      suppliers: suppliers as any[],
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    return { allProducts: [], categories: [], suppliers: [] };
  }
}

export default async function ProductPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <p>No autorizado.</p>;
  }

  const { allProducts, categories, suppliers } = await fetchProductData(
    session.user.id
  );

  return (
    <div className="flex flex-col gap-6">
      {/* --- CABECERA: Título y Botón --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Productos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestiona tu catálogo de productos.
          </p>
        </div>

        {/* El formulario ahora es un botón que abre un modal */}
        <NewProductForm categories={categories} suppliers={suppliers} />
      </div>

      {/* --- LISTA DE PRODUCTOS --- */}
      <div className="w-full">
        <ProductList
          products={allProducts}
          categories={categories}
          suppliers={suppliers}
        />
      </div>
    </div>
  );
}
