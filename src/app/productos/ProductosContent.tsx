"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductForm } from "@/lib/validations";
import { Plus, Package, Tag, DollarSign, Search } from "lucide-react";
import ActionButtons from "@/components/common/ActionButtons";
import { formatDate } from "@/lib/utils/formatters";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import { useSearchAndPagination } from "@/hooks/useSearchAndPagination";
import FilterableSelect from "@/components/common/FilterableSelect";
import SimpleSelect from "@/components/common/SimpleSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useMessageModal } from "@/hooks/useMessageModal";
import { ProductoForm } from "@/components/forms/ProductoForm";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: 'IN_STOCK' | 'OUT_OF_STOCK';
  category?: {
    id: string;
    name: string;
  };
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
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
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

  // Hook para empresas
  const { empresas } = useEmpresas();

  // Determinar qué empresa usar: la seleccionada o la del usuario
  const companyId = currentUser?.role === "SUPERADMIN" 
    ? selectedCompanyId 
    : currentUser?.companyId;

  console.log('ProductosContent - currentUser:', currentUser);
  console.log('ProductosContent - selectedCompanyId:', selectedCompanyId);
  console.log('ProductosContent - companyId:', companyId);
  console.log('ProductosContent - empresas:', empresas);
  console.log('ProductosContent - needsCompanySelection:', currentUser?.role === "SUPERADMIN" && !selectedCompanyId);
  console.log('ProductosContent - shouldShowFilterableSelect:', currentUser?.role === "SUPERADMIN" && empresas.length > 0);
  console.log('ProductosContent - isLoading:', isLoading);

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

  // Hook para búsqueda y paginación
  const {
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedData,
    handleSearchChange,
    handlePageChange
  } = useSearchAndPagination({
    data: filteredProducts,
    searchFields: ['name', 'description'],
    itemsPerPage: 10
  });


  const loadData = async () => {
    if (!companyId) {
      console.log('No companyId, skipping loadData');
      setIsLoading(false); // Importante: poner isLoading en false para mostrar el selector
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading data for companyId:', companyId);
      
      // Pasar companyId del usuario actual (considerando impersonation)
      const productsUrl = companyId ? `/api/products?companyId=${companyId}` : "/api/products";
      const categoriesUrl = companyId ? `/api/categories?companyId=${companyId}` : "/api/categories";
      
      console.log('Fetching from URLs:', { productsUrl, categoriesUrl });
      
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(productsUrl),
        fetch(categoriesUrl)
      ]);

      console.log('Response status:', { products: productsRes.status, categories: categoriesRes.status });

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      console.log('Loaded data:', { products: productsData.length, categories: categoriesData.length });

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
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
  }, [searchParams, handleNewProduct, router, pathname]);

  // Leer parámetro de categoría de la URL
  useEffect(() => {
    const categoryParam = searchParams?.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const onSubmit = async (data: ProductForm) => {
    if (!currentUser?.companyId) return;

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
          companyId: session.user.companyId
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
    if (!showDeleteConfirm) return;
    
    try {
      const response = await fetch(`/api/products/${showDeleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el producto');
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
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock: newStock
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Si es error 401, redirigir al login
        if (response.status === 401) {
          showError(
            'Sesión expirada',
            'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            result.message
          );
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
          return;
        }

        // Para otros errores, mostrar el mensaje específico
        showError(
          'Error al actualizar stock',
          result.message || result.error || 'Error al actualizar el stock',
          response.status === 500 ? result.details : undefined
        );
        return;
      }

      // Éxito
      const stockText = newStock === 'IN_STOCK' ? 'en stock' : 'sin stock';
      showSuccess(
        'Stock actualizado',
        `El producto ahora está ${stockText}.`
      );

      await loadData();
    } catch (error) {
      console.error('Error updating stock:', error);
      showError(
        'Error de conexión',
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        (error as Error).message
      );
    }
  };

  const getStockColor = (stock: string) => {
    switch (stock) {
      case "IN_STOCK":
        return "stock-in";
      case "OUT_OF_STOCK":
        return "stock-out";
      default:
        return "stock-out";
    }
  };

  const getCleanDescription = (product: any) => {
    // Remover el texto "Stock: XXX" de la descripción
    // La descripción ya no contiene información de stock
    return product.description;
  };

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="loading">Cargando productos...</div>
      </main>
    );
  }

  // Verificar si necesita seleccionar empresa
  const needsCompanySelection = currentUser?.role === "SUPERADMIN" && !selectedCompanyId;

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
          
          
          <SearchAndPagination
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            placeholder="Buscar productos..."
          >
            <div className="category-filter-wrapper" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {currentUser?.role === "SUPERADMIN" && empresas.length > 0 && (
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
          </SearchAndPagination>

          {!needsCompanySelection && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Lista de Productos</h3>
                <button
                  onClick={handleNewProduct}
                  className="primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </button>
              </div>
              
              {!Array.isArray(products) || products.length === 0 ? (
            <div className="empty-state">
              <Package className="empty-icon" />
              <p className="empty-text">No hay productos</p>
              <p className="empty-subtext">Comienza creando un nuevo producto.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(paginatedData) && paginatedData.map((product, index) => (
                  <tr key={product.id} className={index % 2 === 0 ? "row-even" : "row-odd"}>
                    <td>
                      <div className="product-info">
                        <div className="product-name">{product.name}</div>
                        {getCleanDescription(product) && (
                          <div className="product-description">{getCleanDescription(product)}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      {product.category ? (
                        <span className="badge">{product.category.name}</span>
                      ) : (
                        <span className="text-gray-400">Sin categoría</span>
                      )}
                    </td>
                    <td>${(Number(product.price) || 0).toFixed(2)}</td>
                    <td>
                      <SimpleSelect
                        value={getStockFromProduct(product)}
                        onChange={(value) => handleStockChange(product.id, value as 'IN_STOCK' | 'OUT_OF_STOCK')}
                        options={[
                          { id: 'IN_STOCK', name: 'Con stock', icon: '✅' },
                          { id: 'OUT_OF_STOCK', name: 'Sin stock', icon: '❌' }
                        ]}
                        className={getStockColor(getStockFromProduct(product))}
                      />
                    </td>
                    <td>{new Date(product.createdAt).toLocaleString('es-AR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}</td>
                    <td>
                      <ActionButtons
                        onEdit={() => handleEditProduct(product)}
                        onDelete={() => handleDeleteRequest(product.id, product.name)}
                        editTitle="Editar producto"
                        deleteTitle="Eliminar producto"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
            </>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          onConfirm={handleDelete}
          onCancel={handleCancelDelete}
          title="Eliminar producto"
          message="¿Estás seguro de que deseas eliminar este producto?"
          itemName={showDeleteConfirm?.name}
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

export default function ProductosContentWrapper() {
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
