/**
 * Archivo: src/components/new-product-form.tsx
 *
 * ¡CORREGIDO!
 * - El estado inicial ahora es "NONE" en lugar de "".
 * - El <SelectItem> de "(Ninguna)" ahora usa value="NONE".
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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

interface NewProductFormProps {
  categories: SelectItem[];
  suppliers: SelectItem[];
}

// 1. Estado inicial actualizado
const initialState = {
  name: "",
  sku: "",
  price: "",
  quantity: "",
  description: "",
  categoryId: "NONE", // <-- CORREGIDO
  supplierId: "NONE", // <-- CORREGIDO
};

export function NewProductForm({ categories, suppliers }: NewProductFormProps) {
  const [loading, setLoading] = useState(false);
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
          /* ... (toast de error) ... */
        });
      } else {
        toast({
          title: "¡Éxito!",
          description: "Producto creado exitosamente.",
        });
        setFormData(initialState); // Limpiar el formulario
        router.refresh();
      }
    } catch (err) {
      toast({
        /* ... (toast de red) ... */
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Añadir Nuevo Producto</CardTitle>
        <CardDescription>
          Completa los datos para registrar un nuevo ítem en el inventario.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          {/* ... (campos name, sku, price, quantity) ... */}
          <div className="col-span-1">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="sku">SKU (Código Único)</Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="price">Precio (Ej: 1200.50)</Label>
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
            <Label htmlFor="quantity">Cantidad (Stock Inicial)</Label>
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

          {/* --- Campos de Select CORREGIDOS --- */}
          <div className="col-span-1">
            <Label htmlFor="categoryId">Categoría</Label>
            <Select
              onValueChange={handleCategoryChange}
              value={formData.categoryId}
            >
              <SelectTrigger id="categoryId">
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
            <Label htmlFor="supplierId">Proveedor</Label>
            <Select
              onValueChange={handleSupplierChange}
              value={formData.supplierId}
            >
              <SelectTrigger id="supplierId">
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
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-2 text-right">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Añadir Producto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
