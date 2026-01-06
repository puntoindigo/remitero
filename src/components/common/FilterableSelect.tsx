"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X, Search } from "lucide-react";
import { useColorTheme } from "@/contexts/ColorThemeContext";

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
  useThemeColors?: boolean; // Nueva prop para usar colores del tema
  style?: React.CSSProperties; // Nueva prop para estilos inline
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
  searchable = true,
  useThemeColors = false,
  style
}: FilterableSelectProps) {
  const { colors } = useColorTheme();
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
  
  // Calcular ancho mínimo basado en el contenido más largo (memoizado)
  const minDropdownWidth = useMemo(() => {
    if (typeof window === 'undefined' || !options || options.length === 0) return 250;
    
    // Crear un elemento temporal para medir el texto
    const tempElement = document.createElement('span');
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.style.fontSize = '14px';
    tempElement.style.padding = '0 12px';
    tempElement.style.fontFamily = 'inherit';
    tempElement.style.fontWeight = '400';
    document.body.appendChild(tempElement);
    
    let maxWidth = 0;
    options.forEach(option => {
      tempElement.textContent = option?.name || '';
      const width = tempElement.offsetWidth;
      if (width > maxWidth) maxWidth = width;
    });
    
    document.body.removeChild(tempElement);
    // Agregar padding lateral (24px cada lado = 48px) y espacio para iconos/acciones (aprox 80px)
    // Total: padding + contenido + iconos
    const calculatedWidth = maxWidth + 48 + 80;
    // Asegurar un mínimo razonable pero permitir que crezca según el contenido
    return Math.max(calculatedWidth, 250);
  }, [options]);
  
  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const triggerWidth = rect.width;
      
      // Calcular el ancho ideal del dropdown basado en el contenido
      // Usar el mayor entre el ancho del trigger y el ancho mínimo calculado
      let idealWidth = Math.max(triggerWidth, minDropdownWidth);
      
      // Asegurarse de que el dropdown no se salga de la pantalla
      // Dejar al menos 16px de margen en cada lado
      const viewportWidth = window.innerWidth;
      const maxAllowedWidth = viewportWidth - rect.left - 16;
      
      // El ancho final será el menor entre el ideal y el máximo permitido
      const dropdownWidth = Math.min(idealWidth, maxAllowedWidth);
      
      // Asegurar un ancho mínimo razonable
      const finalWidth = Math.max(dropdownWidth, 250);
      
      // getBoundingClientRect devuelve coordenadas relativas al viewport
      // Como usamos position: fixed, estas coordenadas son perfectas
      setDropdownPosition({
        top: rect.bottom + 4, // 4px de espacio entre trigger y dropdown
        left: rect.left,
        width: finalWidth
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

  // Actualizar posición cuando se abre el dropdown o cuando hay scroll/resize
  useEffect(() => {
    if (!isOpen) {
      // Asegurarse de cancelar el RAF cuando se cierra
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    
    // Actualización inicial
    updateDropdownPosition();
    
    // Handler para eventos de scroll/resize (throttled para evitar actualizaciones excesivas)
    let lastUpdate = 0;
    const throttleDelay = 16; // ~60fps
    
    const handler = () => {
      const now = performance.now();
      if (now - lastUpdate >= throttleDelay) {
        updateDropdownPosition();
        lastUpdate = now;
      }
    };
    
    // Escuchar eventos en todos los contenedores posibles
    // Usar capture: true para capturar scrolls en cualquier nivel
    const scrollElements: (Window | Document | Element)[] = [window, document];
    
    // Agregar también los contenedores scrollables más comunes
    const scrollableContainers = document.querySelectorAll('[data-scroll-container], .data-table-wrapper, .main-content');
    scrollableContainers.forEach(container => {
      scrollElements.push(container);
    });
    
    // Agregar listeners
    scrollElements.forEach(element => {
      element.addEventListener('scroll', handler, true);
      element.addEventListener('resize', handler, true);
    });
    
    // RAF para actualización continua sin throttle adicional (ya está en handler)
    const tick = () => {
      if (isOpen && triggerRef.current) {
        updateDropdownPosition();
        rafRef.current = requestAnimationFrame(tick);
      } else {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    
    return () => {
      // Limpiar todos los listeners
      scrollElements.forEach(element => {
        element.removeEventListener('scroll', handler, true);
        element.removeEventListener('resize', handler, true);
      });
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
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
                <span style={{ 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                  minWidth: 0
                }}>
                {showColors && option.color && (
                  <span 
                    style={{ 
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: option.color,
                        marginRight: '8px',
                        flexShrink: 0
                    }}
                  />
                )}
                {option?.name}
                </span>
              </button>
            ))
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className={`vercel-select-container ${className}`} style={{ position: 'relative', ...style }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`vercel-select-trigger ${isOpen ? 'vercel-select-open' : ''} ${disabled ? 'vercel-select-disabled' : ''} ${useThemeColors ? 'vercel-select-theme-enabled' : ''}`}
        style={(() => {
          const baseStyle: React.CSSProperties = { 
            minHeight: 'unset',
            ...(style?.width && { width: style.width }),
            ...(style?.minWidth && { minWidth: style.minWidth }),
            ...(style?.maxWidth && { maxWidth: style.maxWidth })
          };
          
          // Solo aplicar estilos si muestra colores (no para theme colors, esos van en hover)
          if (showColors && selectedOption?.color) {
            return {
              ...baseStyle,
              border: `1px solid ${selectedOption.color}`,
              backgroundColor: `${selectedOption.color}22`,
            };
          }
          
          return baseStyle;
        })()}
        onMouseEnter={(e) => {
          if (useThemeColors && !disabled) {
            e.currentTarget.style.background = colors.gradient;
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = colors.primary;
            // Aplicar color blanco al texto y todos los iconos internos
            const valueText = e.currentTarget.querySelector('.vercel-select-value');
            const clearIcon = e.currentTarget.querySelector('.vercel-select-clear-icon');
            const chevron = e.currentTarget.querySelector('.vercel-select-chevron');
            const clearButton = e.currentTarget.querySelector('.vercel-select-clear');
            if (valueText) (valueText as HTMLElement).style.color = '#ffffff';
            if (clearIcon) (clearIcon as HTMLElement).style.color = '#ffffff';
            if (chevron) (chevron as HTMLElement).style.color = '#ffffff';
            if (clearButton) (clearButton as HTMLElement).style.color = '#ffffff';
          }
        }}
        onMouseLeave={(e) => {
          if (useThemeColors && !disabled) {
            e.currentTarget.style.background = '';
            e.currentTarget.style.color = '';
            e.currentTarget.style.borderColor = '';
            // Restaurar color por defecto al texto y a los iconos
            const valueText = e.currentTarget.querySelector('.vercel-select-value');
            const clearIcon = e.currentTarget.querySelector('.vercel-select-clear-icon');
            const chevron = e.currentTarget.querySelector('.vercel-select-chevron');
            const clearButton = e.currentTarget.querySelector('.vercel-select-clear');
            if (valueText) (valueText as HTMLElement).style.color = '';
            if (clearIcon) (clearIcon as HTMLElement).style.color = '';
            if (chevron) (chevron as HTMLElement).style.color = '';
            if (clearButton) (clearButton as HTMLElement).style.color = '';
          }
        }}
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
