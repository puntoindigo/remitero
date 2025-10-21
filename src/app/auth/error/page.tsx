"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"

const errorMessages = {
  Configuration: "Error de configuración del servidor",
  AccessDenied: "Acceso denegado",
  Verification: "Error de verificación",
  Default: "Ha ocurrido un error inesperado"
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") as keyof typeof errorMessages

  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" style={{width: '48px', height: '48px'}} />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Error de Autenticación
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {errorMessage}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">
              <p className="font-medium">Posibles causas:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Variables de entorno no configuradas</li>
                <li>Base de datos no disponible</li>
                <li>Configuración de NextAuth incorrecta</li>
                <li>Credenciales inválidas</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-4">
            <Link
              href="/auth/login"
              className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Intentar nuevamente
            </Link>
            <Link
              href="/"
              className="flex-1 flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Ir al inicio
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Si el problema persiste, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Cargando..." size="lg" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
