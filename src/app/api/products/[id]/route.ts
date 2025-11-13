/**
 * Archivo: src/app/api/products/[id]/route.ts
 *
 * ¡ACTUALIZADO! Añadimos la función PUT para actualizar.
 */

// ... (todos tus imports de 'NextResponse', 'prisma', 'authOptions', etc. siguen igual)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Prisma } from "@/generated/prisma";

// --- TU FUNCIÓN 'DELETE' (déjala como está) ---
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  // ... (tu código de DELETE que ya funciona)
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

// --- ¡NUEVA FUNCIÓN 'PUT' (AÑADIR ESTO) ---
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // 1. Obtener el ID del producto de la URL
    const url = new URL(request.url);
    const productId = url.pathname.split("/").pop();
    if (!productId) {
      return NextResponse.json(
        { error: "No se pudo encontrar el ID del producto en la URL." },
        { status: 400 }
      );
    }

    // 2. Proteger la ruta y obtener el ID del usuario
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    // 3. Obtener los nuevos datos del body
    const body = await request.json();
    const { name, description, price, sku, quantity } = body;

    // 4. Validar los datos
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

    // 5. [VALIDACIÓN DE SKU]
    // Verificar si el nuevo SKU ya existe EN OTRO producto
    const existingSku = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id FROM Product 
        WHERE sku = ${sku} 
          AND authorId = ${userId} 
          AND id != ${productId} -- ¡Que no sea este mismo producto!
      `
    );

    if (Array.isArray(existingSku) && existingSku.length > 0) {
      return NextResponse.json(
        { error: "Ese SKU ya está en uso por otro producto." },
        { status: 409 } // 409 Conflict
      );
    }

    // 6. Ejecutar la sentencia UPDATE con SQL crudo
    const result = await prisma.$executeRaw(
      Prisma.sql`
        UPDATE Product 
        SET 
          name = ${name}, 
          description = ${description || null}, 
          price = ${priceFloat}, 
          sku = ${sku}, 
          quantity = ${quantityInt}, 
          updatedAt = ${new Date()}
        WHERE 
          id = ${productId} AND authorId = ${userId}
      `
    );

    // 7. Verificar si algo se actualizó
    if (result === 0) {
      return NextResponse.json(
        { error: "Producto no encontrado o no tienes permiso para editarlo." },
        { status: 404 }
      );
    }

    // 8. Devolver éxito
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
