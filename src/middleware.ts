export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto las que comienzan con:
     * - /api (rutas de API)
     * - /_next/static (archivos estáticos)
     * - /_next/image (imágenes optimizadas)
     * - /favicon.ico (el ícono)
     * - /login (nuestra página de inicio de sesión)
     * - /register (nuestra página de registro)
     *
     * Esto significa que CUALQUIER otra ruta (como "/", "/dashboard", "/perfil")
     * estará protegida y requerirá inicio de sesión.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
};
