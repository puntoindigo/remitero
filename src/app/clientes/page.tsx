"use client";
import { useState } from "react";
import { useDB } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FileText, Package, Users, Tag } from "lucide-react";

export default function ClientesPage() {
  const { db, addCliente, deleteCliente } = useDB();
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
        <h2>Gestión de Clientes</h2>
        
        <div>
          <h3>Nuevo Cliente</h3>
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
              addCliente(nombre);
              setNombre("");
            }}
          >
            Guardar
          </button>
        </div>

        <div>
          <h3>Lista de Clientes</h3>
          {db.clientes.length === 0 ? (
            <p>No hay clientes registrados</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {db.clientes.map(c => (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td>
                      <button onClick={() => deleteCliente(c.id)}>
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