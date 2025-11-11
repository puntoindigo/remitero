"use client";

import React, { useState, useEffect } from "react";
import { Bell, Mail, Loader2 } from "lucide-react";
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

  const handleToggleEnabled = async (action: ActivityAction) => {
    const updated = preferences.map(p => 
      p.action === action 
        ? { ...p, enabled: !p.enabled }
        : p
    );
    setPreferences(updated);
    await savePreferences(updated);
  };

  const handleToggleEmail = async (action: ActivityAction) => {
    const updated = preferences.map(p => 
      p.action === action 
        ? { ...p, send_email: !p.send_email }
        : p
    );
    setPreferences(updated);
    await savePreferences(updated);
  };

  const handleToggleAll = async () => {
    const allEnabled = preferences.every(p => p.enabled && p.send_email);
    const updated = preferences.map(p => ({ 
      ...p, 
      enabled: !allEnabled, 
      send_email: !allEnabled 
    }));
    setPreferences(updated);
    await savePreferences(updated);
  };

  const savePreferences = async (prefsToSave: NotificationPreference[]) => {
    try {
      setSaving(true);
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences: prefsToSave }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar preferencias');
      }

      showSuccess('Preferencias actualizadas');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      showError(error.message || 'Error al guardar las preferencias');
      // Revertir cambios en caso de error
      fetchPreferences();
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

  const allEnabled = preferences.length > 0 && preferences.every(p => p.enabled && p.send_email);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">Notificaciones de Actividad</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">{allEnabled ? 'Todas activas' : 'Algunas activas'}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={allEnabled}
              onChange={handleToggleAll}
              disabled={saving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          {saving && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Encabezado de tabla */}
        <div className="grid grid-cols-12 gap-2 p-2 bg-gray-50 border-b border-gray-200 font-semibold text-xs text-gray-700">
          <div className="col-span-6">Acción</div>
          <div className="col-span-3 text-center">Activar</div>
          <div className="col-span-3 text-center">Email</div>
        </div>

        {/* Cuerpo de tabla */}
        <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
          {Object.entries(groupedActions).map(([category, actions]) => (
            <div key={category}>
              {/* Encabezado de categoría */}
              <div className="px-2 py-1 bg-gray-100 border-b border-gray-200">
                <h4 className="text-xs font-semibold text-gray-800">{category}</h4>
              </div>
              
              {/* Acciones de la categoría */}
              {actions.map(action => {
                const preference = preferences.find(p => p.action === action);
                if (!preference) return null;

                return (
                  <div
                    key={action}
                    className="grid grid-cols-12 gap-2 p-2 hover:bg-gray-200 transition-colors"
                  >
                    <div className="col-span-6 flex items-center gap-1">
                      <span className="text-xs text-gray-900">
                        {getActionDescription(action)}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        ({action})
                      </span>
                    </div>
                    
                    <div className="col-span-3 flex items-center justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preference.enabled}
                          onChange={() => handleToggleEnabled(action)}
                          disabled={saving}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="col-span-3 flex items-center justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preference.send_email && preference.enabled}
                          onChange={() => handleToggleEmail(action)}
                          disabled={!preference.enabled || saving}
                          className="sr-only peer"
                        />
                        <div className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                          preference.enabled
                            ? 'bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 peer-checked:bg-green-600'
                            : 'bg-gray-300 cursor-not-allowed opacity-70'
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
        <div className="flex items-start gap-2">
          <Mail className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            Las notificaciones se envían a <code className="bg-blue-100 px-1 rounded text-xs">SUPERADMIN_EMAIL</code> o <code className="bg-blue-100 px-1 rounded text-xs">EMAIL_USER</code>. 
            Los cambios se guardan automáticamente. Puedes desactivar desde el email.
          </p>
        </div>
      </div>
    </div>
  );
}

