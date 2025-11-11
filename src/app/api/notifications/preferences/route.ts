import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ActivityAction } from "@/lib/user-activity-types";

interface NotificationPreference {
  action: ActivityAction;
  enabled: boolean;
  send_email: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Solo SUPERADMIN puede ver las preferencias de notificaciones
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Solo SUPERADMIN puede acceder a las preferencias de notificaciones." 
      }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('notification_preferences')
      .select('*')
      .order('action', { ascending: true });

    if (error) {
      console.error('❌ [Notifications API] Error fetching preferences:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron obtener las preferencias de notificaciones."
      }, { status: 500 });
    }

    return NextResponse.json({ preferences: data || [] });
  } catch (error: any) {
    console.error('Error in notifications preferences GET:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Solo SUPERADMIN puede actualizar las preferencias de notificaciones
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Solo SUPERADMIN puede actualizar las preferencias de notificaciones." 
      }, { status: 403 });
    }

    const body = await request.json();
    const { preferences }: { preferences: NotificationPreference[] } = body;

    if (!Array.isArray(preferences)) {
      return NextResponse.json({ 
        error: "Datos inválidos",
        message: "Las preferencias deben ser un array."
      }, { status: 400 });
    }

    // Actualizar cada preferencia
    const updates = preferences.map(pref => 
      supabaseAdmin
        .from('notification_preferences')
        .update({
          enabled: pref.enabled,
          send_email: pref.send_email,
          updated_at: new Date().toISOString()
        })
        .eq('action', pref.action)
    );

    const results = await Promise.all(updates);
    
    // Verificar si hubo errores
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('❌ [Notifications API] Error updating preferences:', errors);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron actualizar algunas preferencias."
      }, { status: 500 });
    }

    console.log('✅ [Notifications API] Preferences updated successfully:', {
      count: preferences.length,
      updatedBy: session.user.id
    });

    return NextResponse.json({ 
      success: true,
      message: "Preferencias actualizadas correctamente."
    });
  } catch (error: any) {
    console.error('Error in notifications preferences PUT:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

