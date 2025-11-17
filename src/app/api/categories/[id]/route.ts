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
    // 1. Obtener el ID de la categoría de la URL
    const url = new URL(request.url);
    const categoryId = url.pathname.split("/").pop();
    if (!categoryId) {
      return NextResponse.json(
        { error: "No se pudo encontrar el ID de la categoría." },
        { status: 400 }
      );
    }

    // 2. Proteger la ruta
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    // 3. Obtener el nuevo 'name' del body
    const body = await request.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido." },
        { status: 400 }
      );
    }

    // 4. Verificar si el nombre ya existe (en OTRA categoría)
    const existing = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id FROM Category 
        WHERE name = ${name} 
          AND authorId = ${userId} 
          AND id != ${categoryId}
      `
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe otra categoría con ese nombre." },
        { status: 409 } // Conflict
      );
    }

    // 5. Ejecutar el UPDATE
    const result = await prisma.$executeRaw(
      Prisma.sql`
        UPDATE Category 
        SET name = ${name}
        WHERE id = ${categoryId} AND authorId = ${userId}
      `
    );

    if (result === 0) {
      return NextResponse.json(
        { error: "Categoría no encontrada o no autorizada." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Categoría actualizada." },
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
    // 1. Obtener el ID de la categoría de la URL
    const url = new URL(request.url);
    const categoryId = url.pathname.split("/").pop();
    if (!categoryId) {
      return NextResponse.json(
        { error: "No se pudo encontrar el ID de la categoría." },
        { status: 400 }
      );
    }

    // 2. Proteger la ruta
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    // 3. Ejecutar el DELETE

    const result = await prisma.$executeRaw(
      Prisma.sql`
        DELETE FROM Category 
        WHERE id = ${categoryId} AND authorId = ${userId}
      `
    );

    if (result === 0) {
      return NextResponse.json(
        { error: "Categoría no encontrada o no autorizada." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Categoría eliminada." },
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
