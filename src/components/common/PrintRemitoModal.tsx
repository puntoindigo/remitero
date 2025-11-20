"use client";

import { useEffect } from 'react';
import { X, Printer } from 'lucide-react';

interface PrintRemitoModalProps {
  remitoId: string;
  remitoNumber?: string;
  onClose: () => void;
}

export function PrintRemitoModal({ remitoId, remitoNumber, onClose }: PrintRemitoModalProps) {
  useEffect(() => {
    // Cerrar con ESC
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc, { capture: true });
    return () => document.removeEventListener('keydown', handleEsc, { capture: true });
  }, [onClose]);

  const handlePrint = () => {
    const iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
      style={{ padding: '16px' }}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(90vw, 1040px)',
          height: 'min(85vh, 700px)',
          maxWidth: '1040px',
          maxHeight: '700px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header con cruz visible */}
        <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900">Remito #{remitoNumber || remitoId}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Iframe - con zoom al 80% */}
        <div className="flex-1 overflow-auto" style={{ minHeight: 0, padding: '16px', paddingTop: '16px' }}>
          <div style={{ 
            transform: 'scale(0.8)',
            transformOrigin: 'top left',
            width: '125%', // Compensar el scale (100% / 0.8 = 125%)
            minHeight: '100%',
            marginTop: '0',
            paddingTop: '0'
          }}>
            <iframe
              id="print-iframe"
              src={`/remitos/${remitoId}/print?noAutoPrint=true`}
              className="border border-gray-200 rounded"
              title="Vista previa del remito"
              style={{ 
                width: '100%',
                height: 'auto',
                minHeight: '600px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                display: 'block'
              }}
            />
          </div>
        </div>

        {/* Footer con botones */}
        <div className="p-3 border-t bg-gray-50 rounded-b-lg flex justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <X className="h-4 w-4" />
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}


