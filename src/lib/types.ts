export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  createdAt: string; // ISO
}

export interface Producto {
  id: string;
  nombre: string;
  categoriaId?: string;
  precio: number;
  stock?: number;
  medida?: string;
  capacidad?: string;
  descripcion?: string;
  createdAt: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  createdAt: string;
}

export interface RemitoItem {
  productoId: string;
  nombre: string;
  precioUnit: number;
  cantidad: number;
  subtotal: number;
}

export interface Remito {
  id: string;
  numero: string;     // REM-0001
  fecha: string;      // ISO yyyy-mm-dd
  clienteId: string;
  clienteNombre: string;
  items: RemitoItem[];
  observaciones?: string;
  total: number;
  createdAt: string;
}

export interface DBShape {
  categorias: Categoria[];
  productos: Producto[];
  clientes: Cliente[];
  remitos: Remito[];
  counters: { remito: number };
}
