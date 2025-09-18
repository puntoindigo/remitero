export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoriaId: string;
  categoria?: Categoria;
  stock?: number;
  medida?: string; // Ej: "1L", "500ml", "2kg", "500g"
  capacidad?: string; // Ej: "Botella", "Lata", "Caja", "Bolsa"
  createdAt: Date;
  updatedAt: Date;
}

export interface RemitoItem {
  productoId: string;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Remito {
  id: string;
  numero: string;
  fecha: Date;
  clienteId: string;
  cliente: Cliente;
  items: RemitoItem[];
  total: number;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormData {
  categorias: Categoria[];
  clientes: Cliente[];
  productos: Producto[];
  remitos: Remito[];
  contadorRemitos: number;
}
