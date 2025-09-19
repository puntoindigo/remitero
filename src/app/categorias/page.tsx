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
        <h2>Gestión de Categorías</h2>
        
        <div>
          <h3>Nueva Categoría</h3>
          <div>
            <label>Nombre:</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              if (!nombre) return;
              addCategoria(nombre);
              setNombre("");
            }}
          >
            Guardar
          </button>
        </div>

        <div>
          <h3>Lista de Categorías</h3>
          {db.categorias.length === 0 ? (
            <p>No hay categorías registradas</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {db.categorias.map(cat => (
                  <tr key={cat.id}>
                    <td>{cat.nombre}</td>
                    <td>
                      <button onClick={() => deleteCategoria(cat.id)}>
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