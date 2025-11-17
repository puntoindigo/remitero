"use client";

import { useState } from "react";
import { Edit2, Trash2, GripVertical, Maximize2 } from "lucide-react";
import type { ServiceCardData } from "@/types/web2";

interface ServiceCardProps {
  card: ServiceCardData;
  index: number;
  onEdit: (card: ServiceCardData) => void;
  onDelete: (id: string) => void;
  onDragEnd: (draggedId: string, targetId: string) => void;
  onResize: (card: ServiceCardData) => void;
}

export function ServiceCard({ card, index, onEdit, onDelete, onDragEnd, onResize }: ServiceCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.id);
    (e.target as HTMLElement).style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    setDragOver(false);
    (e.target as HTMLElement).style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId !== card.id) {
      onDragEnd(draggedId, card.id);
    }
  };

  const cardSize = card.size || { cols: 1, rows: 1 };
  const gridStyle: React.CSSProperties = {
    borderTopColor: card.color,
    gridColumn: `span ${cardSize.cols}`,
    gridRow: `span ${cardSize.rows}`,
  };

  if (cardSize.fullWidth) {
    gridStyle.gridColumn = '1 / -1';
  }

  if (cardSize.fullHeight) {
    gridStyle.height = '100%';
    gridStyle.minHeight = '100vh';
  }

  return (
    <div
      className={`service-card ${isDragging ? 'dragging' : ''} ${dragOver ? 'drag-over' : ''}`}
      data-card-id={card.id}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={gridStyle}
    >
      <div className="card-drag-handle" title="Arrastrar para reordenar">
        <GripVertical className="grip-icon" />
      </div>
      
      <div className="card-image-container">
        <img src={card.image} alt={card.title} className="card-image" />
        <div 
          className="card-overlay"
          style={{ 
            backgroundColor: `rgba(0, 0, 0, ${card.overlayIntensity ?? 0.5})`,
          }} 
        />
        <div className="card-content-overlay">
          {card.category && (
            <span 
              className="card-category" 
              style={{ 
                backgroundColor: card.color + "CC",
                color: card.textColor || "#ffffff",
                border: `2px solid ${card.textColor || "#ffffff"}40`
              }}
            >
              {card.category}
            </span>
          )}
          <h3 
            className="card-title"
            style={{ 
              color: card.textColor || "#ffffff",
              textShadow: `2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)`
            }}
          >
            {card.title}
          </h3>
          <p 
            className="card-description"
            style={{ 
              color: card.textColor || "#ffffff",
              textShadow: `1px 1px 3px rgba(0, 0, 0, 0.8), 0 0 6px rgba(0, 0, 0, 0.5)`
            }}
          >
            {card.description}
          </p>
          {card.price !== undefined && (
            <div 
              className="card-price"
              style={{ 
                color: card.textColor || "#ffffff",
                textShadow: `2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)`
              }}
            >
              ${card.price.toLocaleString('es-AR')}
            </div>
          )}
        </div>
      </div>
      
      <div className="card-actions">
        <button
          className="card-action-btn resize"
          onClick={() => onResize(card)}
          title="Cambiar tamaño"
        >
          <Maximize2 className="action-icon" />
        </button>
        <button
          className="card-action-btn edit"
          onClick={() => onEdit(card)}
          title="Editar"
        >
          <Edit2 className="action-icon" />
        </button>
        <button
          className="card-action-btn delete"
          onClick={() => onDelete(card.id)}
          title="Eliminar"
        >
          <Trash2 className="action-icon" />
        </button>
      </div>
    </div>
  );
}

