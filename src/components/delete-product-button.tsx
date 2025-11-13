/**
 * Archivo: src/components/delete-product-button.tsx
 *
 * Componente de cliente ("use client") que muestra el botón "Eliminar"
 * y el modal de confirmación (AlertDialog) de Shadcn.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Definimos las props que el botón necesita
interface DeleteProductButtonProps {
  productId: string;
}

export function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Para refrescar la página
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Llamar a nuestra API de DELETE
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error al eliminar",
          description: result.error || "No se pudo eliminar el producto.",
          variant: "destructive",
        });
        setError(result.error || "No se pudo eliminar el producto.");
      } else {
        toast({
          title: "¡Éxito!",
          description: "Producto eliminado exitosamente.",
        });
        router.refresh();
      }
    } catch (err) {
      toast({
        title: "Error de red",
        description: "No se pudo conectar a la API.",
        variant: "destructive",
      });
      setError("Error de red. No se pudo conectar a la API.");
    } finally {
      // Nota: No seteamos setLoading(false) porque el modal se cierra
      // y el componente se "desmonta" al refrescar.
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/* Este es el botón que se ve en la tabla */}
        <Button variant="destructive" size="sm">
          Eliminar
        </Button>
      </AlertDialogTrigger>
      {/* Este es el contenido del modal (pop-up) */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El producto se eliminará
            permanentemente de la base de datos.
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Botón de Cancelar */}
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          {/* Botón de Confirmar Eliminación */}
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700" // Estilo extra de peligro
          >
            {loading ? "Eliminando..." : "Sí, eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
