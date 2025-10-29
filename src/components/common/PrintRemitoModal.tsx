"use client";

import { useEffect } from 'react';

interface PrintRemitoModalProps {
  remitoId: string;
  onClose: () => void;
}

export function PrintRemitoModal({ remitoId, onClose }: PrintRemitoModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Vista Previa del Remito</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🖨️ Imprimir
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* Iframe */}
        <div className="flex-1 overflow-hidden">
          <iframe
            id="print-iframe"
            src={`/remitos/${remitoId}/print`}
            className="w-full h-full border-none"
            title="Vista previa del remito"
          />
        </div>

        {/* Footer hint */}
        <div className="p-2 text-center text-sm text-gray-500 border-t">
          Presiona <kbd className="px-2 py-1 bg-gray-100 rounded">ESC</kbd> para cerrar
        </div>
      </div>
    </div>
  );
}


