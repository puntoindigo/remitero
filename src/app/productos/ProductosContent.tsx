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

export default function ProductosContent() {
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
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

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
        body: JSON.stringify({
          ...data,
          companyId: session.user.companyId
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el producto');
      }

      await loadData();
      reset();
      setEditingProduct(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setValue("name", product.name);
    setValue("description", product.description || "");
    setValue("price", product.price);
    setValue("categoryId", product.category?.id || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      await loadData();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleNew = () => {
    setEditingProduct(null);
    reset();
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    reset();
    setShowForm(false);
  };

  const handleStockChange = async (productId: string, newStock: 'IN_STOCK' | 'OUT_OF_STOCK') => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          stock: newStock
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el stock');
      }

      await loadData();
    } catch (error) {
      console.error('Error updating stock:', error);
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

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="loading">Cargando productos...</div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
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
          <div className="form-section">
            <h3>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h3>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del producto</label>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="Ingresa el nombre del producto"
                  />
                  {errors.name && (
                    <p className="error-message">{errors.name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Precio</label>
                  <div className="price-input">
                    <span className="price-symbol">$</span>
                    <input
                      {...register("price", { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="error-message">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoría</label>
                  <FilterableSelect
                    options={[
                      { id: "", name: "Sin categoría" },
                      ...categories.map(cat => ({ id: cat.id, name: cat.name }))
                    ]}
                    value={watch("categoryId") || ""}
                    onChange={(value) => setValue("categoryId", value)}
                    placeholder="Seleccionar categoría"
                    searchFields={["name"]}
                  />
                  {errors.categoryId && (
                    <p className="error-message">{errors.categoryId.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Descripción del producto (opcional)"
                  />
                  {errors.description && (
                    <p className="error-message">{errors.description.message}</p>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Guardando..." : editingProduct ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
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
              className="max-w-48"
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
                  <th>Stock</th>
                  <th>Fecha de creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(paginatedData) && paginatedData.map((product, index) => (
                  <tr key={product.id} className={index % 2 === 0 ? "row-even" : "row-odd"}>
                    <td>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500">{product.description}</div>
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
                      <select
                        value={product.stock || 'OUT_OF_STOCK'}
                        onChange={(e) => handleStockChange(product.id, e.target.value as 'IN_STOCK' | 'OUT_OF_STOCK')}
                        className={`stock-select ${getStockColor(product.stock || 'OUT_OF_STOCK')}`}
                      >
                        <option value="IN_STOCK">✅ Hay stock</option>
                        <option value="OUT_OF_STOCK">❌ Sin stock</option>
                      </select>
                    </td>
                    <td>{formatDate(new Date(product.createdAt))}</td>
                    <td>
                      <div className="action-buttons-spaced">
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
          <div className="modal-overlay">
            <div className="modal">
              <h3>Confirmar eliminación</h3>
              <p>¿Estás seguro de que quieres eliminar este producto?</p>
              <div className="modal-actions">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="primary delete"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
