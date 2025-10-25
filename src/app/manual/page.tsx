'use client';

import { useEffect } from 'react';

export default function ManualPage() {
  useEffect(() => {
    // Redirigir al manual interactivo
    window.location.href = '/manual-pruebas-interactivo.html';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo al manual de pruebas...</p>
      </div>
    </div>
  );
}
