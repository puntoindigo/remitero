"use client";

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/hooks/useTheme';
import { ThemeSelector } from './ThemeSelector';
import { ConfiguracionModal } from '@/components/common/ConfiguracionModal';
import { 
  User, 
  Settings, 
  Palette, 
  LogOut, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface UserPanelProps {
  className?: string;
}

export function UserPanel({ className = '' }: UserPanelProps) {
  const { data: session } = useSession();
  const { currentTheme, themeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleLogout = async () => {
    setIsOpen(false);
    setIsLoggingOut(true);
    try {
      // Redirigir inmediatamente para evitar demoras en compilación
      if (typeof window !== 'undefined') {
        // Hacer logout en background sin esperar ni mostrar errores
        signOut({ redirect: false }).catch(() => {
          // Ignorar errores silenciosamente
        });
        // Pequeño delay para que el signOut se ejecute antes de navegar
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 50);
      }
    } catch (error) {
      // Ignorar errores y redirigir de todas formas
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  const handleSettings = () => {
    setIsOpen(false);
    setShowConfigModal(true);
  };

  return (
    <div className={`user-panel relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-white">
            {session?.user?.name || 'Usuario'}
          </div>
          <div className="text-xs text-gray-300">
            {session?.user?.role || 'USER'}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-300" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-300" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {session?.user?.name || 'Usuario'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {session?.user?.email || 'usuario@ejemplo.com'}
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Section */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">Tema Actual</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{themeConfig.preview}</span>
                  <span className="text-sm font-medium">{themeConfig.displayName}</span>
                </div>
                <ThemeSelector variant="compact" />
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Configuración</span>
              </button>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/themes';
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <Palette className="h-4 w-4" />
                <span>Cambiar Tema</span>
              </button>
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cerrando sesión...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      <ConfiguracionModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </div>
  );
}
