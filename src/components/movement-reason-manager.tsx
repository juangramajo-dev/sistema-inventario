/**
 * Archivo: src/components/movement-reason-manager.tsx
 *
 * Componente de cliente para crear y listar Motivos de Movimiento.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditReasonForm } from "./edit-reason-form";
import { DeleteReasonButton } from "./delete-reason-button";

type MovementType = "IN" | "OUT";
type MovementReason = { id: string; name: string; type: MovementType };

interface MovementReasonManagerProps {
  initialReasons: MovementReason[];
}

export function MovementReasonManager({
  initialReasons,
}: MovementReasonManagerProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<MovementType | undefined>(undefined);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!type) {
      toast({
        title: "Error",
        description: "Debes seleccionar un tipo (Entrada/Salida).",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/reasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "No se pudo crear el motivo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Éxito!",
          description: "Motivo creado.",
        });
        setName("");
        // No limpiamos el 'type' para facilitar la inserción de múltiples del mismo tipo
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
        <CardTitle>Gestionar Motivos de Movimiento</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Formulario de Creación */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 mb-6 items-end"
        >
          <Input
            placeholder="Nombre del Motivo (Ej: Venta, Merma, Compra)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-grow"
          />
          <Select
            onValueChange={(v) => setType(v as MovementType)}
            value={type}
          >
            <SelectTrigger className="w-[150px] shrink-0">
              <SelectValue placeholder="Tipo (IN/OUT)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN">Entrada (+)</SelectItem>
              <SelectItem value="OUT">Salida (-)</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={loading} className="shrink-0">
            {loading ? "Creando..." : "Crear Motivo"}
          </Button>
        </form>

        {/* Tabla de Motivos Existentes */}
        <h3 className="mb-2 font-semibold">
          Motivos Existentes ({initialReasons.length})
        </h3>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialReasons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    No hay motivos creados.
                  </TableCell>
                </TableRow>
              ) : (
                initialReasons.map((reason) => (
                  <TableRow key={reason.id}>
                    <TableCell className="font-medium">{reason.name}</TableCell>
                    <TableCell>
                      <span
                        className={
                          reason.type === "IN"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {reason.type === "IN" ? "ENTRADA" : "SALIDA"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditReasonForm reason={reason} />
                        <DeleteReasonButton reasonId={reason.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
