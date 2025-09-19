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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white rounded">
                <Package className="h-5 w-5 text-black" />
              </div>
              <h1 className="text-lg font-semibold">Sistema de Gestión</h1>
            </div>
            <nav className="flex space-x-6">
              <a href="/categorias" className="px-3 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-white">Categorías</a>
              <a href="/clientes" className="px-3 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-white">Clientes</a>
              <a href="/productos" className="px-3 py-1.5 rounded text-sm font-medium bg-gray-800 text-white">Productos</a>
              <a href="/remitos" className="px-3 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-white">Remitos</a>
            </nav>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 bg-gray-800 text-xs font-medium rounded text-gray-300">BETA</span>
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Producto</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm font-medium text-gray-700">Nombre *</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} className="h-9 mt-1" />
            </div>
            <div className="w-32">
              <Label className="text-sm font-medium text-gray-700">Precio *</Label>
              <Input 
                type="number" 
                min={0} 
                value={precio} 
                onChange={(e) => setPrecio(parseFloat(e.target.value || "0"))}
                className="h-9 mt-1"
              />
            </div>
            <div className="w-48">
              <Label className="text-sm font-medium text-gray-700">Categoría</Label>
              <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="h-9 mt-1">
                <option value="">Sin categoría</option>
                {db.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Select>
            </div>
            <div>
              <Button
                onClick={() => {
                  if (!nombre || precio <= 0) return;
                  addProducto({ nombre, precio, categoriaId: categoriaId || undefined });
                  setNombre(""); setPrecio(0); setCategoriaId("");
                }}
                className="h-9 px-6 bg-gray-600 hover:bg-gray-700 text-white"
              >Guardar</Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Productos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">NOMBRE</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">CATEGORÍA</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 uppercase tracking-wider">PRECIO</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 uppercase tracking-wider">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {db.productos.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{db.categorias.find(c => c.id === p.categoriaId)?.nombre ?? "—"}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {p.precio.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Button variant="outline" size="sm" onClick={() => deleteProducto(p.id)} className="text-red-600 hover:text-red-700">
                        Borrar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
