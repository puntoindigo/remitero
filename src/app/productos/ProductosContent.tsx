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
        setProductos(productsData || []);
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

  // Función de eliminación con useCallback para evitar problemas de hoisting
  const handleDeleteProduct = useCallback((producto: Product) => {
    handleDeleteRequest(producto.id, producto.name);
  }, [handleDeleteRequest]);

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig
  } = useCRUDTable({
    data: productos,
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
      await updateStock(productId, newStock);
      await loadData();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleDelete = async () => {
    if (!editingProduct) return;
    
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        handleCancelDelete();
        showSuccess("Producto eliminado correctamente");
        await loadData();
      } else {
        throw new Error('Error al eliminar producto');
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
        handleCloseForm();
        showSuccess(editingProduct ? "Producto actualizado correctamente" : "Producto creado correctamente");
        await loadData();
      } else {
        throw new Error('Error al guardar producto');
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
      render: (producto) => `$${producto.price.toFixed(2)}`
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
      render: (producto) => formatDate(producto.createdAt)
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
          <div className="category-filter-wrapper" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
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
          <DataTable
            {...tableConfig}
            columns={columns}
            showSearch={true}
            showNewButton={true}
            onEdit={(producto) => handleEditProduct(producto)}
            onDelete={(producto) => handleDeleteRequest(producto)}
            actionsColumnLabel="Acciones"
          />
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
