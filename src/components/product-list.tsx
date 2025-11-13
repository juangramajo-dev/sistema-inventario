import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteProductButton } from "@/components/delete-product-button";
import { EditProductForm } from "@/components/edit-product-form";

// Definimos el "tipo" de producto que esperamos recibir.

// Debe coincidir con tu schema.prisma
type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  createdAt: Date;
};

// Definimos las props que el componente aceptará
interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  // Si no hay productos, mostramos un mensaje amigable
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

  // Si hay productos, los mostramos en la tabla
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
                  {/* --- 2. AÑADIR EL BOTÓN --- */}
                  <DeleteProductButton productId={product.id} />
                  <EditProductForm product={product} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
