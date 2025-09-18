'use client';

import React, { useState } from 'react';
import { Remito, Cliente, Producto, RemitoItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Plus, Edit, Trash2, X, Printer } from 'lucide-react';

interface RemitosSectionProps {
  remitos: Remito[];
  clientes: Cliente[];
  productos: Producto[];
  contadorRemitos: number;
  onAdd: (remito: Omit<Remito, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Remito>) => void;
  onDelete: (id: string) => void;
}

export function RemitosSection({ 
  remitos, 
  clientes, 
  productos, 
  contadorRemitos, 
  onAdd, 
  onUpdate, 
  onDelete 
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

    const total = remitoItems.reduce((sum, item) => sum + item.subtotal, 0);

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
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .remito-impresion { width: 100%; max-width: 800px; margin: 0 auto; }
          .remito-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
          .remito-header h1 { font-size: 24px; margin-bottom: 10px; }
          .remito-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
          .remito-cliente { margin-bottom: 20px; font-size: 16px; font-weight: bold; }
          .remito-productos { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .remito-productos th, .remito-productos td { border: 1px solid #000; padding: 8px; text-align: left; }
          .remito-productos th { background-color: #f0f0f0; font-weight: bold; }
          .remito-total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; padding: 10px; border-top: 2px solid #000; }
          .remito-footer { margin-top: 30px; text-align: center; font-size: 12px; border-top: 1px solid #000; padding-top: 10px; }
          .cut-line { border-top: 2px dashed #000; margin: 40px 0; text-align: center; color: #666; }
          @media print { body { margin: 0; padding: 10px; } }
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
      productosHTML += `
        <tr>
          <td>${item.producto.nombre}</td>
          <td>${item.cantidad}</td>
          <td>$${item.precioUnitario.toFixed(2)}</td>
          <td>$${item.subtotal.toFixed(2)}</td>
        </tr>
      `;
    });
    
    return `
      <div class="remito-impresion">
        <!-- Primera copia -->
        <div class="remito-header">
          <h1>REMITO</h1>
          <p>Número: ${remito.numero}</p>
        </div>
        
        <div class="remito-info">
          <div>Fecha: ${fecha}</div>
          <div>Cliente: ${remito.cliente.nombre}</div>
        </div>
        
        <div class="remito-cliente">
          Cliente: ${remito.cliente.nombre}
        </div>
        
        <table class="remito-productos">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productosHTML}
          </tbody>
        </table>
        
        <div class="remito-total">
          Total: $${remito.total.toFixed(2)}
        </div>
        
        <div class="remito-footer">
          <p>Firma del Cliente: _________________________</p>
          <p>Fecha de Entrega: _________________________</p>
        </div>
        
        <!-- Línea divisoria para cortar -->
        <div class="cut-line">
          CORTAR AQUÍ
        </div>
        
        <!-- Segunda copia (duplicado) -->
        <div class="remito-header">
          <h1>REMITO (DUPLICADO)</h1>
          <p>Número: ${remito.numero}</p>
        </div>
        
        <div class="remito-info">
          <div>Fecha: ${fecha}</div>
          <div>Cliente: ${remito.cliente.nombre}</div>
        </div>
        
        <div class="remito-cliente">
          Cliente: ${remito.cliente.nombre}
        </div>
        
        <table class="remito-productos">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productosHTML}
          </tbody>
        </table>
        
        <div class="remito-total">
          Total: $${remito.total.toFixed(2)}
        </div>
        
        <div class="remito-footer">
          <p>Firma del Cliente: _________________________</p>
          <p>Fecha de Entrega: _________________________</p>
        </div>
      </div>
    `;
  };

  const total = remitoItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Remitos</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Remito</span>
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Remito' : 'Nuevo Remito'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero">Número de Remito</Label>
                <Input
                  id="numero"
                  value={editingId ? remitos.find(r => r.id === editingId)?.numero : `REM-${contadorRemitos.toString().padStart(4, '0')}`}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="clienteId">Cliente *</Label>
                <Select
                  id="clienteId"
                  value={formData.clienteId}
                  onChange={(e) => setFormData(prev => ({ ...prev, clienteId: e.target.value }))}
                  required
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Agregar productos */}
            <div className="border-t pt-4">
              <h4 className="text-md font-semibold mb-4">Productos</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="producto">Producto</Label>
                  <Select
                    value={newItem.productoId}
                    onChange={(e) => setNewItem(prev => ({ ...prev, productoId: e.target.value }))}
                  >
                    <option value="">Seleccionar producto...</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} - ${producto.precio.toFixed(2)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newItem.cantidad}
                    onChange={(e) => setNewItem(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={addItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Lista de productos agregados */}
              {remitoItems.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm font-medium text-gray-500">
                        <th className="pb-2">Producto</th>
                        <th className="pb-2">Cantidad</th>
                        <th className="pb-2">Precio Unit.</th>
                        <th className="pb-2">Subtotal</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {remitoItems.map((item) => (
                        <tr key={item.productoId} className="border-b">
                          <td className="py-2">{item.producto.nombre}</td>
                          <td className="py-2">{item.cantidad}</td>
                          <td className="py-2">${item.precioUnitario.toFixed(2)}</td>
                          <td className="py-2">${item.subtotal.toFixed(2)}</td>
                          <td className="py-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeItem(item.productoId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold text-lg">
                        <td colSpan={3} className="pt-2">Total:</td>
                        <td className="pt-2">${total.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit">
                {editingId ? 'Actualizar' : 'Guardar Remito'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de remitos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
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
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No hay remitos registrados
                  </td>
                </tr>
              ) : (
                remitos.map((remito) => (
                  <tr key={remito.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {remito.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {remito.fecha.toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {remito.cliente.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Vista Previa del Remito</h3>
              <Button variant="outline" onClick={() => setShowPrintModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: generatePrintContent(printRemito) }} />
            <div className="flex justify-end space-x-2 mt-4">
              <Button onClick={printDocument}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" onClick={() => setShowPrintModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
