"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, XCircle } from "lucide-react";
import { useColorTheme } from "@/contexts/ColorThemeContext";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}: ChangePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
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
    e.preventDefault();
    setError("");

    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await onSubmit(password);
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Error al cambiar la contraseña");
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
            Por favor, ingresa tu nueva contraseña. Debes cambiarla para continuar.
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="form-input-standard"
                disabled={isSubmitting}
                required
                minLength={6}
              />
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
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="form-input-standard"
                disabled={isSubmitting}
                required
                minLength={6}
                style={{
                  borderColor: trafficLightState === 'green' ? '#10b981' : 
                                trafficLightState === 'red' ? '#ef4444' : undefined,
                  borderWidth: trafficLightState ? '2px' : '1px'
                }}
              />
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
                disabled={isSubmitting || true} // No permitir cerrar sin cambiar la contraseña
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
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


