/**
 *
 * API para manejar la creación (POST) de nuevos productos.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Prisma } from "@/generated/prisma";
import { createId } from "@paralleldrive/cuid2";

export async function POST(request: Request) {
  try {
    // 1. Proteger la ruta
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // 2. Obtener los datos del formulario
    const body = await request.json();
    const { name, description, price, sku, quantity } = body;

    // 3. Validar los datos
    if (!name || !price || !sku || quantity === undefined) {
      return NextResponse.json(
        { error: "Nombre, precio, SKU y cantidad son requeridos." },
        { status: 400 } // 400 Bad Request
      );
    }

    const priceFloat = parseFloat(price);
    const quantityInt = parseInt(quantity, 10);

    if (isNaN(priceFloat) || isNaN(quantityInt)) {
      return NextResponse.json(
        { error: "Precio y cantidad deben ser números válidos." },
        { status: 400 }
      );
    }

    // 4. Crear el producto en la BD (usando SQL crudo)
    const newId = createId(); // <-- 2. Usamos createId() en lugar de crypto.randomUUID()

    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO Product (
          id, name, description, price, sku, quantity, authorId, createdAt, updatedAt
        ) VALUES (
          ${newId}, 
          ${name}, 
          ${description || null}, 
          ${priceFloat}, 
          ${sku}, 
          ${quantityInt}, 
          ${userId},
          ${new Date()}, 
          ${new Date()}
        )
      `
    );

    // 5. Devolver respuesta exitosa
    return NextResponse.json(
      { message: "Producto creado exitosamente." },
      { status: 201 } // 201 Created
    );
  } catch (error: any) {
    // Manejar errores comunes
    if (error.code === "P2002" || error.message.includes("Duplicate entry")) {
      return NextResponse.json(
        { error: "El SKU ya existe. Debe ser único." },
        { status: 409 } // 409 Conflict
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
