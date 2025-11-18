/**
 *
 * Página para registrar y ver movimientos (Kardex).
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { NewMovementForm } from "@/components/new-movement-form";
// Usaremos la tabla de Shadcn que ya instalamos
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Función de Data Fetching (Server-Side)
 */
async function fetchPageData(userId: string) {
  try {
    // 1. Buscamos los productos (solo ID y Nombre para el dropdown)
    const productsPromise = prisma.$queryRaw(
      Prisma.sql`
        SELECT id, name FROM Product
        WHERE authorId = ${userId}
        ORDER BY name ASC
      `
    );

    // 2. Buscamos los 50 movimientos más recientes (el Kardex)
    //    ¡Usamos un JOIN para obtener el nombre del producto!
    const movementsPromise = prisma.$queryRaw(
      Prisma.sql`
        SELECT 
          m.id, m.type, m.quantity, m.notes, m.createdAt,
          p.name as productName 
        FROM InventoryMovement m
        JOIN Product p ON m.productId = p.id
        WHERE m.authorId = ${userId}
        ORDER BY m.createdAt DESC
        LIMIT 50
      `
    );

    // 3. Ejecutamos ambas consultas en paralelo
    const [products, movements] = await Promise.all([
      productsPromise,
      movementsPromise,
    ]);

    return { products: products as any[], movements: movements as any[] };
  } catch (error) {
    console.error("Error fetching kardex data:", error);
    return { products: [], movements: [] };
  }
}

// --- El Componente de Página ---
export default async function KardexPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <p>Error: No autorizado.</p>;
  }

  // 1. Buscamos los datos
  const { products, movements } = await fetchPageData(session.user.id);

  return (
    <div className="flex flex-col gap-8 m-10">
      <h1 className="text-3xl font-bold">Registro de Movimientos (Kardex)</h1>

      <NewMovementForm products={products} />

      {/* Lista de Últimos Movimientos */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Últimos Movimientos Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-500"
                    >
                      No hay movimientos registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((move) => (
                    <TableRow key={move.id}>
                      <TableCell>
                        {new Date(move.createdAt).toLocaleString("es-ES")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {move.productName}
                      </TableCell>
                      <TableCell>
                        {move.type === "IN" ? (
                          <span className="text-green-600 font-medium">
                            ENTRADA
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            SALIDA
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {move.type === "IN" ? "+" : "-"}
                        {move.quantity}
                      </TableCell>
                      <TableCell>{move.notes || "N/A"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
