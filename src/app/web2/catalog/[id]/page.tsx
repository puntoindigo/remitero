"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Share2, Copy, MessageCircle, Download, Edit2, Save, X, ShoppingCart, Maximize2, Trash2, ArrowLeft, Eye, Settings, Palette, Image, Layout, Plus, Grid, Tag } from "lucide-react";
import { ToastContainer, showToast } from "@/components/web2/Toast";
import { PaymentModal } from "@/components/web2/PaymentModal";
import { CardModal } from "@/components/web2/CardModal";
import { ResizeModal } from "@/components/web2/ResizeModal";
import type { CatalogData, ServiceCardData, CardSize } from "@/types/web2";

export default function PublicCatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const catalogId = resolvedParams.id;
  const searchParams = useSearchParams();
  const router = useRouter();
  const editParam = searchParams.get('edit');
  const editMode = editParam === 'true';
  
  // Debug
  useEffect(() => {
    if (editMode) {
      console.log('✅ Modo edición activado');
    }
  }, [editMode]);
  
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [products, setProducts] = useState<ServiceCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ServiceCardData | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ServiceCardData | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isResizeModalOpen, setIsResizeModalOpen] = useState(false);
  const [resizingProduct, setResizingProduct] = useState<ServiceCardData | null>(null);

  useEffect(() => {
    if (!catalogId) return;
    
    const loadCatalog = () => {
      try {
        const catalogs = localStorage.getItem("web2-catalogs");
        const cards = localStorage.getItem("web2-cards");
        
        if (catalogs && cards) {
          const catalogsList: CatalogData[] = JSON.parse(catalogs);
          const cardsList: ServiceCardData[] = JSON.parse(cards);
          
          const foundCatalog = catalogsList.find(c => c.id === catalogId);
          
          if (foundCatalog) {
            // Asegurar valores por defecto para opciones de visualización
            const catalogWithDefaults = {
              ...foundCatalog,
              showCategoryTag: foundCatalog.showCategoryTag !== undefined ? foundCatalog.showCategoryTag : true,
              showBuyButton: foundCatalog.showBuyButton !== undefined ? foundCatalog.showBuyButton : true
            };
            setCatalog(catalogWithDefaults);
            setEditedTitle(foundCatalog.title);
            const catalogProducts = cardsList.filter(card => 
              foundCatalog.products.includes(card.id)
            );
            setProducts(catalogProducts);
          }
        }
      } catch (e) {
        console.error("Error loading catalog:", e);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, [catalogId]);

  // Guardar automáticamente cuando cambian los productos
  useEffect(() => {
    if (!catalog || products.length === 0) return;
    
    try {
      const catalogs = localStorage.getItem("web2-catalogs");
      if (catalogs) {
        const catalogsList: CatalogData[] = JSON.parse(catalogs);
        const updatedCatalogs = catalogsList.map(c => 
          c.id === catalog.id ? { ...c, products: products.map(p => p.id) } : c
        );
        localStorage.setItem("web2-catalogs", JSON.stringify(updatedCatalogs));
      }
    } catch (e) {
      console.error("Error auto-saving catalog:", e);
    }
  }, [products, catalog]);

  const handleShare = async (method: 'whatsapp' | 'copy' | 'link') => {
    const url = `${window.location.origin}/web2/catalog/${catalogId}`;
    const text = catalog?.title || "Catálogo";

    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        showToast("URL copiada al portapapeles", "success");
        break;
      case 'link':
        navigator.clipboard.writeText(url);
        showToast("Enlace copiado", "success");
        break;
    }
  };

  const saveTitle = (title: string) => {
    if (!catalog || !title.trim()) return;
    
    try {
      const catalogs = localStorage.getItem("web2-catalogs");
      if (catalogs) {
        const catalogsList: CatalogData[] = JSON.parse(catalogs);
        const updatedCatalogs = catalogsList.map(c => 
          c.id === catalog.id ? { ...c, title: title.trim() } : c
        );
        localStorage.setItem("web2-catalogs", JSON.stringify(updatedCatalogs));
        setCatalog({ ...catalog, title: title.trim() });
      }
    } catch (e) {
      console.error("Error saving title:", e);
    }
  };

  const handleSaveTitle = () => {
    saveTitle(editedTitle);
    setIsEditingTitle(false);
  };

  // Guardar título automáticamente cuando cambia
  useEffect(() => {
    if (!isEditingTitle || !catalog || !editedTitle.trim() || editedTitle === catalog.title) return;
    
    const timeoutId = setTimeout(() => {
      saveTitle(editedTitle);
    }, 1000); // Guardar después de 1 segundo sin cambios

    return () => clearTimeout(timeoutId);
  }, [editedTitle, isEditingTitle, catalog]);

  const handleBuyClick = (product: ServiceCardData) => {
    setSelectedProduct(product);
    setIsPaymentOpen(true);
  };

  const handleEditProduct = (product: ServiceCardData) => {
    setEditingProduct(product);
    setIsCardModalOpen(true);
  };

  const handleSaveProduct = (productData: ServiceCardData) => {
    try {
      const cards = localStorage.getItem("web2-cards");
      if (cards) {
        const cardsList: ServiceCardData[] = JSON.parse(cards);
        const updatedCards = cardsList.map(c => 
          c.id === productData.id ? productData : c
        );
        localStorage.setItem("web2-cards", JSON.stringify(updatedCards));
        
        // Actualizar en el estado local
        setProducts(products.map(p => p.id === productData.id ? productData : p));
        showToast("Producto actualizado", "success");
      }
    } catch (e) {
      console.error("Error saving product:", e);
      showToast("Error al guardar", "error");
    }
    setIsCardModalOpen(false);
    setEditingProduct(null);
  };

  const handleResizeProduct = (product: ServiceCardData) => {
    setResizingProduct(product);
    setIsResizeModalOpen(true);
  };

  const handleSaveSize = (size: CardSize) => {
    if (!resizingProduct) return;
    
    try {
      const cards = localStorage.getItem("web2-cards");
      if (cards) {
        const cardsList: ServiceCardData[] = JSON.parse(cards);
        const updatedCard = { ...resizingProduct, size };
        const updatedCards = cardsList.map(c => 
          c.id === resizingProduct.id ? updatedCard : c
        );
        localStorage.setItem("web2-cards", JSON.stringify(updatedCards));
        
        // Actualizar en el estado local
        setProducts(products.map(p => p.id === resizingProduct.id ? updatedCard : p));
        showToast("Tamaño actualizado", "success");
      }
    } catch (e) {
      console.error("Error saving size:", e);
      showToast("Error al guardar", "error");
    }
    setIsResizeModalOpen(false);
    setResizingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    try {
      const cards = localStorage.getItem("web2-cards");
      if (cards) {
        const cardsList: ServiceCardData[] = JSON.parse(cards);
        const updatedCards = cardsList.filter(c => c.id !== productId);
        localStorage.setItem("web2-cards", JSON.stringify(updatedCards));
        
        // Actualizar en el estado local
        setProducts(products.filter(p => p.id !== productId));
        showToast("Producto eliminado", "success");
      }
    } catch (e) {
      console.error("Error deleting product:", e);
      showToast("Error al eliminar", "error");
    }
  };

  if (loading) {
    return (
      <div className="public-catalog-loading">
        <div className="loading-spinner"></div>
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="public-catalog-error">
        <h1>Catálogo no encontrado</h1>
        <p>El catálogo que buscas no existe o ha sido eliminado.</p>
      </div>
    );
  }

  return (
    <div 
      className={`public-catalog ${editMode ? 'edit-mode-layout' : ''}`}
      style={{
        backgroundColor: catalog.backgroundColor,
        color: catalog.textColor,
        minHeight: '100vh'
      }}
    >
      {editMode ? (
        <>
          {/* Top Bar */}
          <div className="edit-top-bar">
            <div className="edit-top-bar-content">
              <div className="edit-top-bar-left">
                <button
                  className="back-btn"
                  onClick={() => {
                    router.push('/web2');
                  }}
                  title="Volver"
                >
                  <ArrowLeft className="icon" />
                </button>
                <div className="edit-top-bar-title">
                  <Edit2 className="icon" />
                  <span>Editando: {catalog.title}</span>
                </div>
              </div>
              <div className="edit-top-bar-right">
                <button
                  className="preview-btn"
                  onClick={() => {
                    router.push(`/web2/catalog/${catalogId}`);
                  }}
                  title="Vista previa"
                >
                  <Eye className="icon" />
                  <span>Vista Previa</span>
                </button>
              </div>
            </div>
          </div>

          {/* Container for Sidebar and Main Content */}
          <div className="edit-content-wrapper">
            {/* Sidebar */}
            <div className="edit-sidebar">
              <div className="edit-sidebar-content">
              <div className="edit-sidebar-section">
                <h3 className="edit-sidebar-title">Opciones</h3>
                <button
                  className="edit-sidebar-item"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit2 className="icon" />
                  <span>Editar Título</span>
                </button>
                <button
                  className="edit-sidebar-item"
                  onClick={() => {
                    // TODO: Abrir modal de configuración del catálogo
                    showToast("Configuración del catálogo", "info");
                  }}
                >
                  <Settings className="icon" />
                  <span>Configuración</span>
                </button>
                <button
                  className="edit-sidebar-item"
                  onClick={() => {
                    // TODO: Abrir modal de colores
                    showToast("Personalizar colores", "info");
                  }}
                >
                  <Palette className="icon" />
                  <span>Colores</span>
                </button>
              </div>

              <div className="edit-sidebar-section">
                <h3 className="edit-sidebar-title">Productos</h3>
                <button
                  className="edit-sidebar-item"
                  onClick={() => {
                    // TODO: Agregar nuevo producto
                    showToast("Agregar nuevo producto", "info");
                  }}
                >
                  <Plus className="icon" />
                  <span>Agregar Producto</span>
                </button>
                <div className="edit-sidebar-stats">
                  <span className="edit-sidebar-stat-label">Total:</span>
                  <span className="edit-sidebar-stat-value">{products.length}</span>
                </div>
              </div>

              <div className="edit-sidebar-section">
                <h3 className="edit-sidebar-title">Vista</h3>
                <label 
                  className="edit-sidebar-item" 
                  style={{ 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.75rem",
                    margin: 0,
                    padding: "0.75rem 1rem"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={catalog?.showCategoryTag !== false}
                    onChange={(e) => {
                      if (catalog) {
                        const updated = { ...catalog, showCategoryTag: e.target.checked };
                        setCatalog(updated);
                        // Guardar en localStorage
                        const catalogs = localStorage.getItem("web2-catalogs");
                        if (catalogs) {
                          const catalogsList: CatalogData[] = JSON.parse(catalogs);
                          const updatedCatalogs = catalogsList.map(c => 
                            c.id === catalog.id ? updated : c
                          );
                          localStorage.setItem("web2-catalogs", JSON.stringify(updatedCatalogs));
                        }
                      }
                    }}
                    style={{ 
                      cursor: "pointer",
                      width: "18px",
                      height: "18px",
                      margin: 0,
                      flexShrink: 0
                    }}
                  />
                  <Tag className="icon" style={{ width: "20px", height: "20px", flexShrink: 0 }} />
                  <span>Mostrar Categoría</span>
                </label>
                <label 
                  className="edit-sidebar-item" 
                  style={{ 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.75rem",
                    margin: 0,
                    padding: "0.75rem 1rem"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={catalog?.showBuyButton !== false}
                    onChange={(e) => {
                      if (catalog) {
                        const updated = { ...catalog, showBuyButton: e.target.checked };
                        setCatalog(updated);
                        // Guardar en localStorage
                        const catalogs = localStorage.getItem("web2-catalogs");
                        if (catalogs) {
                          const catalogsList: CatalogData[] = JSON.parse(catalogs);
                          const updatedCatalogs = catalogsList.map(c => 
                            c.id === catalog.id ? updated : c
                          );
                          localStorage.setItem("web2-catalogs", JSON.stringify(updatedCatalogs));
                        }
                      }
                    }}
                    style={{ 
                      cursor: "pointer",
                      width: "18px",
                      height: "18px",
                      margin: 0,
                      flexShrink: 0
                    }}
                  />
                  <ShoppingCart className="icon" style={{ width: "20px", height: "20px", flexShrink: 0 }} />
                  <span>Mostrar Comprar</span>
                </label>
                <button
                  className="edit-sidebar-item"
                  onClick={() => {
                    // TODO: Cambiar layout
                    showToast("Cambiar layout", "info");
                  }}
                >
                  <Layout className="icon" />
                  <span>Layout</span>
                </button>
                <button
                  className="edit-sidebar-item"
                  onClick={() => {
                    router.push(`/web2/catalog/${catalogId}`);
                  }}
                >
                  <Grid className="icon" />
                  <span>Vista Pública</span>
                </button>
              </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="edit-main-content">
              <header className="edit-mode-header">
                <div className="public-catalog-header-content">
                  <div>
                    {isEditingTitle ? (
                      <div className="catalog-title-edit">
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="catalog-title-input"
                          autoFocus
                          onBlur={handleSaveTitle}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveTitle();
                            } else if (e.key === 'Escape') {
                              setEditedTitle(catalog.title);
                              setIsEditingTitle(false);
                            }
                          }}
                        />
                        <button
                          className="catalog-title-save"
                          onClick={handleSaveTitle}
                          title="Guardar"
                        >
                          <Save className="icon" />
                        </button>
                        <button
                          className="catalog-title-cancel"
                          onClick={() => {
                            setEditedTitle(catalog.title);
                            setIsEditingTitle(false);
                          }}
                          title="Cancelar"
                        >
                          <X className="icon" />
                        </button>
                      </div>
                    ) : (
                      <h1 
                        className="public-catalog-title editable"
                        onClick={() => setIsEditingTitle(true)}
                        title="Click para editar"
                      >
                        {catalog.title}
                        <Edit2 className="edit-icon" />
                      </h1>
                    )}
                    {catalog.description && (
                      <p className="public-catalog-description">{catalog.description}</p>
                    )}
                  </div>
                </div>
              </header>

              <main className="edit-mode-main">
        <div className="public-catalog-grid">
          {products.map((product) => {
            const cardSize = product.size || { cols: 1, rows: 1 };
            const gridStyle: React.CSSProperties = {
              borderTopColor: product.color,
              gridColumn: `span ${cardSize.cols}`,
              gridRow: `span ${cardSize.rows}`,
            };

            if (cardSize.fullWidth) {
              gridStyle.gridColumn = '1 / -1';
            }

            return (
            <div
              key={product.id}
              className={`public-catalog-card ${editMode ? 'edit-mode' : ''}`}
              style={gridStyle}
            >
              {editMode && (
                <div className="public-catalog-card-actions">
                  <button
                    className="card-action-btn resize"
                    onClick={() => handleResizeProduct(product)}
                    title="Cambiar tamaño"
                  >
                    <Maximize2 className="action-icon" />
                  </button>
                  <button
                    className="card-action-btn edit"
                    onClick={() => handleEditProduct(product)}
                    title="Editar"
                  >
                    <Edit2 className="action-icon" />
                  </button>
                  <button
                    className="card-action-btn delete"
                    onClick={() => handleDeleteProduct(product.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="action-icon" />
                  </button>
                </div>
              )}
              <div className="public-catalog-card-image">
                <img src={product.image} alt={product.title} />
              </div>
              <div className="public-catalog-card-content">
                {catalog?.showCategoryTag !== false && product.category && (
                  <span 
                    className="public-catalog-card-category"
                    style={{ 
                      backgroundColor: product.color + "20",
                      color: product.color 
                    }}
                  >
                    {product.category}
                  </span>
                )}
                <h3 className="public-catalog-card-title">{product.title}</h3>
                <p className="public-catalog-card-description">{product.description}</p>
                {product.price !== undefined && (
                  <>
                    <div className="public-catalog-card-price">
                      ${product.price.toLocaleString('es-AR')}
                    </div>
                    {!editMode && catalog?.showBuyButton !== false && (
                      <button
                        className="public-catalog-buy-btn"
                        onClick={() => handleBuyClick(product)}
                      >
                        <ShoppingCart className="icon" />
                        Comprar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            );
          })}
        </div>
              </main>
            </div>
          </div>
          </>
      ) : (
        <>
          <header className="public-catalog-header">
            <div className="public-catalog-header-content">
              <div>
                <h1 className="public-catalog-title">{catalog.title}</h1>
                {catalog.description && (
                  <p className="public-catalog-description">{catalog.description}</p>
                )}
              </div>
              <div className="share-buttons">
                <button
                  className="share-btn whatsapp"
                  onClick={() => handleShare('whatsapp')}
                  title="Compartir por WhatsApp"
                >
                  <MessageCircle className="icon" />
                </button>
                <button
                  className="share-btn copy"
                  onClick={() => handleShare('copy')}
                  title="Copiar enlace"
                >
                  <Copy className="icon" />
                </button>
                <button
                  className="share-btn share"
                  onClick={() => handleShare('link')}
                  title="Compartir"
                >
                  <Share2 className="icon" />
                </button>
              </div>
            </div>
          </header>

          <main className="public-catalog-main">
            <div className="public-catalog-grid">
              {products.map((product) => {
                const cardSize = product.size || { cols: 1, rows: 1 };
                const gridStyle: React.CSSProperties = {
                  borderTopColor: product.color,
                  gridColumn: `span ${cardSize.cols}`,
                  gridRow: `span ${cardSize.rows}`,
                };

                if (cardSize.fullWidth) {
                  gridStyle.gridColumn = '1 / -1';
                }

                return (
                  <div
                    key={product.id}
                    className="public-catalog-card"
                    style={gridStyle}
                  >
                    <div className="public-catalog-card-image">
                      <img src={product.image} alt={product.title} />
                    </div>
                    <div className="public-catalog-card-content">
                      {catalog?.showCategoryTag !== false && product.category && (
                        <span 
                          className="public-catalog-card-category"
                          style={{ 
                            backgroundColor: product.color + "20",
                            color: product.color 
                          }}
                        >
                          {product.category}
                        </span>
                      )}
                      <h3 className="public-catalog-card-title">{product.title}</h3>
                      <p className="public-catalog-card-description">{product.description}</p>
                      {product.price !== undefined && (
                        <>
                          <div className="public-catalog-card-price">
                            ${product.price.toLocaleString('es-AR')}
                          </div>
                          {catalog?.showBuyButton !== false && (
                            <button
                              className="public-catalog-buy-btn"
                              onClick={() => handleBuyClick(product)}
                            >
                              <ShoppingCart className="icon" />
                              Comprar
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </>
      )}

      <ToastContainer />
      
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      {editMode && (
        <>
          <CardModal
            isOpen={isCardModalOpen}
            onClose={() => {
              setIsCardModalOpen(false);
              setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
            card={editingProduct}
          />

          <ResizeModal
            isOpen={isResizeModalOpen}
            onClose={() => {
              setIsResizeModalOpen(false);
              setResizingProduct(null);
            }}
            onSave={handleSaveSize}
            card={resizingProduct}
          />
        </>
      )}
    </div>
  );
}

