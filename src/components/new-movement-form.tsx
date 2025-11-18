/**
 *
 * Componente de cliente para el formulario de "Registrar Movimiento".
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
// ¡Importamos los nuevos componentes Select de Shadcn!
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definimos el tipo 'Product' (simple)
type Product = {
  id: string;
  name: string;
};

// Props: 'products' vendrá del Server Component
interface NewMovementFormProps {
  products: Product[];
}

export function NewMovementForm({ products }: NewMovementFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Estados para el formulario
  const [productId, setProductId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<"IN" | "OUT" | undefined>(undefined);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    // Validación de cliente
    if (!productId || !type || !quantity) {
      toast({
        title: "Error",
        description: "Producto, Tipo y Cantidad son requeridos.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          type,
          quantity: parseInt(quantity, 10),
          notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "No se pudo registrar el movimiento.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Éxito!",
          description: "Movimiento registrado.",
        });
        // Limpiar el formulario
        setProductId(undefined);
        setType(undefined);
        setQuantity("");
        setNotes("");
        // Refrescar la página (¡actualiza la lista de Kardex Y el stock en la otra página!)
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Registrar Movimiento de Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <Label>Producto</Label>
            <Select onValueChange={setProductId} value={productId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un producto..." />
              </SelectTrigger>
              <SelectContent>
                {products.length === 0 ? (
                  <SelectItem value="no-products" disabled>
                    No hay productos creados.
                  </SelectItem>
                ) : (
                  products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-1">
            <Label>Tipo de Movimiento</Label>
            <Select
              onValueChange={(v) => setType(v as "IN" | "OUT")}
              value={type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Entrada (+)</SelectItem>
                <SelectItem value="OUT">Salida (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-1">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              step="1"
              min="1"
              placeholder="Ej: 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="notes">Notas (Razón del movimiento)</Label>
            <Input
              id="notes"
              placeholder="Ej: Venta Factura #123, Ajuste por rotura..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="col-span-2 text-right">
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrar Movimiento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
