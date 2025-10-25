"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEnvironment } from "@/hooks/useEnvironment"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Password requerido"),
  rememberMe: z.boolean().optional()
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const environment = useEnvironment()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const rememberMe = watch("rememberMe")

  // Cargar credenciales guardadas al cargar la página
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    const savedPassword = localStorage.getItem("rememberedPassword")
    const savedRememberMe = localStorage.getItem("rememberMe") === "true"

    if (savedEmail && savedPassword && savedRememberMe) {
      setValue("email", savedEmail)
      setValue("password", savedPassword)
      setValue("rememberMe", true)
    }, []
  }, [setValue])

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: data?.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        // Solo logear errores que no sean de credenciales incorrectas
        if (result.error !== "CredentialsSignin") {
          console.error("Login error:", result.error)
        }
        
        if (result.error === "CredentialsSignin") {
          setError("Email o contraseña incorrectos")
        } else if (result.error === "Configuration") {
          setError("Error de configuración del servidor. Contacta al administrador.")
        } else {
          setError("Error al iniciar sesión. Intenta nuevamente.")
        }
      } else {
        // Guardar o limpiar credenciales según el checkbox
        if (data.rememberMe) {
          localStorage.setItem("rememberedEmail", data?.email)
          localStorage.setItem("rememberedPassword", data.password)
          localStorage.setItem("rememberMe", "true")
        } else {
          localStorage.removeItem("rememberedEmail")
          localStorage.removeItem("rememberedPassword")
          localStorage.removeItem("rememberMe")
        }

        // Verificar la sesión para obtener el rol
        const session = await getSession()
        if (session?.user?.role === "SUPERADMIN") {
          router.push("/empresas")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Error de conexión. Verifica tu conexión a internet.")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="login-container space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="mt-8 text-3xl font-bold text-gray-900">
            Acceso
          </h2>
        </div>

        {/* Form */}
        <div className="login-form">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="login-field">
              <label htmlFor="email" className="login-label">
                Correo electrónico
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className="login-input"
                placeholder="admin@remitero.com"
              />
              {errors?.email && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors?.email.message}
                </p>
              )}
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Contraseña
              </label>
              <input
                {...register("password")}
                type="password"
                autoComplete="current-password"
                className="login-input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-3">
              <input
                {...register("rememberMe")}
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-gray-700 cursor-pointer select-none hover:text-gray-900 transition-colors duration-200"
              >
                Recordar contraseña
              </label>
            </div>

            {error && (
              <div className="login-error">
                <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </div>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 mx-auto">
            © 2025 Desarrollado por{' '}
            <a 
              href="https://www.linkedin.com/company/punto-indigo/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Punto Indigo
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
