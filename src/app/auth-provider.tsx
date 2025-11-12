/**
 * Archivo: src/app/auth-provider.tsx
 *
 * Este componente envuelve nuestra aplicación con el SessionProvider de NextAuth.
 * Es necesario para que los hooks como useSession() funcionen.
 * Lo separamos en su propio archivo porque <SessionProvider> requiere "use client",
 * pero nuestro layout.tsx raíz no debería ser un "Client Component".
 */

"use client";

import { SessionProvider } from "next-auth/react";

// Definimos una interfaz simple para las 'props'
interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // El SessionProvider "provee" la información de la sesión
  // a todos los componentes hijos que la necesiten.
  return <SessionProvider>{children}</SessionProvider>;
}
