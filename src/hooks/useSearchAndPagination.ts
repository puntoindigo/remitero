"use client";

import { useState, useMemo } from "react";

interface UseSearchAndPaginationProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  itemsPerPage?: number;
}

export function useSearchAndPagination<T>({
  data,
  searchFields,
  itemsPerPage = 10
}: UseSearchAndPaginationProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Asegurar que data sea siempre un array
  const safeData = Array.isArray(data) ? data : [];


  // Filtrar datos basado en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!Array.isArray(safeData) || safeData.length === 0) {
      return [];
    }
    if (!searchTerm.trim()) {
      return safeData;
    }

    const term = searchTerm.toLowerCase();
    const filtered = safeData.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(term);
        }
        if (typeof value === "number") {
          return value.toString().includes(term);
        }
        if (value && typeof value === "object" && "name" in value) {
          return (value as any).name.toLowerCase().includes(term);
        }
        return false;
      })
    );
    return filtered;
  }, [safeData, searchTerm, searchFields]);

  // Calcular paginación
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Resetear página cuando cambia la búsqueda
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedData,
    handleSearchChange,
    handlePageChange
  };
}
