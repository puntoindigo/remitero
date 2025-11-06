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
    
    // Ignorar ESC para modales
    if (event.key === 'Escape') {
      return;
    }
    
    // No ejecutar shortcuts si el usuario está escribiendo en un input/textarea
    const target = event.target as HTMLElement;
    const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
    const isContentEditable = target.isContentEditable;
    
    if (isInputField || isContentEditable) {
      return;
    }

    // Si se presiona ENTER, buscar el shortcut "n" (nuevo)
    let keyToMatch = event.key.toLowerCase();
    if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      keyToMatch = 'n';
    }

    // Buscar el shortcut que coincida
    const matchedShortcut = shortcutsRef.current.find((shortcut) => {
      const keyMatches = keyToMatch === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      
      return keyMatches && ctrlMatches && shiftMatches && altMatches;
    });

    if (matchedShortcut) {
      if (matchedShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      
      // Iluminar el botón asociado si existe
      const shortcutKey = matchedShortcut.key.toLowerCase();
      const buttonSelector = `[data-shortcut="${shortcutKey}"], .new-button`;
      const button = document.querySelector(buttonSelector) as HTMLElement;
      
      if (button) {
        const originalBoxShadow = button.style.boxShadow || '';
        const originalTransform = button.style.transform || '';
        const originalTransition = button.style.transition || '';
        
        // Aplicar efecto de iluminación inmediatamente
        button.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.8), 0 4px 12px rgba(59, 130, 246, 0.5)';
        button.style.transform = 'translateY(-2px) scale(1.05)';
        button.style.transition = 'all 0.2s ease';
        
        // Restaurar después de 400ms (más tiempo para que se note)
        setTimeout(() => {
          button.style.boxShadow = originalBoxShadow;
          button.style.transform = originalTransform;
          setTimeout(() => {
            button.style.transition = originalTransition;
          }, 200);
        }, 400);
      }
      
      // Ejecutar acción después de un pequeño delay para que se note la iluminación primero
      setTimeout(() => {
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
      }, 200); // Delay de 200ms para que se vea la iluminación primero
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

