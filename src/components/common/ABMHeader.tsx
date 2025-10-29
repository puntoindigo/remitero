"use client";

import React from "react";
import { Plus } from "lucide-react";
import FilterableSelect from "./FilterableSelect";
import { ShortcutText } from "./ShortcutText";

interface ABMHeaderProps {
  // Selector de empresa (opcional)
  showCompanySelector?: boolean;
  companies?: Array<{ id: string; name: string }>;
  selectedCompanyId?: string;
  onCompanyChange?: (companyId: string) => void;
  
  // Botón Nuevo
  showNewButton?: boolean;
  newButtonText?: string;
  onNewClick?: () => void;
  isSubmitting?: boolean;
  
  // Campos de búsqueda y filtros (opcional)
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  // Filtros adicionales
  additionalFilters?: React.ReactNode;
}

export function ABMHeader({
  showCompanySelector = false,
  companies = [],
  selectedCompanyId = "",
  onCompanyChange,
  showNewButton = true,
  newButtonText = "Nuevo",
  onNewClick,
  isSubmitting = false,
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange,
  additionalFilters
}: ABMHeaderProps) {
  return (
    <>
      {/* Selector de empresa - ancho completo */}
      {showCompanySelector && companies.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <FilterableSelect
            options={companies}
            value={selectedCompanyId}
            onChange={onCompanyChange}
            placeholder="Seleccionar empresa"
            searchFields={["name"]}
            className="w-full"
          />
        </div>
      )}

      {/* Línea de búsqueda, filtros y botón Nuevo */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        alignItems: 'center', 
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Búsqueda y filtros a la izquierda */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center',
          flex: 1,
          minWidth: '300px'
        }}>
          {/* Campo de búsqueda */}
          {onSearchChange && (
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 2.5rem 0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
              <div style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                pointerEvents: 'none'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
            </div>
          )}
          
          {/* Filtros adicionales */}
          {additionalFilters}
        </div>
        
        {/* Botón Nuevo a la derecha */}
        {showNewButton && onNewClick && (
          <button
            onClick={onNewClick}
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              opacity: isSubmitting ? 0.6 : 1,
              transition: 'background-color 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            <Plus className="h-4 w-4" />
            <ShortcutText text={newButtonText} shortcutKey="n" />
          </button>
        )}
      </div>
    </>
  );
}

