"use client";

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { ThemeSelector } from '@/components/common/ThemeSelector';
import { Palette, Sparkles, Check } from 'lucide-react';

export default function ThemesPage() {
  const { currentTheme, themeConfig, availableThemes, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuración de Temas
          </h1>
          <p className="text-gray-600">
            Personaliza la apariencia de tu aplicación seleccionando un tema.
          </p>
        </div>

        {/* Current Theme Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Tema Actual
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{themeConfig.preview}</span>
              <span className="text-lg font-medium">{themeConfig.displayName}</span>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{themeConfig.description}</p>
          
          <div className="flex gap-4">
            <ThemeSelector variant="dropdown" />
            <button
              onClick={() => setTheme(currentTheme === 'classic' ? 'modern' : 'classic')}
              className="btn secondary flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Cambiar Tema
            </button>
          </div>
        </div>

        {/* Available Themes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableThemes.map((theme) => (
            <div
              key={theme.name}
              className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all cursor-pointer ${
                currentTheme === theme.name
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setTheme(theme.name as any)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{theme.preview}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {theme.displayName}
                    </h3>
                    <p className="text-sm text-gray-600">{theme.description}</p>
                  </div>
                </div>
                {currentTheme === theme.name && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Check className="h-5 w-5" />
                    <span className="text-sm font-medium">Activo</span>
                  </div>
                )}
              </div>

              {/* Theme Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  {/* Header Preview */}
                  <div className="bg-gray-800 text-white p-3 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white rounded"></div>
                      <span className="text-sm font-medium">Sistema de Gestión</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-gray-600 rounded"></div>
                      <div className="w-6 h-6 bg-gray-600 rounded"></div>
                    </div>
                  </div>

                  {/* Card Preview */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Ejemplo de Card</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Activo
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Este es un ejemplo de cómo se ve el contenido en este tema.
                    </p>
                    <div className="flex gap-2">
                      <button className="btn primary text-xs px-3 py-1">
                        Acción
                      </button>
                      <button className="btn secondary text-xs px-3 py-1">
                        Secundaria
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  currentTheme === theme.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setTheme(theme.name as any)}
              >
                {currentTheme === theme.name ? 'Tema Activo' : 'Seleccionar Tema'}
              </button>
            </div>
          ))}
        </div>

        {/* Theme Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Palette className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Sobre los Temas
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                Los temas cambian la apariencia visual de toda la aplicación, incluyendo colores, 
                tipografías, espaciados y efectos visuales.
              </p>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• <strong>Clásico:</strong> Diseño tradicional y corporativo</li>
                <li>• <strong>Moderno:</strong> Diseño contemporáneo inspirado en apps líderes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
