/**
 * Archivo: src/app/api/products/[id]/route.ts
 *
 * ¡CORREGIDO!
 * - La función PUT ahora convierte "NONE" a 'null'.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Prisma } from "@/generated/prisma";

// --- FUNCIÓN 'DELETE' (Sin cambios) ---
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const productId = url.pathname.split("/").pop();
    if (!productId) {
      return NextResponse.json(
        { error: "No se pudo encontrar el ID del producto en la URL." },
        { status: 400 }
      );
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const userId = session.user.id;
    const result = await prisma.$executeRaw(
      Prisma.sql`
        DELETE FROM Product 
        WHERE id = ${productId} AND authorId = ${userId}
      `
    );
    if (result === 0) {
      return NextResponse.json(
        {
          error: "Producto no encontrado o no tienes permiso para eliminarlo.",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Producto eliminado exitosamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

// --- ¡FUNCIÓN 'PUT' (ACTUALIZADA)! ---
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // 1. Obtener ID y Sesión
    const url = new URL(request.url);
    const productId = url.pathname.split("/").pop();
    if (!productId) {
      return NextResponse.json(
        { error: "No se pudo encontrar el ID del producto en la URL." },
        { status: 400 }
      );
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Obtener los nuevos datos del body
    const body = await request.json();
    const { name, description, price, sku, quantity, categoryId, supplierId } =
      body;

    // 3. Validar datos principales
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

    // 4. Validar SKU
    const existingSku = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id FROM Product 
        WHERE sku = ${sku} 
          AND authorId = ${userId} 
          AND id != ${productId}
      `
    );
    if (Array.isArray(existingSku) && existingSku.length > 0) {
      return NextResponse.json(
        { error: "Ese SKU ya está en uso por otro producto." },
        { status: 409 }
      );
    }

    // --- ¡CORRECCIÓN IMPORTANTE! ---
    // Convertimos "NONE" (del select) a null (para la BD)
    const finalCategoryId = categoryId === "NONE" ? null : categoryId;
    const finalSupplierId = supplierId === "NONE" ? null : supplierId;

    // 5. Ejecutar el UPDATE
    const result = await prisma.$executeRaw(
      Prisma.sql`
        UPDATE Product 
        SET 
          name = ${name}, 
          description = ${description || null}, 
          price = ${priceFloat}, 
          sku = ${sku}, 
          quantity = ${quantityInt}, 
          updatedAt = ${new Date()},
          categoryId = ${finalCategoryId}, -- <-- CORREGIDO
          supplierId = ${finalSupplierId}  -- <-- CORREGIDO
        WHERE 
          id = ${productId} AND authorId = ${userId}
      `
    );

    if (result === 0) {
      return NextResponse.json(
        { error: "Producto no encontrado o no tienes permiso para editarlo." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Producto actualizado exitosamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
