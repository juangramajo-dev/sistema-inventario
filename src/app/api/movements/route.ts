/**
 * Archivo: src/app/api/movements/route.ts
 *
 * ¡ACTUALIZADO! IMPLEMENTACIÓN DE SEGURIDAD CONTRA STOCK NEGATIVO.
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
    const { productId, type, quantity, notes } = body;

    // 1. Validaciones
    if (!productId || !type || !quantity) {
      return NextResponse.json(
        { error: "Producto, Tipo y Cantidad son requeridos." },
        { status: 400 }
      );
    }

    const quantityInt = parseInt(quantity, 10);
    if (isNaN(quantityInt) || quantityInt <= 0) {
      return NextResponse.json(
        { error: "La cantidad debe ser un número positivo." },
        { status: 400 }
      );
    }

    if (type !== "IN" && type !== "OUT") {
      return NextResponse.json(
        { error: "Tipo de movimiento inválido." },
        { status: 400 }
      );
    }

    // --- NUEVA VALIDACIÓN DE SEGURIDAD ---
    const stockChange = type === "IN" ? quantityInt : -quantityInt;

    if (type === "OUT") {
      // 2. BUSCAR STOCK ACTUAL (CON SQL CRUDO)
      const currentStockResult = await prisma.$queryRaw<ProductStock[]>(
        Prisma.sql`
                SELECT quantity FROM Product 
                WHERE id = ${productId} AND authorId = ${userId}
            `
      );

      const currentStock = currentStockResult[0]?.quantity || 0;
      const finalStock = currentStock + stockChange; // stockChange es negativo aquí

      if (finalStock < 0) {
        // Error! La salida excede el stock actual
        return NextResponse.json(
          {
            error: `La salida de ${quantityInt} unidades excede el stock actual (${currentStock}). El stock final sería ${finalStock}.`,
          },
          { status: 409 } // 409 Conflict
        );
      }
    }
    // --- FIN DE LA VALIDACIÓN DE SEGURIDAD ---

    // 3. La Transacción (El resto sigue igual, pero con la garantía de que el stock es positivo)

    const movementId = createId();

    await prisma.$transaction([
      // Operación 1: INSERTAR el registro del movimiento
      prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO InventoryMovement (id, type, quantity, notes, productId, authorId, createdAt)
          VALUES (
            ${movementId}, 
            ${type}, 
            ${quantityInt}, 
            ${notes || null}, 
            ${productId}, 
            ${userId},
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
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
