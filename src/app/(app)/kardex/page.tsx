/**
 * Archivo: src/app/(app)/kardex/page.tsx
 *
 * ¡ACTUALIZADO! Ahora incluye Motivos de Movimiento.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { NewMovementForm } from "@/components/new-movement-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Tipo para el nuevo modelo
type MovementReason = {
  id: string;
  name: string;
  type: "IN" | "OUT";
};

/**
 * Función de Data Fetching (Server-Side)
 */
async function fetchPageData(userId: string) {
  try {
    // 1. Buscamos los productos (ID y Nombre para el dropdown)
    const productsPromise = prisma.$queryRaw(
      Prisma.sql`
        SELECT id, name FROM Product
        WHERE authorId = ${userId}
        ORDER BY name ASC
      `
    );

    // 2. Buscamos los Motivos (ID y Nombre para el dropdown)
    const reasonsPromise = prisma.$queryRaw(
      Prisma.sql`
        SELECT id, name, type FROM MovementReason
        WHERE authorId = ${userId}
        ORDER BY name ASC
      `
    );

    // 3. Buscamos los 50 movimientos más recientes (Kardex)
    //    ¡Usamos un LEFT JOIN para obtener el nombre del motivo (si existe)!
    const movementsPromise = prisma.$queryRaw(
      Prisma.sql`
        SELECT 
          m.id, m.type, m.quantity, m.notes, m.createdAt,
          p.name as productName,
          r.name as reasonName -- <-- NOMBRE DEL MOTIVO
        FROM InventoryMovement m
        JOIN Product p ON m.productId = p.id
        LEFT JOIN MovementReason r ON m.reasonId = r.id -- <-- JOIN con el motivo
        WHERE m.authorId = ${userId}
        ORDER BY m.createdAt DESC
        LIMIT 50
      `
    );

    // 4. Ejecutamos todas las consultas en paralelo
    const [products, reasons, movements] = await Promise.all([
      productsPromise,
      reasonsPromise,
      movementsPromise,
    ]);

    return {
      products: products as any[],
      reasons: reasons as MovementReason[], // <-- Lo devolvemos
      movements: movements as any[],
    };
  } catch (error) {
    console.error("Error fetching kardex data:", error);
    return { products: [], reasons: [], movements: [] };
  }
}

// --- El Componente de Página ---
export default async function KardexPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <p>No autorizado.</p>;
  }

  // 1. Buscamos los datos
  const { products, reasons, movements } = await fetchPageData(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Registro de Movimientos (Kardex)</h1>

      {/* Formulario de Nuevo Movimiento */}
      {/* Pasamos la lista de motivos al formulario */}
      <NewMovementForm products={products} reasons={reasons} />

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
                  <TableHead>Motivo</TableHead> {/* <-- NUEVO */}
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                      <TableCell>{move.reasonName || "Sin Motivo"}</TableCell>{" "}
                      {/* <-- NUEVO CAMPO */}
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
