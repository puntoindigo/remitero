"use client";

import { X, Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Buscar...",
  className = ""
}: SearchInputProps) {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div style={{ width: '300px', position: 'relative' }} className={className}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
        style={{
          width: '100%',
          padding: '0.5rem 2.5rem 0.5rem 2.5rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          backgroundImage: 'none'
        }}
      />
      
      {/* Ícono de búsqueda (izquierda) */}
      <div style={{
        position: 'absolute',
        left: '0.75rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9ca3af',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Search width={16} height={16} />
      </div>

      {/* Botón de limpiar (derecha) - solo visible cuando hay texto */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            padding: '0.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#9ca3af',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
          title="Limpiar búsqueda"
          aria-label="Limpiar búsqueda"
        >
          <X width={16} height={16} />
        </button>
      )}
    </div>
  );
}


