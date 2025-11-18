/**
 * Archivo: src/app/(app)/product/page.tsx
 *
 * ¡ACTUALIZADO! Ahora usa una API (search-products) para
 * gestionar paginación y búsqueda.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

import { NewProductForm } from "@/components/new-product-form";
import { ProductList } from "@/components/product-list";
import { DataTableSearch } from "@/components/data-table-search"; // <-- NUEVO IMPORT

// Definimos los tipos para las props (igual que antes)
type SelectItem = {
  id: string;
  name: string;
};

// Tipo para la respuesta de la API de búsqueda
type SearchResponse = {
  products: any[];
  pagination: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
};

// Función de utilidad para construir la URL de la API
function buildApiUrl(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const params = new URLSearchParams();
  if (searchParams.search) params.set("search", String(searchParams.search));
  if (searchParams.page) params.set("page", String(searchParams.page));
  if (searchParams.limit) params.set("limit", String(searchParams.limit));
  return `/api/search-products?${params.toString()}`;
}

// Función de Data Fetching
async function fetchProductData(
  userId: string,
  searchParams: { [key: string]: string | string[] | undefined }
) {
  try {
    // 1. Llamar a la API de búsqueda y paginación
    const apiUrl = buildApiUrl(searchParams);

    // NOTA: Como la API está en el mismo servidor, podemos llamar directamente
    // al Route Handler GET de /api/search-products.
    const searchResponse = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}${apiUrl}`,
      {
        method: "GET",
        headers: {
          Cookie:
            "next-auth.session-token=" +
            ((await getServerSession(authOptions)) as any)?.token,
        },
        // Desactivamos el caché para que la búsqueda y paginación funcionen en cada clic
        cache: "no-store",
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`API failed with status ${searchResponse.status}`);
    }

    const searchData: SearchResponse = await searchResponse.json();

    // 2. Buscamos Categorías y Proveedores (estos siempre los buscamos todos)
    const categoriesPromise = prisma.$queryRaw(
      Prisma.sql`SELECT id, name FROM Category WHERE authorId = ${userId} ORDER BY name`
    );

    const suppliersPromise = prisma.$queryRaw(
      Prisma.sql`SELECT id, name FROM Supplier WHERE authorId = ${userId} ORDER BY name`
    );

    const [categories, suppliers] = await Promise.all([
      categoriesPromise,
      suppliersPromise,
    ]);

    return {
      allProducts: searchData.products as any[],
      categories: categories as SelectItem[],
      suppliers: suppliers as SelectItem[],
      pagination: searchData.pagination,
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    return {
      allProducts: [],
      categories: [],
      suppliers: [],
      pagination: {
        totalItems: 0,
        itemsPerPage: 10,
        currentPage: 1,
        totalPages: 1,
      },
    };
  }
}

// Interceptamos los parámetros de búsqueda y paginación de la URL
export default async function ProductPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <p>No autorizado.</p>;
  }

  const { allProducts, categories, suppliers, pagination } =
    await fetchProductData(session.user.id, searchParams);

  return (
    <div className="flex flex-col gap-6">
      {/* --- CABECERA: Título y Botón --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Productos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestiona tu catálogo de productos ({pagination.totalItems} items).
          </p>
        </div>

        {/* Botón de Añadir Producto (Modal) */}
        <NewProductForm categories={categories} suppliers={suppliers} />
      </div>

      {/* --- BUSCADOR Y LISTA --- */}
      <div className="w-full">
        {/* Buscador */}
        <DataTableSearch placeholder="Buscar por Nombre, SKU o Descripción..." />

        {/* Lista de Productos */}
        <ProductList
          products={allProducts}
          categories={categories}
          suppliers={suppliers}
        />

        {/* Paginación */}
        <DataTablePagination
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          resource="products"
        />
      </div>
    </div>
  );
}
