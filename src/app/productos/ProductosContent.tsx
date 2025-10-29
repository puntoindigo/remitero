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
  const { data: productos = [], isLoading } = useProductosQuery(companyId);
  const { data: categorias = [] } = useCategoriasQuery(companyId);
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const { empresas } = useEmpresas();
  
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

  // Filtrar productos por categoría
  const filteredProductos = selectedCategoryId 
    ? productos.filter(producto => producto.category?.id === selectedCategoryId)
    : productos;

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
        queryKey: productKeys.list(companyId)
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
        <select
          value={producto.stock || 'OUT_OF_STOCK'}
          onChange={(e) => handleStockChange(producto?.id, e.target.value)}
          className="status-select"
        >
          <option value="IN_STOCK">✅ En Stock</option>
          <option value="OUT_OF_STOCK">❌ Sin Stock</option>
        </select>
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
                  />
                </div>
              </div>
              <button
                onClick={handleNewProduct}
                className="new-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
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
