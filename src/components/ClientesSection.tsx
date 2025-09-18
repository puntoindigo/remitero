'use client';

import React, { useState } from 'react';
import { Cliente } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface ClientesSectionProps {
  clientes: Cliente[];
  onAdd: (cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Cliente>) => void;
  onDelete: (id: string) => void;
}

export function ClientesSection({ clientes, onAdd, onUpdate, onDelete }: ClientesSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quickAdd, setQuickAdd] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }
    setFormData({ nombre: '', email: '', telefono: '', direccion: '' });
    setShowForm(false);
    setQuickAdd(false);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nombre.trim()) {
      onAdd({ nombre: formData.nombre.trim(), email: '', telefono: '', direccion: '' });
      setFormData({ nombre: '', email: '', telefono: '', direccion: '' });
      setQuickAdd(false);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || ''
    });
    setEditingId(cliente.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ nombre: '', email: '', telefono: '', direccion: '' });
    setEditingId(null);
    setShowForm(false);
    setQuickAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-title">Gestión de Clientes</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setQuickAdd(true)} 
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Carga Rápida</span>
          </Button>
          <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nuevo Cliente</span>
          </Button>
        </div>
      </div>

      {quickAdd && (
        <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Carga Rápida de Cliente</h3>
          <form onSubmit={handleQuickAdd} className="space-y-4">
            <div>
              <Label htmlFor="nombre-quick">Nombre del Cliente *</Label>
              <Input
                id="nombre-quick"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Solo el nombre del cliente"
                className="max-w-md"
                required
                autoFocus
              />
              <p className="text-sm text-blue-600 mt-1">
                Los demás datos se pueden completar editando el cliente después
              </p>
            </div>
            <div className="flex space-x-2">
              <Button type="submit">
                Guardar Cliente
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {showForm && (
        <div className="modern-card p-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h3>
                <p className="text-sm text-gray-500">
                  Gestiona la información de tus clientes.
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre del Cliente *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre completo del cliente"
                  className="max-w-md"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="cliente@email.com"
                  className="max-w-md"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="+54 9 11 1234-5678"
                  className="max-w-md"
                />
              </div>
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Dirección completa"
                  className="max-w-md"
                />
              </div>
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

      <div className="modern-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No hay clientes registrados
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cliente.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {cliente.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {cliente.telefono || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {cliente.direccion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cliente)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
                              onDelete(cliente.id);
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
