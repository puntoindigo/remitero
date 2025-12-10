"use client";

import React, { useEffect, Suspense, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/hooks/useTheme';
import { ThemeSelector } from '@/components/common/ThemeSelector';
import { User, Palette, Settings, Bell, Shield, Globe, ChevronDown, ChevronUp, List } from 'lucide-react';
import { NotificationPreferences } from '@/components/common/NotificationPreferences';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { usePaginationPreference } from '@/hooks/usePaginationPreference';
import FilterableSelect from '@/components/common/FilterableSelect';

function ConfiguracionContent() {
  const { data: session, status } = useSession();
  const { currentTheme, themeConfig, availableThemes, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const { showSuccess } = useToast();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { itemsPerPage, updatePaginationPreference, isAdmin } = usePaginationPreference();
  
  const isSuperAdmin = session?.user?.role === 'SUPERADMIN';
  const isAdminOrSuperAdmin = isAdmin || isSuperAdmin;
  
  // Debug: verificar valores
  useEffect(() => {
    console.log('🔍 [Configuracion] Debug paginación:', {
      sessionRole: session?.user?.role,
      isAdmin,
      isSuperAdmin,
      isAdminOrSuperAdmin,
      itemsPerPage
    });
  }, [session?.user?.role, isAdmin, isSuperAdmin, isAdminOrSuperAdmin, itemsPerPage]);
  
  // Mostrar mensaje si se desactivó desde el email
  useEffect(() => {
    const disabled = searchParams.get('disabled');
    if (disabled) {
      if (disabled === 'all') {
        showSuccess('Todas las notificaciones han sido desactivadas');
      } else {
        showSuccess(`La notificación para ${disabled} ha sido desactivada`);
      }
      // Limpiar el parámetro de la URL
      window.history.replaceState({}, '', '/configuracion');
    }
  }, [searchParams, showSuccess]);
  

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuración
          </h1>
          <p className="text-gray-600">
            Personaliza tu experiencia en el sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Perfil de Usuario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {session?.user?.name || 'Usuario'}
                  </h2>
                  <p className="text-gray-600">{session?.user?.email}</p>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mt-1">
                    {session?.user?.role || 'USER'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Permisos</div>
                    <div className="text-sm text-gray-600">
                      {session?.user?.role === 'SUPERADMIN' ? 'Administrador completo' : 
                       session?.user?.role === 'ADMIN' ? 'Administrador de empresa' : 
                       'Usuario estándar'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuraciones */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tema - OCULTO: Funcionalidad discontinuada */}
            {/* 
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Apariencia</h3>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema Actual
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{themeConfig.preview}</span>
                  <div>
                    <div className="font-medium">{themeConfig.displayName}</div>
                    <div className="text-sm text-gray-600">{themeConfig.description}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <ThemeSelector variant="dropdown" />
                <button
                  onClick={() => setTheme(currentTheme === 'classic' ? 'modern' : 'classic')}
                  className="btn secondary flex items-center gap-2"
                >
                  <Palette className="h-4 w-4" />
                  Cambiar Tema
                </button>
              </div>
            </div>
            */}

            {/* Preferencias */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Preferencias</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Notificaciones</div>
                    <div className="text-sm text-gray-600">Recibir notificaciones del sistema</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Modo Oscuro</div>
                    <div className="text-sm text-gray-600">Cambiar automáticamente según el sistema</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Paginación - Solo para ADMIN y SUPERADMIN */}
            {(isAdminOrSuperAdmin || session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN') && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <List className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Paginación</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registros por página
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      Selecciona cuántos registros quieres ver por página en las tablas del sistema.
                    </p>
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
            {status === 'authenticated' && isSuperAdmin && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-left border-b border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Notificaciones de Actividad</h3>
                  </div>
                  {notificationsOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  )}
                </button>
                {notificationsOpen && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <NotificationPreferences />
                  </div>
                )}
              </div>
            )}

            {/* Sistema */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Sistema</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">Versión</div>
                  <div className="text-sm text-gray-600">1.0.0 Beta</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">Última actualización</div>
                  <div className="text-sm text-gray-600">Hoy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfiguracionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-gray-600">Cargando configuración...</div>
      </div>
    }>
      <ConfiguracionContent />
    </Suspense>
  );
}
