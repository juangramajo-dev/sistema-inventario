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
import { DeleteCategoryButton } from "./delete-category-button";
import { EditCategoryForm } from "./edit-category-form";

// Definimos el tipo 'Category' (simplificado)
type Category = {
  id: string;
  name: string;
};

// Definimos las props: 'initialCategories' vendrán del Server Component
interface CategoryManagerProps {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "No se pudo crear la categoría.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Éxito!",
          description: "Categoría creada.",
        });
        setCategoryName(""); // Limpiar el input
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
        <CardTitle>Gestionar Categorías</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Formulario de Creación */}
        <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
          <Input
            placeholder="Nombre de la nueva categoría"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
            className="flex-grow"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear Categoría"}
          </Button>
        </form>

        {/* Tabla de Categorías Existentes */}
        <h3 className="mb-2 font-semibold">Categorías Existentes</h3>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-gray-500">
                    No hay categorías creadas.
                  </TableCell>
                </TableRow>
              ) : (
                initialCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <EditCategoryForm category={category} />
                      <DeleteCategoryButton categoryId={category.id} />
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
