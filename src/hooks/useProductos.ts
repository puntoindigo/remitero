"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCurrentUser } from "./useCurrentUser";

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

export function useProductos() {
  const { data: session } = useSession();
  const currentUser = useCurrentUser();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProductos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Pasar companyId del usuario actual (considerando impersonation)
      const url = currentUser?.companyId ? `/api/products?companyId=${currentUser.companyId}` : "/api/products";
      console.log('🔍 useProductos - currentUser:', currentUser);
      console.log('🔍 useProductos - URL:', url);
      const response = await fetch(url);
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
  };

  const createProducto = async (productoData: ProductoFormData) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productoData,
          companyId: currentUser?.companyId
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
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData),
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
  }, [currentUser?.companyId]);

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
