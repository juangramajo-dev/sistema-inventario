/**
 *
 * Componente de cliente para el modal de "Editar Proveedor".
 */

"use client";

import { useState, useEffect } from "react";
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

// Definimos el tipo (debe coincidir con la data de la BD)
type Supplier = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
};

interface EditSupplierFormProps {
  supplier: Supplier;
}

export function EditSupplierForm({ supplier }: EditSupplierFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Estados para el formulario, inicializados con los datos del proveedor
  const [formData, setFormData] = useState({
    name: supplier.name,
    contactName: supplier.contactName || "",
    phone: supplier.phone || "",
    email: supplier.email || "",
  });

  // Sincronizar estado si las props cambian (ej: después de un refresh)
  useEffect(() => {
    setFormData({
      name: supplier.name,
      contactName: supplier.contactName || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
    });
  }, [supplier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/suppliers/${supplier.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error al actualizar",
          description: result.error || "No se pudo actualizar el proveedor.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Éxito!",
          description: "Proveedor actualizado exitosamente.",
        });
        setOpen(false); // Cerrar el modal
        router.refresh();
      }
    } catch (err) {
      toast({
        title: "Error de red",
        description: "No se pudo conectar a la API.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar Proveedor</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Proveedor</DialogTitle>
          <DialogDescription>
            Actualiza los datos del proveedor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-sup-name" className="text-right">
              Nombre
            </Label>
            <Input
              id="edit-sup-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-sup-contact" className="text-right">
              Contacto
            </Label>
            <Input
              id="edit-sup-contact"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-sup-phone" className="text-right">
              Teléfono
            </Label>
            <Input
              id="edit-sup-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-sup-email" className="text-right">
              Email
            </Label>
            <Input
              id="edit-sup-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="col-span-3"
            />
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
