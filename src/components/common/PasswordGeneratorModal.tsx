"use client";

import React, { useState, useEffect } from "react";
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

  const generateNewPassword = () => {
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const separator = separators[Math.floor(Math.random() * separators.length)];
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

  return (
    <div className="modal-overlay">
      <div className="modal form-modal" style={{ maxWidth: '500px' }}>
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
}
