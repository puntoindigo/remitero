"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, RefreshCw, Copy, Eye, EyeOff } from "lucide-react";

interface PasswordGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordGenerated: (password: string) => void;
}

// Lista de palabras simples para generar contraseñas
const words = [
  "casa", "perro", "gato", "sol", "luna", "agua", "fuego", "aire", "tierra",
  "arbol", "flor", "mar", "rio", "montaña", "ciudad", "pueblo", "casa", "puerta",
  "ventana", "mesa", "silla", "libro", "papel", "lapiz", "boli", "coche", "bici",
  "avion", "barco", "tren", "autobus", "moto", "patin", "pelota", "juego", "música",
  "arte", "pintura", "dibujo", "foto", "video", "pelicula", "serie", "libro", "cuento"
];

const separators = ["-", "_", "."];

export function PasswordGeneratorModal({
  isOpen,
  onClose,
  onPasswordGenerated
}: PasswordGeneratorModalProps) {
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);

  // Generar contraseña inicial
  useEffect(() => {
    if (isOpen) {
      generateNewPassword();
    }
  }, [isOpen]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape, { capture: true });
    return () => window.removeEventListener('keydown', handleEscape, { capture: true });
  }, [isOpen, onClose]);

  const generateNewPassword = () => {
    const word1 = words[Math.floor(Math.random() * words?.length)];
    const word2 = words[Math.floor(Math.random() * words?.length)];
    const separator = separators[Math.floor(Math.random() * separators?.length)];
    const numbers = Math.floor(Math.random() * 999) + 1; // 1-999
    
    // Crear contraseña: palabra1 + separador + palabra2 + números
    const password = `${word1}${separator}${word2}${numbers}`;
    setGeneratedPassword(password);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleUsePassword = () => {
    onPasswordGenerated(generatedPassword);
    onClose();
  };

  if (!isOpen) return null;

  if (typeof window === 'undefined') return null;

  const modalContent = (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        // Cerrar al hacer click en el overlay (no en el modal)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div 
        className="modal form-modal" 
        onClick={(e) => {
          // Prevenir que los clicks dentro del modal cierren el overlay
          e.stopPropagation();
        }}
        style={{ 
          maxWidth: '500px',
          position: 'relative',
          zIndex: 10001,
        }}
      >
        <div className="modal-header">
          <h3>Generador de Contraseña</h3>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="modal-body">
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label-large">Contraseña generada:</label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}>
              <input
                type={showPassword ? "text" : "password"}
                value={generatedPassword}
                readOnly
                className="form-input-standard"
                style={{ flex: 1, fontFamily: 'monospace' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn small secondary"
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={copyToClipboard}
                className={`btn small ${copied ? 'success' : 'secondary'}`}
                title="Copiar al portapapeles"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {copied && (
              <p style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                ¡Copiado al portapapeles!
              </p>
            )}
          </div>


          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            marginTop: '2rem'
          }}>
            <button
              type="button"
              onClick={generateNewPassword}
              className="btn secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw className="h-4 w-4" />
              Generar Nueva
            </button>
            <button
              type="button"
              onClick={handleUsePassword}
              className="btn primary"
            >
              Usar Esta Contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
