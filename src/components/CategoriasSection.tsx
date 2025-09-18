'use client';

import React, { useState } from 'react';
import { Categoria } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Plus, Edit, Trash2, X } from 'lucide-react';

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
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nueva Categoría</span>
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Categoría</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Electrónicos, Ropa, Hogar..."
                required
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción de la categoría..."
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
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No hay categorías registradas
                  </td>
                </tr>
              ) : (
                categorias.map((categoria) => (
                  <tr key={categoria.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {categoria.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {categoria.descripcion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
