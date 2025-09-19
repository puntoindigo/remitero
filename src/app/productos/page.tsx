"use client";
import { useState } from "react";
import { useDB } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FileText, Package, Users, Tag } from "lucide-react";

export default function ProductosPage() {
  const { db, addProducto, deleteProducto } = useDB();
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState<number>(0);
  const [categoriaId, setCategoriaId] = useState<string>("");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema de Gestión</h1>
                <p className="text-sm text-gray-500">Gestión de productos y categorías</p>
              </div>
            </div>
            <nav className="flex space-x-1">
              <a href="/categorias" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">Categorías</a>
              <a href="/clientes" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">Clientes</a>
              <a href="/productos" className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">Productos</a>
              <a href="/remitos" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">Remitos</a>
            </nav>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">BETA</span>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Productos</h2>
          <p className="text-gray-600 mt-1">Administra tu catálogo de productos</p>
        </div>
        
        <div className="modern-card mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Nuevo Producto</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Nombre *</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} className="input-field" placeholder="Ingresa el nombre del producto" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Precio *</Label>
              <Input 
                type="number" 
                min={0} 
                value={precio} 
                onChange={(e) => setPrecio(parseFloat(e.target.value || "0"))}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Categoría</Label>
              <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="input-field">
                <option value="">Sin categoría</option>
                {db.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Select>
            </div>
            <div className="md:col-span-4">
              <Button
                onClick={() => {
                  if (!nombre || precio <= 0) return;
                  addProducto({ nombre, precio, categoriaId: categoriaId || undefined });
                  setNombre(""); setPrecio(0); setCategoriaId("");
                }}
                className="btn-primary"
              >Guardar Producto</Button>
            </div>
          </div>
        </div>

        <div className="modern-table">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Productos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {db.productos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="empty-state">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="empty-state-title">No hay productos registrados</h3>
                        <p className="empty-state-description">Comienza agregando tu primer producto</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  db.productos.map(p => (
                    <tr key={p.id} className="table-row">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{db.categorias.find(c => c.id === p.categoriaId)?.nombre ?? "—"}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {p.precio.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <Button variant="outline" size="sm" onClick={() => deleteProducto(p.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          Eliminar
                        </Button>
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
