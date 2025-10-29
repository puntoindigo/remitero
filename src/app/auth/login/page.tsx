"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
// useEnvironment removido para optimizar carga

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

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    const savedPassword = localStorage.getItem("rememberedPassword")
    const savedRememberMe = localStorage.getItem("rememberMe") === "true"

    if (savedEmail && savedPassword && savedRememberMe) {
      setValue("email", savedEmail)
      setValue("password", savedPassword)
      setValue("rememberMe", true)
    }
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
        if (data.rememberMe) {
          localStorage.setItem("rememberedEmail", data?.email)
          localStorage.setItem("rememberedPassword", data.password)
          localStorage.setItem("rememberMe", "true")
        } else {
          localStorage.removeItem("rememberedEmail")
          localStorage.removeItem("rememberedPassword")
          localStorage.removeItem("rememberMe")
        }

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
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        animation: 'float 20s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-50%',
        left: '-50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        animation: 'float 15s ease-in-out infinite reverse',
      }} />

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(50px, 50px) rotate(180deg); }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .glassmorphism {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          box-shadow: 
            0 8px 32px 0 rgba(31, 38, 135, 0.37),
            inset 0 0 60px rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .input-neomorph {
          background: #f8f9fa;
          border: 2px solid transparent;
          box-shadow: 
            inset 4px 4px 8px rgba(0,0,0,0.1),
            inset -4px -4px 8px rgba(255,255,255,0.9);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-neomorph:focus {
          background: #ffffff;
          border-color: #667eea;
          box-shadow: 
            0 0 0 4px rgba(102, 126, 234, 0.1),
            inset 2px 2px 4px rgba(0,0,0,0.05);
          outline: none;
        }

        .button-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 
            0 10px 30px -10px rgba(102, 126, 234, 0.6),
            0 0 20px rgba(118, 75, 162, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .button-gradient:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 
            0 15px 40px -10px rgba(102, 126, 234, 0.7),
            0 0 30px rgba(118, 75, 162, 0.4);
        }

        .button-gradient:active:not(:disabled) {
          transform: translateY(0);
        }

        .button-gradient:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>

      <div className="glassmorphism rounded-3xl p-8 w-full max-w-md" style={{
        animation: 'slideUp 0.6s ease-out',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo/Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 10px 30px -5px rgba(102, 126, 234, 0.5)',
          }}>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Bienvenido
          </h1>
          <p className="text-gray-600 text-sm">Ingresa a tu cuenta para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              className="input-neomorph w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400"
              placeholder="tu@email.com"
            />
            {errors?.email && (
              <p className="text-xs text-red-500 mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors?.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              className="input-neomorph w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              {...register("rememberMe")}
              id="rememberMe"
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 transition-all"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 cursor-pointer select-none">
              Recordar mis datos
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="button-gradient w-full py-3.5 rounded-xl text-white font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              <span>Iniciar sesión</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-xs text-gray-500">
            © 2025 Desarrollado por{' '}
            <a 
              href="https://www.linkedin.com/company/punto-indigo/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Punto Indigo
            </a>
          </p>
          <a 
            href="/manual" 
            className="inline-block text-sm font-semibold hover:underline transition-all"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            📖 Documentación
          </a>
        </div>
      </div>
    </div>
  )
}
