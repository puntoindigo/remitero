"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useCurrentUserSimple } from "./useCurrentUserSimple";
import { useLoading } from "./useLoading";

export interface Producto {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
  category?: { id: string; name: string };
  createdAt: Date;
}

export interface ProductoFormData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
}

export function useProductos(companyId?: string) {
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar que la sesión y el usuario estén disponibles
  if (!session || !currentUser) {
    return {
      productos: [],
      isLoading: true,
      error: null,
      createProducto: async () => {},
      updateProducto: async () => {},
      deleteProducto: async () => {}
    };
  }

  // Determinar el companyId efectivo para las operaciones CRUD
  const getEffectiveCompanyId = () => {
    // Si se pasa companyId como parámetro (desde useDataWithCompany), usarlo
    if (companyId) {
      return companyId;
    }
    
    // Si no hay companyId pasado, usar la lógica del usuario actual
    const isImpersonating = currentUser?.impersonating !== null;
    
    if (isImpersonating) {
      // Cuando impersono, uso el companyId del usuario impersonado
      return currentUser?.companyId || null;
    } else if (currentUser?.role === "SUPERADMIN") {
      // SUPERADMIN sin impersonation: si no hay companyId seleccionado, no puede crear
      return null;
    } else {
      // Usuario normal usa su companyId
      return currentUser?.companyId || null;
    }
  };

  const loadProductos = useCallback(async () => {
    const effectiveCompanyId = getEffectiveCompanyId();
    
    if (!effectiveCompanyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/products?companyId=${effectiveCompanyId}`);
      if (!response.ok) {
        throw new Error("Error al cargar productos");
      }
      
      const data = await response.json();
      setProductos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error loading productos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, currentUser?.id, currentUser?.role, currentUser?.companyId, currentUser?.impersonating]);

  const createProducto = async (productoData: ProductoFormData) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId();
      
      if (!effectiveCompanyId) {
        throw new Error("No se puede crear el producto: CompanyId no disponible");
      }

      const response = await fetch("/api/test-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productoData,
          companyId: effectiveCompanyId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear producto");
      }

      const newProducto = await response.json();
      setProductos(prev => [...prev, newProducto]);
      return newProducto;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear producto";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProducto = async (id: string, productoData: ProductoFormData) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId();
      
      if (!effectiveCompanyId) {
        throw new Error("No se puede actualizar el producto: CompanyId no disponible");
      }

      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productoData,
          companyId: effectiveCompanyId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar producto");
      }

      const updatedProducto = await response.json();
      setProductos(prev => 
        prev.map(producto => 
          producto.id === id ? updatedProducto : producto
        )
      );
      return updatedProducto;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar producto";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar stock");
      }

      const updatedProducto = await response.json();
      setProductos(prev => 
        prev.map(producto => 
          producto.id === id ? updatedProducto : producto
        )
      );
      return updatedProducto;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar stock";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteProducto = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar producto");
      }

      setProductos(prev => prev.filter(producto => producto.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar producto";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  return {
    productos,
    isLoading,
    error,
    loadProductos,
    createProducto,
    updateProducto,
    updateStock,
    deleteProducto,
  };
}
