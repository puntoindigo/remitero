"use client";

import { useState, useMemo } from "react";
import { useSearchAndPagination } from "./useSearchAndPagination";

export interface CRUDTableConfig<T> {
  data: T[];
  loading: boolean;
  searchFields: string[];
  itemsPerPage?: number;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onNew?: () => void;
  getItemId?: (item: T) => string;
  emptyMessage?: string;
  emptySubMessage?: string;
  emptyIcon?: React.ReactNode;
  newButtonText?: string;
  searchPlaceholder?: string;
}

export function useCRUDTable<T>({
  data,
  loading,
  searchFields,
  itemsPerPage = 10,
  onEdit,
  onDelete,
  onNew,
  getItemId = (item: any) => item.id,
  emptyMessage = "No hay datos",
  emptySubMessage = "Comienza creando un nuevo elemento.",
  emptyIcon,
  newButtonText = "Nuevo",
  searchPlaceholder = "Buscar..."
}: CRUDTableConfig<T>) {
  
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    filteredData,
    totalItems,
    totalPages,
    paginatedData,
    handlePageChange,
    handleSearchChange
  } = useSearchAndPagination({
    data,
    searchFields,
    itemsPerPage
  });

  // Configuración para el DataTable
  const tableConfig = useMemo(() => ({
    data: paginatedData,
    loading,
    searchValue: searchTerm,
    onSearchChange: handleSearchChange,
    searchPlaceholder,
    onEdit,
    onDelete,
    onNew,
    getItemId,
    emptyMessage,
    emptySubMessage,
    emptyIcon,
    newButtonText,
    showSearch: true,
    showNewButton: !!onNew,
    showActions: !!(onEdit || onDelete)
  }), [
    paginatedData,
    loading,
    searchTerm,
    handleSearchChange,
    searchPlaceholder,
    onEdit,
    onDelete,
    onNew,
    getItemId,
    emptyMessage,
    emptySubMessage,
    emptyIcon,
    newButtonText
  ]);

  // Configuración para paginación
  const paginationConfig = useMemo(() => ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange: handlePageChange
  }), [currentPage, totalPages, totalItems, itemsPerPage, handlePageChange]);

  return {
    // Datos filtrados y paginados
    filteredData,
    paginatedData,
    totalItems,
    totalPages,
    currentPage,
    
    // Funciones de búsqueda y paginación
    searchTerm,
    setSearchTerm,
    handleSearchChange,
    handlePageChange,
    
    // Configuraciones para componentes
    tableConfig,
    paginationConfig
  };
}

export default useCRUDTable;
