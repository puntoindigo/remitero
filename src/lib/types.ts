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
  productId?: string;
  productName: string;
  productDesc?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Remito {
  id: string;
  number: number;
  clientId: string;
  client: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  items: RemitoItem[];
  notes?: string;
  status: string;
  total: number;
  createdAt: string;
  createdBy: {
    name: string;
  };
}

export interface DBShape {
  categorias: Categoria[];
  productos: Producto[];
  clientes: Cliente[];
  remitos: Remito[];
  counters: { remito: number };
}
