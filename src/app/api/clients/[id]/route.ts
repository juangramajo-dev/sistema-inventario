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
    const clientId = url.pathname.split("/").pop();
    if (!clientId) {
      return NextResponse.json(
        { error: "No se pudo encontrar el ID del cliente." },
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

    // Verificar si el nombre ya existe (en OTRO cliente)
    const existing = await prisma.$queryRaw(
      Prisma.sql`
        SELECT id FROM Client 
        WHERE name = ${name} 
          AND authorId = ${userId} 
          AND id != ${clientId}
      `
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe otro cliente con ese nombre." },
        { status: 409 } // Conflict
      );
    }

    // Ejecutar el UPDATE
    const result = await prisma.$executeRaw(
      Prisma.sql`
        UPDATE Client 
        SET 
          name = ${name}, 
          contactName = ${contactName || null},
          phone = ${phone || null},
          email = ${email || null}
        WHERE id = ${clientId} AND authorId = ${userId}
      `
    );

    if (result === 0) {
      return NextResponse.json(
        { error: "Cliente no encontrado o no autorizado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Cliente actualizado." },
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
    const clientId = url.pathname.split("/").pop();
    if (!clientId) {
      return NextResponse.json(
        { error: "No se pudo encontrar el ID del cliente." },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    // Ejecutar el DELETE
    // El schema.prisma se encarga de poner 'clientId' a NULL en InventoryMovement
    const result = await prisma.$executeRaw(
      Prisma.sql`
        DELETE FROM Client 
        WHERE id = ${clientId} AND authorId = ${userId}
      `
    );

    if (result === 0) {
      return NextResponse.json(
        { error: "Cliente no encontrado o no autorizado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Cliente eliminado." },
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
