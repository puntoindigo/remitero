"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, getSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useColorTheme, ColorTheme, THEME_CONFIGS } from "@/contexts/ColorThemeContext"
import ColorThemeSelector from "@/components/common/ColorThemeSelector"
import { ForgotPasswordModal } from "@/components/common/ForgotPasswordModal"
import { useIsDevelopment } from "@/hooks/useIsDevelopment"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Password requerido"),
  rememberMe: z.boolean().optional()
})

type LoginForm = z.infer<typeof loginSchema>

// Componente interno que usa useSearchParams
function LoginPageContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isSendingPassword, setIsSendingPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"select" | "email" | "gmail">("select")
  const [showPassword, setShowPassword] = useState(false)
  const { theme, colors, setTheme } = useColorTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDev = useIsDevelopment()
  
  // Log del entorno al cargar la página
  useEffect(() => {
    const hostname = window.location.hostname
    const environment = isDev ? 'DEVELOPMENT' : 'PRODUCTION'
    console.log('🌍 [Login] Entorno detectado:', {
      environment,
      hostname,
      isDevelopment: isDev,
      url: window.location.href
    })
  }, [isDev])

  // Verificar si hay errores en la URL
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const callbackUrl = searchParams.get('callbackUrl')
    
    console.log('🔍 [Login] Verificando parámetros de URL', {
      error: errorParam,
      callbackUrl: callbackUrl,
      fullUrl: window.location.href
    });
    
    if (errorParam === 'UserInactive' || errorParam === 'AccessDenied') {
      console.log('❌ [Login] Error detectado: Usuario desactivado');
      setError('Tu cuenta ha sido desactivada. Contacta al administrador para más información.')
    } else if (errorParam === 'SessionInvalid') {
      console.log('❌ [Login] Error detectado: Sesión inválida');
      setError('Tu sesión no es válida. Por favor, inicia sesión nuevamente.')
    } else if (errorParam === 'OAuthSignin') {
      console.log('❌ [Login] Error detectado: OAuthSignin - Verificando configuración...');
      // Verificar configuración cuando hay error OAuthSignin
      fetch('/api/auth/debug')
        .then(res => res.json())
        .then(config => {
          console.log('🔍 [Login] Configuración OAuth:', config);
          if (!config.hasGoogleClientId || !config.hasGoogleClientSecret) {
            setError('Error de configuración: Faltan credenciales de Google OAuth. Contacta al administrador.');
          } else if (!config.nextAuthUrl) {
            setError('Error de configuración: NEXTAUTH_URL no está configurado. Contacta al administrador.');
          } else {
            setError(`Error al iniciar sesión con Google. Verifica que la URL de callback (${config.expectedCallbackUrl}) esté configurada en Google Cloud Console.`);
          }
        })
        .catch(err => {
          console.error('❌ [Login] Error verificando configuración:', err);
          setError('Error al iniciar sesión con Google. Por favor, intenta nuevamente o contacta al administrador.');
        });
    } else if (errorParam === 'OAuthCallback') {
      console.error('❌ [Login] Error OAuthCallback detectado');
      // Obtener el último error del servidor y la configuración
      Promise.all([
        fetch('/api/auth/last-error').then(res => res.json()),
        fetch('/api/auth/debug').then(res => res.json())
      ])
        .then(([lastError, config]) => {
          console.log('🔍 [Login] Último error OAuth:', lastError);
          console.log('🔍 [Login] Configuración OAuth (OAuthCallback):', config);
          
          const issues = [];
          
          if (!config.googleOAuth?.hasGoogleClientId || !config.googleOAuth?.hasGoogleClientSecret) {
            issues.push('Faltan credenciales de Google OAuth');
          }
          
          if (!config.nextAuth?.nextAuthUrl) {
            issues.push('NEXTAUTH_URL no está configurado');
          }
          
          if (!config.status?.allConfigured) {
            issues.push(`Variables faltantes: ${config.status?.missingVars?.join(', ')}`);
          }
          
          // Si hay un error específico del servidor, mostrarlo
          if (lastError?.hasError && lastError?.lastError) {
            const error = lastError.lastError;
            if (error.error === 'Usuario no existe en la base de datos') {
              setError(`Tu cuenta de Google (${error.email || 'email no disponible'}) no está registrada en el sistema. Debes ser creado por un administrador antes de poder iniciar sesión.`);
            } else if (error.error === 'Usuario desactivado') {
              setError(`Tu cuenta (${error.email || 'email no disponible'}) ha sido desactivada. Contacta al administrador para más información.`);
            } else if (error.error === 'Error de conexión a la base de datos') {
              setError('Error de conexión a la base de datos. Por favor, intenta nuevamente o contacta al administrador.');
            } else {
              setError(`Error en el proceso de autenticación: ${error.error}. ${error.details ? 'Revisa los logs del servidor para más detalles.' : ''}`);
            }
          } else if (issues.length > 0) {
            setError(`Error de configuración: ${issues.join('. ')}. Contacta al administrador.`);
          } else {
            setError('Error en el proceso de autenticación con Google. Esto puede deberse a un problema con la base de datos, el usuario está desactivado, o la cuenta no existe. Revisa los logs del servidor para más detalles.');
          }
        })
        .catch(err => {
          console.error('❌ [Login] Error verificando configuración (OAuthCallback):', err);
          setError('Error en el proceso de autenticación con Google. Por favor, intenta nuevamente o contacta al administrador.');
        });
    } else if (errorParam === 'OAuthCreateAccount') {
      setError('Error al crear la cuenta. Por favor, contacta al administrador.')
    } else if (errorParam === 'EmailCreateAccount') {
      setError('Error al crear la cuenta. Por favor, contacta al administrador.')
    } else if (errorParam === 'Callback') {
      setError('Error en el proceso de autenticación. Por favor, intenta nuevamente.')
    } else if (errorParam === 'OAuthAccountNotLinked') {
      setError('Esta cuenta de Google ya está asociada a otro usuario. Por favor, usa tu email y contraseña.')
    } else if (errorParam === 'EmailSignin') {
      setError('Error al enviar el email de verificación. Por favor, intenta nuevamente.')
    } else if (errorParam === 'CredentialsSignin') {
      setError('Email o contraseña incorrectos.')
    } else if (errorParam === 'SessionRequired') {
      setError('Por favor, inicia sesión para continuar.')
    }
  }, [searchParams])

  // Evitar mismatch de hidratación - solo usar tema después del mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Cerrar cualquier sesión existente al montar el componente
  // Esto asegura que no haya sesiones "fantasma" que permitan pasar sin credenciales válidas
  useEffect(() => {
    const clearExistingSession = async () => {
      try {
        // Limpiar storage primero
        if (typeof window !== 'undefined') {
          localStorage.removeItem('impersonation');
          sessionStorage.clear();
          
          // Limpiar todas las cookies relacionadas con NextAuth
          document.cookie.split(";").forEach((c) => {
            const cookieName = c.trim().split("=")[0];
            if (cookieName.startsWith('next-auth') || cookieName.startsWith('__Secure-next-auth')) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
            }
          });
        }
        
        // Verificar si hay una sesión existente
        const existingSession = await getSession();
        if (existingSession) {
          console.log('🔒 [Login] Sesión existente detectada, cerrando...');
          
          // Intentar cerrar sesión sin redirigir (ya estamos en login)
          // Puede fallar si la sesión ya no es válida, pero eso está bien
          try {
            await signOut({ redirect: false });
            console.log('✅ [Login] Sesión cerrada correctamente');
          } catch (signOutError: any) {
            // Si falla al cerrar sesión (puede ser porque la sesión ya no es válida),
            // no es un problema - ya limpiamos cookies y storage
            // Solo loggear si no es un error de red esperado
            if (signOutError?.message && !signOutError.message.includes('Failed to fetch')) {
              console.warn('⚠️ [Login] Error al cerrar sesión:', signOutError);
            }
          }
        }
      } catch (error: any) {
        // Si hay error al obtener sesión o cerrarla, limpiar de todas formas
        // Esto puede pasar si la sesión ya no es válida o hay problemas de red
        if (error?.message && !error.message.includes('Failed to fetch')) {
          console.warn('⚠️ [Login] Error al verificar/cerrar sesión existente:', error);
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('impersonation');
          sessionStorage.clear();
          // Limpiar cookies de todas formas
          document.cookie.split(";").forEach((c) => {
            const cookieName = c.trim().split("=")[0];
            if (cookieName.startsWith('next-auth') || cookieName.startsWith('__Secure-next-auth')) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
            }
          });
        }
      }
    };

    clearExistingSession();
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

    // Asegurarse de cerrar cualquier sesión existente ANTES de intentar login
    try {
      const existingSession = await getSession();
      if (existingSession) {
        console.log('🔒 [Login] Cerrando sesión existente antes de login...');
        await signOut({ redirect: false });
        // Limpiar localStorage relacionado con sesión
        if (typeof window !== 'undefined') {
          localStorage.removeItem('impersonation');
        }
        // Pequeño delay para asegurar que el signOut se complete
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (signOutError) {
      console.warn('⚠️ [Login] Error al cerrar sesión existente:', signOutError);
      // Continuar con el login de todas formas
    }

    try {
      const result = await signIn("credentials", {
        email: data?.email,
        password: data.password,
        redirect: false,
        callbackUrl: "/dashboard" // Especificar callbackUrl explícitamente como ruta relativa
      })

      if (result?.error) {
        if (result.error !== "CredentialsSignin") {
          console.error("Login error:", result.error)
        }
        
        if (result.error === "CredentialsSignin") {
          // Verificar si el usuario existe y está desactivado
          try {
            const checkResponse = await fetch('/api/auth/check-user-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: data.email })
            });
            
            if (checkResponse.ok) {
              const { exists, isActive } = await checkResponse.json();
              if (exists && !isActive) {
                setError("Tu cuenta ha sido desactivada. Contacta al administrador para más información.");
              } else {
                setError("Email o contraseña incorrectos");
              }
            } else {
              setError("Email o contraseña incorrectos");
            }
          } catch (checkError) {
            // Si falla la verificación, mostrar mensaje genérico
            setError("Email o contraseña incorrectos");
          }
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

        // Obtener sesión después del login exitoso
        let session;
        try {
          session = await getSession();
        } catch (sessionError) {
          console.error("Error obteniendo sesión:", sessionError);
          // Si falla obtener la sesión, intentar navegar de todas formas
          session = null;
        }
        
        // OPTIMIZACIÓN: Prefetch la ruta de destino antes de navegar
        const destination = session?.user?.role === "SUPERADMIN" ? "/empresas" : "/dashboard";
        
        // Prefetch inmediato para que la navegación sea instantánea
        try {
          router.prefetch(destination);
        } catch (prefetchError) {
          console.warn("Error en prefetch:", prefetchError);
        }
        
        // También prefetch otras rutas críticas en background
        const criticalRoutes = session?.user?.role === "SUPERADMIN"
          ? ["/dashboard", "/usuarios", "/remitos", "/productos", "/clientes"]
          : ["/remitos", "/productos", "/clientes"];
        
        criticalRoutes.forEach(route => {
          setTimeout(() => {
            try {
              router.prefetch(route);
            } catch (e) {
              // Ignorar errores de prefetch en background
            }
          }, 0);
        });
        
        // Navegar usando router.push con manejo de errores
        try {
          // Usar window.location como fallback si router.push falla
          setTimeout(() => {
            try {
              router.push(destination);
            } catch (routerError) {
              console.error("Error en router.push:", routerError);
              // Fallback: usar window.location
              window.location.href = destination;
            }
          }, 50);
        } catch (navError) {
          console.error("Error navegando:", navError);
          // Fallback: usar window.location
          window.location.href = destination;
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      // Manejar específicamente el error de URL inválida
      if (error?.message?.includes("Failed to construct 'URL'") || error?.message?.includes("Invalid URL")) {
        console.error("Error de URL inválida detectado, intentando redirección manual");
        // Si hay un error de URL, intentar navegar manualmente
        try {
          const session = await getSession();
          const destination = session?.user?.role === "SUPERADMIN" ? "/empresas" : "/dashboard";
          window.location.href = destination;
          return; // Salir temprano ya que estamos redirigiendo
        } catch (fallbackError) {
          console.error("Error en fallback de navegación:", fallbackError);
          setError("Error de conexión. Verifica tu conexión a internet.");
        }
      } else {
        setError("Error de conexión. Verifica tu conexión a internet.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (email: string) => {
    setIsSendingPassword(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al enviar la contraseña temporal');
      }

      setShowForgotPassword(false);
      setError(""); // Limpiar error si existe
      // Mostrar mensaje de éxito (podrías usar un toast aquí)
      alert('Se ha enviado una contraseña temporal a tu email. Por favor, revisa tu bandeja de entrada.');
    } catch (error: any) {
      throw error;
    } finally {
      setIsSendingPassword(false);
    }
  };

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
            {loginMethod === "select" ? "Selecciona un método de acceso" : "Ingresa tus credenciales para continuar"}
          </p>
        </div>

        {/* Selección de método de login */}
        {loginMethod === "select" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Error Message */}
            {error && (
              <div 
                key={error}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
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

            {/* Botón Gmail */}
            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                setError("");
                
                // Asegurarse de cerrar cualquier sesión existente ANTES de intentar login con Google
                try {
                  const existingSession = await getSession();
                  if (existingSession) {
                    console.log('🔒 [Login] Cerrando sesión existente antes de login con Google...');
                    await signOut({ redirect: false });
                    // Limpiar localStorage relacionado con sesión
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('impersonation');
                    }
                    // Pequeño delay para asegurar que el signOut se complete
                    await new Promise(resolve => setTimeout(resolve, 100));
                  }
                } catch (signOutError) {
                  console.warn('⚠️ [Login] Error al cerrar sesión existente:', signOutError);
                  // Continuar con el login de todas formas
                }

                try {
                  // OAuth providers REQUIEREN redirect: true (no pueden usar redirect: false)
                  // NextAuth manejará la redirección a Google y luego de vuelta
                  // IMPORTANTE: signIn con redirect: true NO retorna un valor porque redirige inmediatamente
                  // Si retorna undefined, es el comportamiento normal y esperado - NO mostrar error
                  await signIn("google", {
                    redirect: true,
                    callbackUrl: "/dashboard"
                  });
                  // Si llegamos aquí, significa que no hubo redirección inmediata
                  // Pero no mostrar error todavía - puede que la redirección esté en proceso
                  // Solo mostrar error si realmente hay una excepción
                } catch (error: any) {
                  // Solo mostrar error si hay una excepción real
                  console.error("❌ [Login] Error en signIn:", error);
                  setError("Error al iniciar sesión con Google. Por favor, intenta nuevamente.");
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: '0.5rem',
                border: 'none',
                background: isLoading ? '#9ca3af' : displayColors.primary,
                color: '#fff',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: isLoading ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isLoading ? "Accediendo..." : "Acceder con Gmail"}
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '0.5rem 0',
              gap: '1rem',
            }}>
              <div style={{
                flex: 1,
                height: '1px',
                background: '#e5e7eb',
              }} />
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280',
              }}>
                o
              </span>
              <div style={{
                flex: 1,
                height: '1px',
                background: '#e5e7eb',
              }} />
            </div>

            {/* Botón Email */}
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                background: '#fff',
                color: '#374151',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = displayColors.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }
              }}
            >
              Acceder con Email
            </button>
          </div>
        )}

        {/* Form de email/password */}
        {loginMethod === "email" && (
          <>
            {/* Botón volver */}
            <button
              type="button"
              onClick={() => {
                setLoginMethod("select");
                setError("");
              }}
              style={{
                marginBottom: '1rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                background: '#fff',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = displayColors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              ← Volver
            </button>
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
            <div style={{ position: 'relative' }}>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                id="password"
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  paddingRight: '40px',
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280'
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
            marginBottom: '1.5rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
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
            {/* Mostrar "Olvidé mi contraseña" solo para no-Gmail */}
            {loginMethod === "email" && (() => {
              // Solo mostrar si estamos en el método de email
              const emailValue = watch("email");
              const isGmail = emailValue && (
                emailValue.toLowerCase().endsWith('@gmail.com') || 
                emailValue.toLowerCase().endsWith('@googlemail.com')
              );
              
              if (isGmail) return null;
              
              return (
                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: displayColors.primary,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    Olvidé mi contraseña
                  </button>
                </div>
              );
            })()}
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
              marginTop: '1rem',
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
          </>
        )}

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

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSubmit={handleForgotPassword}
        isSubmitting={isSendingPassword}
      />
    </div>
  )
}

// Componente principal envuelto en Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
