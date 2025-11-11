import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { ActivityAction } from "@/lib/user-activity-types";
import crypto from "crypto";

/**
 * Genera un token seguro para desactivar notificaciones desde el email
 */
export function generateDisableToken(action: ActivityAction | 'ALL'): string {
  const secret = process.env.NOTIFICATION_DISABLE_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret';
  const timestamp = Date.now();
  const data = `${action}:${timestamp}`;
  const hash = crypto.createHmac('sha256', secret).update(data).digest('hex');
  // Incluir timestamp en el token para verificación
  return Buffer.from(`${timestamp}:${hash}`).toString('base64url');
}

/**
 * Verifica un token de desactivación
 */
function verifyDisableToken(token: string, action: ActivityAction | 'ALL'): boolean {
  try {
    const secret = process.env.NOTIFICATION_DISABLE_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret';
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [timestamp, hash] = decoded.split(':');
    
    if (!timestamp || !hash) return false;
    
    // Verificar que el token no sea muy antiguo (7 días)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
    if (tokenAge > maxAge) return false;
    
    // Verificar el hash
    const data = `${action}:${timestamp}`;
    const expectedHash = crypto.createHmac('sha256', secret).update(data).digest('hex');
    
    return hash === expectedHash;
  } catch (error) {
    return false;
  }
}

/**
 * Desactiva notificaciones desde un link en el email
 * GET /api/notifications/disable?action=LOGIN&token=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') as ActivityAction | 'ALL' | null;
    const token = searchParams.get('token');

    if (!action || !token) {
      return NextResponse.json({ 
        error: "Parámetros inválidos",
        message: "Se requieren los parámetros 'action' y 'token'."
      }, { status: 400 });
    }

    if (!verifyDisableToken(token, action)) {
      return NextResponse.json({ 
        error: "Token inválido",
        message: "El token proporcionado no es válido."
      }, { status: 401 });
    }

    // Desactivar notificaciones
    if (action === 'ALL') {
      // Desactivar todas las notificaciones
      const { error } = await supabaseAdmin
        .from('notification_preferences')
        .update({ enabled: false, send_email: false, updated_at: new Date().toISOString() });

      if (error) {
        console.error('❌ [Disable Notifications] Error desactivando todas:', error);
        return NextResponse.json({ 
          error: "Error interno del servidor",
          message: "No se pudieron desactivar todas las notificaciones."
        }, { status: 500 });
      }

      return NextResponse.redirect(new URL('/configuracion?disabled=all', request.url));
    } else {
      // Desactivar una acción específica
      const { error } = await supabaseAdmin
        .from('notification_preferences')
        .update({ enabled: false, send_email: false, updated_at: new Date().toISOString() })
        .eq('action', action);

      if (error) {
        console.error('❌ [Disable Notifications] Error desactivando acción:', error);
        return NextResponse.json({ 
          error: "Error interno del servidor",
          message: `No se pudo desactivar la notificación para ${action}.`
        }, { status: 500 });
      }

      return NextResponse.redirect(new URL(`/configuracion?disabled=${action}`, request.url));
    }
  } catch (error: any) {
    console.error('Error in disable notifications GET:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

