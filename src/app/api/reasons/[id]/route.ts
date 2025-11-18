/**
 * Archivo: src/app/api/reasons/[id]/route.ts
 *
 * API para actualizar (PUT) y eliminar (DELETE) un motivo de movimiento.
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
    const reasonId = url.pathname.split("/").pop();
    if (!reasonId) {
      /* ... (manejo de error) */
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      /* ... (manejo de error) */
    }
    const userId = session.user.id;

    const body = await request.json();
    const { name, type } = body;
    if (!name || !type) {
      /* ... (manejo de error) */
    }

    // Validación de tipo
    if (type !== "IN" && type !== "OUT") {
      /* ... (manejo de error) */
    }

    // 4. Verificar si el nombre ya existe (en OTRO motivo)
    const existing = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id FROM MovementReason 
        WHERE name = ${name} 
          AND authorId = ${userId} 
          AND id != ${reasonId}
      `
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe otro motivo con ese nombre." },
        { status: 409 } // Conflict
      );
    }

    // 5. Ejecutar el UPDATE
    const result = await prisma.$executeRaw(
      Prisma.sql`
        UPDATE MovementReason 
        SET name = ${name}, type = ${type}
        WHERE id = ${reasonId} AND authorId = ${userId}
      `
    );

    if (result === 0) {
      /* ... (manejo de error 404) */
    }

    return NextResponse.json(
      { message: "Motivo actualizado." },
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
    const reasonId = url.pathname.split("/").pop();
    if (!reasonId) {
      /* ... (manejo de error) */
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      /* ... (manejo de error) */
    }
    const userId = session.user.id;

    // Ejecutar el DELETE
    const result = await prisma.$executeRaw(
      Prisma.sql`
        DELETE FROM MovementReason 
        WHERE id = ${reasonId} AND authorId = ${userId}
      `
    );

    if (result === 0) {
      /* ... (manejo de error 404) */
    }

    return NextResponse.json({ message: "Motivo eliminado." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
