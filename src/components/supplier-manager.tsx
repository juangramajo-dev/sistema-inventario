/**
 * Archivo: src/components/supplier-manager.tsx
 *
 * Componente de cliente para crear y listar proveedores.
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
import { EditSupplierForm } from "./edit-supplier-form";
import { DeleteSupplierButton } from "./delete-supplier-button";

// Definimos el tipo (debe coincidir con la data de la BD)
type Supplier = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
};

interface SupplierManagerProps {
  initialSuppliers: Supplier[];
}

export function SupplierManager({ initialSuppliers }: SupplierManagerProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Estados para el formulario de creación
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "No se pudo crear el proveedor.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Éxito!",
          description: "Proveedor creado.",
        });
        // Limpiar el formulario
        setFormData({ name: "", contactName: "", phone: "", email: "" });
        (event.target as HTMLFormElement).reset();
        router.refresh(); // Recargar los datos del servidor (y la lista)
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
        <CardTitle>Gestionar Proveedores</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Formulario de Creación */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
          <Input
            name="name"
            placeholder="Nombre del Proveedor (requerido)"
            value={formData.name}
            onChange={handleChange}
            required
            className="col-span-2 sm:col-span-1"
          />
          <Input
            name="contactName"
            placeholder="Nombre de Contacto (opcional)"
            value={formData.contactName}
            onChange={handleChange}
            className="col-span-2 sm:col-span-1"
          />
          <Input
            name="phone"
            placeholder="Teléfono (opcional)"
            value={formData.phone}
            onChange={handleChange}
            className="col-span-2 sm:col-span-1"
          />
          <Input
            name="email"
            type="email"
            placeholder="Email (opcional)"
            value={formData.email}
            onChange={handleChange}
            className="col-span-2 sm:col-span-1"
          />
          <Button
            type="submit"
            disabled={loading}
            className="col-span-2 sm:col-span-1"
          >
            {loading ? "Creando..." : "Crear Proveedor"}
          </Button>
        </form>

        {/* Tabla de Proveedores Existentes */}
        <h3 className="mb-2 font-semibold">Proveedores Existentes</h3>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No hay proveedores creados.
                  </TableCell>
                </TableRow>
              ) : (
                initialSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      {supplier.name}
                    </TableCell>
                    <TableCell>{supplier.contactName || "N/A"}</TableCell>
                    <TableCell>{supplier.phone || "N/A"}</TableCell>
                    <TableCell>{supplier.email || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditSupplierForm supplier={supplier} />
                        <DeleteSupplierButton supplierId={supplier.id} />
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
