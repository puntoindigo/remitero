"use client";

import { useState, useEffect } from "react";
import { Plus, X, Edit2, Trash2, FileText, Save, Share2, Copy, MessageCircle, ExternalLink } from "lucide-react";
import { showToast } from "./Toast";
import { ConfirmDialog } from "./ConfirmDialog";
import type { ServiceCardData, CatalogData } from "@/types/web2";

interface CatalogModuleProps {
  cards: ServiceCardData[];
  onClose: () => void;
}

export function CatalogModule({ cards, onClose }: CatalogModuleProps) {
  const [catalogs, setCatalogs] = useState<CatalogData[]>([]);
  const [editingCatalog, setEditingCatalog] = useState<CatalogData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
    isOpen: false,
    message: "",
    onConfirm: () => {}
  });

  useEffect(() => {
    const saved = localStorage.getItem("web2-catalogs");
    if (saved) {
      try {
        setCatalogs(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading catalogs:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (catalogs.length > 0) {
      localStorage.setItem("web2-catalogs", JSON.stringify(catalogs));
    }
  }, [catalogs]);

  const handleCreateCatalog = () => {
    const newCatalog: CatalogData = {
      id: Date.now().toString(),
      title: "Nuevo Catálogo",
      description: "",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      products: [],
      createdAt: new Date().toISOString()
    };
    setCatalogs([...catalogs, newCatalog]);
    setEditingCatalog(newCatalog);
    setIsCreating(true);
  };

  const handleSaveCatalog = (catalog: CatalogData) => {
    if (editingCatalog) {
      setCatalogs(catalogs.map(c => c.id === editingCatalog.id ? catalog : c));
      showToast("Catálogo actualizado", "success");
    }
    setEditingCatalog(null);
    setIsCreating(false);
  };

  const handleDeleteCatalog = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "¿Estás seguro de que deseas eliminar este catálogo?",
      onConfirm: () => {
        setCatalogs(catalogs.filter(c => c.id !== id));
        showToast("Catálogo eliminado", "success");
        setConfirmDialog({ isOpen: false, message: "", onConfirm: () => {} });
      }
    });
  };

  const getCatalogProducts = (catalog: CatalogData) => {
    return cards.filter(card => catalog.products.includes(card.id));
  };

  return (
    <div className="catalog-module">
      <div className="catalog-header">
        <div>
          <h1 className="catalog-title">Catálogos</h1>
          <p className="catalog-subtitle">Crea y gestiona catálogos con tus servicios</p>
        </div>
        <button className="btn-primary" onClick={handleCreateCatalog}>
          <Plus className="icon" />
          Nuevo Catálogo
        </button>
      </div>

      {isCreating && editingCatalog && (
        <CatalogEditor
          catalog={editingCatalog}
          cards={cards}
          onSave={handleSaveCatalog}
          onCancel={() => {
            setCatalogs(catalogs.filter(c => c.id !== editingCatalog.id));
            setEditingCatalog(null);
            setIsCreating(false);
          }}
        />
      )}

      <div className="catalogs-grid">
        {catalogs.map((catalog) => (
          <div
            key={catalog.id}
            className="catalog-card"
            style={{
              backgroundColor: catalog.backgroundColor,
              color: catalog.textColor
            }}
          >
            <div className="catalog-card-header">
              <h3>{catalog.title}</h3>
              <div className="catalog-card-actions">
                <button
                  className="icon-btn share"
                  onClick={() => {
                    const url = `${window.location.origin}/web2/catalog/${catalog.id}`;
                    navigator.clipboard.writeText(url);
                    showToast("URL del catálogo copiada", "success");
                  }}
                  title="Copiar URL pública"
                >
                  <Copy className="icon" />
                </button>
                <button
                  className="icon-btn whatsapp"
                  onClick={() => {
                    const url = `${window.location.origin}/web2/catalog/${catalog.id}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(`${catalog.title}\n${url}`)}`, '_blank');
                  }}
                  title="Compartir por WhatsApp"
                >
                  <MessageCircle className="icon" />
                </button>
                <a
                  href={`/web2/catalog/${catalog.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-btn external"
                  title="Ver catálogo público"
                >
                  <ExternalLink className="icon" />
                </a>
                <button
                  className="icon-btn"
                  onClick={() => {
                    window.location.href = `/web2/catalog/${catalog.id}?edit=true`;
                  }}
                  title="Editar catálogo"
                >
                  <Edit2 className="icon" />
                </button>
                <button
                  className="icon-btn"
                  onClick={() => handleDeleteCatalog(catalog.id)}
                >
                  <Trash2 className="icon" />
                </button>
              </div>
            </div>
            
            {catalog.description && (
              <p className="catalog-card-description">{catalog.description}</p>
            )}
            
            <div className="catalog-card-products">
              <h4>Productos incluidos ({getCatalogProducts(catalog).length})</h4>
              <div className="catalog-products-list">
                {getCatalogProducts(catalog).map((card) => (
                  <div key={card.id} className="catalog-product-item">
                    <img src={card.image} alt={card.title} />
                    <span>{card.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {catalogs.length === 0 && (
          <div className="empty-state">
            <FileText className="empty-icon" />
            <h3>No hay catálogos aún</h3>
            <p>Crea tu primer catálogo para comenzar</p>
            <button className="btn-primary" onClick={handleCreateCatalog}>
              <Plus className="icon" />
              Crear Catálogo
            </button>
          </div>
        )}
      </div>

      {editingCatalog && !isCreating && (
        <CatalogEditor
          catalog={editingCatalog}
          cards={cards}
          onSave={handleSaveCatalog}
          onCancel={() => {
            setEditingCatalog(null);
            setIsCreating(false);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, message: "", onConfirm: () => {} })}
      />
    </div>
  );
}

function CatalogEditor({ catalog, cards, onSave, onCancel }: {
  catalog: CatalogData;
  cards: ServiceCardData[];
  onSave: (catalog: CatalogData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CatalogData>(catalog);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(catalog.products);

  useEffect(() => {
    setFormData({ ...catalog, products: selectedProducts });
  }, [selectedProducts]);

  const handleToggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSave = () => {
    onSave({ ...formData, products: selectedProducts });
  };

  return (
    <div className="catalog-editor-modal">
      <div className="catalog-editor-content">
        <div className="catalog-editor-header">
          <h2>Editar Catálogo</h2>
          <button className="icon-btn" onClick={onCancel}>
            <X className="icon" />
          </button>
        </div>

        <div className="catalog-editor-form">
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Color de Fondo</label>
            <input
              type="color"
              value={formData.backgroundColor}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              className="color-input"
            />
          </div>

          <div className="form-group">
            <label>Color de Texto</label>
            <input
              type="color"
              value={formData.textColor}
              onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
              className="color-input"
            />
          </div>

          <div className="form-group">
            <label>Productos/Servicios</label>
            <div className="products-selector">
              {cards.map((card) => (
                <label key={card.id} className="product-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(card.id)}
                    onChange={() => handleToggleProduct(card.id)}
                  />
                  <div className="product-checkbox-content">
                    <img src={card.image} alt={card.title} />
                    <span>{card.title}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="catalog-editor-actions">
            <button className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSave}>
              <Save className="icon" />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

