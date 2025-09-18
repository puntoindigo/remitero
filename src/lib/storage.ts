import { Categoria, Cliente, Producto, Remito } from '@/types';

export interface FormData {
  categorias: Categoria[];
  clientes: Cliente[];
  productos: Producto[];
  remitos: Remito[];
  contadorRemitos: number;
}

const STORAGE_KEY = 'remitero-data';

export const getStoredData = (): FormData => {
  if (typeof window === 'undefined') {
    return {
      categorias: [],
      clientes: [],
      productos: [],
      remitos: [],
      contadorRemitos: 1
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Convertir fechas de string a Date
      data.categorias = data.categorias.map((c: Categoria & { createdAt: string; updatedAt: string }) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }));
      data.clientes = data.clientes.map((c: Cliente & { createdAt: string; updatedAt: string }) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }));
      data.productos = data.productos.map((p: Producto & { createdAt: string; updatedAt: string }) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }));
      data.remitos = data.remitos.map((r: any) => ({
        ...r,
        fecha: new Date(r.fecha),
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
        items: r.items.map((item: any) => ({
          ...item,
          producto: {
            ...item.producto,
            createdAt: new Date(item.producto.createdAt),
            updatedAt: new Date(item.producto.updatedAt)
          }
        }))
      }));
      return data;
    }
  } catch (error) {
    console.error('Error loading stored data:', error);
  }

  return {
    categorias: [],
    clientes: [],
    productos: [],
    remitos: [],
    contadorRemitos: 1
  };
};

export const saveStoredData = (data: FormData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
