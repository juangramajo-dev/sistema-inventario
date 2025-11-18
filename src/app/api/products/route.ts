/**
 * Archivo: src/app/api/products/route.ts
 *
 * ¡CORREGIDO!
 * - Convierte 'categoryId' y 'supplierId' de "NONE" a 'null'
 * antes de guardar en la base de datos.
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
    const { name, description, price, sku, quantity, categoryId, supplierId } =
      body;

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

    const existingSku = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id FROM Product WHERE sku = ${sku} AND authorId = ${userId}
      `
    );
    if (Array.isArray(existingSku) && existingSku.length > 0) {
      return NextResponse.json(
        { error: "El SKU ya existe. Debe ser único." },
        { status: 409 } // Conflict
      );
    }

    // --- ¡CORRECCIÓN IMPORTANTE! ---
    // Convertimos "NONE" (del select) a null (para la BD)
    const finalCategoryId = categoryId === "NONE" ? null : categoryId;
    const finalSupplierId = supplierId === "NONE" ? null : supplierId;

    // 2. Crear el producto (Consulta INSERT actualizada)
    const newId = createId();
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO Product (
          id, name, description, price, sku, quantity, authorId, createdAt, updatedAt,
          categoryId, supplierId 
        ) VALUES (
          ${newId}, 
          ${name}, 
          ${description || null}, 
          ${priceFloat}, 
          ${sku}, 
          ${quantityInt}, 
          ${userId},
          ${new Date()}, 
          ${new Date()},
          ${finalCategoryId},  -- <-- CORREGIDO
          ${finalSupplierId}   -- <-- CORREGIDO
        )
      `
    );

    return NextResponse.json(
      { message: "Producto creado exitosamente." },
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
