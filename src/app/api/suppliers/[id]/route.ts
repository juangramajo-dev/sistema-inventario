/**
 *
 * API para actualizar (PUT) y eliminar (DELETE) un proveedor.
 * ¡CON SQL CRUDO!
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Prisma } from "@/generated/prisma";

// --- FUNCIÓN 'PUT' (ACTUALIZAR) ---
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const supplierId = url.pathname.split("/").pop();
    if (!supplierId) {
      return NextResponse.json(
        { error: "No se pudo encontrar el ID del proveedor." },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { name, contactName, phone, email } = body;
    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido." },
        { status: 400 }
      );
    }

    // Verificar si el nombre ya existe (en OTRO proveedor)
    const existing = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id FROM Supplier 
        WHERE name = ${name} 
          AND authorId = ${userId} 
          AND id != ${supplierId}
      `
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe otro proveedor con ese nombre." },
        { status: 409 } // Conflict
      );
    }

    // Ejecutar el UPDATE
    const result = await prisma.$executeRaw(
      Prisma.sql`
        UPDATE Supplier 
        SET 
          name = ${name}, 
          contactName = ${contactName || null},
          phone = ${phone || null},
          email = ${email || null}
        WHERE id = ${supplierId} AND authorId = ${userId}
      `
    );

    if (result === 0) {
      return NextResponse.json(
        { error: "Proveedor no encontrado o no autorizado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Proveedor actualizado." },
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

// --- FUNCIÓN 'DELETE' (ELIMINAR) ---
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const supplierId = url.pathname.split("/").pop();
    if (!supplierId) {
      return NextResponse.json(
        { error: "No se pudo encontrar el ID del proveedor." },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    // Ejecutar el DELETE
    // 'onDelete: SetNull' en el schema.prisma se encarga de los productos.
    const result = await prisma.$executeRaw(
      Prisma.sql`
        DELETE FROM Supplier 
        WHERE id = ${supplierId} AND authorId = ${userId}
      `
    );

    if (result === 0) {
      return NextResponse.json(
        { error: "Proveedor no encontrado o no autorizado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Proveedor eliminado." },
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
