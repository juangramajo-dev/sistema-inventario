/**
 * Archivo: src/components/edit-reason-form.tsx
 *
 * Componente de cliente para el modal de "Editar Motivo".
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MovementType = "IN" | "OUT";
type MovementReason = { id: string; name: string; type: MovementType };

interface EditReasonFormProps {
  reason: MovementReason;
}

export function EditReasonForm({ reason }: EditReasonFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(reason.name);
  const [type, setType] = useState<MovementType>(reason.type);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/reasons/${reason.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          /* ... (toast de error) ... */
        });
      } else {
        toast({
          title: "¡Éxito!",
          description: "Motivo actualizado.",
        });
        setOpen(false);
        router.refresh();
      }
    } catch (err) {
      /* ... (toast de red) ... */
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Motivo: {reason.name}</DialogTitle>
          <DialogDescription>
            Cambia el nombre y tipo del motivo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Nombre
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-type" className="text-right">
              Tipo
            </Label>
            <Select
              onValueChange={(v) => setType(v as MovementType)}
              value={type}
            >
              <SelectTrigger id="edit-type" className="col-span-3">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Entrada (+)</SelectItem>
                <SelectItem value="OUT">Salida (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
