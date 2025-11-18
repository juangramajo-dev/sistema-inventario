/**
 *
 * Muestra una lista de productos con bajo stock.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react"; // Ícono de alerta

// Tipo simple para los productos que recibe
type LowStockProduct = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
};

interface LowStockAlertProps {
  products: LowStockProduct[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Alertas de Bajo Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ¡Buenas noticias! No hay productos con bajo stock.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-600">
          <AlertTriangle className="h-5 w-5" />
          Alertas de Bajo Stock ({products.length})
        </CardTitle>
        <CardDescription>
          Estos productos necesitan ser reabastecidos pronto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Stock Restante</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell className="text-right font-bold text-red-600">
                  {product.quantity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
