/**
 * Archivo: src/app/api/search-products/route.ts
 *
 * ¡FIX DE BIGINT!
 * - Convierte totalItems a Number antes de calcular totalPages.
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

    // 2. Construir la cláusula WHERE
    let whereClause = Prisma.sql`WHERE p.authorId = ${userId}`;
    
    if (search) {
      whereClause = Prisma.sql`
        ${whereClause} 
        AND (
          p.name LIKE ${`%${search}%`} OR 
          p.sku LIKE ${`%${search}%`} OR
          p.description LIKE ${`%${search}%`}
        )
      `;
    }

    // 3. Consultas paralelas
    const [totalItemsResult, productsResult] = await prisma.$transaction([
      // Consulta 1: Contar el total de items
      prisma.$queryRaw(Prisma.sql`SELECT COUNT(p.id) AS total FROM Product p ${whereClause}`),
      
      // Consulta 2: Obtener los productos de la página
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

    // 4. --- ¡FIX DE BigInt! ---
    // El resultado del COUNT es un BigInt, lo convertimos a Number.
    const totalItemsRaw = (totalItemsResult as any[])[0].total;
    const totalItems = Number(totalItemsRaw); // <-- CONVERSIÓN CRÍTICA

    // 5. Calcular metadatos de paginación
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      products: productsResult,
      pagination: {
        totalItems: totalItems, 
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