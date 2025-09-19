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
    <div>
      <header>
        <h1>Sistema de Gestión</h1>
        <nav>
          <a href="/categorias">Categorías</a>
          <a href="/clientes">Clientes</a>
          <a href="/productos" className="active">Productos</a>
          <a href="/remitos">Remitos</a>
        </nav>
      </header>

      <main>
        <h2>Gestión de Productos</h2>
        
        <div className="form-section">
          <h3>Nuevo Producto</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre:</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingresa el nombre del producto"
              />
            </div>
            <div className="form-group">
              <label>Precio:</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(parseFloat(e.target.value || "0"))}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Categoría:</label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Sin categoría</option>
                {db.categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>&nbsp;</label>
              <button
                onClick={() => {
                  if (!nombre || precio <= 0) return;
                  addProducto({ nombre, precio, categoriaId: categoriaId || undefined });
                  setNombre(""); setPrecio(0); setCategoriaId("");
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Lista de Productos</h3>
          {db.productos.length === 0 ? (
            <div className="empty-state">
              <p>No hay productos registrados</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {db.productos.map(p => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{db.categorias.find(c => c.id === p.categoriaId)?.nombre ?? "—"}</td>
                    <td>${p.precio.toFixed(2)}</td>
                    <td>
                      <div className="actions">
                        <button className="small danger" onClick={() => deleteProducto(p.id)}>
                          Eliminar
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