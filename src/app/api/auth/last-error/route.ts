import { NextResponse } from "next/server";

// Variable global para almacenar el último error (solo en memoria, se pierde al reiniciar)
let lastOAuthError: {
  timestamp: string;
  email?: string;
  error: string;
  details?: any;
} | null = null;

export function setLastOAuthError(error: {
  email?: string;
  error: string;
  details?: any;
}) {
  lastOAuthError = {
    timestamp: new Date().toISOString(),
    ...error
  };
}

export async function GET() {
  return NextResponse.json({
    lastError: lastOAuthError,
    hasError: !!lastOAuthError
  });
}

