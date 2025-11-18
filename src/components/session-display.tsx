/**
 * Archivo: src/components/session-display.tsx
 *
 * Este es un "Client Component" que muestra el estado de la sesión actual.
 * Usa el hook useSession() de next-auth/react.
 */

"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function SessionDisplay() {
  // useSession() es el hook principal para leer la sesión en el cliente.
  const { data: session, status } = useSession();

  // 'status' puede ser "loading", "authenticated", o "unauthenticated"
  if (status === "loading") {
    return (
      <div className="text-center p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
        <p className="font-medium text-gray-700 dark:text-gray-300">
          Cargando sesión...
        </p>
      </div>
    );
  }

  // Si la sesión existe (authenticated)
  if (session) {
    return (
      <div className="w-full max-w-lg p-6 border rounded-lg shadow-xl bg-white dark:bg-gray-800 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          ¡Bienvenido, {session.user?.name || session.user?.email}!
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tu sesión está activa.
        </p>

        {/* Mostramos los datos de la sesión para depuración */}
        {/* <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md overflow-x-auto">
          <pre className="text-xs text-gray-800 dark:text-gray-200">
            <code>{JSON.stringify(session, null, 2)}</code>
          </pre>
        </div> */}
      </div>
    );
  }

  // Si no hay sesión (unauthenticated)
  return (
    <div className="w-full max-w-md p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 text-center space-y-4">
      <p className="font-medium text-gray-700 dark:text-gray-300">
        No has iniciado sesión.
      </p>
      <Button asChild className="w-full">
        <Link href="/login">Ir a Login</Link>
      </Button>
    </div>
  );
}
