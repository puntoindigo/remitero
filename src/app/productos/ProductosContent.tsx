"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Package } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDataWithCompany } from "@/hooks/useDataWithCompany";
import { useEmpresas } from "@/hooks/useEmpresas";
import FilterableSelect from "@/components/common/FilterableSelect";

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

function ProductosContentSimple() {
  const { data: session } = useSession();
  const currentUser = useCurrentUser();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompany();
  
  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { empresas } = useEmpresas();

  const loadData = async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/products?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setProductos(data || []);
      }
    } catch (error) {
      console.error('Error loading productos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  // Lógica simplificada: mostrar contenido si hay companyId o si es SUPERADMIN sin impersonar
  const needsCompanySelection = !companyId && currentUser?.role === "SUPERADMIN";

  if (!session) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <main className="main-content">
      <div className="page-container">
        <div className="page-header">
          <h1>Gestión de Productos</h1>
          <h2>Administra los productos de la empresa</h2>
        </div>

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

        {/* Contenido principal */}
        {needsCompanySelection ? (
          <div className="empty-state">
            <Package className="empty-icon" />
            <h3>Selecciona una empresa</h3>
            <p>Para ver los productos, primero selecciona una empresa.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <div className="data-table-header">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="search-input"
                />
              </div>
              <button className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </button>
            </div>
            
            {isLoading ? (
              <div className="loading">Cargando productos...</div>
            ) : productos.length === 0 ? (
              <div className="empty-state">
                <Package className="empty-icon" />
                <h3>No hay productos</h3>
                <p>Comienza creando un nuevo producto.</p>
              </div>
            ) : (
              <div className="data-table">
                <table>
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
                    {productos.map((producto) => (
                      <tr key={producto.id}>
                        <td>
                          <div>
                            <div className="font-medium">{producto.name}</div>
                            {producto.description && (
                              <div className="text-sm text-gray-500">{producto.description}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          {producto.category ? (
                            <span className="badge">{producto.category.name}</span>
                          ) : (
                            <span className="text-gray-400">Sin categoría</span>
                          )}
                        </td>
                        <td>${producto.price.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${producto.stock === 'IN_STOCK' ? 'badge-success' : 'badge-danger'}`}>
                            {producto.stock === 'IN_STOCK' ? '✅ En Stock' : '❌ Sin Stock'}
                          </span>
                        </td>
                        <td>{new Date(producto.createdAt).toLocaleDateString('es-AR')}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-button edit-button" 
                              title="Editar"
                              onClick={() => console.log('Editar producto:', producto.id)}
                            >
                              ✏️
                            </button>
                            <button 
                              className="action-button delete-button" 
                              title="Eliminar"
                              onClick={() => console.log('Eliminar producto:', producto.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default ProductosContentSimple;
