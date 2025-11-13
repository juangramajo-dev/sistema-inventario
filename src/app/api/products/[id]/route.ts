/**
 * Archivo: src/app/api/products/[id]/route.ts
 *
 * API para eliminar (DELETE) un producto.
 *
 * --- ¡FIX DEFINITIVO! ---
 * Leemos el ID desde la URL (request.url) en lugar de
 * context.params, que está bugueado en el compilador.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Prisma } from "@/generated/prisma";

export async function DELETE(
  request: Request,
  // Dejamos 'context' aquí solo para que Next.js reconozca
  // la ruta como dinámica, ¡pero NO LO USAREMOS!
  context: { params: { id: string } }
) {
  try {
    // --- ¡NUEVO MÉTODO PARA OBTENER EL ID! ---

    // 1. Leemos la URL completa (ej: "http://.../api/products/123-abc")
    const url = new URL(request.url);

    // 2. Dividimos la ruta por "/" (ej: ['', 'api', 'products', '123-abc'])
    //    y tomamos el último segmento (.pop()), que es el ID.
    const productId = url.pathname.split("/").pop();

    // 3. Verificamos que obtuvimos un ID
    if (!productId) {
      return NextResponse.json(
        { error: "No se pudo encontrar el ID del producto en la URL." },
        { status: 400 } // 400 Bad Request
      );
    }
    // --- FIN DEL NUEVO MÉTODO ---

    // 4. Proteger la ruta y obtener el ID del usuario
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const userId = session.user.id;

    // 5. Ejecutar la sentencia DELETE con SQL crudo
    //    Usamos el 'productId' que sacamos de la URL.
    const result = await prisma.$executeRaw(
      Prisma.sql`
        DELETE FROM Product 
        WHERE id = ${productId} AND authorId = ${userId}
      `
    );

    // 6. Verificar si algo se borró
    if (result === 0) {
      return NextResponse.json(
        {
          error: "Producto no encontrado o no tienes permiso para eliminarlo.",
        },
        { status: 404 } // 404 Not Found
      );
    }

    // 7. Devolver éxito
    return NextResponse.json(
      { message: "Producto eliminado exitosamente." },
      { status: 200 } // 200 OK
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
