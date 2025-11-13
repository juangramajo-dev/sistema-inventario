/**
 * Archivo: src/components/new-product-form.tsx
 *
 * Componente (UI) para el formulario de creación de productos.
 * Esta versión "Mejorada" maneja correctamente las respuestas JSON
 * de éxito y error de la API.
 */

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function NewProductForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para cada campo del formulario
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const productData = {
      name,
      sku,
      price: parseFloat(price), // Convertir a número
      quantity: parseInt(quantity, 10), // Convertir a número
      description,
    };

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      // --- INICIO DE LA LÓGICA MEJORADA ---

      // Intenta leer el cuerpo de la respuesta, sea cual sea el status
      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error al crear",
          description: result.error || "No se pudo crear el producto.",
          variant: "destructive",
        });
        setError(result.error || "Ocurrió un error desconocido.");
      } else {
        toast({
          title: "¡Éxito!",
          description: "Producto creado exitosamente.",
        });
        setSuccess(result.message || "¡Producto creado exitosamente!");

        // Limpiar el formulario tras el éxito
        setName("");
        setSku("");
        setPrice("");
        setQuantity("");
        setDescription("");
      }
      // --- FIN DE LA LÓGICA MEJORADA ---
    } catch (err) {
      toast({
        title: "Error de red",
        description: "No se pudo conectar a la API.",
        variant: "destructive",
      });
      console.error("Error de fetch:", err);
      setError("Error de red. No se pudo conectar a la API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Añadir Nuevo Producto</CardTitle>
        <CardDescription>
          Completa los datos para registrar un nuevo ítem en el inventario.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                placeholder="Ej: Teclado Mecánico"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Código Único)</Label>
              <Input
                id="sku"
                placeholder="Ej: TEC-MEC-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio (Ej: 1200.50)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="1200.50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad (Stock Inicial)</Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descripción detallada del producto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Muestra mensajes de Éxito o Error */}
          {error && (
            <p className="mt-4 text-sm font-medium text-red-500">{error}</p>
          )}
          {success && (
            <p className="mt-4 text-sm font-medium text-green-500">{success}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando Producto..." : "Añadir Producto"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
