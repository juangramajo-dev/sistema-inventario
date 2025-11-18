"use client"; // Directiva de Next.js para componentes de cliente

import { useState } from "react";
import { signIn } from "next-auth/react"; // Función de NextAuth para iniciar sesión
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
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const { toast } = useToast();

  // Estados para manejar los inputs del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para manejar la respuesta
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // Para redirigir al usuario

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Llamamos a la función signIn de next-auth
      const result = await signIn("credentials", {
        // Le pasamos las credenciales que definimos en el "motor"
        email: email,
        password: password,

        redirect: false,
      });

      setLoading(false);

      // 2. Verificamos el resultado
      if (result?.error) {
        // Si hay un error (ej. "Contraseña incorrecta"), lo mostramos.
        // 'result.error' contendrá el mensaje que lanzamos en la función 'authorize'
        toast({
          title: "Error",
          description: "No se pudo iniciar sesión.",
          variant: "destructive",
        });
        setError("Error al iniciar sesión.");
      } else if (result?.ok) {
        // ¡Éxito!
        // El inicio de sesión fue correcto.
        setError(""); // Limpiamos cualquier error antiguo

        // (Opcional) Mostrar un mensaje de éxito
        // setSuccess("¡Éxito! Redirigiendo...");

        // Redirigimos al usuario a la página de inicio (dashboard)

        router.push("/"); // Puedes cambiar esto a "/dashboard" en el futuro
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
      setLoading(false);
      toast({
        title: "Error de red",
        description: "No se pudo conectar a la API.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Accede a tu cuenta del sistema de inventario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Mensaje de Error */}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <a
              href="/register"
              className="underline text-blue-600 hover:text-blue-800"
            >
              Regístrate aquí
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
