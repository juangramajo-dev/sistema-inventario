/**
 * Archivo: src/components/data-table-pagination.tsx
 *
 * Componente de cliente que maneja la paginación y el selector de tamaño.
 * Controla los parámetros 'page' y 'limit' de la URL.
 */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Props para el componente de paginación
interface DataTablePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  resource: string; // 'products', 'categories', etc.
}

export function DataTablePagination({
  totalItems,
  itemsPerPage,
  currentPage,
  totalPages,
}: DataTablePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    // Nos aseguramos de que el número de página sea válido
    const newPage = Math.max(1, Math.min(totalPages, page));
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  const setPageSize = (size: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", size);
    // Siempre resetear a la página 1 cuando se cambia el límite
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between px-2 py-4 border-t">
      {/* Información del Total */}
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium hidden sm:block">Items por página</p>
        <Select value={String(itemsPerPage)} onValueChange={setPageSize}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={itemsPerPage} />
          </SelectTrigger>
          <SelectContent side="top">
            {[5, 10, 20, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={String(pageSize)}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm font-medium text-muted-foreground">
          {totalItems} total
        </div>
      </div>

      {/* Controles de Paginación */}
      <div className="flex items-center space-x-4">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Página {currentPage} de {totalPages}
        </div>

        {/* Botón Primera Página */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0 hidden lg:flex"
          onClick={() => setPage(1)}
          disabled={currentPage <= 1}
        >
          <span className="sr-only">Ir a la primera página</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Botón Página Anterior */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <span className="sr-only">Ir a la página anterior</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Botón Página Siguiente */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <span className="sr-only">Ir a la página siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Botón Última Página */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0 hidden lg:flex"
          onClick={() => setPage(totalPages)}
          disabled={currentPage >= totalPages}
        >
          <span className="sr-only">Ir a la última página</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
