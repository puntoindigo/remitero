"use client";

import React, { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductForm } from "@/lib/validations";
import { Plus, Package, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { ToastContainer } from "@/components/common/Toast.jsx";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useToast } from "@/hooks/useToast.js";
import { useDirectUpdate } from "@/hooks/useDirectUpdate";
import { ProductoForm } from "@/components/forms/ProductoForm";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";
import { CompanySelector } from "@/components/common/CompanySelector";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ShortcutText } from "@/components/common/ShortcutText";
import { SearchInput } from "@/components/common/SearchInput";
import { useLoading } from "@/hooks/useLoading";
import { LoadingButton } from "@/components/common/LoadingButton";
import { useShortcuts } from "@/hooks/useShortcuts";
import { useColorTheme } from "@/contexts/ColorThemeContext";
import { StatusToggle } from "@/components/common/StatusToggle";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePaginationPreference } from "@/hooks/usePaginationPreference";

import { 
  useProductosQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  productKeys,
  type Product
} from "@/hooks/queries/useProductosQuery";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCategoriasQuery,
  type Category
} from "@/hooks/queries/useCategoriasQuery";

function ProductosContent() {
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const { colors } = useColorTheme();
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompanySimple();
  
  // 🚀 REACT QUERY: Reemplaza state y fetch
  const { data: productos = [], isLoading } = useProductosQuery(companyId || undefined);
  const { data: categorias = [] } = useCategoriasQuery(companyId || undefined);
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedStock, setSelectedStock] = useState<string>("");
  const { empresas, isLoading: empresasLoading } = useEmpresas();
  const { itemsPerPage } = usePaginationPreference();
  
  // Refs para rastrear valores anteriores de filtros y evitar resetear cuando cambia la página manualmente
  const prevSelectedCategoryId = useRef<string>("");
  const prevSelectedStock = useRef<string>("");
  
  // Sincronizar estado inicial con searchParams
  useEffect(() => {
    const stockParam = searchParams.get('stock');
    if (stockParam === 'IN_STOCK' || stockParam === 'OUT_OF_STOCK') {
      if (selectedStock !== stockParam) {
        setSelectedStock(stockParam);
      }
    } else if (selectedStock) {
      setSelectedStock("");
    }
    
    const categoryParam = searchParams.get('categoryId');
    if (categoryParam) {
      if (selectedCategoryId !== categoryParam) {
        setSelectedCategoryId(categoryParam);
      }
    } else if (selectedCategoryId) {
      setSelectedCategoryId("");
    }
  }, [searchParams]); // Solo ejecutar cuando cambien los searchParams iniciales
  
  // Loading state management
  const { loading: loadingState, startLoading, stopLoading } = useLoading();

  // CRUD State Management
  const {
    editingItem: editingProduct,
    showForm,
    isSubmitting,
    handleNew: handleNewProduct,
    handleEdit: handleEditProduct,
    handleCloseForm,
    setIsSubmitting,
    showDeleteConfirm,
    handleDeleteRequest,
    handleCancelDelete
  } = useCRUDPage<Product>();

  const { modalState, showSuccess, showError, closeModal } = useMessageModal();
  const { toasts, showSuccess: showToastSuccess, showError: showToastError, removeToast } = useToast();
  const { updateStock } = useDirectUpdate();

  // Configurar shortcuts de teclado
  useShortcuts([
    {
      key: 'n',
      action: handleNewProduct,
      description: 'Nuevo Producto'
    }
  ], !!companyId && !showForm);

  // Detectar si viene de /nuevo y abrir formulario
  useEffect(() => {
    const openForm = searchParams.get('openForm');
    if (openForm === 'true' && !showForm && companyId) {
      handleNewProduct();
      // Limpiar el parámetro de la URL
      const params = new URLSearchParams(searchParams as any);
      params.delete('openForm');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, companyId, showForm]); // Solo ejecutar cuando cambien searchParams o companyId

  // Listener para FAB mobile
  useEffect(() => {
    const handleFABClick = (event: any) => {
      if (event.detail?.action === 'newProducto') {
        handleNewProduct();
      }
    };

    window.addEventListener('fabClick', handleFABClick);
    return () => window.removeEventListener('fabClick', handleFABClick);
  }, [handleNewProduct]);

  // 🚀 REACT QUERY: Ya no necesita loadData ni useEffect
  // React Query se encarga automáticamente del fetching y caching

  // Empujar cambios de stock a la URL sin hacer scroll ni recargar
  useEffect(() => {
    const currentParam = searchParams.get('stock') || "";
    const params = new URLSearchParams(searchParams as any);
    
    // Evitar actualizar si el parámetro de la URL ya coincide con el estado
    if (selectedStock && currentParam === selectedStock) {
      return;
    }
    if (!selectedStock && !currentParam) {
      return;
    }
    
    // Si se selecciona un stock específico, actualizar la URL
    if (selectedStock) {
      params.set('stock', selectedStock);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      // Si se selecciona "Todos los stocks" (vacío), eliminar el parámetro
      params.delete('stock');
      const qs = params.toString();
      const nextUrl = qs ? `${pathname}?${qs}` : `${pathname}`;
      router.replace(nextUrl, { scroll: false });
    }
  }, [selectedStock, router, pathname]);

  // Empujar cambios de categoría a la URL
  useEffect(() => {
    const currentParam = searchParams.get('categoryId') || "";
    const params = new URLSearchParams(searchParams as any);
    
    // Evitar actualizar si el parámetro de la URL ya coincide con el estado
    if (selectedCategoryId && currentParam === selectedCategoryId) {
      return;
    }
    if (!selectedCategoryId && !currentParam) {
      return;
    }
    
    if (selectedCategoryId) {
      params.set('categoryId', selectedCategoryId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else if (currentParam) {
      params.delete('categoryId');
      const qs = params.toString();
      const nextUrl = qs ? `${pathname}?${qs}` : `${pathname}`;
      router.replace(nextUrl, { scroll: false });
    }
  }, [selectedCategoryId, router, pathname]);


  // Filtrar productos por categoría y stock
  const filteredProductos = productos
    .filter(producto => {
      if (!selectedCategoryId) return true;
      return producto.category?.id === selectedCategoryId;
    })
    .filter(producto => {
      if (!selectedStock) return true;
      return (producto.stock || 'OUT_OF_STOCK') === selectedStock;
    });

  // Función de eliminación
  const handleDeleteProduct = (producto: Product) => {
    if (!producto?.id || typeof producto?.id !== 'string') {
      showError("ID de producto inválido");
      return;
    }
    
    const productName = producto?.name || 'Producto sin nombre';
    handleDeleteRequest(producto?.id, productName);
  };

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig,
    searchTerm,
    setSearchTerm,
    handlePageChange
  } = useCRUDTable({
    data: filteredProductos,
    loading: isLoading,
    searchFields: ['name', 'description'],
    itemsPerPage: itemsPerPage,
    onEdit: handleEditProduct,
    onDelete: handleDeleteProduct,
    onNew: handleNewProduct,
    getItemId: (product) => product?.id,
    emptyMessage: "No hay productos",
    emptySubMessage: "Comienza creando un nuevo producto.",
    emptyIcon: <Package className="empty-icon" />,
    newButtonText: "Nuevo Producto",
    searchPlaceholder: "Buscar productos..."
  });

  // Resetear a página 1 cuando cambian los filtros (solo cuando realmente cambian, no cuando cambia la página)
  useEffect(() => {
    // Solo resetear si los filtros realmente cambiaron (no si solo cambió la página)
    const categoryChanged = prevSelectedCategoryId.current !== selectedCategoryId;
    const stockChanged = prevSelectedStock.current !== selectedStock;
    
    if (categoryChanged || stockChanged) {
      // Solo resetear si no estamos ya en la página 1
      if (paginationConfig.currentPage > 1) {
        handlePageChange(1);
      }
    }
    
    // Actualizar refs con los valores actuales
    prevSelectedCategoryId.current = selectedCategoryId;
    prevSelectedStock.current = selectedStock;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStock, selectedCategoryId]); // Solo dependemos de los filtros, no de la página

  // Limpiar campo de búsqueda cuando cambie la empresa
  useEffect(() => {
    setSearchTerm('');
  }, [companyId, setSearchTerm]);

  // Inicializar campo de búsqueda desde la URL una sola vez
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search).get('q') || "";
    if (q) setSearchTerm(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Empujar cambios de búsqueda a la URL
  useEffect(() => {
    const currentParam = searchParams.get('q') || "";
    const params = new URLSearchParams(searchParams as any);
    if (searchTerm) {
      if (currentParam !== searchTerm) {
        params.set('q', searchTerm);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    } else if (currentParam) {
      params.delete('q');
      const qs = params.toString();
      const nextUrl = qs ? `${pathname}?${qs}` : `${pathname}`;
      router.replace(nextUrl, { scroll: false });
    }
  }, [searchTerm, router, pathname, searchParams]);

  const handleStockChange = async (productId: string, newStock: "IN_STOCK" | "OUT_OF_STOCK") => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: newStock })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el stock');
      }

      // Invalidar queries para refrescar datos usando productKeys
      await queryClient.invalidateQueries({ 
        queryKey: productKeys.lists()
      });
      
      // También forzar refetch inmediato
      await queryClient.refetchQueries({ 
        queryKey: productKeys.list((companyId || undefined) as string | undefined)
      });
      
      // Mostrar mensaje de éxito
      showSuccess('Éxito', 'Stock actualizado correctamente');
    } catch (error) {
      console.error('Error updating stock:', error);
      showError('Error', error instanceof Error ? error.message : 'No se pudo actualizar el stock del producto');
    }
  };

  // 🚀 REACT QUERY: Delete con mutación
  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    if (!showDeleteConfirm?.id || typeof showDeleteConfirm?.id !== 'string') {
      showError("ID de producto inválido para eliminación");
      handleCancelDelete();
      return;
    }
    
    try {
      await deleteMutation.mutateAsync(showDeleteConfirm.id);
      handleCancelDelete();
      showToastSuccess("Producto eliminado correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showToastError(error instanceof Error ? error.message : "Error al eliminar producto");
    }
  };

  // 🚀 REACT QUERY: Submit con mutaciones
  const onSubmit = async (data: ProductForm) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, data: { ...data, companyId } });
        showSuccess("Producto actualizado correctamente");
      } else {
        await createMutation.mutateAsync({ ...data, companyId });
        showSuccess("Producto creado correctamente");
      }
      handleCloseForm();
    } catch (error: any) {
      showError(error.message || "Error al guardar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lógica simplificada: mostrar contenido si hay companyId o si es SUPERADMIN sin impersonar
  const needsCompanySelection = !companyId && currentUser?.role === "SUPERADMIN";

  // Definir columnas para el DataTable - desktop tradicional, mobile sin descripción
  const columns: DataTableColumn<Product>[] = isMobile ? [
    {
      key: 'name',
      label: 'Nombre',
      render: (producto) => producto.name || 'Sin nombre'
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (producto) => producto.category ? (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          fontSize: '12px',
          fontWeight: 500,
          display: 'inline-block',
          textAlign: 'left'
        }}>
          {producto.category.name}
        </span>
      ) : (
        <span style={{ color: '#9ca3af', textAlign: 'left', display: 'block' }}>Sin categoría</span>
      )
    },
    {
      key: 'price',
      label: 'Precio',
      render: (producto) => {
        const price = producto.price || 0;
        return `$ ${typeof price === 'number' ? price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}`;
      }
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (producto) => {
        const isInStock = (producto.stock || 'OUT_OF_STOCK') === 'IN_STOCK';
        return (
          <span style={{
            fontSize: '16px',
            lineHeight: '1',
            display: 'inline-block',
            width: '24px',
            textAlign: 'center'
          }}>
            {isInStock ? '✓' : '✗'}
          </span>
        );
      }
    }
  ] : [
    {
      key: 'image',
      label: '',
      render: (producto) => {
        const placeholderSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Cpath d='M9 9h6v6H9z'/%3E%3C/svg%3E";
        const imageUrl = producto.imageUrl;
        
        return (
          <div style={{ width: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {imageUrl ? (
              <img 
                src={imageUrl}
                alt={producto.name || 'Producto'}
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  objectFit: 'cover',
                  borderRadius: '4px',
                  flexShrink: 0,
                  border: '1px solid #e5e7eb'
                }}
                onError={(e) => {
                  // Si la imagen falla al cargar, mostrar placeholder y loguear el error
                  console.error('Error loading product image:', {
                    imageUrl,
                    productName: producto.name,
                    productId: producto.id
                  });
                  const target = e.target as HTMLImageElement;
                  target.src = placeholderSvg;
                  target.style.opacity = '0.5';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', imageUrl);
                }}
                loading="lazy"
                crossOrigin="anonymous"
              />
            ) : (
              <img 
                src={placeholderSvg}
                alt="Sin imagen"
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  flexShrink: 0,
                  opacity: 0.5
                }}
              />
            )}
          </div>
        );
      }
    },
    {
      key: 'name',
      label: 'Nombre',
      render: (producto) => producto.name || 'Sin nombre'
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (producto) => producto.description || '-'
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (producto) => producto.category ? (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          fontSize: '12px',
          fontWeight: 500
        }}>
          {producto.category.name}
        </span>
      ) : (
        <span style={{ color: '#9ca3af' }}>Sin categoría</span>
      )
    },
    {
      key: 'price',
      label: 'Precio',
      render: (producto) => {
        const price = producto.price || 0;
        return `$ ${typeof price === 'number' ? price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}`;
      }
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (producto) => {
        const isInStock = (producto.stock || 'OUT_OF_STOCK') === 'IN_STOCK';
        const stockColor = isInStock ? '#16a34a' : '#ef4444';
        return (
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: `${stockColor}20`,
            color: stockColor,
            fontSize: '12px',
            fontWeight: 500
          }}>
            {isInStock ? 'En stock' : 'Sin stock'}
          </span>
        );
      }
    }
  ];

  if (!session) {
    return <LoadingSpinner message="Cargando..." />;
  }

  return (
    <>
      <main className="main-content">
        <div className="px-4 py-6 sm:px-0">
        {/* Formulario */}
        <ProductoForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingProduct={editingProduct}
          categories={categorias}
          companyId={companyId || undefined}
        />

        <div className="form-section">
          {/* Título Productos - siempre visible para SUPERADMIN */}
          {currentUser?.role === "SUPERADMIN" && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem',
              padding: '0 16px'
            }}>
              <h2 className="page-title-desktop" style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                color: '#111827',
                marginBottom: 0,
                marginTop: '0',
                padding: 0
              }}>
                Productos
              </h2>
              <CompanySelector
                selectedCompanyId={selectedCompanyId}
                setSelectedCompanyId={setSelectedCompanyId}
              />
            </div>
          )}
          {currentUser?.role !== "SUPERADMIN" && companyId && (
            <h2 className="page-title-desktop" style={{ 
              fontSize: '24px', 
              fontWeight: 700, 
              color: '#111827',
              marginBottom: '0.75rem',
              marginTop: '0',
              padding: '0 16px'
            }}>
              Productos
            </h2>
          )}

          {/* Barra de búsqueda, filtros y botón nuevo */}
          {!!companyId && (
            <div style={{ padding: '0 16px', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar productos..."
                />
                <div style={{ width: '300px' }}>
                  <FilterableSelect
                    options={[
                      { id: "", name: "Todas las categorías" },
                      ...categorias
                    ]}
                    value={selectedCategoryId}
                    onChange={setSelectedCategoryId}
                    placeholder="Filtrar por categoría"
                    searchFields={["name"]}
                    className="w-full"
                    useThemeColors={true}
                  />
                </div>
                <div style={{ width: '220px' }}>
                  <FilterableSelect
                    options={[
                      { id: "", name: "Todos los stocks" },
                      { id: "IN_STOCK", name: "En stock", color: "#16a34a" },
                      { id: "OUT_OF_STOCK", name: "Sin stock", color: "#ef4444" }
                    ]}
                    value={selectedStock}
                    onChange={setSelectedStock}
                    placeholder="Filtrar por stock"
                    searchFields={["name"]}
                    showColors={true}
                    searchable={false}
                    className="w-full"
                    useThemeColors={true}
                  />
                </div>
              </div>
              <button
                onClick={handleNewProduct}
                className="btn-primary new-button"
                data-shortcut="n"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '8px 16px',
                  background: colors.gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  minWidth: '100px',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Plus className="h-4 w-4" />
                <ShortcutText text="Nuevo Producto" shortcutKey="n" />
              </button>
            </div>
          )}

          {/* Mostrar productos solo si hay empresa seleccionada */}
          {needsCompanySelection ? (
            <div className="empty-state">
              <Package className="empty-icon" />
              <p>Para ver los productos, primero selecciona una empresa.</p>
            </div>
          ) : companyId ? (
            <>
              {/* DataTable con paginación */}
                <DataTable
                  {...tableConfig}
                  columns={columns}
                  showSearch={false}
                  showNewButton={false}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
                <Pagination {...paginationConfig} />
              </>
            ) : null}
        </div>

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          onCancel={handleCancelDelete}
          onConfirm={handleDelete}
          title="Eliminar Producto"
          message={`¿Estás seguro de que deseas eliminar el producto "${showDeleteConfirm?.name || 'este producto'}"?`}
        />

        {/* Modal de mensajes */}
        <MessageModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
          details={modalState.details}
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      </main>
    </>
  );
}

export default ProductosContent;
