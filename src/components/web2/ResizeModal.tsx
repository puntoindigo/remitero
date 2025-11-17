"use client";

import { useState, useEffect } from "react";
import { X, Maximize2, Columns, LayoutGrid } from "lucide-react";
import type { ServiceCardData, CardSize } from "@/types/web2";

interface ResizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (size: CardSize) => void;
  card: ServiceCardData | null;
}

const SIZE_PRESETS: Array<{ label: string; size: CardSize; icon: string; description: string }> = [
  { 
    label: "Módulo Chico", 
    size: { cols: 1, rows: 1 }, 
    icon: "1x1",
    description: "Tarjeta pequeña estándar"
  },
  { 
    label: "Banner Horizontal", 
    size: { cols: 2, rows: 1 }, 
    icon: "2x1",
    description: "Ancho doble, una fila"
  },
  { 
    label: "Sliver Vertical", 
    size: { cols: 1, rows: 3 }, 
    icon: "1x3",
    description: "Una columna, tres filas"
  },
  { 
    label: "Cuadro Grande", 
    size: { cols: 2, rows: 2 }, 
    icon: "2x2",
    description: "Cuadrado grande"
  },
  { 
    label: "Banner Ancho", 
    size: { cols: 4, rows: 1, fullWidth: true }, 
    icon: "4x1",
    description: "Ancho completo, una fila"
  },
  { 
    label: "Panel Lateral", 
    size: { cols: 1, rows: 2 }, 
    icon: "1x2",
    description: "Una columna, dos filas"
  },
  { 
    label: "Rectángulo Horizontal", 
    size: { cols: 3, rows: 1 }, 
    icon: "3x1",
    description: "Tres columnas, una fila"
  },
  { 
    label: "Torre Alta", 
    size: { cols: 1, rows: 4 }, 
    icon: "1x4",
    description: "Una columna, cuatro filas"
  },
  { 
    label: "Panel Ancho", 
    size: { cols: 3, rows: 2 }, 
    icon: "3x2",
    description: "Tres columnas, dos filas"
  },
  { 
    label: "Banner Hero", 
    size: { cols: 4, rows: 2, fullWidth: true }, 
    icon: "4x2",
    description: "Banner hero completo"
  },
];

export function ResizeModal({ isOpen, onClose, onSave, card }: ResizeModalProps) {
  const [size, setSize] = useState<CardSize>(card?.size || { cols: 1, rows: 1 });

  useEffect(() => {
    if (card?.size) {
      setSize(card.size);
    } else {
      setSize({ cols: 1, rows: 1 });
    }
  }, [card, isOpen]);

  const handleSave = () => {
    onSave(size);
    onClose();
  };

  const handlePresetSelect = (preset: CardSize) => {
    setSize(preset);
    // Aplicar automáticamente
    onSave(preset);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content resize-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Maximize2 className="icon" style={{ width: "24px", height: "24px", marginRight: "0.5rem" }} />
            Configurar Tamaño
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X className="icon" />
          </button>
        </div>

        <div className="resize-content">
          <div className="resize-section">
            <h3 className="resize-section-title">Elige un Layout</h3>
            <div className="preset-grid-simple">
              {SIZE_PRESETS.map((preset, idx) => {
                const isActive = JSON.stringify(size) === JSON.stringify(preset.size);
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`layout-option ${isActive ? 'active' : ''}`}
                    onClick={() => handlePresetSelect(preset.size)}
                  >
                    <div className="layout-visual">
                      <div className="layout-grid-preview">
                        {Array.from({ length: 12 }).map((_, idx) => {
                          const row = Math.floor(idx / 4) + 1;
                          const col = (idx % 4) + 1;
                          
                          let isActive = false;
                          
                          if (preset.size.fullWidth && row === 1) {
                            // Banner ancho: todas las columnas en la primera fila
                            isActive = true;
                          } else {
                            // Layout normal: verificar si está dentro del área
                            isActive = col <= preset.size.cols && row <= preset.size.rows;
                          }
                          
                          return (
                            <div
                              key={idx}
                              className={`layout-cell ${isActive ? 'active' : ''}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="layout-info">
                      <span className="layout-name">{preset.label}</span>
                      <span className="layout-desc">{preset.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

