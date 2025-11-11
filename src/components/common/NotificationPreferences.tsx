"use client";

import React, { useState, useEffect } from "react";
import { Bell, Mail, Save, Loader2 } from "lucide-react";
import { ActivityAction } from "@/lib/user-activity-types";
import { getActionDescription } from "@/lib/user-activity-types";
import { useToast } from "@/hooks/useToast";

interface NotificationPreference {
  action: ActivityAction;
  enabled: boolean;
  send_email: boolean;
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/preferences');
      
      if (!response.ok) {
        throw new Error('Error al cargar preferencias');
      }

      const data = await response.json();
      setPreferences(data.preferences || []);
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
      showError('Error al cargar las preferencias de notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = (action: ActivityAction) => {
    setPreferences(prev => 
      prev.map(p => 
        p.action === action 
          ? { ...p, enabled: !p.enabled }
          : p
      )
    );
  };

  const handleToggleEmail = (action: ActivityAction) => {
    setPreferences(prev => 
      prev.map(p => 
        p.action === action 
          ? { ...p, send_email: !p.send_email }
          : p
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar preferencias');
      }

      showSuccess('Preferencias de notificaciones guardadas correctamente');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      showError(error.message || 'Error al guardar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando preferencias...</span>
      </div>
    );
  }

  // Agrupar acciones por categoría
  const groupedActions: Record<string, ActivityAction[]> = {
    'Autenticación': ['LOGIN', 'LOGOUT'],
    'Remitos': ['CREATE_REMITO', 'UPDATE_REMITO', 'DELETE_REMITO'],
    'Clientes': ['CREATE_CLIENT', 'UPDATE_CLIENT', 'DELETE_CLIENT'],
    'Productos': ['CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT'],
    'Categorías': ['CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY'],
    'Estados de Remito': ['CREATE_ESTADO_REMITO', 'UPDATE_ESTADO_REMITO', 'DELETE_ESTADO_REMITO'],
    'Usuarios': ['CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'ACTIVATE_USER', 'DEACTIVATE_USER', 'RESEND_INVITATION', 'UPDATE_PROFILE'],
    'Reportes y Datos': ['VIEW_REPORT', 'EXPORT_DATA'],
    'Otros': ['OTHER']
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notificaciones de Actividad
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Configura qué actividades quieres recibir por email. Útil para dar seguimiento de pruebas y errores.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Encabezado de tabla */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
          <div className="col-span-5">Acción</div>
          <div className="col-span-3 text-center">Activar</div>
          <div className="col-span-4 text-center">Enviar Email</div>
        </div>

        {/* Cuerpo de tabla */}
        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {Object.entries(groupedActions).map(([category, actions]) => (
            <div key={category}>
              {/* Encabezado de categoría */}
              <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800">{category}</h4>
              </div>
              
              {/* Acciones de la categoría */}
              {actions.map(action => {
                const preference = preferences.find(p => p.action === action);
                if (!preference) return null;

                return (
                  <div
                    key={action}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-5 flex items-center">
                      <span className="text-sm text-gray-900">
                        {getActionDescription(action)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500 font-mono">
                        ({action})
                      </span>
                    </div>
                    
                    <div className="col-span-3 flex items-center justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preference.enabled}
                          onChange={() => handleToggleEnabled(action)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="col-span-4 flex items-center justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preference.send_email && preference.enabled}
                          onChange={() => handleToggleEmail(action)}
                          disabled={!preference.enabled}
                          className="sr-only peer disabled:opacity-50"
                        />
                        <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                          preference.enabled
                            ? 'bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:bg-green-600'
                            : 'bg-gray-100 cursor-not-allowed opacity-50'
                        }`}></div>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Información sobre las Notificaciones
            </h4>
            <p className="text-sm text-blue-800">
              Las notificaciones se enviarán al email configurado en <code className="bg-blue-100 px-1 rounded">SUPERADMIN_EMAIL</code> o <code className="bg-blue-100 px-1 rounded">EMAIL_USER</code>. 
              Cada email incluirá información detallada sobre la actividad realizada, incluyendo el usuario, la acción, fecha y hora, y detalles adicionales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

