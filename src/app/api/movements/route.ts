/**
 *
 * API para crear (POST) un nuevo movimiento de inventario.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Prisma } from "@/generated/prisma";
import { createId } from "@paralleldrive/cuid2";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { productId, type, quantity, notes } = body;

    // --- 1. Validaciones ---
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

    // Generamos el ID aquí para pasarlo a ambas consultas
    const movementId = createId();
    // Calculamos el cambio de stock (ej: -10 para 'OUT', +10 para 'IN')
    const stockChange = type === "IN" ? quantityInt : -quantityInt;

    await prisma.$transaction([
      // --- Operación 1: INSERTAR el registro del movimiento ---
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

      // --- Operación 2: ACTUALIZAR el stock del producto ---
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
    // 3. Manejar Errores
    console.error(error);

    if (error.message.includes("constraint fails")) {
      return NextResponse.json(
        { error: "Error de base de datos (ej: stock negativo no permitido)." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
