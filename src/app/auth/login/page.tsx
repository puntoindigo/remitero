"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useColorTheme, ColorTheme, THEME_CONFIGS } from "@/contexts/ColorThemeContext"
import ColorThemeSelector from "@/components/common/ColorThemeSelector"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Password requerido"),
  rememberMe: z.boolean().optional()
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const { theme, colors, setTheme } = useColorTheme()
  const router = useRouter()

  // Evitar mismatch de hidratación - solo usar tema después del mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

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
    // Deshabilitar inmediatamente al hacer click - verificar y establecer en la misma línea
    if (isLoading) return;
    // Establecer loading inmediatamente para prevenir múltiples clicks
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

  // Usar tema default durante SSR para evitar mismatch
  const displayColors = isMounted ? colors : THEME_CONFIGS['blue']
  const displayTheme = isMounted ? theme : 'blue'

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundImage: displayColors.background,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-image 0.5s ease',
        height: '100vh',
        minHeight: '100vh',
      }}
      suppressHydrationWarning
    >
      {/* Animated background effects */}
      <div style={{
        position: 'absolute',
        top: '-30%',
        right: '-30%',
        width: '600px',
        height: '600px',
        background: `radial-gradient(circle, rgba(255,255,255,${theme === 'dark' ? '0.08' : '0.15'}) 0%, transparent 70%)`,
        borderRadius: '50%',
        animation: 'float 20s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-30%',
        width: '500px',
        height: '500px',
        background: `radial-gradient(circle, rgba(255,255,255,${displayTheme === 'dark' ? '0.05' : '0.1'}) 0%, transparent 70%)`,
        borderRadius: '50%',
        animation: 'float 15s ease-in-out infinite reverse',
      }} />

      <style jsx global>{`
        @keyframes float {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg); 
          }
          50% { 
            transform: translate(30px, 30px) rotate(180deg); 
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 200px;
            margin-bottom: 1.5rem;
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateY(0);
            max-height: 200px;
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
        }
      `}</style>

      {/* Theme Selector flotante abajo a la derecha */}
      <ColorThemeSelector />

      {/* Login Card */}
      <div style={{
        background: displayTheme === 'dark' ? 'rgba(249, 250, 251, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1rem',
        padding: '3rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: displayTheme === 'dark' 
          ? '0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.1)' 
          : '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 600,
            margin: '0 0 0.5rem 0',
            color: '#1f2937',
          }}>
            Sistema de Remitos
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0,
          }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="email" 
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              Correo electrónico
            </label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              id="email"
              placeholder="tu@email.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                background: '#fff',
                color: '#1f2937',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = displayColors.primary;
                e.target.style.boxShadow = `0 0 0 3px ${displayColors.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              onKeyDown={() => {
                if (error) {
                  setError("");
                }
              }}
            />
            {errors?.email && (
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.75rem',
                color: '#ef4444',
              }}>
                {errors?.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '2rem' }}>
            <label 
              htmlFor="password" 
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              Contraseña
            </label>
            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              id="password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                background: '#fff',
                color: '#1f2937',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = displayColors.primary;
                e.target.style.boxShadow = `0 0 0 3px ${displayColors.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              onKeyDown={() => {
                if (error) {
                  setError("");
                }
              }}
            />
            {errors.password && (
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.75rem',
                color: '#ef4444',
              }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
          }}>
            <input
              {...register("rememberMe")}
              id="rememberMe"
              type="checkbox"
              style={{
                width: '1rem',
                height: '1rem',
                marginRight: '0.75rem',
                cursor: 'pointer',
                accentColor: displayColors.primary,
              }}
            />
            <label 
              htmlFor="rememberMe" 
              style={{
                fontSize: '0.875rem',
                color: '#4b5563',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              Recordar mis datos
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              key={error}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                borderRadius: '0.5rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                animation: 'slideIn 0.3s ease-out',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              <span style={{
                fontSize: '0.875rem',
                color: '#dc2626',
              }}>
                {error}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            onClick={(e) => {
              // Solo prevenir si ya está cargando - NO establecer isLoading aquí
              // Dejar que onSubmit maneje el estado para evitar conflictos
              if (isLoading) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
              // No establecer isLoading aquí para evitar race conditions
            }}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: '#fff',
              background: displayColors.gradient,
              border: 'none',
              borderRadius: '0.5rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isLoading ? 0.7 : 1,
              boxShadow: `0 4px 12px ${displayColors.primary}40`,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 6px 16px ${displayColors.primary}50`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${displayColors.primary}40`;
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0,
          }}>
            © 2025 Desarrollado por{' '}
            <a 
              href="https://www.linkedin.com/company/punto-indigo/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: displayColors.primary,
                textDecoration: 'none',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              Punto Indigo
            </a>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
