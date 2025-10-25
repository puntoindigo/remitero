"use client";

import React, { useState } from 'react';
import { useLoading } from '@/hooks/useLoading';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { LoadingButton } from '@/components/common/LoadingButton';
import { LoadingCard } from '@/components/common/LoadingCard';
import { LoadingTable } from '@/components/common/LoadingTable';

export function LoadingExample() {
  const { loading, startLoading, stopLoading, setProgress, setMessage } = useLoading();
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isCardLoading, setIsCardLoading] = useState(false);

  const handleSimulateLoading = async () => {
    startLoading('Procesando datos...');
    
    // Simular progreso
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      setMessage(`Procesando... ${i}%`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    stopLoading();
  };

  const handleTableLoading = () => {
    setIsTableLoading(true);
    setTimeout(() => setIsTableLoading(false), 3000);
  };

  const handleCardLoading = () => {
    setIsCardLoading(true);
    setTimeout(() => setIsCardLoading(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Ejemplos de Loading Components</h2>
      
      {/* Loading Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Loading Buttons</h3>
        <div className="flex gap-4">
          <LoadingButton
            onClick={handleSimulateLoading}
            isLoading={loading.isLoading}
            loadingText="Procesando..."
            variant="primary"
          >
            Procesar con Progreso
          </LoadingButton>
          
          <LoadingButton
            onClick={handleTableLoading}
            isLoading={isTableLoading}
            variant="secondary"
          >
            Cargar Tabla
          </LoadingButton>
          
          <LoadingButton
            onClick={handleCardLoading}
            isLoading={isCardLoading}
            variant="success"
          >
            Cargar Card
          </LoadingButton>
        </div>
      </div>

      {/* Loading Card */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Loading Card</h3>
        <LoadingCard
          isLoading={isCardLoading}
          message="Cargando contenido del card..."
          className="max-w-md"
        >
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">Contenido del Card</h4>
            <p className="text-blue-700">Este contenido se muestra cuando no está cargando.</p>
          </div>
        </LoadingCard>
      </div>

      {/* Loading Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Loading Table</h3>
        <LoadingTable
          isLoading={isTableLoading}
          columns={4}
          rows={3}
          className="max-w-4xl"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Juan Pérez</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">juan@email.com</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button className="text-blue-600 hover:text-blue-900">Editar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </LoadingTable>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        isLoading={loading.isLoading}
        message={loading.message}
        progress={loading.progress}
        showProgress={true}
      />
    </div>
  );
}
