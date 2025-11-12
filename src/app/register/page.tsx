/**
 * Archivo: src/app/register/page.tsx
 *
 * Página de Registro de Usuario.
 * Es un "Client Component" (usa "use client") porque tiene interactividad (un formulario).
 */

"use client"; // Directiva de Next.js para componentes de cliente

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  // Estados para manejar los inputs del formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para manejar la respuesta de la API
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // Para redirigir al usuario

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    setLoading(true);
    setError("");
    setSuccess("");

    // Validación simple en el cliente
    if (!name || !email || !password) {
      setError("Por favor, completa todos los campos.");
      setLoading(false);
      return;
    }

    try {
      // Hacemos la petición a nuestra API de registro
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Si el servidor responde con un error (ej. 409, 500)
        setError(data.error || "Algo salió mal. Inténtalo de nuevo.");
      } else {
        // ¡Éxito!
        setSuccess("¡Usuario creado! Redirigiendo al login...");

        // Esperamos 2 segundos para que el usuario lea el mensaje
        // y luego lo redirigimos a la página de login.
        setTimeout(() => {
          router.push("/login"); // Asumimos que esta página existirá
        }, 2000);
      }
    } catch (err) {
      // Error de red (ej. no hay internet, el servidor está caído)
      setError("Error de red. No se pudo conectar al servidor.");
    } finally {
      // Se ejecuta siempre, haya éxito o error
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Crear una Cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para registrarte en el sistema de inventario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || !!success} // Deshabilitar si está cargando o si ya fue exitoso
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || !!success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••••• (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !!success}
              />
            </div>

            {/* Mensaje de Error */}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
            )}

            {/* Mensaje de Éxito */}
            {success && (
              <p className="text-sm text-green-600 dark:text-green-500">
                {success}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !!success}
            >
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
