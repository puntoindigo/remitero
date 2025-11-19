"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useColorTheme } from "@/contexts/ColorThemeContext";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { colors } = useColorTheme();
  const [token, setToken] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      setIsValidating(false);
      setIsValid(false);
      setError("No se proporcionó un token válido.");
    }
  }, [searchParams]);

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${tokenToValidate}`);
      const data = await response.json();

      if (data.valid) {
        setIsValid(true);
        setUserEmail(data.email || "");
      } else {
        setIsValid(false);
        setError(data.message || "El enlace no es válido o ha expirado.");
      }
    } catch (error: any) {
      console.error('Error validating token:', error);
      setIsValid(false);
      setError("Error al validar el enlace. Por favor, intenta nuevamente.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer la contraseña');
      }

      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/auth/login?message=password-reset-success');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f9fafb' }}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
          <p style={{ color: '#6b7280' }}>Validando enlace...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f9fafb' }}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#ef4444' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
            Enlace inválido o expirado
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            {error || "El enlace de restablecimiento no es válido o ha expirado. Por favor, solicita uno nuevo."}
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            style={{
              backgroundColor: colors.primary,
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              width: '100%'
            }}
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f9fafb' }}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#10b981' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
            ¡Contraseña restablecida!
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión en unos segundos.
          </p>
          <div style={{ 
            width: '100%', 
            height: '4px', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '2px',
            overflow: 'hidden',
            marginTop: '1rem'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: colors.primary,
              animation: 'shrink 3s linear forwards'
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f9fafb' }}>
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '2rem', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>
          Restablecer contraseña
        </h1>
        {userEmail && (
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Para: {userEmail}
          </p>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              Nueva contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: '#6b7280'
                }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              Confirmar contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: '#6b7280'
                }}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '0.75rem',
              marginBottom: '1rem',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#9ca3af' : colors.primary,
              color: '#ffffff',
              padding: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Restableciendo...
              </>
            ) : (
              'Restablecer contraseña'
            )}
          </button>
        </form>

        <p style={{ 
          marginTop: '1rem', 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          color: '#6b7280' 
        }}>
          Por motivos de seguridad, este enlace caducará en 30 minutos.
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#3b82f6' }} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

