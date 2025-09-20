"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search } from "lucide-react";

interface FilterableSelectProps {
  options: Array<{ id: string; name: string; [key: string]: any }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchFields?: string[];
  className?: string;
  disabled?: boolean;
}

export default function FilterableSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  searchFields = ["name"],
  className = "",
  disabled = false
}: FilterableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar opciones basado en el término de búsqueda
  useEffect(() => {
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
  }, [searchTerm, options, searchFields]);

  // Obtener el texto del elemento seleccionado
  const selectedOption = options.find(option => option.id === value);
  const displayText = selectedOption ? selectedOption.name : placeholder;

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

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

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`vercel-select-container ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`vercel-select-trigger ${isOpen ? 'vercel-select-open' : ''} ${disabled ? 'vercel-select-disabled' : ''}`}
      >
        <span className={`vercel-select-value ${value ? 'vercel-select-has-value' : ''}`}>
          {displayText}
        </span>
        <div className="vercel-select-actions">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="vercel-select-clear"
            >
              <X className="vercel-select-clear-icon" />
            </button>
          )}
          <ChevronDown className={`vercel-select-chevron ${isOpen ? 'vercel-select-chevron-open' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="vercel-select-dropdown">
          <div className="vercel-select-search">
            <Search className="vercel-select-search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="vercel-select-search-input"
            />
          </div>
          <div className="vercel-select-options">
            {filteredOptions.length === 0 ? (
              <div className="vercel-select-empty">
                No se encontraron opciones
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={`vercel-select-option ${value === option.id ? 'vercel-select-option-selected' : ''}`}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
