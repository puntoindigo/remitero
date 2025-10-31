"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X, Search } from "lucide-react";

interface FilterableSelectProps {
  options: Array<{ id: string; name: string; color?: string; [key: string]: any }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchFields?: string[];
  className?: string;
  disabled?: boolean;
  showColors?: boolean;
  searchable?: boolean;
}

export default function FilterableSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  searchFields = ["name"],
  className = "",
  disabled = false,
  showColors = false,
  searchable = true
}: FilterableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Filtrar opciones basado en el término de búsqueda
  useEffect(() => {
    if (!searchable) {
      setFilteredOptions(options);
      return;
    }
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = options.filter((option) =>
        searchFields.some((field) => {
          const fieldValue = option[field];
          if (typeof fieldValue === "string") {
            return fieldValue.toLowerCase().includes(term);
          }
          return false;
        })
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options, searchFields, searchable]);

  // Obtener el texto del elemento seleccionado
  const selectedOption = options.find(option => option?.id === value);
  const displayText = selectedOption ? selectedOption?.name : placeholder;

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const rafRef = useRef<number | null>(null);
  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) updateDropdownPosition();
    setIsOpen(!isOpen);
    if (!isOpen && searchable) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Actualizar posición cuando se abre el dropdown o cuando hay scroll
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      const handler = () => updateDropdownPosition();
      window.addEventListener('resize', handler);
      // Captura scrolls de contenedores
      document.addEventListener('scroll', handler, true);
      // Mantener pegado mediante RAF mientras esté abierto (por desplazamientos/transiciones)
      const tick = () => {
        updateDropdownPosition();
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        window.removeEventListener('resize', handler);
        document.removeEventListener('scroll', handler, true);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  // Cerrar dropdown al hacer clic fuera o presionar ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside, { capture: true });
    document.addEventListener("keydown", handleEscape, { capture: true });
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, { capture: true });
      document.removeEventListener("keydown", handleEscape, { capture: true });
    };
  }, [isOpen]);

  const renderDropdown = () => {
    if (!isOpen || typeof window === 'undefined') return null;
    return createPortal(
      <div 
        ref={dropdownRef}
        className="vercel-select-dropdown"
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 99999,
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)'
        }}
      >
        {searchable && (
          <div className="vercel-select-search" style={{ position: 'relative', borderBottom: '1px solid #e5e7eb' }}>
            <Search className="vercel-select-search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="vercel-select-search-input"
              style={{ fontSize: '14px', height: '36px' }}
            />
          </div>
        )}
        <div className="vercel-select-options" style={{ maxHeight: '280px', overflowY: 'auto' }}>
          {filteredOptions?.length === 0 ? (
            <div className="vercel-select-empty">
              No se encontraron opciones
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option?.id}
                type="button"
                onClick={() => handleSelect(option?.id)}
                className={`vercel-select-option ${value === option?.id ? 'vercel-select-option-selected' : ''}`}
                style={showColors && option.color ? { 
                  borderLeft: `4px solid ${option.color}`,
                  paddingLeft: '8px'
                } : {}}
              >
                {showColors && option.color && (
                  <span 
                    style={{ 
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: option.color,
                      marginRight: '8px'
                    }}
                  />
                )}
                {option?.name}
              </button>
            ))
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className={`vercel-select-container ${className}`} style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`vercel-select-trigger ${isOpen ? 'vercel-select-open' : ''} ${disabled ? 'vercel-select-disabled' : ''}`}
        style={showColors && selectedOption?.color ? {
          border: `1px solid ${selectedOption.color}`,
          backgroundColor: `${selectedOption.color}22`,
          minHeight: 'unset'
        } : { minHeight: 'unset' }}
      >
        <span className={`vercel-select-value ${value ? 'vercel-select-has-value' : ''}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {showColors && selectedOption?.color && (
            <span 
              style={{ 
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: selectedOption.color,
                marginRight: '8px'
              }}
            />
          )}
          {displayText}
        </span>
        <div className="vercel-select-actions">
          {value && (
            <div
              onClick={handleClear}
              className="vercel-select-clear"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClear(e as any);
                }
              }}
            >
              <X className="vercel-select-clear-icon" />
            </div>
          )}
          <ChevronDown className={`vercel-select-chevron ${isOpen ? 'vercel-select-chevron-open' : ''}`} />
        </div>
      </button>

      {renderDropdown()}
    </div>
  );
}
