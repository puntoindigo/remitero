import { NextResponse } from "next/server";

// Variable global para almacenar el último error (solo en memoria, se pierde al reiniciar)
// Usar una variable en el módulo global para que sea accesible desde otros módulos
declare global {
  var lastOAuthError: {
    timestamp: string;
    email?: string;
    error: string;
    details?: any;
  } | null;
}

// Inicializar solo si no existe (para evitar resetear en hot reload)
if (!global.lastOAuthError) {
  global.lastOAuthError = null;
}

export function setLastOAuthError(error: {
  email?: string;
  error: string;
  details?: any;
}) {
  global.lastOAuthError = {
    timestamp: new Date().toISOString(),
    ...error
  };
}

export async function GET() {
  return NextResponse.json({
    lastError: global.lastOAuthError,
    hasError: !!global.lastOAuthError
  });
}

