"use client";
import { useState } from "react";
import { useDB } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FileText, Package, Users, Tag } from "lucide-react";

export default function CategoriasPage() {
  const { db, addCategoria, deleteCategoria } = useDB();
  const [nombre, setNombre] = useState("");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white rounded">
                <Tag className="h-5 w-5 text-black" />
              </div>
              <h1 className="text-lg font-semibold">Sistema de Gestión</h1>
            </div>
            <nav className="flex space-x-6">
              <a href="/categorias" className="px-3 py-1.5 rounded text-sm font-medium bg-gray-800 text-white">Categorías</a>
              <a href="/clientes" className="px-3 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-white">Clientes</a>
              <a href="/productos" className="px-3 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-white">Productos</a>
              <a href="/remitos" className="px-3 py-1.5 rounded text-sm font-medium text-gray-400 hover:text-white">Remitos</a>
            </nav>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 bg-gray-800 text-xs font-medium rounded text-gray-300">BETA</span>
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h2>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Categoría</h3>
          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div className="space-y-1 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">Nombre *</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} className="h-9" />
            </div>
            <Button 
              onClick={() => { if (!nombre) return; addCategoria(nombre); setNombre(""); }}
              className="h-9 px-4"
            >Guardar</Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {db.categorias.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.nombre}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Button variant="outline" size="sm" onClick={() => deleteCategoria(cat.id)} className="text-red-600 hover:text-red-700">
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
