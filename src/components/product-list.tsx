/**
 * Archivo: src/components/product-list.tsx
 *
 * ACTUALIZADO: Acepta y pasa 'categories' y 'suppliers'
 * a EditProductForm.
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteProductButton } from "./delete-product-button";
import { EditProductForm } from "./edit-product-form";

// 1. Definimos los tipos para las props
type SelectItem = {
  id: string;
  name: string;
};

// 2. Actualizamos el tipo Product
type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  description?: string | null;
  createdAt: Date;
  categoryId: string | null; // <-- ¡NUEVO!
  supplierId: string | null; // <-- ¡NUEVO!
};

// 3. Actualizamos las Props del componente
interface ProductListProps {
  products: Product[];
  categories: SelectItem[];
  suppliers: SelectItem[];
}

export function ProductList({
  products,
  categories,
  suppliers,
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 dark:text-gray-400">
            Aún no has añadido ningún producto.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mi Inventario ({products.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell className="text-right">
                  ${product.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">{product.quantity}</TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* 4. Pasamos las listas al formulario de edición */}
                    <EditProductForm
                      product={product}
                      categories={categories}
                      suppliers={suppliers}
                    />
                    <DeleteProductButton productId={product.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
