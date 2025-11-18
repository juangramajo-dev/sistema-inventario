/**
 * Archivo: src/components/edit-product-form.tsx
 *
 * ¡CORREGIDO!
 * - El estado inicial ahora es "NONE" en lugar de "".
 * - El <SelectItem> de "(Ninguna)" ahora usa value="NONE".
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SelectItem = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  description?: string | null;
  createdAt: Date;
  categoryId: string | null;
  supplierId: string | null;
};

interface EditProductFormProps {
  product: Product;
  categories: SelectItem[];
  suppliers: SelectItem[];
}

export function EditProductForm({
  product,
  categories,
  suppliers,
}: EditProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // 1. Estado inicial actualizado
  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    price: product.price,
    quantity: product.quantity,
    description: product.description || "",
    categoryId: product.categoryId || "NONE", // <-- CORREGIDO
    supplierId: product.supplierId || "NONE", // <-- CORREGIDO
  });

  // Sincronizar estado si las props cambian
  useEffect(() => {
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
      description: product.description || "",
      categoryId: product.categoryId || "NONE", // <-- CORREGIDO
      supplierId: product.supplierId || "NONE", // <-- CORREGIDO
    });
  }, [product]);

  // (Handlers para inputs y selects)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "price") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === "quantity") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        setOpen(false);
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
          <span className="sr-only">Editar Producto</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Actualiza los datos del producto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 py-4">
          {/* ... (campos name, sku, price, quantity) ... */}
          <div className="col-span-1">
            <Label htmlFor="edit-name">Nombre</Label>
            <Input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="edit-sku">SKU</Label>
            <Input
              id="edit-sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="edit-price">Precio</Label>
            <Input
              id="edit-price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="edit-quantity">Cantidad</Label>
            <Input
              id="edit-quantity"
              name="quantity"
              type="number"
              step="1"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          {/* --- Campos de Select CORREGIDOS --- */}
          <div className="col-span-1">
            <Label htmlFor="edit-categoryId">Categoría</Label>
            <Select
              onValueChange={handleCategoryChange}
              value={formData.categoryId}
            >
              <SelectTrigger id="edit-categoryId">
                <SelectValue placeholder="Seleccionar (Opcional)" />
              </SelectTrigger>
              <SelectContent>
                {/* 2. value="NONE" */}
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
            <Label htmlFor="edit-supplierId">Proveedor</Label>
            <Select
              onValueChange={handleSupplierChange}
              value={formData.supplierId}
            >
              <SelectTrigger id="edit-supplierId">
                <SelectValue placeholder="Seleccionar (Opcional)" />
              </SelectTrigger>
              <SelectContent>
                {/* 3. value="NONE" */}
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
            <Label htmlFor="edit-description">Descripción</Label>
            <Input
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
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
