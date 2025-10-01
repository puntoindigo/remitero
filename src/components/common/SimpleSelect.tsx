"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface SimpleSelectProps {
  options: Array<{ id: string; name: string; icon?: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SimpleSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  className = "",
  disabled = false
}: SimpleSelectProps) {
  const selectedOption = options.find(option => option.id === value);
  const displayText = selectedOption 
    ? `${selectedOption.icon || ''} ${selectedOption.name}`.trim()
    : placeholder;

  return (
    <div className={`simple-select-container ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="simple-select"
      >
        {placeholder && !value && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.icon ? `${option.icon} ${option.name}` : option.name}
          </option>
        ))}
      </select>
      <ChevronDown className="simple-select-chevron" />
    </div>
  );
}

