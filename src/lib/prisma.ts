import { PrismaClient } from "@/generated/prisma"; // Usamos el alias @/

// Declaramos un tipo global para 'prisma' en el objeto 'globalThis'
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Exportamos la instancia de prisma
export const prisma =
  globalThis.prisma || // Reutiliza la instancia existente si está en global
  new PrismaClient({
    // O crea una nueva si no existe
    // Opcional: descomenta la línea de abajo si quieres ver
    // las consultas SQL exactas en tu terminal de 'npm run dev'
    // log: ['query', 'info', 'warn', 'error'],
  });

// En desarrollo, asignamos la instancia a 'globalThis'.
// Esto evita que Next.js (con su recarga en caliente) cree
// cientos de nuevas instancias de PrismaClient cada vez que guardas un archivo.
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
