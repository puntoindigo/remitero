"use client";

import React, { useState, useRef, useEffect } from "react";

interface StockToggleProps {
  value: "IN_STOCK" | "OUT_OF_STOCK";
  onChange: (value: "IN_STOCK" | "OUT_OF_STOCK") => void;
  compact?: boolean;
}

export function StockToggle({ value, onChange, compact = false }: StockToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInStock = value === "IN_STOCK";

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const size = compact ? 12 : 16;
  const dotSize = compact ? 8 : 12;

  // Manejar click directo para cambiar el estado
  const handleDirectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Cambiar directamente el estado
    const newValue = isInStock ? 'OUT_OF_STOCK' : 'IN_STOCK';
    onChange(newValue);
  };

  // Manejar click derecho o doble click para abrir menú (opcional)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        display: 'inline-flex', 
        justifyContent: 'center',
        position: 'relative',
        width: compact ? '30px' : 'auto'
      }}
    >
      <div
        onClick={handleDirectClick}
        onContextMenu={handleContextMenu}
        style={{
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          backgroundColor: isInStock ? '#16a34a' : '#ef4444',
          boxShadow: isInStock 
            ? '0 0 4px rgba(22, 163, 74, 0.6)' 
            : '0 0 4px rgba(239, 68, 68, 0.6)',
          border: '1px solid white',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        title="Modificar stock"
      />
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: containerRef.current?.getBoundingClientRect().bottom ? containerRef.current.getBoundingClientRect().bottom + 4 : 0,
            left: containerRef.current?.getBoundingClientRect().left ? containerRef.current.getBoundingClientRect().left - 14 : 0,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '6px',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            minWidth: '28px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            onClick={() => {
              onChange('IN_STOCK');
              setIsOpen(false);
            }}
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              boxShadow: '0 0 4px rgba(22, 163, 74, 0.6)',
              border: '1px solid white',
              cursor: 'pointer',
              margin: '0 auto',
            }}
            title="En Stock"
          />
          <div
            onClick={() => {
              onChange('OUT_OF_STOCK');
              setIsOpen(false);
            }}
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)',
              border: '1px solid white',
              cursor: 'pointer',
              margin: '0 auto',
            }}
            title="Sin Stock"
          />
        </div>
      )}
    </div>
  );
}

