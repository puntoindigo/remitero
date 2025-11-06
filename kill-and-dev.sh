#!/bin/bash

# Script para matar el proceso en el puerto 8000 y ejecutar npm run dev

echo "🔍 Buscando proceso en el puerto 8000..."

# Buscar el PID del proceso que usa el puerto 8000
PID=$(lsof -ti:8000)

if [ -z "$PID" ]; then
    echo "✅ No hay ningún proceso usando el puerto 8000"
else
    echo "🛑 Matando proceso con PID: $PID"
    kill -9 $PID
    echo "✅ Proceso eliminado"
    # Esperar un momento para asegurar que el puerto esté libre
    sleep 1
fi

echo "🚀 Iniciando servidor de desarrollo..."
npm run dev

