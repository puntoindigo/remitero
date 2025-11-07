"use client";

import React from "react";
import { X, Check } from "lucide-react";

interface StatusToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  title?: string;
  size?: number;
}

export function StatusToggle({ 
  value, 
  onChange, 
  title = "Modificar estado",
  size = 20
}: StatusToggleProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(!value);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: 0,
      }}
      title={title}
    >
      {value ? (
        <Check style={{ color: '#16a34a', width: `${size}px`, height: `${size}px` }} />
      ) : (
        <X style={{ color: '#ef4444', width: `${size}px`, height: `${size}px` }} />
      )}
    </button>
  );
}

