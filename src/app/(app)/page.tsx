import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

// Componentes
import { KpiCard } from "@/components/kpi-card";
import { LowStockAlert } from "@/components/low-stock-alert";

import SessionDisplay from "@/components/session-display";
import { MovementsChart } from "@/components/movements-chart"; // Importamos el gráfico

// Iconos
import { DollarSign, Archive, Warehouse, PackageMinus } from "lucide-react";

// --- Tipo para los datos crudos del SQL del gráfico ---
type RawMovementData = {
  date: Date; // MySQL devuelve un objeto Date
  type: "IN" | "OUT";
  total: number; // MySQL devuelve un 'BigInt' o 'Decimal', lo tratamos como 'number'
};

/**
 * Función de Data Fetching (Server-Side)
 * Busca TODO lo que el dashboard necesita.
 */
async function fetchDashboardData(userId: string) {
  try {
    // 1. Estadísticas (KPIs)
    const statsPromise = prisma.$queryRaw<any[]>(
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

    // 2. Alertas de Bajo Stock
    const lowStockThreshold = 10;
    const lowStockPromise = prisma.$queryRaw(
      Prisma.sql`
        SELECT id, name, sku, quantity
        FROM Product
        WHERE authorId = ${userId} AND quantity < ${lowStockThreshold}
        ORDER BY quantity ASC
      `
    );

    // 3. Lista Completa de Productos (para la tabla principal)
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

    // 4. Lista de Categorías (para los <Select>)
    const categoriesPromise = prisma.$queryRaw(
      Prisma.sql`SELECT id, name FROM Category WHERE authorId = ${userId} ORDER BY name`
    );

    // 5. Lista de Proveedores (para los <Select>)
    const suppliersPromise = prisma.$queryRaw(
      Prisma.sql`SELECT id, name FROM Supplier WHERE authorId = ${userId} ORDER BY name`
    );

    // 6. Datos para el Gráfico (últimos 7 días)
    const movementsPromise = prisma.$queryRaw<RawMovementData[]>(
      Prisma.sql`
        SELECT 
          DATE(createdAt) as date, 
          type, 
          SUM(quantity) as total
        FROM InventoryMovement
        WHERE 
          authorId = ${userId} AND
          createdAt >= CURDATE() - INTERVAL 7 DAY
        GROUP BY 
          DATE(createdAt), type
        ORDER BY 
          date ASC
      `
    );

    // ¡Ejecutamos todo en paralelo!
    const [
      statsResult,
      lowStockProducts,
      allProducts,
      categories,
      suppliers,
      rawMovements, // <-- Dato nuevo
    ] = await Promise.all([
      statsPromise,
      lowStockPromise,
      allProductsPromise,
      categoriesPromise,
      suppliersPromise,
      movementsPromise, // <-- Consulta nueva
    ]);

    // Procesamos las estadísticas
    const stats = {
      totalValue: statsResult[0].totalValue || 0,
      totalItems: statsResult[0].totalItems || 0,
      totalSkus: statsResult[0].totalSkus || 0,
    };

    const chartDataMap = new Map<
      string,
      { date: string; ENTRADA: number; SALIDA: number }
    >();

    // (Helper para formatear la fecha)
    const formatDate = (dateObj: Date) =>
      new Date(dateObj).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      });

    for (const move of rawMovements) {
      const dateKey = formatDate(move.date);

      // Si es la primera vez que vemos esta fecha, creamos la entrada
      if (!chartDataMap.has(dateKey)) {
        chartDataMap.set(dateKey, { date: dateKey, ENTRADA: 0, SALIDA: 0 });
      }

      const entry = chartDataMap.get(dateKey)!;

      if (move.type === "IN") {
        entry.ENTRADA += Number(move.total); // Usamos Number() por si acaso
      } else {
        entry.SALIDA += Number(move.total);
      }
    }

    // Devolvemos todos los datos que la página necesita
    return {
      stats,
      lowStockProducts: lowStockProducts as any[],
      allProducts: allProducts as any[],
      categories: categories as any[],
      suppliers: suppliers as any[],
      chartData: Array.from(chartDataMap.values()), // Convertimos el Map en Array
    };
  } catch (error) {
    console.error("Error al buscar datos del dashboard:", error);
    // Devolvemos valores por defecto en caso de error
    return {
      stats: { totalValue: 0, totalItems: 0, totalSkus: 0 },
      lowStockProducts: [],
      allProducts: [],
      categories: [],
      suppliers: [],
      chartData: [], // <-- Nuevo valor por defecto
    };
  }
}

// --- El Componente de Página ---
export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <p>No autorizado.</p>;
  }

  // 1. Obtenemos TODOS los datos de nuestra función
  const { stats, lowStockProducts, chartData } = await fetchDashboardData(
    session.user.id
  );

  return (
    // 'flex flex-col gap-8' es nuestro contenedor principal
    <div className="flex flex-col gap-8">
      {/* Título */}
      <div className="w-full text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Resumen de tu inventario.
        </p>
      </div>
      <div className="lg:cols-12 ">
        <SessionDisplay />
      </div>

      <div className="w-full grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Valor Total del Inventario"
          value={`$${Number(stats.totalValue).toFixed(2)}`}
          icon={DollarSign}
        />
        <KpiCard
          title="Items Totales en Stock"
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

      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Columna Izquierda (más ancha) */}
        <div className="lg:col-span-6 space-y-8">
          <MovementsChart data={chartData} />
        </div>

        <div className="lg:col-span-6 space-y-8">
          <LowStockAlert products={lowStockProducts} />
        </div>
      </div>
    </div>
  );
}
