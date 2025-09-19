"use client";

import React, { useState, useMemo } from "react";
import { useDB } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Combobox } from "@/components/ui/Combobox";
import { Plus, Edit, Trash2, X, Printer, FileText, Package, Users, Tag, Calendar, DollarSign } from "lucide-react";

export default function RemitosPage() {
  const { db, addRemito } = useDB();
  const [showForm, setShowForm] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [clienteId, setClienteId] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [lineas, setLineas] = useState<Array<{
    productoId: string;
    nombre: string;
    precioUnit: number;
    cantidad: number;
    subtotal: number;
  }>>([]);

  const clientes = db.clientes;
  const productos = db.productos;
  const remitos = db.remitos;

  const numero = useMemo(
    () => `REM-${String(db.counters.remito + 1).padStart(4, "0")}`,
    [db.counters.remito]
  );

  const clienteOptions = clientes.map(cliente => ({
    value: cliente.id,
    label: cliente.nombre,
    description: ''
  }));

  const productoOptions = productos
    .filter(p => !lineas.some(l => l.productoId === p.id))
    .map(producto => ({
      value: producto.id,
      label: producto.nombre,
      description: `$${producto.precio.toFixed(2)}`
    }));

  const total = lineas.reduce((sum, item) => sum + item.subtotal, 0);

  const addLinea = () => {
    if (!productoId || cantidad <= 0) return;
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const existingLinea = lineas.find(l => l.productoId === productoId);
    if (existingLinea) {
      setLineas(prev => prev.map(l => 
        l.productoId === productoId 
          ? { 
              ...l, 
              cantidad: l.cantidad + cantidad,
              subtotal: (l.cantidad + cantidad) * l.precioUnit
            }
          : l
      ));
    } else {
      setLineas(prev => [...prev, {
        productoId: producto.id,
        nombre: producto.nombre,
        precioUnit: producto.precio,
        cantidad,
        subtotal: producto.precio * cantidad
      }]);
    }

    setProductoId("");
    setCantidad(1);
  };

  const removeLinea = (productoId: string) => {
    setLineas(prev => prev.filter(l => l.productoId !== productoId));
  };

  const updateCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0 || Number.isNaN(nuevaCantidad)) return;
    setLineas(prev =>
      prev.map(l => l.productoId === productoId
        ? { ...l, cantidad: nuevaCantidad, subtotal: nuevaCantidad * l.precioUnit }
        : l
      )
    );
  };

  const handleGuardarRemito = () => {
    if (!clienteId || lineas.length === 0) return;
    const clienteNombre = clientes.find(c => c.id === clienteId)?.nombre ?? "";
    addRemito({
      fecha,
      clienteId,
      clienteNombre,
      items: lineas,
      observaciones,
      total,
    });
    
    // Limpiar UI
    setClienteId("");
    setObservaciones("");
    setProductoId("");
    setCantidad(1);
    setLineas([]);
    setShowForm(false);
  };

  const handlePrint = (remito: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>REMITO ${remito.numero}</h1>
        <p><strong>Fecha:</strong> ${new Date(remito.fecha).toLocaleDateString('es-ES')}</p>
        <p><strong>Cliente:</strong> ${remito.clienteNombre}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px;">Producto</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Cantidad</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Precio</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${remito.items.map((item: any) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.nombre}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.cantidad}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">$${item.precioUnit.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">$${item.subtotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="text-align: right; font-size: 18px; font-weight: bold;">TOTAL: $${remito.total.toFixed(2)}</p>
        ${remito.observaciones ? `<p><strong>Observaciones:</strong> ${remito.observaciones}</p>` : ''}
      </div>
    `;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Remito ${remito.numero}</title></head>
      <body>${printContent}</body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white rounded">
                <FileText className="h-5 w-5 text-black" />
              </div>
              <h1 className="text-lg font-semibold">Sistema de Gestión</h1>
            </div>
            <nav className="flex space-x-6">
              <a href="/categorias" className="px-3 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-white">Categorías</a>
              <a href="/clientes" className="px-3 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-white">Clientes</a>
              <a href="/productos" className="px-3 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-white">Productos</a>
              <a href="/remitos" className="px-3 py-1.5 rounded text-sm font-medium bg-gray-800 text-white">Remitos</a>
            </nav>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 bg-gray-800 text-xs font-medium rounded text-gray-300">BETA</span>
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Remitos</h2>
          <Button onClick={() => setShowForm(true)} className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nuevo Remito</span>
          </Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-gray-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Nuevo Remito</h3>
                  <p className="text-sm text-gray-600">Completa los datos y agrega productos al remito.</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Numero</p>
                <p className="text-lg font-semibold text-gray-900">{numero}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-end space-x-6">
                <div>
                  <Label htmlFor="fecha" className="text-sm font-medium text-gray-700">Fecha</Label>
                  <div className="relative mt-1">
                    <Input
                      id="fecha"
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
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
                      value={clienteId}
                      onValueChange={setClienteId}
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
                        value={productoId}
                        onValueChange={setProductoId}
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
                        value={cantidad}
                        onChange={(e) => setCantidad(parseInt(e.target.value || "1"))}
                        className="w-20 h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Button 
                      type="button" 
                      onClick={addLinea} 
                      disabled={!productoId}
                      className="h-9 px-4 bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </div>

                {/* Lista de productos agregados */}
                {lineas.length > 0 && (
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
                        {lineas.map((linea) => (
                          <tr key={linea.productoId} className="border-b border-gray-200">
                            <td className="py-2">
                              <p className="text-sm font-medium text-gray-900">{linea.nombre}</p>
                            </td>
                            <td className="py-2 text-sm text-gray-600">$ {linea.precioUnit.toFixed(2)}</td>
                            <td className="py-2">
                              <Input
                                className="h-7 w-16 text-center text-sm"
                                type="number"
                                min={1}
                                value={linea.cantidad}
                                onChange={(e) => updateCantidad(linea.productoId, parseInt(e.target.value || "1", 10))}
                              />
                            </td>
                            <td className="py-2 text-sm font-medium text-gray-900">$ {linea.subtotal.toFixed(2)}</td>
                            <td className="py-2">
                              <button
                                type="button"
                                onClick={() => removeLinea(linea.productoId)}
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
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
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
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="h-9 px-4">
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button type="button" onClick={handleGuardarRemito} className="h-9 px-4 bg-gray-600 hover:bg-gray-700 text-white">
                    <FileText className="h-4 w-4 mr-1" />
                    Guardar Remito
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de remitos */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">NÚMERO</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">FECHA</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">CLIENTE</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">TOTAL</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 uppercase tracking-wider">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {remitos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-3 bg-gray-100 rounded-full">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-base font-medium text-gray-900">No hay remitos registrados</p>
                          <p className="text-sm text-gray-500 mt-1">Comienza creando tu primer remito</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  remitos.map((remito) => (
                    <tr key={remito.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{remito.numero}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(remito.fecha).toLocaleDateString('es-ES')}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{remito.clienteNombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${remito.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handlePrint(remito)} className="text-gray-600 hover:text-gray-900">
                            <Printer className="h-4 w-4" />
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
    </div>
  );
}
