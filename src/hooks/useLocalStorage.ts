import { useState, useEffect } from 'react';
import { FormData, getStoredData, saveStoredData } from '@/lib/storage';

export const useLocalStorage = () => {
  const [data, setData] = useState<FormData>(() => getStoredData());

  useEffect(() => {
    saveStoredData(data);
  }, [data]);

  const updateData = (newData: Partial<FormData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const addCategoria = (categoria: Omit<FormData['categorias'][0], 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCategoria = {
      ...categoria,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setData(prev => ({
      ...prev,
      categorias: [...prev.categorias, newCategoria]
    }));
    return newCategoria;
  };

  const updateCategoria = (id: string, updates: Partial<FormData['categorias'][0]>) => {
    setData(prev => ({
      ...prev,
      categorias: prev.categorias.map(c => 
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
      )
    }));
  };

  const deleteCategoria = (id: string) => {
    setData(prev => ({
      ...prev,
      categorias: prev.categorias.filter(c => c.id !== id)
    }));
  };

  const addCliente = (cliente: Omit<FormData['clientes'][0], 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCliente = {
      ...cliente,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setData(prev => ({
      ...prev,
      clientes: [...prev.clientes, newCliente]
    }));
    return newCliente;
  };

  const updateCliente = (id: string, updates: Partial<FormData['clientes'][0]>) => {
    setData(prev => ({
      ...prev,
      clientes: prev.clientes.map(c => 
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
      )
    }));
  };

  const deleteCliente = (id: string) => {
    setData(prev => ({
      ...prev,
      clientes: prev.clientes.filter(c => c.id !== id)
    }));
  };

  const addProducto = (producto: Omit<FormData['productos'][0], 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProducto = {
      ...producto,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setData(prev => ({
      ...prev,
      productos: [...prev.productos, newProducto]
    }));
    return newProducto;
  };

  const updateProducto = (id: string, updates: Partial<FormData['productos'][0]>) => {
    setData(prev => ({
      ...prev,
      productos: prev.productos.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      )
    }));
  };

  const deleteProducto = (id: string) => {
    setData(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.id !== id)
    }));
  };

  const addRemito = (remito: Omit<FormData['remitos'][0], 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRemito = {
      ...remito,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setData(prev => ({
      ...prev,
      remitos: [...prev.remitos, newRemito],
      contadorRemitos: prev.contadorRemitos + 1
    }));
    return newRemito;
  };

  const updateRemito = (id: string, updates: Partial<FormData['remitos'][0]>) => {
    setData(prev => ({
      ...prev,
      remitos: prev.remitos.map(r => 
        r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
      )
    }));
  };

  const deleteRemito = (id: string) => {
    setData(prev => ({
      ...prev,
      remitos: prev.remitos.filter(r => r.id !== id)
    }));
  };

  return {
    data,
    updateData,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    addCliente,
    updateCliente,
    deleteCliente,
    addProducto,
    updateProducto,
    deleteProducto,
    addRemito,
    updateRemito,
    deleteRemito
  };
};
