"use client";

import React from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface SearchAndPaginationProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  placeholder?: string;
  children?: React.ReactNode;
}

export default function SearchAndPagination({
  searchTerm,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  placeholder = "Buscar...",
  children
}: SearchAndPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="search-pagination">
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="search-input"
          />
        </div>
        {children}
      </div>

      <div className="pagination-info">
        <span className="pagination-text">
          Mostrando {startItem}-{endItem} de {totalItems} elementos
        </span>
        
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <span className="pagination-page">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
