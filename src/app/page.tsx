/**
 * Archivo: src/app/page.tsx
 *
 * Página de inicio (Dashboard).
 * ¡Ahora es un Server Component "async"!
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

import SessionDisplay from "@/components/session-display";
import NewProductForm from "@/components/new-product-form";
import { ProductList } from "@/components/product-list"; // <-- 1. Importamos la lista

/**
 * Esta es la función de "Data Fetching".
 * Se ejecuta en el SERVIDOR antes de que la página se renderice.
 */
async function fetchProducts() {
  // 1. Obtenemos la sesión del usuario (en el servidor)
  const session = await getServerSession(authOptions);

  // Si no hay sesión, devolvemos un array vacío
  if (!session?.user?.id) {
    return [];
  }

  // 2. Buscamos en la BD SÓLO los productos creados por este usuario
  // ¡Usamos SQL crudo como acordamos!
  try {
    const products = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id, name, sku, price, quantity, createdAt 
        FROM Product 
        WHERE authorId = ${session.user.id}
        ORDER BY createdAt DESC
      `
    );
    return products as any[]; // Devolvemos los productos encontrados
  } catch (error) {
    console.error("Error al buscar productos:", error);
    return []; // En caso de error, devolvemos vacío
  }
}

// --- El Componente de Página ---
// 3. ¡Convertimos la página en "async" para poder usar "await"!
export default async function Home() {
  // 4. Llamamos a nuestra función de data fetching
  const products = await fetchProducts();

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-12 lg:p-24 bg-gray-50 dark:bg-gray-900">
      {/* Título */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Sistema de Inventario
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Bienvenido a tu panel de control.
        </p>
      </div>

      {/* Contenedor principal con Flexbox */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8">
        {/* Columna Izquierda (Formulario) */}
        <div className="flex-grow lg:flex-shrink lg:w-2/3">
          <NewProductForm />
        </div>

        {/* Columna Derecha (Sesión) */}
        <div className="flex-shrink-0 lg:w-1/3">
          <SessionDisplay />
        </div>
      </div>

      {/* --- SECCIÓN NUEVA: LISTA DE PRODUCTOS --- */}
      <div className="w-full max-w-6xl mt-8">
        {/* 5. Pasamos los productos a nuestro componente de lista */}
        <ProductList products={products} />
      </div>
    </main>
  );
}
