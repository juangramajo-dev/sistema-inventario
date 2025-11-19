/**
 * Archivo: src/app/(app)/product/page.tsx
 *
 * ¡ACTUALIZADO! Arreglo definitivo del error 401/TypeError.
 * Usamos cookies() para obtener el token de sesión.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { cookies } from "next/headers"; // <-- CAMBIO CLAVE: Usamos cookies()

import { NewProductForm } from "@/components/new-product-form";
import { ProductList } from "@/components/product-list";
import { DataTableSearch } from "@/components/data-table-search";
import { DataTablePagination } from "@/components/data-table-pagination";

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
  const search = searchParams.search;
  const page = searchParams.page;
  const limit = searchParams.limit;
  
  if (search) params.set("search", String(search));
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  
  return `/api/search-products?${params.toString()}`;
}

// Función de Data Fetching
async function fetchProductData(
  userId: string,
  searchParams: { [key: string]: string | string[] | undefined } = {}
) {
  // Crear una copia segura de searchParams
  const safeSearchParams = {
    search: searchParams.search ? String(searchParams.search) : undefined,
    page: searchParams.page ? String(searchParams.page) : '1',
    limit: searchParams.limit ? String(searchParams.limit) : '10'
  };
  
  console.log('Iniciando fetchProductData con userId:', userId);
  console.log('Parámetros de búsqueda:', safeSearchParams);
  
  try {
    // 1. Obtener el token de sesión de las cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('next-auth.session-token')?.value;

    if (!sessionToken) {
      throw new Error('No se encontró el token de sesión');
    }

    // 2. Construir la URL de la API con los parámetros seguros
    const apiUrl = buildApiUrl(safeSearchParams);

    // 3. Llamar a la API de búsqueda y paginación
    const searchResponse = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}${apiUrl}`,
      {
        method: "GET",
        headers: {
          Cookie: `next-auth.session-token=${sessionToken}`,
        },
        cache: "no-store",
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error(
        `API failed with status ${searchResponse.status}. Response: ${errorText}`
      );
      throw new Error(`API failed with status ${searchResponse.status}`);
    }

    const responseData = await searchResponse.json();
    
    // Aseguramos que la respuesta tenga la estructura esperada
    const searchData: SearchResponse = {
      products: responseData.products || [],
      pagination: responseData.pagination || {
        totalItems: 0,
        itemsPerPage: 10,
        currentPage: 1,
        totalPages: 1
      }
    };
    
    console.log('Datos de la API recibidos:', {
      rawResponse: responseData, // Mostramos la respuesta cruda para depuración
      processedData: searchData  // Mostramos los datos procesados
    });
    
    if (!searchData.products || searchData.products.length === 0) {
      console.warn('La API no devolvió productos. Verifica la consulta y los permisos.');
    }

    // 3. Buscamos Categorías y Proveedores (estos siempre los buscamos todos)
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
  searchParams: searchParamsProp = {},
}: {
  searchParams?: { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Aseguramos que searchParams sea un objeto y no una promesa
  const searchParams = searchParamsProp instanceof Promise ? await searchParamsProp : searchParamsProp || {};
  const session = await getServerSession(authOptions);
  
  console.log('Datos de sesión:', {
    hasSession: !!session,
    user: session?.user,
    userId: (session?.user as any)?.id // Forzamos el tipo temporalmente
  });

  if (!session?.user || !(session.user as any)?.id) {
    return <p>No autorizado. Por favor inicia sesión.</p>;
  }
  
  const userId = (session.user as any).id;

  // Aseguramos que searchParams sea un objeto
  const safeSearchParams = searchParams || {};
  
  console.log('Iniciando búsqueda con parámetros:', {
    userId,
    searchParams: safeSearchParams
  });
  
  const { allProducts = [], categories = [], suppliers = [], pagination } =
    await fetchProductData(userId, safeSearchParams);

  console.log('Datos a renderizar:', {
    allProductsCount: allProducts.length,
    categoriesCount: categories.length,
    suppliersCount: suppliers.length,
    pagination,
    hasSession: !!session,
    hasUserId: !!session?.user?.id
  });

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
        <div className="mb-4">
          <DataTableSearch placeholder="Buscar por Nombre, SKU o Descripción..." />
        </div>

        {/* Lista de Productos */}
        {allProducts && allProducts.length > 0 ? (
          <ProductList
            products={allProducts}
            categories={categories}
            suppliers={suppliers}
          />
        ) : (
          <div className="p-4 text-center text-gray-500">
            No se encontraron productos. {allProducts === undefined ? '(Cargando...)' : ''}
          </div>
        )}

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
