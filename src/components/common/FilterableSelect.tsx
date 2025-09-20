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
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-all duration-200 ${
          disabled ? "bg-gray-50 cursor-not-allowed opacity-50" : "cursor-pointer hover:border-gray-300"
        } ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
      >
        <div className="flex items-center justify-between">
          <span className={`truncate ${value ? "text-gray-900" : "text-gray-500"}`}>
            {displayText}
          </span>
          <div className="flex items-center space-x-1 ml-2">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No se encontraron opciones
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors duration-150 ${
                    value === option.id 
                      ? "bg-blue-50 text-blue-900 font-medium" 
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
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
