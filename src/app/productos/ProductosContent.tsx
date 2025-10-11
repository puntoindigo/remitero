"use client";

import React, { useState, useEffect, Suspense } from "react";
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
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { ProductoForm } from "@/components/forms/ProductoForm";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useDataWithCompany } from "@/hooks/useDataWithCompany";
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

function ProductosContent() {
  const { data: session } = useSession();
  const currentUser = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompany();
  
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
    handleCancelDelete,
    setEditingItem: setEditingProduct
  } = useCRUDPage<Product>();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  
  // Hook para manejar modales de mensajes
  const { modalState, showSuccess, showError, closeModal } = useMessageModal();
  const { updateStock, confirmation } = useDirectUpdate();

  // Hook para empresas
  const { empresas } = useEmpresas();

  // Función para obtener el stock del producto
  const getStockFromProduct = (product: any) => {
    return product.stock || 'OUT_OF_STOCK';
  };

  // Filtrar productos por categoría y stock
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category?.id === selectedCategory;
    
    let matchesStock = true;
    if (selectedStock) {
      const productStock = getStockFromProduct(product);
      matchesStock = productStock === selectedStock;
    }
    
    return matchesCategory && matchesStock;
  });

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig
  } = useCRUDTable({
    data: filteredProducts,
    loading: isLoading,
    searchFields: ['name', 'description'],
    itemsPerPage: 10,
    onEdit: handleEditProduct,
    onDelete: handleDeleteRequest,
    onNew: handleNewProduct,
    getItemId: (product) => product.id,
    emptyMessage: "No hay productos",
    emptySubMessage: "Comienza creando un nuevo producto.",
    emptyIcon: <Package className="empty-icon" />,
    newButtonText: "Nuevo Producto",
    searchPlaceholder: "Buscar productos..."
  });

  const loadData = async () => {
    if (!companyId) {
      setIsLoading(false); // Importante: poner isLoading en false para mostrar el selector
      return;
    }

    try {
      setIsLoading(true);
      
      // Pasar companyId del usuario actual (considerando impersonation)
      const productsUrl = companyId ? `/api/products?companyId=${companyId}` : "/api/products";
      const categoriesUrl = companyId ? `/api/categories?companyId=${companyId}` : "/api/categories";
      
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(productsUrl),
        fetch(categoriesUrl)
      ]);

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const [productsData, categoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      showError("Error", "No se pudieron cargar los productos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  // Detectar parámetro ?new=true para abrir formulario automáticamente
  useEffect(() => {
    const newParam = searchParams?.get('new');
    if (newParam === 'true') {
      handleNewProduct();
      // Limpiar el query parameter después de procesarlo
      const newSearchParams = new URLSearchParams(searchParams?.toString());
      newSearchParams.delete('new');
      const newUrl = newSearchParams.toString() 
        ? `${pathname}?${newSearchParams.toString()}` 
        : pathname;
      router.replace(newUrl);
    }
  }, [searchParams, handleNewProduct, pathname, router]);

  // Leer parámetro de categoría de la URL
  useEffect(() => {
    const categoryParam = searchParams?.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const onSubmit = async (data: ProductForm) => {
    if (!companyId) return;

    setIsSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          companyId: companyId
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el producto');
      }

      await loadData();
      setEditingProduct(null);
      handleCloseForm();
      showSuccess(editingProduct ? "Producto actualizado correctamente" : "Producto creado correctamente");
    } catch (error: any) {
      console.error('Error saving product:', error);
      showError("Error al guardar el producto", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      await loadData();
      handleCancelDelete();
      showSuccess("Producto eliminado correctamente");
    } catch (error: any) {
      console.error('Error deleting product:', error);
      handleCancelDelete();
      showError("Error al eliminar el producto", error.message);
    }
  };

  const handleStockChange = async (productId: string, newStock: 'IN_STOCK' | 'OUT_OF_STOCK') => {
    const updateFunction = async (id: string, stock: string) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el stock');
      }

      // Actualizar el estado local
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === id ? { ...product, stock: stock as 'IN_STOCK' | 'OUT_OF_STOCK' } : product
        )
      );
    };

    await updateStock(
      productId,
      newStock,
      updateFunction,
      {
        onSuccess: (message) => showSuccess(message),
        onError: (error) => showError("Error", error)
      }
    );
  };

  const getCleanDescription = (product: Product) => {
    if (!product.description) return null;
    const cleanDesc = product.description.replace(/<[^>]*>/g, '').trim();
    return cleanDesc.length > 0 ? cleanDesc : null;
  };

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="loading">Cargando productos...</div>
      </main>
    );
  }

  // Lógica simplificada: mostrar contenido si hay companyId o si es SUPERADMIN sin impersonar
  const needsCompanySelection = !companyId && currentUser?.role === "SUPERADMIN";

  // Definir columnas para el DataTable
  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      label: 'Producto',
      render: (product) => (
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          {getCleanDescription(product) && (
            <div className="product-description">{getCleanDescription(product)}</div>
          )}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (product) => (
        product.category ? (
          <span className="badge">{product.category.name}</span>
        ) : (
          <span className="text-gray-400">Sin categoría</span>
        )
      )
    },
    {
      key: 'price',
      label: 'Precio',
      render: (product) => `$${(Number(product.price) || 0).toFixed(2)}`
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (product) => {
        const stock = getStockFromProduct(product);
        return (
          <select
            value={stock}
            onChange={(e) => handleStockChange(product.id, e.target.value as 'IN_STOCK' | 'OUT_OF_STOCK')}
            className="stock-select"
          >
            <option value="IN_STOCK">✅ En Stock</option>
            <option value="OUT_OF_STOCK">❌ Sin Stock</option>
          </select>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Registrado',
      render: (product) => new Date(product.createdAt).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  ];

  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">

        {/* Formulario */}
        <ProductoForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingProduct={editingProduct ? {
            id: editingProduct.id,
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price,
            stock: editingProduct.stock,
            categoryId: editingProduct.category?.id
          } : null}
          categories={categories}
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
            {!needsCompanySelection && (
              <>
                <FilterableSelect
                  options={[
                    { id: "", name: "Todas las categorías" },
                    ...categories.map(cat => ({ id: cat.id, name: cat.name }))
                  ]}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Filtrar por categoría"
                  searchFields={["name"]}
                  className="category-filter-select"
                />
                <FilterableSelect
                  options={[
                    { id: "", name: "Todos los estados" },
                    { id: "IN_STOCK", name: "✅ Con stock" },
                    { id: "OUT_OF_STOCK", name: "❌ Sin stock" }
                  ]}
                  value={selectedStock}
                  onChange={setSelectedStock}
                  placeholder="Filtrar por stock"
                  searchFields={["name"]}
                  className="category-filter-select"
                />
              </>
            )}
          </div>

          {/* DataTable con paginación */}
          {!needsCompanySelection && (
            <>
              <DataTable
                {...tableConfig}
                columns={columns}
                showSearch={true}
                showNewButton={false} // Ya tenemos el botón arriba
              />
              <Pagination {...paginationConfig} />
            </>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={handleCancelDelete}
          onConfirm={handleDelete}
          title="Eliminar Producto"
          message={`¿Estás seguro de que deseas eliminar el producto "${editingProduct?.name}"?`}
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

        {/* Modal de confirmación */}
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          onClose={confirmation.close}
          onConfirm={confirmation.confirm}
          title={confirmation.title}
          message={confirmation.message}
          type={confirmation.type}
          isLoading={confirmation.isLoading}
        />
      </div>
    </main>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    }>
      <ProductosContent />
    </Suspense>
  );
}
