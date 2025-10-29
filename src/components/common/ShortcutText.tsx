"use client";

import React from "react";

interface ShortcutTextProps {
  text: string;
  shortcutKey: string;
  className?: string;
}

/**
 * Componente para mostrar texto con la letra del shortcut subrayada
 * @param text - El texto completo a mostrar
 * @param shortcutKey - La letra que es el shortcut (se buscará case-insensitive)
 * @param className - Clases CSS adicionales para el contenedor
 */
export function ShortcutText({ text, shortcutKey, className = "" }: ShortcutTextProps) {
  const key = shortcutKey.toLowerCase();
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(key);

  // Si no se encuentra la letra, mostrar el texto normal
  if (index === -1) {
    return <span className={className}>{text}</span>;
  }

  const before = text.slice(0, index);
  const shortcut = text.slice(index, index + 1);
  const after = text.slice(index + 1);

  return (
    <span className={className}>
      {before}
      <span style={{ textDecoration: "underline", textUnderlineOffset: "3px", textDecorationThickness: "1.5px" }}>
        {shortcut}
      </span>
      {after}
    </span>
  );
}


