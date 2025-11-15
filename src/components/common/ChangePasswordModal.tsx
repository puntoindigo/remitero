"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { useColorTheme } from "@/contexts/ColorThemeContext";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<void>;
  isSubmitting?: boolean;
  isMandatory?: boolean;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  isMandatory = false
}: ChangePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { colors } = useColorTheme();

  // Estado del semáforo: 'red' | 'green' | null
  const getTrafficLightState = (): 'red' | 'green' | null => {
    if (!password && !confirmPassword) return null;
    if (password && confirmPassword) {
      return password === confirmPassword ? 'green' : 'red';
    }
    if (password || confirmPassword) return 'red';
    return null;
  };

  const trafficLightState = getTrafficLightState();

  useEffect(() => {
    setError("");
  }, [password, confirmPassword]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (typeof window === 'undefined') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔐 [ChangePasswordModal] handleSubmit INICIADO');
    e.preventDefault();
    setError("");

    if (!password || password.length < 6) {
      console.warn('⚠️ [ChangePasswordModal] Contraseña muy corta', { length: password?.length });
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      console.warn('⚠️ [ChangePasswordModal] Contraseñas no coinciden');
      setError("Las contraseñas no coinciden");
      return;
    }

    console.log('✅ [ChangePasswordModal] Validaciones pasadas, llamando onSubmit', {
      passwordLength: password.length,
      isSubmitting
    });

    try {
      console.log('📤 [ChangePasswordModal] Llamando onSubmit(password)...');
      await onSubmit(password);
      console.log('✅ [ChangePasswordModal] onSubmit completado exitosamente');
      setPassword("");
      setConfirmPassword("");
      console.log('🧹 [ChangePasswordModal] Campos limpiados');
    } catch (err: unknown) {
      console.error('❌ [ChangePasswordModal] Error en onSubmit:', err);
      // Manejar el error de forma segura
      const errorMessage = err instanceof Error ? err.message : "Error al cambiar la contraseña";
      console.log('📝 [ChangePasswordModal] Estableciendo error en modal:', errorMessage);
      setError(errorMessage);
    }
  };

  const modalContent = (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        // Cerrar al hacer click en el overlay (no en el modal)
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 10001,
        }}
      >
        <div className="modal-header">
          <h2>Cambiar contraseña</h2>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-button"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
            {isMandatory 
              ? 'Debe cambiar su contraseña temporal. Por favor, ingresa una nueva contraseña para continuar.'
              : 'Por favor, ingresa tu nueva contraseña. Debes cambiarla para continuar.'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label-large">
                Nueva contraseña
                {error && (
                  <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.875rem', fontWeight: 'normal' }}>
                    {error}
                  </span>
                )}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="form-input-standard"
                  disabled={isSubmitting}
                  required
                  minLength={6}
                  style={{ paddingRight: '40px' }}
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
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label-large" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Confirmar contraseña
                {trafficLightState && (
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    marginLeft: '0.25rem'
                  }}>
                    {trafficLightState === 'green' ? (
                      <CheckCircle className="h-5 w-5" style={{ color: '#10b981' }} />
                    ) : (
                      <XCircle className="h-5 w-5" style={{ color: '#ef4444' }} />
                    )}
                  </span>
                )}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="form-input-standard"
                  disabled={isSubmitting}
                  required
                  minLength={6}
                  style={{
                    paddingRight: '40px',
                    borderColor: trafficLightState === 'green' ? '#10b981' : 
                                  trafficLightState === 'red' ? '#ef4444' : undefined,
                    borderWidth: trafficLightState ? '2px' : '1px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {trafficLightState === 'green' && (
                <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle className="h-3 w-3" />
                  Las contraseñas coinciden
                </p>
              )}
              {trafficLightState === 'red' && (
                <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <XCircle className="h-3 w-3" />
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting || isMandatory} // No permitir cerrar sin cambiar la contraseña si es obligatorio
                style={{ opacity: isMandatory ? 0.5 : 1, cursor: isMandatory ? 'not-allowed' : 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || trafficLightState !== 'green'}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: (isSubmitting || trafficLightState !== 'green') ? '#9ca3af' : colors.gradient,
                  color: 'white',
                  cursor: (isSubmitting || trafficLightState !== 'green') ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  minWidth: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  opacity: (isSubmitting || trafficLightState !== 'green') ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && trafficLightState === 'green') {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}50`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}


