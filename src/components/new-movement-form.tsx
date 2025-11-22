/**
 * Archivo: src/components/new-movement-form.tsx
 *
 * ¡ACTUALIZADO! Lógica de Trazabilidad: Muestra Cliente/Proveedor basado en Motivo.
 */

"use client";

import { useState, useEffect } from "react";
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
type SelectEntity = { id: string; name: string };
type MovementType = "IN" | "OUT";
type MovementReason = {
  id: string;
  name: string;
  type: MovementType;
  name: string;
};

// Props
interface NewMovementFormProps {
  products: SelectEntity[];
  reasons: MovementReason[];
  clients: SelectEntity[]; // <-- NUEVA PROP
  suppliers: SelectEntity[]; // <-- NUEVA PROP
}

const initialState = {
  productId: undefined as string | undefined,
  type: undefined as MovementType | undefined,
  reasonId: "NONE" as string | undefined,
  quantity: "",
  notes: "",
  clientId: "NONE" as string | undefined, // <-- NUEVO
  supplierId: "NONE" as string | undefined, // <-- NUEVO
};

export function NewMovementForm({
  products,
  reasons,
  clients,
  suppliers,
}: NewMovementFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Estados
  const [formData, setFormData] = useState(initialState);

  // Lógica de filtrado de motivos y trazabilidad
  const filteredReasons = reasons.filter((r) => r.type === formData.type);
  const selectedReason = reasons.find((r) => r.id === formData.reasonId);

  // --- LÓGICA CONDICIONAL ---
  // Utilizamos includes() para ser flexibles si el usuario nombra el motivo "Venta Minorista"
  const isSale =
    formData.type === "OUT" &&
    selectedReason?.name.toLowerCase().includes("venta");
  const isPurchase =
    formData.type === "IN" &&
    selectedReason?.name.toLowerCase().includes("compra");

  // Determinar qué campo de trazabilidad se debe mostrar y su requisito
  const showClientSelect = isSale;
  const showSupplierSelect = isPurchase;
  const isTrazabilityRequired = isSale || isPurchase;

  // Limpiar Cliente/Proveedor cuando el motivo o tipo cambia
  useEffect(() => {
    // Si la trazabilidad no es requerida, limpiamos
    if (!showClientSelect) {
      setFormData((prev) => ({ ...prev, clientId: "NONE" }));
    }
    if (!showSupplierSelect) {
      setFormData((prev) => ({ ...prev, supplierId: "NONE" }));
    }
    // Se dispara cada vez que cambia el motivo o el tipo.
  }, [formData.type, formData.reasonId, showClientSelect, showSupplierSelect]);

  // Handlers
  const handleTypeChange = (newType: string) => {
    // Resetear el motivo y la trazabilidad al cambiar el tipo
    setFormData((prev) => ({
      ...prev,
      type: newType as MovementType,
      reasonId: "NONE",
      clientId: "NONE",
      supplierId: "NONE",
    }));
  };
  const handleReasonChange = (newReasonId: string) => {
    setFormData((prev) => ({ ...prev, reasonId: newReasonId }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      quantity: parseInt(formData.quantity, 10),
    };

    // Validación de requerimiento de Trazabilidad
    if (isSale && data.clientId === "NONE") {
      toast({
        title: "Error",
        description: "Debes seleccionar un cliente para la venta.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    if (isPurchase && data.supplierId === "NONE") {
      toast({
        title: "Error",
        description: "Debes seleccionar un proveedor para la compra.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validación básica
    if (!data.productId || !data.type || data.quantity <= 0) {
      toast({
        title: "Error",
        description: "Faltan datos requeridos.",
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
          productId: data.productId,
          type: data.type,
          quantity: data.quantity,
          reasonId: data.reasonId,
          notes: data.notes,
          // Solo incluimos el ID si no es "NONE"
          clientId: data.clientId === "NONE" ? null : data.clientId,
          supplierId: data.supplierId === "NONE" ? null : data.supplierId,
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
        toast({ title: "¡Éxito!", description: "Movimiento registrado." });
        setFormData(initialState); // Limpiar el formulario
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
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Fila 1: Producto y Tipo */}
          <div className="col-span-2 lg:col-span-1">
            <Label>Producto</Label>
            <Select
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, productId: v }))
              }
              value={formData.productId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona producto..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <Label>Tipo</Label>
            <Select onValueChange={handleTypeChange} value={formData.type}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Entrada (+)</SelectItem>
                <SelectItem value="OUT">Salida (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              step="1"
              min="1"
              placeholder="Ej: 10"
              value={formData.quantity}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, quantity: e.target.value }))
              }
              required
            />
          </div>

          <div className="col-span-2 lg:col-span-1">
            <Label>Motivo</Label>
            <Select
              onValueChange={handleReasonChange}
              value={formData.reasonId}
              disabled={!formData.type || filteredReasons.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    formData.type
                      ? `Motivo de ${
                          formData.type === "IN" ? "Entrada" : "Salida"
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

          {/* --- CAMPO CONDICIONAL DE TRAZABILIDAD (CLIENTE) --- */}
          {showClientSelect && (
            <div className="col-span-2 lg:col-span-1">
              <Label className="text-blue-600 font-semibold">
                Cliente (Venta)
              </Label>
              <Select
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, clientId: v }))
                }
                value={formData.clientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {/* Si es requerido por VENTA, forzamos la selección */}
                  {clients.length === 0 && (
                    <SelectItem value="no-clients" disabled>
                      No hay clientes creados.
                    </SelectItem>
                  )}
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* --- CAMPO CONDICIONAL DE TRAZABILIDAD (PROVEEDOR) --- */}
          {showSupplierSelect && (
            <div className="col-span-2 lg:col-span-1">
              <Label className="text-purple-600 font-semibold">
                Proveedor (Compra)
              </Label>
              <Select
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, supplierId: v }))
                }
                value={formData.supplierId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proveedor..." />
                </SelectTrigger>
                <SelectContent>
                  {/* Si es requerido por COMPRA, forzamos la selección */}
                  {suppliers.length === 0 && (
                    <SelectItem value="no-suppliers" disabled>
                      No hay proveedores creados.
                    </SelectItem>
                  )}
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* El campo Notas se ajusta para ocupar el espacio restante */}
          <div
            className={
              (isTrazabilityRequired ? "lg:col-span-2" : "lg:col-span-4") +
              " col-span-4"
            }
          >
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Input
              id="notes"
              placeholder="Ej: Número de factura, motivo de merma, etc."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>

          <div className="col-span-4 text-right">
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
