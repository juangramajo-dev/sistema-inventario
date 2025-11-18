/**
 * Archivo: src/app/api/reasons/route.ts
 *
 * API para crear (POST) motivos de movimiento.
 * ¡CON SQL CRUDO!
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
    const { name, type } = body; // type será 'IN' o 'OUT'

    if (!name || !type) {
      return NextResponse.json(
        { error: "Nombre y Tipo (IN/OUT) son requeridos." },
        { status: 400 }
      );
    }

    if (type !== "IN" && type !== "OUT") {
      return NextResponse.json(
        { error: "Tipo inválido. Debe ser IN o OUT." },
        { status: 400 }
      );
    }

    // Verificar si el motivo ya existe para ESTE usuario (usando SQL)
    const existing = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id FROM MovementReason 
        WHERE name = ${name} AND authorId = ${userId}
      `
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe un motivo con ese nombre." },
        { status: 409 } // Conflict
      );
    }

    // Crear el motivo (usando SQL)
    const newId = createId();
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO MovementReason (id, name, type, authorId) 
        VALUES (${newId}, ${name}, ${type}, ${userId})
      `
    );

    return NextResponse.json(
      { message: "Motivo creado exitosamente." },
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
