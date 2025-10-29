"use client";

import { useEffect, useCallback, useRef } from "react";

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

/**
 * Hook para manejar shortcuts de teclado de forma centralizada y reutilizable
 * 
 * @example
 * // Shortcut simple: presionar 'N' para nueva entidad
 * useShortcuts([
 *   { key: 'n', action: handleNew, description: 'Nueva categoría' }
 * ]);
 * 
 * @example
 * // Shortcut con modificadores: Ctrl+S para guardar
 * useShortcuts([
 *   { key: 's', ctrl: true, action: handleSave, description: 'Guardar', preventDefault: true }
 * ]);
 * 
 * @param shortcuts - Array de configuraciones de shortcuts
 * @param enabled - Si false, los shortcuts están deshabilitados
 */
export function useShortcuts(shortcuts: ShortcutConfig[], enabled: boolean = true) {
  const shortcutsRef = useRef(shortcuts);
  
  // Actualizar ref cuando cambien los shortcuts
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Ignorar teclas reservadas para modales (ESC y Enter)
    if (event.key === 'Escape' || event.key === 'Enter') {
      return;
    }
    
    // No ejecutar shortcuts si el usuario está escribiendo en un input/textarea
    const target = event.target as HTMLElement;
    const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
    const isContentEditable = target.isContentEditable;
    
    if (isInputField || isContentEditable) {
      return;
    }

    // Buscar el shortcut que coincida
    const matchedShortcut = shortcutsRef.current.find((shortcut) => {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      
      return keyMatches && ctrlMatches && shiftMatches && altMatches;
    });

    if (matchedShortcut) {
      if (matchedShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      
      // Ejecutar acción con manejo de errores
      try {
        const result = matchedShortcut.action();
        // Si la acción retorna una promesa, manejar errores
        if (result && typeof result === 'object' && 'catch' in result) {
          (result as Promise<any>).catch((error) => {
            console.error('Error ejecutando shortcut:', error);
          });
        }
      } catch (error) {
        console.error('Error ejecutando shortcut:', error);
      }
    }
  }, [enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Hook para obtener una descripción formateada de un shortcut
 */
export function useShortcutDescription(shortcut: ShortcutConfig): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join('+');
}

