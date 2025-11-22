/**
 * Archivo: src/app/api/movements/route.ts
 *
 * ¡FIX CRÍTICO! Sentencia INSERT en la transacción estaba incompleta.
 * Ahora incluye reasonId, clientId y supplierId.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Prisma } from "@/generated/prisma";
import { createId } from "@paralleldrive/cuid2";

// Tipo para el stock actual que buscaremos
type ProductStock = {
  quantity: number;
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    // 1. Recibimos TODOS los campos del frontend
    const { productId, type, quantity, notes, reasonId, clientId, supplierId } =
      body;

    // 2. (Validaciones de stock y tipo omitidas por brevedad, asumiendo que ya funcionan)

    const quantityInt = parseInt(quantity, 10);
    const stockChange = type === "IN" ? quantityInt : -quantityInt;

    if (type === "OUT") {
      const currentStockResult = await prisma.$queryRaw<ProductStock[]>(
        Prisma.sql`SELECT quantity FROM Product WHERE id = ${productId} AND authorId = ${userId}`
      );
      const currentStock = currentStockResult[0]?.quantity || 0;
      const finalStock = currentStock + stockChange;
      if (finalStock < 0) {
        return NextResponse.json(
          {
            error: `La salida de ${quantityInt} unidades excede el stock actual (${currentStock}). El stock final sería ${finalStock}.`,
          },
          { status: 409 }
        );
      }
    }

    // 3. FIX: Convertir "NONE" a null y manejar valores por defecto
    const movementId = createId();
    const finalReasonId = reasonId === "NONE" ? null : reasonId || null;
    const finalClientId = clientId === "NONE" ? null : clientId || null; // <-- FIX
    const finalSupplierId = supplierId === "NONE" ? null : supplierId || null; // <-- FIX

    await prisma.$transaction([
      // Operación 1: INSERTAR el registro del movimiento
      // --- ¡LISTA DE CAMPOS COMPLETA AHORA! ---
      prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO InventoryMovement (
            id, type, quantity, notes, productId, authorId, reasonId, 
            clientId, supplierId, createdAt 
          )
          VALUES (
            ${movementId}, 
            ${type}, 
            ${quantityInt}, 
            ${notes || null}, 
            ${productId}, 
            ${userId},
            ${finalReasonId},
            ${finalClientId},  -- <-- ¡FIX: VALOR CLIENTE!
            ${finalSupplierId},  -- <-- ¡FIX: VALOR PROVEEDOR!
            ${new Date()}
          )
        `
      ),

      // Operación 2: ACTUALIZAR el stock del producto
      prisma.$executeRaw(
        Prisma.sql`
          UPDATE Product
          SET quantity = quantity + ${stockChange}
          WHERE id = ${productId} AND authorId = ${userId}
        `
      ),
    ]);

    return NextResponse.json(
      { message: "Movimiento registrado exitosamente." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error en la transacción de movimientos:", error);
    return NextResponse.json(
      {
        error:
          "Error interno del servidor. No se pudo registrar la transacción completa.",
      },
      { status: 500 }
    );
  }
}
