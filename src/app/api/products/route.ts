/**
 * API para crear (POST) productos.
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
        { status: 400 }
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

    // 4. Verificar si el SKU ya existe (usando SQL)
    const existingSku = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id FROM Product WHERE sku = ${sku} AND authorId = ${userId}
      `
    );

    // queryRaw devuelve un array, si su longitud es > 0, el SKU ya existe
    if (Array.isArray(existingSku) && existingSku.length > 0) {
      return NextResponse.json(
        { error: "El SKU ya existe. Debe ser único." },
        { status: 409 } // 409 Conflict
      );
    }

    // 5. Crear el producto en la BD (usando SQL crudo)
    const newId = createId(); // Generamos el CUID

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

    // 6. Devolver respuesta exitosa
    return NextResponse.json(
      { message: "Producto creado exitosamente." },
      { status: 201 } // 201 Created
    );
  } catch (error: any) {
    // Manejar errores
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
