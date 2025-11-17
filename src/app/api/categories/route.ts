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
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido." },
        { status: 400 }
      );
    }

    // Verificar si la categoría ya existe para ESTE usuario (usando SQL)
    const existing = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id FROM Category 
        WHERE name = ${name} AND authorId = ${userId}
      `
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre." },
        { status: 409 } // Conflict
      );
    }

    // Crear la categoría (usando SQL)
    const newId = createId();
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO Category (id, name, authorId) 
        VALUES (${newId}, ${name}, ${userId})
      `
    );

    return NextResponse.json(
      { message: "Categoría creada exitosamente." },
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
