/**
 * Archivo: src/components/new-product-form.tsx
 *
 * ¡ACTUALIZADO! Ahora es un MODAL (Dialog) en lugar de una Card.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react"; // Icono para el botón
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SelectItem = {
  id: string;
  name: string;
};

interface NewProductFormProps {
  categories: SelectItem[];
  suppliers: SelectItem[];
}

const initialState = {
  name: "",
  sku: "",
  price: "",
  quantity: "",
  description: "",
  categoryId: "NONE",
  supplierId: "NONE",
};

export function NewProductForm({ categories, suppliers }: NewProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // <-- Nuevo estado para controlar el modal
  const [formData, setFormData] = useState(initialState);
  const { toast } = useToast();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
  };
  const handleSupplierChange = (value: string) => {
    setFormData((prev) => ({ ...prev, supplierId: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error al crear",
          description: result.error || "No se pudo crear el producto.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Éxito!",
          description: "Producto creado exitosamente.",
        });
        setFormData(initialState);
        setOpen(false); // <-- ¡CERRAMOS EL MODAL AL FINALIZAR!
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
        {/* Este es el botón que se verá en la página */}
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Añadir Producto
        </Button>
      </DialogTrigger>

      {/* El contenido del modal */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Producto</DialogTitle>
          <DialogDescription>
            Completa los datos para registrar un nuevo ítem.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 py-4">
          <div className="col-span-1">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              step="1"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-1">
            <Label htmlFor="categoryId">Categoría</Label>
            <Select
              onValueChange={handleCategoryChange}
              value={formData.categoryId}
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">(Ninguna)</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <Label htmlFor="supplierId">Proveedor</Label>
            <Select
              onValueChange={handleSupplierChange}
              value={formData.supplierId}
            >
              <SelectTrigger id="supplierId">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">(Ninguno)</SelectItem>
                {suppliers.map((sup) => (
                  <SelectItem key={sup.id} value={sup.id}>
                    {sup.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <DialogFooter className="col-span-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Guardando..." : "Guardar Producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
