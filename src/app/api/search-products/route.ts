/**
 * Archivo: src/app/api/search-products/route.ts
 *
 * API GET para buscar y paginar productos.
 * Utiliza los parámetros 'search', 'page' y 'limit' de la URL.
 * ¡Versión que implementa BUSQUEDA y PAGINACION con SQL!
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Prisma } from "@/generated/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const userId = session.user.id;
    const url = new URL(request.url);

    // 1. Obtener parámetros de URL
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // 2. Construir la cláusula WHERE (incluyendo la búsqueda y el userId)
    // El primer WHERE siempre es para filtrar por usuario
    let whereClause = Prisma.sql`WHERE p.authorId = ${userId}`;

    // Si hay un término de búsqueda, lo añadimos al WHERE
    if (search) {
      // Concatenamos la cláusula con un AND
      whereClause = Prisma.sql`
        ${whereClause} 
        AND (
          p.name LIKE ${`%${search}%`} OR 
          p.sku LIKE ${`%${search}%`} OR
          p.description LIKE ${`%${search}%`}
        )
      `;
    }

    // 3. Consultas paralelas: Total de items y datos de la página
    const [totalItemsResult, productsResult] = await prisma.$transaction([
      // Consulta 1: Contar el total de items (con la búsqueda aplicada)
      // Usamos AS total para obtener el nombre del campo que esperamos
      prisma.$queryRaw(
        Prisma.sql`SELECT COUNT(p.id) AS total FROM Product p ${whereClause}`
      ),

      // Consulta 2: Obtener los productos para la página actual
      prisma.$queryRaw(
        Prisma.sql`
          SELECT 
            p.id, p.name, p.sku, p.price, p.quantity, p.description, p.createdAt,
            p.categoryId, p.supplierId 
          FROM Product p
          ${whereClause}
          ORDER BY p.createdAt DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `
      ),
    ]);

    // Calcular metadatos de paginación
    const totalItems = (totalItemsResult as any[])[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      products: productsResult,
      pagination: {
        totalItems: Number(totalItems), // Aseguramos que sea un Number
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error en search-products API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al buscar productos." },
      { status: 500 }
    );
  }
}
