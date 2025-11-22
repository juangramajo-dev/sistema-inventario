/**
 * Archivo: src/app/(app)/kardex/page.tsx
 *
 * ¡ACTUALIZADO! Incluye Clientes y Proveedores para trazabilidad.
 * Muestra el nombre de Cliente/Proveedor en la tabla.
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

// Tipos...
type MovementType = "IN" | "OUT";
type MovementReason = { id: string; name: string; type: MovementType };
type SelectEntity = { id: string; name: string }; // Tipo simplificado (Producto, Cliente, Proveedor)

// --- FUNCIÓN fetchProducts (Sin cambios) ---
async function fetchProducts(userId: string) {
  try {
    const products = await prisma.$queryRaw(
      Prisma.sql`SELECT id, name FROM Product WHERE authorId = ${userId} ORDER BY name`
    );
    return products as SelectEntity[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// --- FUNCIÓN fetchMovementReasons (Sin cambios) ---
async function fetchMovementReasons(userId: string) {
  try {
    const reasons = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id, name, type FROM MovementReason
        WHERE authorId = ${userId}
        ORDER BY name ASC
      `
    );
    return reasons as MovementReason[];
  } catch (error) {
    console.error("Error fetching movement reasons:", error);
    return [];
  }
}

// --- NUEVA FUNCIÓN fetchClients ---
async function fetchClients(userId: string) {
  try {
    const clients = await prisma.$queryRaw(
      Prisma.sql`SELECT id, name FROM Client WHERE authorId = ${userId} ORDER BY name`
    );
    return clients as SelectEntity[];
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}
// --- NUEVA FUNCIÓN fetchSuppliers ---
async function fetchSuppliersKardex(userId: string) {
  try {
    const suppliers = await prisma.$queryRaw(
      Prisma.sql`SELECT id, name FROM Supplier WHERE authorId = ${userId} ORDER BY name`
    );
    return suppliers as SelectEntity[];
  } catch (error) {
    console.error("Error fetching suppliers (kardex):", error);
    return [];
  }
}

/**
 * Función de Data Fetching principal
 */
async function fetchPageData(userId: string) {
  // 1. Buscamos TODOS los datos en paralelo
  const [products, reasons, clients, suppliers, movements] = await Promise.all([
    fetchProducts(userId),
    fetchMovementReasons(userId),
    fetchClients(userId), // <-- FETCH CLIENTES
    fetchSuppliersKardex(userId), // <-- FETCH PROVEEDORES
    prisma.$queryRaw(
      Prisma.sql`
        SELECT 
          m.id, m.type, m.quantity, m.notes, m.createdAt,
          p.name as productName,
          r.name as reasonName, 
          c.name as clientName,   -- <-- NOMBRE DEL CLIENTE (JOIN)
          s.name as supplierName  -- <-- NOMBRE DEL PROVEEDOR (JOIN)
        FROM InventoryMovement m
        JOIN Product p ON m.productId = p.id
        LEFT JOIN MovementReason r ON m.reasonId = r.id
        LEFT JOIN Client c ON m.clientId = c.id      
        LEFT JOIN Supplier s ON m.supplierId = s.id  
        WHERE m.authorId = ${userId}
        ORDER BY m.createdAt DESC
        LIMIT 50
      `
    ),
  ]);

  return {
    products: products as any[],
    reasons: reasons as MovementReason[],
    clients: clients as SelectEntity[], // <-- Devolvemos clientes
    suppliers: suppliers as SelectEntity[], // <-- Devolvemos proveedores
    movements: movements as any[],
  };
}

// --- El Componente de Página ---
export default async function KardexPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return <p>No autorizado.</p>;
  }

  const { products, reasons, clients, suppliers, movements } =
    await fetchPageData(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Registro de Movimientos (Kardex)</h1>

      {/* Formulario de Nuevo Movimiento */}
      <NewMovementForm
        products={products}
        reasons={reasons}
        clients={clients} // <-- PASAMOS CLIENTES
        suppliers={suppliers} // <-- PASAMOS PROVEEDORES
      />

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
                  <TableHead>Motivo</TableHead>
                  <TableHead>Trazabilidad</TableHead> {/* <-- CAMPO NUEVO */}
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
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
                      <TableCell>{move.reasonName || "Sin Motivo"}</TableCell>
                      <TableCell>
                        {/* --- CAMPO DE TRAZABILIDAD (Visualización) --- */}
                        {move.clientName && (
                          <span className="font-semibold text-blue-600">
                            Cliente: {move.clientName}
                          </span>
                        )}
                        {move.supplierName && (
                          <span className="font-semibold text-purple-600">
                            Proveedor: {move.supplierName}
                          </span>
                        )}
                        {!move.clientName && !move.supplierName && (
                          <span>N/A</span>
                        )}
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
