/**
 * Archivo: src/components/data-table-search.tsx
 *
 * Componente de cliente para la barra de búsqueda (Input).
 * Usa use-debounce para evitar saturar el servidor.
 */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce"; // Requiere 'npm install use-debounce'

interface DataTableSearchProps {
  placeholder: string;
}

export function DataTableSearch({ placeholder }: DataTableSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Lee el parámetro 'search' de la URL al iniciar
  const initialSearch = searchParams.get("search") || "";

  // Usamos el estado local para la entrada de texto
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Usamos useDebounce para no hacer la consulta a la BD por cada tecla
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // Este useEffect se dispara cuando el valor "debounced" cambia (500ms después de la última pulsación)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Si hay término de búsqueda, lo añade/actualiza
    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm);
    } else {
      // Si está vacío, elimina el parámetro de la URL
      params.delete("search");
    }

    // Siempre reseteamos a la página 1 cuando la búsqueda cambia
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  return (
    <Input
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="max-w-sm"
    />
  );
}
