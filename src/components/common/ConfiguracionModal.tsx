"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/hooks/useTheme';
import { ThemeSelector } from '@/components/common/ThemeSelector';
import { useColorTheme } from '@/contexts/ColorThemeContext';
import { User, Palette, Settings, Shield, X, Pin, Bell, List } from 'lucide-react';
import { NotificationPreferences } from '@/components/common/NotificationPreferences';
import { useIsDevelopment } from '@/hooks/useIsDevelopment';
import { usePaginationPreference } from '@/hooks/usePaginationPreference';
import FilterableSelect from '@/components/common/FilterableSelect';
import { useToast } from '@/hooks/useToast';

interface ConfiguracionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfiguracionModal({ isOpen, onClose }: ConfiguracionModalProps) {
  const { data: session, update } = useSession();
  const { currentTheme, themeConfig, setTheme } = useTheme();
  const { colors } = useColorTheme();
  const [enableBotonera, setEnableBotonera] = useState(false);
  const isDevelopment = useIsDevelopment();
  const [enablePinnedModals, setEnablePinnedModals] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { itemsPerPage, updatePaginationPreference } = usePaginationPreference();
  const { showSuccess } = useToast();

  // Cargar estado de preferencias desde la sesión
  useEffect(() => {
    if (session?.user) {
      const botonera = (session.user as any).enable_botonera ?? false;
      const pinnedModals = (session.user as any).enable_pinned_modals ?? false;
      setEnableBotonera(botonera);
      setEnablePinnedModals(pinnedModals);
    }
  }, [session]);

  // Guardar preferencia de botonera
  const handleSaveBotonera = async () => {
    console.log('⚙️ [ConfiguracionModal] handleSaveBotonera INICIADO', {
      hasSession: !!session?.user?.id,
      enableBotonera
    });

    if (!session?.user?.id) {
      console.error('❌ [ConfiguracionModal] No hay sesión');
      return;
    }
    
    console.log('🔄 [ConfiguracionModal] Estableciendo isSaving = true');
    setIsSaving(true);
    
    try {
      console.log('📤 [ConfiguracionModal] Enviando request a /api/profile', {
        method: 'PUT',
        body: { enableBotonera }
      });

      const response = await fetch('/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enableBotonera: enableBotonera
        }),
      });

      console.log('📥 [ConfiguracionModal] Respuesta recibida', {
        ok: response.ok,
        status: response.status
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [ConfiguracionModal] Error en respuesta', errorData);
        throw new Error(errorData.message || 'Error al guardar preferencia');
      }

      const result = await response.json();
      console.log('✅ [ConfiguracionModal] Preferencia guardada exitosamente', result);

      // Actualizar la sesión
      console.log('🔄 [ConfiguracionModal] Actualizando sesión...');
      if (typeof update === 'function') {
        await update();
        console.log('✅ [ConfiguracionModal] Sesión actualizada');
      } else {
        console.warn('⚠️ [ConfiguracionModal] update no es una función');
      }
    } catch (error) {
      console.error('❌ [ConfiguracionModal] Error guardando preferencia:', error);
      alert('Error al guardar la preferencia. Intenta nuevamente.');
    } finally {
      console.log('🔄 [ConfiguracionModal] Estableciendo isSaving = false');
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '0.75rem',
          width: '100%',
          maxWidth: session?.user?.role === 'SUPERADMIN' ? '900px' : '500px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fijo */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
              Configuración
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Con scroll */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          {/* Perfil */}
          <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  backgroundColor: '#dbeafe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User className="h-5 w-5" style={{ color: colors.primary }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>
                  {session?.user?.name || 'Usuario'}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  {session?.user?.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: '#dbeafe',
                      color: colors.primary,
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      display: 'inline-block',
                    }}
                  >
                    {session?.user?.role || 'USER'}
                  </div>
                  <Shield className="h-3 w-3" style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {session?.user?.role === 'SUPERADMIN' ? 'Administrador completo' :
                     session?.user?.role === 'ADMIN' ? 'Administrador de empresa' :
                     'Usuario estándar'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Apariencia - OCULTO: Funcionalidad discontinuada */}
          {/* 
          <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Palette className="h-4 w-4" style={{ color: colors.primary }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                Apariencia
              </h3>
            </div>
            
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                Tema Actual
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{themeConfig.preview}</span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1f2937' }}>
                    {themeConfig.displayName}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#6b7280' }}>
                    {themeConfig.description}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ThemeSelector variant="dropdown" />
              <button
                onClick={() => setTheme(currentTheme === 'classic' ? 'modern' : 'classic')}
                style={{
                  padding: '0.4375rem 0.875rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: '#374151',
                  backgroundColor: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                <Palette className="h-3.5 w-3.5" />
                Cambiar
              </button>
            </div>
          </div>
          */}

          {/* Paginación - Solo para ADMIN y SUPERADMIN */}
          {(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN') && (
            <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <List className="h-4 w-4" style={{ color: colors.primary }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                  Paginación
                </h3>
              </div>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                  Registros por página
                </label>
                <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Selecciona cuántos registros quieres ver por página en las tablas del sistema.
                </p>
                <div style={{ width: '100%' }}>
                  <FilterableSelect
                    options={[
                      { id: '10', name: '10 registros' },
                      { id: '25', name: '25 registros' },
                      { id: '50', name: '50 registros' },
                      { id: '100', name: '100 registros' }
                    ]}
                    value={itemsPerPage.toString()}
                    onChange={async (value) => {
                      if (value) {
                        const newValue = parseInt(value) as 10 | 25 | 50 | 100;
                        const success = await updatePaginationPreference(newValue);
                        if (success) {
                          showSuccess('Preferencia de paginación actualizada');
                        }
                      }
                    }}
                    placeholder="Seleccionar cantidad"
                    searchable={false}
                    className="w-full"
                    useThemeColors={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notificaciones de Actividad - Solo para SUPERADMIN */}
          {session?.user?.role === 'SUPERADMIN' && (
            <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
              <NotificationPreferences />
            </div>
          )}

          {/* Botonera (solo desarrollo) */}
          {isDevelopment && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Settings className="h-4 w-4" style={{ color: colors.primary }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                  Desarrollo
                </h3>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1f2937', marginBottom: '0.125rem' }}>
                    Habilitar Botonera
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#6b7280' }}>
                    Muestra la barra de navegación inferior
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={enableBotonera}
                    onChange={async (e) => {
                      const newValue = e.target.checked;
                      console.log('⚙️ [ConfiguracionModal] enableBotonera cambiado', { newValue });
                      setEnableBotonera(newValue);
                      // Guardar inmediatamente
                      setIsSaving(true);
                      try {
                        console.log('📤 [ConfiguracionModal] Enviando request a /api/profile (enableBotonera)', {
                          method: 'PUT',
                          body: { enableBotonera: newValue }
                        });

                        const response = await fetch('/api/profile', {
                          method: 'PUT',
                          credentials: 'include',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            enableBotonera: newValue
                          }),
                        });

                        console.log('📥 [ConfiguracionModal] Respuesta recibida (enableBotonera)', {
                          ok: response.ok,
                          status: response.status
                        });

                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({}));
                          console.error('❌ [ConfiguracionModal] Error en respuesta (enableBotonera)', errorData);
                          throw new Error(errorData.message || 'Error al guardar');
                        }

                        const result = await response.json();
                        console.log('✅ [ConfiguracionModal] enableBotonera guardado exitosamente', result);

                        // Disparar evento INMEDIATAMENTE para actualizar componentes sin refrescar
                        // Esto debe hacerse ANTES de cualquier otra cosa
                        const event = new CustomEvent('botonera-updated', { 
                          detail: { enableBotonera: newValue },
                          bubbles: true,
                          cancelable: true
                        });
                        window.dispatchEvent(event);
                        console.log('📢 [ConfiguracionModal] Evento botonera-updated disparado:', newValue);
                        
                        // Actualizar sesión en background sin forzar refresh
                        // Usar setTimeout para que el evento se procese primero
                        console.log('🔄 [ConfiguracionModal] Actualizando sesión (enableBotonera)...');
                        setTimeout(() => {
                          if (typeof update === 'function') {
                            update().catch((err) => {
                              console.warn('⚠️ [ConfiguracionModal] Error al actualizar sesión:', err);
                            });
                          }
                        }, 50);
                      } catch (error: any) {
                        console.error('❌ [ConfiguracionModal] Error guardando enableBotonera:', error);
                        setEnableBotonera(!newValue); // Revertir en caso de error
                        alert(error.message || 'Error al guardar la preferencia');
                      } finally {
                        console.log('🔄 [ConfiguracionModal] Estableciendo isSaving = false (enableBotonera)');
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                    style={{ display: 'none' }}
                  />
                  <div
                    style={{
                      width: '2.75rem',
                      height: '1.5rem',
                      backgroundColor: enableBotonera ? colors.primary : '#d1d5db',
                      borderRadius: '9999px',
                      position: 'relative',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.125rem',
                    }}
                  >
                    <div
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        transform: enableBotonera ? 'translateX(1.25rem)' : 'translateX(0)',
                        transition: 'transform 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Modales Anclados - Solo en dev o para SUPERADMIN */}
          {(isDevelopment || session?.user?.role === 'SUPERADMIN') && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                      <Pin className="h-3.5 w-3.5" style={{ color: colors.primary }} />
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1f2937' }}>
                        Habilitar Modales Anclados
                      </div>
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#6b7280', marginLeft: '1.75rem' }}>
                      Permite anclar formularios al Panel de Control
                    </div>
                  </div>
                  <label
                    style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={enablePinnedModals}
                    onChange={async (e) => {
                      const newValue = e.target.checked;
                      console.log('⚙️ [ConfiguracionModal] enablePinnedModals cambiado', { newValue });
                      setEnablePinnedModals(newValue);
                      // Guardar inmediatamente
                      setIsSaving(true);
                      try {
                        console.log('📤 [ConfiguracionModal] Enviando request a /api/profile (enablePinnedModals)', {
                          method: 'PUT',
                          body: { enablePinnedModals: newValue }
                        });

                        const response = await fetch('/api/profile', {
                          method: 'PUT',
                          credentials: 'include',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            enablePinnedModals: newValue
                          }),
                        });

                        console.log('📥 [ConfiguracionModal] Respuesta recibida (enablePinnedModals)', {
                          ok: response.ok,
                          status: response.status
                        });

                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({}));
                          console.error('❌ [ConfiguracionModal] Error en respuesta (enablePinnedModals)', errorData);
                          throw new Error(errorData.message || 'Error al guardar');
                        }

                        const result = await response.json();
                        console.log('✅ [ConfiguracionModal] enablePinnedModals guardado exitosamente', result);

                        // Disparar evento INMEDIATAMENTE para actualizar componentes sin refrescar
                        // Esto debe hacerse ANTES de cualquier otra cosa
                        const event = new CustomEvent('pinned-modals-updated', { 
                          detail: { enablePinnedModals: newValue },
                          bubbles: true,
                          cancelable: true
                        });
                        window.dispatchEvent(event);
                        console.log('📢 [ConfiguracionModal] Evento pinned-modals-updated disparado:', newValue);
                        
                        // Actualizar sesión en background sin forzar refresh
                        // Usar setTimeout para que el evento se procese primero
                        console.log('🔄 [ConfiguracionModal] Actualizando sesión (enablePinnedModals)...');
                        setTimeout(() => {
                          if (typeof update === 'function') {
                            update().catch((err) => {
                              console.warn('⚠️ [ConfiguracionModal] Error al actualizar sesión:', err);
                            });
                          }
                        }, 50);
                      } catch (error: any) {
                        console.error('❌ [ConfiguracionModal] Error guardando enablePinnedModals:', error);
                        setEnablePinnedModals(!newValue); // Revertir en caso de error
                        alert(error.message || 'Error al guardar la preferencia');
                      } finally {
                        console.log('🔄 [ConfiguracionModal] Estableciendo isSaving = false (enablePinnedModals)');
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                    style={{ display: 'none' }}
                  />
                  <div
                    style={{
                      width: '2.75rem',
                      height: '1.5rem',
                      backgroundColor: enablePinnedModals ? colors.primary : '#d1d5db',
                      borderRadius: '9999px',
                      position: 'relative',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.125rem',
                    }}
                  >
                    <div
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        transform: enablePinnedModals ? 'translateX(1.25rem)' : 'translateX(0)',
                        transition: 'transform 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                  </div>
                </label>
                </div>
              )}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#fff',
                background: colors.gradient,
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${colors?.primary || '#667eea'}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

