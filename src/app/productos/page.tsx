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
          <a href="/productos">Productos</a>
          <a href="/remitos">Remitos</a>
        </nav>
      </header>

      <main>
        <h2>Gestión de Productos</h2>
        
        <div>
          <h3>Nuevo Producto</h3>
          <div>
            <label>Nombre:</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label>Precio:</label>
            <input
              type="number"
              min={0}
              value={precio}
              onChange={(e) => setPrecio(parseFloat(e.target.value || "0"))}
            />
          </div>
          <div>
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

        <div>
          <h3>Lista de Productos</h3>
          {db.productos.length === 0 ? (
            <p>No hay productos registrados</p>
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
                      <button onClick={() => deleteProducto(p.id)}>
                        Eliminar
                      </button>
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