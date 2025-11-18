/**
 * Archivo: src/components/new-movement-form.tsx
 *
 * ¡ACTUALIZADO! Incluye la selección de Motivos de Movimiento.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tipos
type Product = { id: string; name: string };
type MovementType = "IN" | "OUT";
type MovementReason = { id: string; name: string; type: MovementType };

// Props
interface NewMovementFormProps {
  products: Product[];
  reasons: MovementReason[]; // <-- MOTIVOS
}

export function NewMovementForm({ products, reasons }: NewMovementFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Estados para el formulario
  const [productId, setProductId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<MovementType | undefined>(undefined);
  // Usamos "NONE" para el valor inicial/nulo del Select
  const [reasonId, setReasonId] = useState<string | undefined>("NONE");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  // Filtramos los motivos según el tipo de movimiento seleccionado
  const filteredReasons = reasons.filter((r) => r.type === type);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    // Validación de cliente
    if (!productId || !type || !quantity) {
      toast({
        title: "Error de Formulario",
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
          // Enviamos "NONE" si no se selecciona nada (el backend lo convierte a null)
          reasonId: reasonId,
          notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error al registrar",
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
        setReasonId("NONE"); // Resetear a NONE
        setQuantity("");
        setNotes("");
        // Refrescar la página (actualiza el Kardex y el Dashboard)
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

  // Cuando el tipo de movimiento cambia, reiniciamos el motivo.
  const handleTypeChange = (newType: string) => {
    setType(newType as MovementType);
    setReasonId("NONE"); // Resetear el motivo a "NONE"
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Registrar Movimiento de Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
          {/* Fila 1: Producto, Tipo, Cantidad */}
          <div className="col-span-3 sm:col-span-1">
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

          <div className="col-span-3 sm:col-span-1">
            <Label>Tipo de Movimiento</Label>
            <Select onValueChange={handleTypeChange} value={type}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Entrada (+)</SelectItem>
                <SelectItem value="OUT">Salida (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-3 sm:col-span-1">
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

          {/* Fila 2: Motivo y Notas */}
          <div className="col-span-3 sm:col-span-1">
            <Label>Motivo</Label>
            <Select
              onValueChange={setReasonId}
              value={reasonId}
              // Deshabilitado si no se selecciona el tipo o no hay motivos filtrados
              disabled={!type || filteredReasons.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    type
                      ? `Selecciona un motivo de ${
                          type === "IN" ? "Entrada" : "Salida"
                        }`
                      : "Selecciona el tipo primero..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">(Sin Motivo Específico)</SelectItem>
                {filteredReasons.map((reason) => (
                  <SelectItem key={reason.id} value={reason.id}>
                    {reason.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-3 sm:col-span-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Input
              id="notes"
              placeholder="Ej: Venta Factura #123, Ajuste por rotura..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="col-span-3 text-right">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Registrando..." : "Registrar Movimiento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
