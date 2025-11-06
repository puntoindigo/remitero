"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useColorTheme } from "@/contexts/ColorThemeContext";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = ""
}: PaginationProps) {
  const { colors } = useColorTheme();
  
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (currentPage <= 3) {
        // Al inicio
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Al final
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // En el medio
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={`pagination-container ${className}`}>
      <div className="pagination-info">
        <span className="pagination-pages">
          Página {currentPage} de {totalPages}
        </span>
      </div>
      
      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
          title="Página anterior"
          style={{
            background: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              const element = e.currentTarget;
              element.style.setProperty('background', colors.gradient, 'important');
              element.style.setProperty('color', '#ffffff', 'important');
              element.style.setProperty('border-color', colors.primary, 'important');
              element.style.setProperty('transform', 'translateY(-1px)', 'important');
              element.style.setProperty('box-shadow', `0 4px 12px ${colors.primary}50`, 'important');
              // También cambiar color del icono
              const icon = element.querySelector('svg');
              if (icon) (icon as unknown as HTMLElement).style.setProperty('color', '#ffffff', 'important');
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              const element = e.currentTarget;
              element.style.setProperty('background', 'white', 'important');
              element.style.setProperty('color', '#374151', 'important');
              element.style.setProperty('border-color', '#d1d5db', 'important');
              element.style.setProperty('transform', 'translateY(0)', 'important');
              element.style.setProperty('box-shadow', 'none', 'important');
              // Restaurar color del icono
              const icon = element.querySelector('svg');
              if (icon) (icon as unknown as HTMLElement).style.setProperty('color', '', 'important');
            }
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="pagination-numbers">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
              disabled={page === '...'}
              className={`pagination-number ${
                page === currentPage ? 'active' : ''
              } ${page === '...' ? 'ellipsis' : ''}`}
              style={page === currentPage ? {
                background: colors.gradient,
                color: '#ffffff',
                borderColor: colors.primary,
                fontWeight: '600',
              } : {
                background: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled && page !== currentPage && page !== '...') {
                  const element = e.currentTarget;
                  element.style.setProperty('background', colors.gradient, 'important');
                  element.style.setProperty('color', '#ffffff', 'important');
                  element.style.setProperty('border-color', colors.primary, 'important');
                  element.style.setProperty('transform', 'translateY(-1px)', 'important');
                  element.style.setProperty('box-shadow', `0 4px 12px ${colors.primary}50`, 'important');
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled && page !== currentPage && page !== '...') {
                  const element = e.currentTarget;
                  element.style.setProperty('background', 'white', 'important');
                  element.style.setProperty('color', '#374151', 'important');
                  element.style.setProperty('border-color', '#d1d5db', 'important');
                  element.style.setProperty('transform', 'translateY(0)', 'important');
                  element.style.setProperty('box-shadow', 'none', 'important');
                }
              }}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
          title="Página siguiente"
          style={{
            background: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              const element = e.currentTarget;
              element.style.setProperty('background', colors.gradient, 'important');
              element.style.setProperty('color', '#ffffff', 'important');
              element.style.setProperty('border-color', colors.primary, 'important');
              element.style.setProperty('transform', 'translateY(-1px)', 'important');
              element.style.setProperty('box-shadow', `0 4px 12px ${colors.primary}50`, 'important');
              // También cambiar color del icono
              const icon = element.querySelector('svg');
              if (icon) (icon as unknown as HTMLElement).style.setProperty('color', '#ffffff', 'important');
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              const element = e.currentTarget;
              element.style.setProperty('background', 'white', 'important');
              element.style.setProperty('color', '#374151', 'important');
              element.style.setProperty('border-color', '#d1d5db', 'important');
              element.style.setProperty('transform', 'translateY(0)', 'important');
              element.style.setProperty('box-shadow', 'none', 'important');
              // Restaurar color del icono
              const icon = element.querySelector('svg');
              if (icon) (icon as unknown as HTMLElement).style.setProperty('color', '', 'important');
            }
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
