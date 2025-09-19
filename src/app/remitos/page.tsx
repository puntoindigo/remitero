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
    <div>
      <header>
        <h1>Sistema de Gestión</h1>
        <nav>
          <a href="/categorias">Categorías</a>
          <a href="/clientes">Clientes</a>
          <a href="/productos">Productos</a>
          <a href="/remitos" className="active">Remitos</a>
        </nav>
      </header>

      <main>
        <h2>Gestión de Remitos</h2>
        <button onClick={() => setShowForm(true)}>Nuevo Remito</button>

        {showForm && (
          <div className="form-section">
            <h3>Nuevo Remito - {numero}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Fecha:</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Cliente:</label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <h4>Productos</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Producto:</label>
                  <select
                    value={productoId}
                    onChange={(e) => setProductoId(e.target.value)}
                  >
                    <option value="">Seleccionar producto</option>
                    {productoOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad:</label>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value || "1"))}
                  />
                </div>
                <div className="form-group">
                  <label>&nbsp;</label>
                  <button onClick={addLinea}>Agregar</button>
                </div>
              </div>

              {lineas.length > 0 && (
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineas.map((linea) => (
                      <tr key={linea.productoId}>
                        <td>{linea.nombre}</td>
                        <td>$ {linea.precioUnit.toFixed(2)}</td>
                        <td>
                          <input
                            type="number"
                            min={1}
                            value={linea.cantidad}
                            onChange={(e) => updateCantidad(linea.productoId, parseInt(e.target.value || "1", 10))}
                            style={{width: '60px'}}
                          />
                        </td>
                        <td>$ {linea.subtotal.toFixed(2)}</td>
                        <td>
                          <button className="small danger" onClick={() => removeLinea(linea.productoId)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="form-group">
              <label>Observaciones:</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                placeholder="Notas adicionales para este remito..."
              />
            </div>

            <div className="total-display">
              <strong>Total: $ {total.toFixed(2)}</strong>
            </div>

            <div className="form-actions">
              <button className="secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button onClick={handleGuardarRemito}>Guardar Remito</button>
            </div>
          </div>
        )}

        <div className="form-section">
          <h3>Lista de Remitos</h3>
          {remitos.length === 0 ? (
            <div className="empty-state">
              <p>No hay remitos registrados</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {remitos.map((remito) => (
                  <tr key={remito.id}>
                    <td>{remito.numero}</td>
                    <td>{new Date(remito.fecha).toLocaleDateString('es-ES')}</td>
                    <td>{remito.clienteNombre}</td>
                    <td>${remito.total.toFixed(2)}</td>
                    <td>
                      <div className="actions">
                        <button className="small" onClick={() => handlePrint(remito)}>
                          Imprimir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}