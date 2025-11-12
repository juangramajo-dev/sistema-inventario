/**
 * Archivo: src/app/api/register/route.ts
 *
 * Este es un "Route Handler" de Next.js.
 * Maneja la petición POST a /api/register
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Nuestro singleton de Prisma
import { hash } from "bcrypt"; // Para encriptar la contraseña
import { Prisma } from "@/generated/prisma"; // Para el helper `Prisma.sql`

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // 1. Validar la entrada (input)
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Nombre, email y contraseña son requeridos." },
        { status: 400 } // 400 Bad Request
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    // 2. Hashear la contraseña
    // '10' es el "costo" o "rondas" del hash. 10 o 12 es el estándar.
    const hashedPassword = await hash(password, 10);

    // 3. Crear el usuario en la BD usando SQL crudo (como acordamos)

    // Generamos un ID único compatible con `String @id` (VARCHAR(191))
    // Usamos crypto.randomUUID() que está integrado en Node.js
    const newId = crypto.randomUUID();

    // Usamos $executeRaw para sentencias que NO devuelven datos (INSERT, UPDATE)
    // Usamos Prisma.sql para una protección 100% segura contra Inyección SQL.
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO User (id, name, email, password, createdAt, updatedAt) 
        VALUES (
          ${newId}, ${name}, ${email}, ${hashedPassword}, ${new Date()}, ${new Date()}
        )
      `
    );

    // 4. Devolver una respuesta exitosa
    return NextResponse.json(
      { message: "Usuario creado exitosamente." },
      { status: 201 } // 201 Created
    );
  } catch (error: any) {
    // 5. Manejar errores

    // Manejar el error de "email duplicado"
    // El código P2002 de Prisma es "Unique constraint failed"
    // El error 1062 de MySQL es "Duplicate entry"
    if (error.code === "P2002" || error.message.includes("Duplicate entry")) {
      return NextResponse.json(
        { error: "El email ya está registrado." },
        { status: 409 } // 409 Conflict
      );
    }

    // Para cualquier otro error
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
