/**
 * Archivo: src/app/page.tsx
 *
 * ¡ACTUALIZADO PARA FASE 5!
 * Ahora calcula KPIs y alertas de bajo stock.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

// Nuevos componentes
import { KpiCard } from "@/components/kpi-card";
import { LowStockAlert } from "@/components/low-stock-alert";
import { NewProductForm } from "@/components/new-product-form";
import { ProductList } from "@/components/product-list";
import SessionDisplay from "@/components/session-display";

// Iconos para los KPIs (¡Asegúrate de tener 'lucide-react' instalado!)
import { DollarSign, Archive, Warehouse, PackageMinus } from "lucide-react";

/**
 * Función de Data Fetching (Server-Side)
 * Ahora busca TODO lo que el dashboard necesita.
 */
async function fetchDashboardData(userId: string) {
  try {
    // 1. Estadísticas (KPIs) - Usamos SQL para agrupar y calcular
    //    Usamos 'as any[]' porque Prisma no sabe el tipo de retorno de
    //    consultas SQL crudas complejas (con SUM, COUNT, etc.)
    const statsResult = await prisma.$queryRaw<any[]>(
      Prisma.sql`
        SELECT 
          -- KPI 1: Valor Total (precio * cantidad)
          SUM(price * quantity) as totalValue,
          -- KPI 2: Items Totales (suma de todas las cantidades)
          SUM(quantity) as totalItems,
          -- KPI 3: SKUs Únicos (conteo de productos)
          COUNT(id) as totalSkus
        FROM Product
        WHERE authorId = ${userId}
      `
    );
    const stats = {
      // Usamos '|| 0' como fallback por si no hay productos (para evitar 'null')
      totalValue: statsResult[0].totalValue || 0,
      totalItems: statsResult[0].totalItems || 0,
      totalSkus: statsResult[0].totalSkus || 0,
    };

    // 2. Alertas de Bajo Stock (ej: menos de 10)
    const lowStockThreshold = 10;
    const lowStockProducts = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id, name, sku, quantity
        FROM Product
        WHERE authorId = ${userId} AND quantity < ${lowStockThreshold}
        ORDER BY quantity ASC
      `
    );

    // 3. Lista Completa de Productos (para la tabla principal)
    //    (Asegúrate de que esta consulta coincida con la de product-list.tsx)
    const allProducts = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id, name, sku, price, quantity, description, createdAt 
        FROM Product 
        WHERE authorId = ${userId}
        ORDER BY createdAt DESC
      `
    );

    return {
      stats,
      lowStockProducts: lowStockProducts as any[],
      allProducts: allProducts as any[],
    };
  } catch (error) {
    console.error("Error al buscar datos del dashboard:", error);
    // Devolvemos valores por defecto en caso de error
    return {
      stats: { totalValue: 0, totalItems: 0, totalSkus: 0 },
      lowStockProducts: [],
      allProducts: [],
    };
  }
}

// --- El Componente de Página ---
export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // El middleware ya protege esto, pero es una buena práctica
    return <p>No autorizado.</p>;
  }

  // 1. Llamamos a nuestra ÚNICA función de data fetching
  const { stats, lowStockProducts, allProducts } = await fetchDashboardData(
    session.user.id
  );

  return (
    // ¡Eliminamos el padding (p-8, p-12, p-24) de aquí
    // para que la Navbar se pegue a 'main'!
    // El padding ahora está en el 'main' de layout.tsx

    <div className="flex min-h-screen flex-col items-center">
      {/* Título */}
      <div className="w-full text-center my-6">
        <div className="lg:col-span-1">
          <SessionDisplay />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Resumen de tu inventario.
        </p>
      </div>

      {/* --- SECCIÓN NUEVA: KPIs --- */}
      <div className="w-full grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <KpiCard
          title="Valor Total del Inventario"
          // Formateamos el número a 2 decimales
          value={`$${Number(stats.totalValue).toFixed(2)}`}
          icon={DollarSign}
        />
        <KpiCard
          title="Items Totales en Stock"
          // Convertimos el número a string
          value={String(stats.totalItems)}
          icon={Warehouse}
        />
        <KpiCard
          title="Productos (SKUs Únicos)"
          value={String(stats.totalSkus)}
          icon={Archive}
        />
        <KpiCard
          title="Alertas de Bajo Stock"
          value={String(lowStockProducts.length)}
          icon={PackageMinus}
          description="Productos con menos de 10 unidades"
        />
      </div>

      {/* Contenedor principal (Formularios y Alertas) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda (más ancha) */}
        <div className="lg:col-span-2 space-y-8">
          <LowStockAlert products={lowStockProducts} />
          <NewProductForm />
        </div>

        {/* Columna Derecha (Sesión) */}
      </div>

      {/* Lista de Productos (Tabla Principal) */}
      <div className="w-full mt-8">
        <ProductList products={allProducts} />
      </div>
    </div>
  );
}
