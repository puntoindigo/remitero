"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/hooks/useTheme';
import { ThemeSelector } from '@/components/common/ThemeSelector';
import { User, Palette, Settings, Bell, Shield, Globe } from 'lucide-react';

export default function ConfiguracionPage() {
  const { data: session } = useSession();
  const { currentTheme, themeConfig, availableThemes, setTheme } = useTheme();

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
            {/* Tema */}
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
