"use client";

import { useEffect } from 'react';

export function ErrorHandlerScript() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function shouldIgnoreError(error: any) {
      if (!error) return true;
      
      if (error instanceof Event) {
        const eventTarget = (error as any).target;
        if (eventTarget && (
          eventTarget.tagName === 'LINK' || 
          eventTarget.tagName === 'IMG' || 
          eventTarget.tagName === 'SCRIPT' ||
          eventTarget.tagName === 'STYLE'
        )) {
          return true;
        }
        return true; // Ignorar todos los Events
      }
      if (error instanceof Error) {
        const msg = error.message || '';
        if (msg.includes('Failed to fetch') || 
            msg.includes('NetworkError') ||
            msg.includes('Load failed') ||
            msg.includes('Network request failed') ||
            msg.includes('naveg') ||
            msg.includes('Unexpected identifier') ||
            msg.includes('Minified React error')) {
          return true;
        }
      }
      if (error && typeof error.toString === 'function' && error.toString().includes('[object Event]')) {
        return true;
      }
      return false;
    }
    
    try {
      window.addEventListener('unhandledrejection', function(event) {
        if (shouldIgnoreError(event.reason)) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
      }, { capture: true, passive: false });
      
      window.addEventListener('error', function(event) {
        if (shouldIgnoreError(event.error || event)) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
      }, { capture: true, passive: false });
    } catch (e) {
      // Silenciar errores al registrar listeners
    }
  }, []);

  return null;
}

