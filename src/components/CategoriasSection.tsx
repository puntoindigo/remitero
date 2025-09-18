'use client';

import React, { useState } from 'react';
import { Categoria } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Plus, Edit, Trash2, X, Tag } from 'lucide-react';

interface CategoriasSectionProps {
  categorias: Categoria[];
  onAdd: (categoria: Omit<Categoria, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Categoria>) => void;
  onDelete: (id: string) => void;
}

export function CategoriasSection({ categorias, onAdd, onUpdate, onDelete }: CategoriasSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }
    setFormData({ nombre: '', descripcion: '' });
    setShowForm(false);
  };

  const handleEdit = (categoria: Categoria) => {
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || ''
    });
    setEditingId(categoria.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ nombre: '', descripcion: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-title">Gestión de Categorías</h2>
          <p className="text-subtitle">Organiza tus productos por categorías</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nueva Categoría</span>
        </Button>
      </div>

      {showForm && (
        <div className="modern-card p-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <p className="text-sm text-gray-500">
                  Organiza tus productos por categorías.
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nombre">Nombre de la Categoría</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Electrónicos, Ropa, Hogar..."
                  className="max-w-md"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="descripcion">Descripción (opcional)</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción de la categoría..."
                  className="max-w-2xl"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="px-8">
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

      <div className="modern-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Tag className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-body font-medium">No hay categorías registradas</p>
                      <p className="text-caption">Comienza creando tu primera categoría</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categorias.map((categoria) => (
                  <tr key={categoria.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Tag className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="text-body font-medium text-gray-900">
                          {categoria.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body text-gray-600">
                      {categoria.descripcion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-caption text-gray-500">
                      {new Date(categoria.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(categoria)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
                              onDelete(categoria.id);
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
