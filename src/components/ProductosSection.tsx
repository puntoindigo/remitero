'use client';

import React, { useState } from 'react';
import { Producto, Categoria } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface ProductosSectionProps {
  productos: Producto[];
  categorias: Categoria[];
  onAdd: (producto: Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Producto>) => void;
  onDelete: (id: string) => void;
}

export function ProductosSection({ productos, categorias, onAdd, onUpdate, onDelete }: ProductosSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoriaId: '',
    stock: '',
    medida: '',
    capacidad: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: formData.stock ? parseInt(formData.stock) : undefined
      });
      setEditingId(null);
    } else {
      onAdd({
        ...formData,
        precio: parseFloat(formData.precio),
        stock: formData.stock ? parseInt(formData.stock) : undefined
      });
    }
    setFormData({ nombre: '', descripcion: '', precio: '', categoriaId: '', stock: '', medida: '', capacidad: '' });
    setShowForm(false);
  };

  const handleEdit = (producto: Producto) => {
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio.toString(),
      categoriaId: producto.categoriaId,
      stock: producto.stock?.toString() || '',
      medida: producto.medida || '',
      capacidad: producto.capacidad || ''
    });
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ nombre: '', descripcion: '', precio: '', categoriaId: '', stock: '', medida: '', capacidad: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const getCategoriaNombre = (categoriaId: string) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Producto</span>
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre del Producto *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre del producto"
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoriaId">Categoría *</Label>
                <Select
                  id="categoriaId"
                  value={formData.categoriaId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoriaId: e.target.value }))}
                  required
                >
                  <option value="">Seleccionar categoría...</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="precio">Precio *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio}
                  onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock (opcional)</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="Cantidad en stock"
                />
              </div>
              <div>
                <Label htmlFor="medida">Medida (opcional)</Label>
                <Input
                  id="medida"
                  value={formData.medida}
                  onChange={(e) => setFormData(prev => ({ ...prev, medida: e.target.value }))}
                  placeholder="Ej: 1L, 500ml, 2kg"
                />
              </div>
              <div>
                <Label htmlFor="capacidad">Capacidad (opcional)</Label>
                <Input
                  id="capacidad"
                  value={formData.capacidad}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacidad: e.target.value }))}
                  placeholder="Ej: Botella, Lata, Caja"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción del producto..."
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">
                {editingId ? 'Actualizar' : 'Guardar'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medida/Capacidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {producto.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoriaNombre(producto.categoriaId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${producto.precio.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {producto.medida && producto.capacidad 
                        ? `${producto.medida} - ${producto.capacidad}`
                        : producto.medida || producto.capacidad || '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {producto.stock !== undefined ? producto.stock : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {producto.descripcion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(producto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                              onDelete(producto.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
