@echo off
REM Script para Windows: matar proceso en puerto 8000 y ejecutar npm run dev

echo Buscando proceso en el puerto 8000...

REM Buscar el PID del proceso que usa el puerto 8000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    set PID=%%a
)

if defined PID (
    echo Matando proceso con PID: %PID%
    taskkill /F /PID %PID%
    echo Proceso eliminado
    timeout /t 1 /nobreak >nul
) else (
    echo No hay ningun proceso usando el puerto 8000
)

echo Iniciando servidor de desarrollo...
npm run dev

