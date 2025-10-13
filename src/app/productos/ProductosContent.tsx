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

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock?: string;
  category?: Category;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

function ProductosContentFixed() {
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompanySimple();
  
  const [productos, setProductos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const { empresas } = useEmpresas();

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

  const loadData = async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Cargar productos
      const productsResponse = await fetch(`/api/products?companyId=${companyId}`);
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        // Filtrar productos que tengan datos mínimos requeridos
        const validProducts = (productsData || []).filter((product: any) => 
          product && product.id && product.name && product.name.trim() !== ''
        );
        setProductos(validProducts);
      }

      // Cargar categorías
      const categoriesResponse = await fetch(`/api/categories?companyId=${companyId}`);
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategorias(categoriesData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  // Filtrar productos por categoría
  const filteredProductos = selectedCategoryId 
    ? productos.filter(producto => producto.category?.id === selectedCategoryId)
    : productos;

  // Función de eliminación
  const handleDeleteProduct = (producto: Product) => {
    if (!producto.id || typeof producto.id !== 'string') {
      showError("Error", "ID de producto inválido");
      return;
    }
    
    const productName = producto.name || 'Producto sin nombre';
    handleDeleteRequest(producto.id, productName);
  };

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig
  } = useCRUDTable({
    data: filteredProductos,
    loading: isLoading,
    searchFields: ['name', 'description'],
    itemsPerPage: 10,
    onEdit: handleEditProduct,
    onDelete: handleDeleteProduct,
    onNew: handleNewProduct,
    getItemId: (product) => product.id,
    emptyMessage: "No hay productos",
    emptySubMessage: "Comienza creando un nuevo producto.",
    emptyIcon: <Package className="empty-icon" />,
    newButtonText: "Nuevo Producto",
    searchPlaceholder: "Buscar productos..."
  });

  const handleStockChange = async (productId: string, newStock: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el stock');
      }

      // Actualizar el estado local inmediatamente
      setProductos(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ? { ...product, stock: newStock } : product
        )
      );
    } catch (error) {
      console.error('Error updating stock:', error);
      showError('Error', 'No se pudo actualizar el stock del producto');
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    if (!showDeleteConfirm.id || typeof showDeleteConfirm.id !== 'string') {
      showError("Error", "ID de producto inválido para eliminación");
      handleCancelDelete();
      return;
    }
    
    try {
      const response = await fetch(`/api/products/${showDeleteConfirm.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        handleCancelDelete();
        showSuccess("Producto eliminado correctamente");
        await loadData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar producto');
      }
    } catch (error: any) {
      handleCancelDelete();
      showError("Error", error instanceof Error ? error.message : "Error al eliminar producto");
    }
  };

  const onSubmit = async (data: ProductForm) => {
    setIsSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, companyId })
      });

      if (response.ok) {
        const newProduct = await response.json();
        
        // Validar que el producto tenga los datos mínimos requeridos
        if (!newProduct || !newProduct.id || !newProduct.name || newProduct.name.trim() === '') {
          throw new Error('El producto creado no tiene los datos válidos');
        }
        
        if (editingProduct) {
          // Actualizar producto existente
          setProductos(prev => prev.map(p => p.id === editingProduct.id ? newProduct : p));
        } else {
          // Agregar nuevo producto al principio de la lista
          setProductos(prev => [newProduct, ...prev]);
        }
        
        handleCloseForm();
        showSuccess(editingProduct ? "Producto actualizado correctamente" : "Producto creado correctamente");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar producto');
      }
    } catch (error: any) {
      showError("Error", error instanceof Error ? error.message : "Error al guardar producto");
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
          <div className="font-medium">{producto.name}</div>
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
          onChange={(e) => handleStockChange(producto.id, e.target.value)}
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
          minute: '2-digit'
        });
      }
    }
  ];

  if (!session) {
    return <div className="loading">Cargando...</div>;
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
          
          {/* Filtros adicionales */}
          <div className="filters-wrapper" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {shouldShowCompanySelector && empresas.length > 0 && (
              <FilterableSelect
                options={empresas}
                value={selectedCompanyId}
                onChange={setSelectedCompanyId}
                placeholder="Seleccionar empresa"
                searchFields={["name"]}
                className="w-64"
              />
            )}
          </div>

          {/* DataTable con paginación */}
          <div className="data-table-with-filters">
            <div className="search-and-filter-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="search-field" style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={tableConfig.searchValue || ''}
                  onChange={(e) => tableConfig.onSearchChange?.(e.target.value)}
                  className="search-input"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div className="category-filter" style={{ minWidth: '200px' }}>
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
              {tableConfig.onNew && (
                <button
                  onClick={tableConfig.onNew}
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
                  {tableConfig.newButtonText || 'Nuevo'}
                </button>
              )}
            </div>
            
            <DataTable
              {...tableConfig}
              columns={columns}
              showSearch={false}
              showNewButton={false}
              onEdit={(producto) => handleEditProduct(producto)}
              onDelete={handleDeleteProduct}
              actionsColumnLabel="Acciones"
            />
          </div>
          <Pagination {...paginationConfig} />
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

export default ProductosContentFixed;
