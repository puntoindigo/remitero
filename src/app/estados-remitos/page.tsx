"use client";

import React, { Suspense } from "react";

function EstadosRemitosContent() {
  return (
    <div>
      <h1>Estados de Remitos</h1>
      <p>Página temporalmente simplificada</p>
      <p>Sin hooks personalizados</p>
    </div>
  );
}

export default function EstadosRemitosPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EstadosRemitosContent />
    </Suspense>
  );
}