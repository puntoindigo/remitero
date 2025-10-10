"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";

interface Remito {
  id: string;
  number: number;
  client: {
    id: string;
    name: string;
  };
  status: "PENDIENTE" | "PREPARADO" | "ENTREGADO" | "CANCELADO";
  total: number;
  createdAt: string;
}

function RemitosContentSimple() {
  const { data: session } = useSession();
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/remitos");
      if (!response.ok) {
        throw new Error("Error al cargar remitos");
      }
      
      const data = await response.json();
      setRemitos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error loading remitos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/remitos/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }

      await loadData();
    } catch (error: any) {
      console.error('Status change error:', error);
      setError(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando remitos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Remitos (Versión Simple)</h1>
      
      {remitos.length === 0 ? (
        <p>No hay remitos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {remitos.map((remito) => (
                <tr key={remito.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{remito.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {remito.client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={remito.status}
                      onChange={(e) => handleStatusChange(remito.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="PENDIENTE">⏰ Pendiente</option>
                      <option value="PREPARADO">✅ Preparado</option>
                      <option value="ENTREGADO">🚚 Entregado</option>
                      <option value="CANCELADO">❌ Cancelado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${remito.total.toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(remito.createdAt).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function RemitosPageSimple() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando remitos...</p>
        </div>
      </div>
    }>
      <RemitosContentSimple />
    </Suspense>
  );
}
