"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductForm } from "@/lib/validations";
import { Plus, Package } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useDirectUpdate } from "@/hooks/useDirectUpdate";
import { ProductoForm } from "@/components/forms/ProductoForm";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";
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
import { StockToggle } from "@/components/common/StockToggle";

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
  const { empresas } = useEmpresas();
  
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
    setSearchTerm
  } = useCRUDTable({
    data: filteredProductos,
    loading: isLoading,
    searchFields: ['name', 'description'],
    itemsPerPage: 10,
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

  const handleStockChange = async (productId: string, newStock: string) => {
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
      showSuccess("Producto eliminado correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showError(error instanceof Error ? error.message : "Error al eliminar producto");
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

  // Definir columnas para el DataTable
  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      label: 'Producto',
      render: (producto) => (
        <div>
          <div className="font-medium">{producto?.name}</div>
          {producto.description && (
            <div className="text-sm text-gray-500">{producto.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (producto) => (
        producto.category ? (
          <span className="badge">{producto.category.name}</span>
        ) : (
          <span className="text-gray-400">Sin categoría</span>
        )
      )
    },
    {
      key: 'price',
      label: 'Precio',
      render: (producto) => {
        const price = producto.price || 0;
        return `$${typeof price === 'number' ? price.toFixed(2) : '0.00'}`;
      }
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (producto) => (
        <div style={{ display: 'flex', justifyContent: 'center', width: '40px' }}>
          <StockToggle
            value={(producto.stock || 'OUT_OF_STOCK') as "IN_STOCK" | "OUT_OF_STOCK"}
            onChange={(value) => handleStockChange(producto?.id, value)}
            compact={true}
          />
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Registrado',
      render: (producto) => {
        const date = new Date(producto.createdAt);
        return date.toLocaleString('es-AR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    }
  ];

  if (!session) {
    return <LoadingSpinner message="Cargando..." />;
  }

  return (
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
        />

        <div className="form-section">
          <h2>Gestión de Productos</h2>
          
          {/* Selector de empresa - ancho completo */}
          {shouldShowCompanySelector && empresas?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <FilterableSelect
                options={empresas}
                value={selectedCompanyId}
                onChange={setSelectedCompanyId}
                placeholder="Seleccionar empresa"
                searchFields={["name"]}
                className="w-full"
                useThemeColors={true}
              />
            </div>
          )}

          {/* Barra de búsqueda, filtros y botón nuevo */}
          {!!companyId && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
                  onEdit={(producto) => handleEditProduct(producto)}
                  onDelete={handleDeleteProduct}
                  actionsColumnLabel="Acciones"
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
      </div>
    </main>
  );
}

export default ProductosContent;
