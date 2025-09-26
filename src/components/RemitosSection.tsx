'use client';

import React, { useState } from 'react';
import { Remito, Cliente, Producto, RemitoItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Combobox } from '@/components/ui/Combobox';
import { Plus, Edit, Trash2, X, Printer, FileText, Package, Users, Tag, Calendar, DollarSign } from 'lucide-react';

interface RemitosSectionProps {
  remitos: Remito[];
  clientes: Cliente[];
  productos: Producto[];
  contadorRemitos: number;
  onAdd: (remito: Omit<Remito, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Remito>) => void;
  onDelete: (id: string) => void;
  onAddCliente: (cliente: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => Cliente;
}

export function RemitosSection({ 
  remitos, 
  clientes, 
  productos, 
  contadorRemitos, 
  onAdd, 
  onUpdate, 
  onDelete,
  onAddCliente
}: RemitosSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printRemito, setPrintRemito] = useState<Remito | null>(null);
  const [formData, setFormData] = useState({
    clienteId: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: ''
  });
  const [showQuickClient, setShowQuickClient] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');
  const [remitoItems, setRemitoItems] = useState<RemitoItem[]>([]);
  const [newItem, setNewItem] = useState({
    productoId: '',
    cantidad: 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (remitoItems.length === 0) {
      alert('Debes agregar al menos un producto al remito');
      return;
    }

    const cliente = clientes.find(c => c.id === formData.clienteId);
    if (!cliente) return;

    const total = (remitoItems || []).reduce((sum, item) => sum + item.subtotal, 0);

    if (editingId) {
      onUpdate(editingId, {
        ...formData,
        cliente,
        items: remitoItems,
        total,
        fecha: new Date(formData.fecha)
      });
      setEditingId(null);
    } else {
      onAdd({
        numero: `REM-${contadorRemitos.toString().padStart(4, '0')}`,
        ...formData,
        cliente,
        items: remitoItems,
        total,
        fecha: new Date(formData.fecha)
      });
    }
    
    resetForm();
  };

  const handleEdit = (remito: Remito) => {
    setFormData({
      clienteId: remito.clienteId,
      fecha: remito.fecha.toISOString().split('T')[0],
      observaciones: remito.observaciones || ''
    });
    setRemitoItems(remito.items);
    setEditingId(remito.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clienteId: '',
      fecha: new Date().toISOString().split('T')[0],
      observaciones: ''
    });
    setRemitoItems([]);
    setNewItem({ productoId: '', cantidad: 1 });
    setEditingId(null);
    setShowForm(false);
  };

  const addItem = () => {
    if (!newItem.productoId || newItem.cantidad <= 0) return;

    const producto = productos.find(p => p.id === newItem.productoId);
    if (!producto) return;

    const existingItem = remitoItems.find(item => item.productoId === newItem.productoId);
    if (existingItem) {
      setRemitoItems(prev => prev.map(item => 
        item.productoId === newItem.productoId 
          ? { 
              ...item, 
              cantidad: item.cantidad + newItem.cantidad,
              subtotal: (item.cantidad + newItem.cantidad) * item.precioUnitario
            }
          : item
      ));
    } else {
      const newRemitoItem: RemitoItem = {
        productoId: producto.id,
        producto,
        cantidad: newItem.cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * newItem.cantidad
      };
      setRemitoItems(prev => [...prev, newRemitoItem]);
    }

    setNewItem({ productoId: '', cantidad: 1 });
  };

  const removeItem = (productoId: string) => {
    setRemitoItems(prev => prev.filter(item => item.productoId !== productoId));
  };

  const updateCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0 || Number.isNaN(nuevaCantidad)) return;
    setRemitoItems(prev =>
      prev.map(item => item.productoId === productoId
        ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precioUnitario }
        : item
      )
    );
  };

  const handleQuickClientAdd = () => {
    if (quickClientName.trim()) {
      const newCliente = onAddCliente({
        nombre: quickClientName.trim(),
        email: '',
        telefono: '',
        direccion: ''
      });
      setFormData(prev => ({ ...prev, clienteId: newCliente.id }));
      setShowQuickClient(false);
      setQuickClientName('');
    }
  };

  const handlePrint = (remito: Remito) => {
    setPrintRemito(remito);
    setShowPrintModal(true);
  };

  const printDocument = () => {
    if (!printRemito) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generatePrintContent(printRemito);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Remito ${printRemito.numero}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .remito-impresion-horizontal { width: 100%; height: 100vh; display: flex; }
          .remito-mitad { width: 50%; height: 100vh; padding: 20px; box-sizing: border-box; border-right: 2px dashed #000; }
          .remito-mitad.derecha { border-right: none; border-left: 2px dashed #000; }
          .remito-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; }
          .remito-header h1 { font-size: 20px; margin-bottom: 8px; }
          .remito-header p { font-size: 14px; margin: 0; }
          .remito-info { margin-bottom: 15px; font-size: 12px; }
          .remito-info div { margin-bottom: 5px; }
          .remito-productos { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px; }
          .remito-productos th, .remito-productos td { border: 1px solid #000; padding: 4px; text-align: left; }
          .remito-productos th { background-color: #f0f0f0; font-weight: bold; font-size: 10px; }
          .remito-productos td { font-size: 10px; }
          .remito-total { text-align: right; font-size: 14px; font-weight: bold; margin-top: 15px; padding: 8px; border-top: 2px solid #000; }
          .remito-footer { margin-top: 20px; font-size: 10px; border-top: 1px solid #000; padding-top: 8px; }
          .remito-footer p { margin: 5px 0; }
          .observaciones { font-style: italic; margin-top: 10px; }
          @media print { body { margin: 0; padding: 0; } }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const generatePrintContent = (remito: Remito) => {
    const fecha = remito.fecha.toLocaleDateString('es-ES');
    
    let productosHTML = '';
    remito.items.forEach(item => {
      const medidaInfo = item.producto.medida && item.producto.capacidad 
        ? ` (${item.producto.medida} - ${item.producto.capacidad})`
        : item.producto.medida || item.producto.capacidad 
        ? ` (${item.producto.medida || item.producto.capacidad})`
        : '';
      
      productosHTML += `
        <tr>
          <td>${item.producto.nombre}${medidaInfo}</td>
          <td>${item.cantidad}</td>
          <td>$${item.precioUnitario.toFixed(2)}</td>
          <td>$${item.subtotal.toFixed(2)}</td>
        </tr>
      `;
    });
    
    return `
      <div class="remito-impresion-horizontal">
        <!-- Mitad izquierda - Para archivo -->
        <div class="remito-mitad izquierda">
          <div class="remito-header">
            <h1>REMITO</h1>
            <p>Número: ${remito.numero}</p>
          </div>
          
          <div class="remito-info">
            <div><strong>Fecha:</strong> ${fecha}</div>
            <div><strong>Cliente:</strong> ${remito.cliente.nombre}</div>
          </div>
          
          <table class="remito-productos">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productosHTML}
            </tbody>
          </table>
          
          <div class="remito-total">
            <strong>TOTAL: $${remito.total.toFixed(2)}</strong>
          </div>
          
          <div class="remito-footer">
            <p>Firma del Cliente: _________________________</p>
            <p>Fecha de Entrega: _________________________</p>
            <p class="observaciones">${remito.observaciones || ''}</p>
          </div>
        </div>
        
        <!-- Mitad derecha - Para cliente -->
        <div class="remito-mitad derecha">
          <div class="remito-header">
            <h1>REMITO</h1>
            <p>Número: ${remito.numero}</p>
          </div>
          
          <div class="remito-info">
            <div><strong>Fecha:</strong> ${fecha}</div>
            <div><strong>Cliente:</strong> ${remito.cliente.nombre}</div>
          </div>
          
          <table class="remito-productos">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productosHTML}
            </tbody>
          </table>
          
          <div class="remito-total">
            <strong>TOTAL: $${remito.total.toFixed(2)}</strong>
          </div>
          
          <div class="remito-footer">
            <p>Firma del Cliente: _________________________</p>
            <p>Fecha de Entrega: _________________________</p>
            <p class="observaciones">${remito.observaciones || ''}</p>
          </div>
        </div>
      </div>
    `;
  };

  const total = remitoItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Preparar opciones para los combobox
  const clienteOptions = clientes.map(cliente => ({
    value: cliente.id,
    label: cliente.nombre,
    description: cliente.email ? cliente.email : cliente.telefono || ''
  }));

  const productoOptions = productos
    .filter(p => !remitoItems.some(item => item.productoId === p.id))
    .map(producto => ({
      value: producto.id,
      label: producto.nombre,
      description: `$${producto.precio.toFixed(2)}`
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-title">Gestión de Remitos</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Remito</span>
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-gray-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingId ? 'Editar Remito' : 'Nuevo Remito'}
                </h3>
                <p className="text-sm text-gray-600">
                  Completa los datos y agrega productos al remito.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Numero</p>
              <p className="text-lg font-semibold text-gray-900">
                {editingId ? remitos.find(r => r.id === editingId)?.numero : `REM-${contadorRemitos.toString().padStart(4, '0')}`}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-end space-x-6">
              <div>
                <Label htmlFor="fecha" className="text-sm font-medium text-gray-700">Fecha</Label>
                <div className="relative mt-1">
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                    className="w-40 h-9 text-sm"
                    required
                  />
                  <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="clienteId" className="text-sm font-medium text-gray-700">Cliente *</Label>
                <div className="mt-1">
                  <Combobox
                    options={clienteOptions}
                    value={formData.clienteId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value }))}
                    placeholder="Seleccionar cliente..."
                    searchPlaceholder="Buscar cliente..."
                    className="w-full h-9"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ¿No aparece? Podrás crear uno nuevo en la pantalla de Clientes.
                  </p>
                </div>
              </div>
            </div>

            {/* Sección de productos */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-5 w-5 text-gray-600" />
                <h4 className="text-md font-semibold text-gray-900">Productos</h4>
              </div>
              
              <div className="flex items-end space-x-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="producto" className="text-sm font-medium text-gray-700">Producto</Label>
                  <div className="mt-1">
                    <Combobox
                      options={productoOptions}
                      value={newItem.productoId}
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, productoId: value }))}
                      placeholder="Seleccionar producto..."
                      searchPlaceholder="Buscar producto..."
                      className="w-full h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cantidad" className="text-sm font-medium text-gray-700">Cantidad</Label>
                  <div className="mt-1">
                    <Input
                      type="number"
                      min="1"
                      value={newItem.cantidad}
                      onChange={(e) => setNewItem(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
                      className="w-20 h-9 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Button 
                    type="button" 
                    onClick={addItem} 
                    disabled={!newItem.productoId}
                    className="h-9 px-4 bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Lista de productos agregados */}
              {remitoItems.length > 0 && (
                <div className="bg-gray-50 rounded p-3">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500">
                        <th className="pb-2">Producto</th>
                        <th className="pb-2">Precio</th>
                        <th className="pb-2">Cant.</th>
                        <th className="pb-2">Subtotal</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {remitoItems.map((item) => (
                        <tr key={item.productoId} className="border-b border-gray-200">
                          <td className="py-2">
                            <p className="text-sm font-medium text-gray-900">{item.producto.nombre}</p>
                          </td>
                          <td className="py-2 text-sm text-gray-600">$ {item.precioUnitario.toFixed(2)}</td>
                          <td className="py-2">
                            <Input
                              className="h-7 w-16 text-center text-sm"
                              type="number"
                              min={1}
                              value={item.cantidad}
                              onChange={(e) => updateCantidad(item.productoId, parseInt(e.target.value || "1", 10))}
                            />
                          </td>
                          <td className="py-2 text-sm font-medium text-gray-900">$ {item.subtotal.toFixed(2)}</td>
                          <td className="py-2">
                            <button
                              type="button"
                              onClick={() => removeItem(item.productoId)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="observaciones" className="text-sm font-medium text-gray-700">Observaciones (opcional)</Label>
              <div className="mt-1">
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Notas adicionales para este remito..."
                  className="w-full h-20 text-sm"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Total estimado</span>
                <span className="text-lg font-bold text-gray-900">$ {total.toFixed(2)}</span>
              </div>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={handleCancel} className="h-9 px-4">
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-4 bg-gray-600 hover:bg-gray-700 text-white">
                  <FileText className="h-4 w-4 mr-1" />
                  {editingId ? 'Actualizar Remito' : 'Guardar Remito'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista de remitos */}
      <div className="modern-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {remitos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-body font-medium">No hay remitos registrados</p>
                      <p className="text-caption">Comienza creando tu primer remito</p>
                    </div>
                  </td>
                </tr>
              ) : (
                remitos.map((remito) => (
                  <tr key={remito.id} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {remito.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {remito.fecha.toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {remito.cliente.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${remito.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrint(remito)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(remito)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar este remito?')) {
                              onDelete(remito.id);
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

      {/* Modal de impresión */}
      {showPrintModal && printRemito && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Imprimir Remito</h3>
            <p className="text-gray-600 mb-6">
              ¿Deseas imprimir el remito {printRemito.numero}?
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowPrintModal(false)}>
                Cancelar
              </Button>
              <Button onClick={printDocument}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}