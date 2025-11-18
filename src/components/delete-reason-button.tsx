/**
 * Archivo: src/components/delete-reason-button.tsx
 *
 * Componente de cliente para el modal de "Eliminar Motivo".
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
import { Trash2 } from "lucide-react";

interface DeleteReasonButtonProps {
  reasonId: string;
}

export function DeleteReasonButton({ reasonId }: DeleteReasonButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/reasons/${reasonId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          /* ... (toast de error) ... */
        });
        setLoading(false);
      } else {
        toast({
          title: "¡Éxito!",
          description: "Motivo eliminado exitosamente.",
        });
        router.refresh();
      }
    } catch (err) {
      /* ... (toast de red) ... */
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Eliminar Motivo</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Los movimientos que usaron este
            motivo se mantendrán, pero perderán la etiqueta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Eliminando..." : "Sí, eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
