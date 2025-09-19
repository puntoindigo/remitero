"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductForm, productSchema } from "@/lib/validations";
import { Plus, Edit, Trash2, Package, Tag, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import { useSearchAndPagination } from "@/hooks/useSearchAndPagination";
import FilterableSelect from "@/components/common/FilterableSelect";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductosPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Filtrar productos por categoría
  const filteredProducts = products.filter(product => 
    !selectedCategory || product.category?.id === selectedCategory
  );

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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema)
  });

  const loadData = async () => {
    if (!session?.user?.companyId) return;
    
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);

      if (!productsResponse.ok || !categoriesResponse.ok) {
        throw new Error('Error al cargar los datos');
      }

      const [productsData, categoriesData] = await Promise.all([
        productsResponse.json(),
        categoriesResponse.json()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session?.user?.companyId]);

  // Leer parámetro de categoría de la URL
  useEffect(() => {
    const categoryParam = searchParams?.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const onSubmit = async (data: ProductForm) => {
    if (!session?.user?.companyId) return;

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el producto');
      }
      
      reset();
      setEditingProduct(null);
      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error("Error saving product:", error);
      alert(error instanceof Error ? error.message : 'Error al guardar el producto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
    setValue("name", product.name);
    setValue("description", product.description || "");
    setValue("price", product.price);
    setValue("categoryId", product.category?.id || "");
  };

  const handleNew = () => {
    setEditingProduct(null);
    setShowForm(true);
    reset();
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setShowForm(false);
    reset();
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.companyId) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el producto');
      }

      await loadData();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      alert(error.message || "Error al eliminar el producto");
    }
  };

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="mt-2 text-gray-600">
            Administra el catálogo de productos
          </p>
        </div>

        {/* Botón Nuevo Producto */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={handleNew}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </button>
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre del producto
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ingresa el nombre del producto"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Precio
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      {...register("price", { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  {...register("categoryId")}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Sin categoría</option>
                  {Array.isArray(categories) && categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Descripción del producto (opcional)"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Guardando..." : editingProduct ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
        )}

        <div className="form-section">
          <h3>Lista de Productos</h3>
          
          <SearchAndPagination
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            placeholder="Buscar productos..."
          />
          
          <div className="mb-4">
            <FilterableSelect
              options={[
                { id: "", name: "Todas las categorías" },
                ...categories.map(cat => ({ id: cat.id, name: cat.name }))
              ]}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Filtrar por categoría"
              searchFields={["name"]}
              className="max-w-xs"
            />
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
                  <th>Fecha de creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(paginatedData) && paginatedData.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td>
                      {product.category ? (
                        <span className="badge">
                          <Tag className="h-3 w-3 mr-1" />
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Sin categoría</span>
                      )}
                    </td>
                    <td className="font-medium">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td>{formatDate(product.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(product)}
                          className="action-btn edit"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(product.id)}
                          className="action-btn delete"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}