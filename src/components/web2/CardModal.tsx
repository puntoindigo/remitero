"use client";

import { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import type { ServiceCardData } from "@/types/web2";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: ServiceCardData) => void;
  card?: ServiceCardData | null;
}

const PRESET_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
];

const PRESET_IMAGES = [
  { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", label: "Lector de huella - Fábrica" },
  { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", label: "Control de acceso - Oficina" },
  { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80", label: "Dashboard - Analytics" },
  { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80", label: "Reportes - Datos" },
  { url: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80", label: "Ecommerce - Tienda" },
  { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80", label: "Ecommerce - Checkout" },
  { url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80", label: "Códigos QR/Barras" },
  { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", label: "Empleados - Restaurante" },
  { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", label: "Seguridad - Aeropuerto" }
];

export function CardModal({ isOpen, onClose, onSave, card }: CardModalProps) {
  const [formData, setFormData] = useState<ServiceCardData>({
    id: card?.id || "",
    title: card?.title || "",
    description: card?.description || "",
    image: card?.image || "",
    color: card?.color || PRESET_COLORS[0],
    category: card?.category || "",
    textColor: card?.textColor || "#ffffff",
    overlayIntensity: card?.overlayIntensity ?? 0.5,
    price: card?.price
  });

  useEffect(() => {
    if (card) {
      setFormData(card);
    } else {
      setFormData({
        id: "",
        title: "",
        description: "",
        image: "",
        color: PRESET_COLORS[0],
        category: "",
        textColor: "#ffffff",
        overlayIntensity: 0.5,
        price: undefined
      });
    }
  }, [card, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{card ? "Editar Servicio" : "Nuevo Servicio"}</h2>
          <button className="modal-close" onClick={onClose}>
            <X className="icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form modal-form-compact">
          <div className="form-group-compact">
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título del servicio"
              required
            />
          </div>

          <div className="form-group-compact">
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del servicio"
              rows={3}
              required
            />
          </div>

          <div className="form-group-compact">
            <input
              type="text"
              className="form-input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Categoría (ej: Seguridad, Analytics, Ventas)"
            />
          </div>

          <div className="form-group-compact">
            <input
              type="number"
              className="form-input"
              value={formData.price ?? ""}
              onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="Precio (opcional)"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group-compact">
            <div className="color-picker-compact">
              <button
                type="button"
                className="color-btn-mini"
                style={{ backgroundColor: formData.color }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = formData.color;
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    setFormData({ ...formData, color: target.value });
                  };
                  input.click();
                }}
                title="Color de categoría"
              />
              <div className="color-presets-mini">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-dot ${formData.color === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-group-compact">
            <div className="form-row-compact">
              <div className="form-col-compact">
                <button
                  type="button"
                  className="color-btn-mini"
                  style={{ backgroundColor: formData.textColor || "#ffffff" }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = formData.textColor || "#ffffff";
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement;
                      setFormData({ ...formData, textColor: target.value });
                    };
                    input.click();
                  }}
                  title="Color del texto"
                />
                <span className="form-hint">Color texto</span>
              </div>
              <div className="form-col-compact">
                <div className="overlay-control-compact">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.overlayIntensity ?? 0.5}
                    onChange={(e) => setFormData({ ...formData, overlayIntensity: parseFloat(e.target.value) })}
                    className="overlay-slider-compact"
                  />
                  <span className="overlay-value">{Math.round((formData.overlayIntensity ?? 0.5) * 100)}%</span>
                </div>
                <span className="form-hint">Overlay</span>
              </div>
            </div>
          </div>

          <div className="form-group-compact">
            <div className="image-preview-compact">
              <div 
                className="preview-card-compact"
                style={{
                  backgroundImage: formData.image ? `url(${formData.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div 
                  className="preview-overlay-compact"
                  style={{ 
                    backgroundColor: `rgba(0, 0, 0, ${formData.overlayIntensity ?? 0.5})`
                  }}
                />
                <div className="preview-content-compact">
                  {formData.category && (
                    <span 
                      className="preview-category-compact"
                      style={{ 
                        backgroundColor: formData.color + "CC",
                        color: formData.textColor || "#ffffff",
                        border: `2px solid ${(formData.textColor || "#ffffff")}40`
                      }}
                    >
                      {formData.category}
                    </span>
                  )}
                  <h4 style={{ 
                    color: formData.textColor || "#ffffff",
                    textShadow: `2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)`
                  }}>
                    {formData.title || "Título del servicio"}
                  </h4>
                  <p style={{ 
                    color: formData.textColor || "#ffffff",
                    textShadow: `1px 1px 3px rgba(0, 0, 0, 0.8), 0 0 6px rgba(0, 0, 0, 0.5)`
                  }}>
                    {formData.description || "Descripción del servicio"}
                  </p>
                  {formData.price !== undefined && (
                    <div style={{ 
                      color: formData.textColor || "#ffffff",
                      textShadow: `2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)`,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      marginTop: '0.5rem'
                    }}>
                      ${formData.price.toLocaleString('es-AR')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group-compact">
            <label className="image-upload-btn-compact">
              <Upload className="icon" />
              Subir Imagen
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </label>
            <div className="preset-images-compact">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`preset-image-btn-compact ${formData.image === preset.url ? "active" : ""}`}
                  onClick={() => setFormData({ ...formData, image: preset.url })}
                  title={preset.label}
                >
                  <img src={preset.url} alt={preset.label} />
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {card ? "Guardar Cambios" : "Crear Servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

