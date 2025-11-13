/**
 * Archivo: src/components/edit-product-form.tsx
 *
 * Componente de cliente ("use client") que muestra el botón "Editar"
 * y el modal (Dialog) con el formulario para actualizar un producto.
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
import { Pencil } from "lucide-react"; // ¡Un ícono para el botón!

// Definimos el "tipo" de producto que esperamos recibir
// (Asegúrate que coincida con el de product-list.tsx)
type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  description?: string | null; // Añadimos description
  createdAt: Date;
};

// Definimos las props que el componente aceptará
interface EditProductFormProps {
  product: Product;
}

export function EditProductForm({ product }: EditProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // Estado para controlar el modal

  // Estados para cada campo del formulario
  // Los inicializamos con los valores del producto que recibimos
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku);
  const [price, setPrice] = useState(product.price);
  const [quantity, setQuantity] = useState(product.quantity);
  const [description, setDescription] = useState(product.description || "");

  // Sincronizar estado si las props cambian (ej: después de un refresh)
  useEffect(() => {
    setName(product.name);
    setSku(product.sku);
    setPrice(product.price);
    setQuantity(product.quantity);
    setDescription(product.description || "");
  }, [product]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const updatedData = {
      name,
      sku,
      price,
      quantity,
      description,
    };

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error al actualizar",
          description: result.error || "No se pudo actualizar el producto.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Éxito!",
          description: "Producto actualizado exitosamente.",
        });
        setOpen(false); // ¡Cerrar el modal al tener éxito!
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
        {/* Este es el botón "Editar" en la tabla */}
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      {/* Contenido del Modal (Dialog) */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Actualiza los datos del producto. Haz clic en 'Guardar' para
            finalizar.
          </DialogDescription>
        </DialogHeader>

        {/* Formulario de Edición */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 py-4">
          <div className="col-span-1">
            <Label htmlFor="edit-name">Nombre del Producto</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="edit-sku">SKU</Label>
            <Input
              id="edit-sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="edit-price">Precio</Label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              required
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="edit-quantity">Cantidad (Stock)</Label>
            <Input
              id="edit-quantity"
              type="number"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              required
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="edit-description">Descripción (Opcional)</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción detallada del producto..."
            />
          </div>

          <DialogFooter className="col-span-2 mt-4">
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
