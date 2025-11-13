import { supabaseAdmin } from "./supabase";
import type { ActivityAction, ActivityLogMetadata, ActivityLog } from "./user-activity-types";
import { getActionDescription } from "./user-activity-types";
import { sendActivityNotificationEmail } from "./notification-email";

// Re-exportar tipos para compatibilidad
export type { ActivityAction, ActivityLogMetadata, ActivityLog };

/**
 * Registra una actividad del usuario en el sistema
 */
export async function logUserActivity(
  userId: string,
  action: ActivityAction,
  description?: string,
  metadata?: ActivityLogMetadata
): Promise<void> {
  try {
    // Validar y limpiar userId
    if (!userId || typeof userId !== 'string') {
      console.error('❌ [logUserActivity] Invalid userId:', { userId, userIdType: typeof userId });
      return;
    }

    const cleanUserId = userId.trim();
    
    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cleanUserId)) {
      console.error('❌ [logUserActivity] Invalid UUID format:', { 
        userId: cleanUserId, 
        userIdLength: cleanUserId.length 
      });
      return;
    }

    console.log('📝 [logUserActivity] Attempting to log activity:', {
      userId: cleanUserId,
      userIdType: typeof cleanUserId,
      userIdLength: cleanUserId.length,
      action,
      description,
      hasMetadata: !!metadata
    });

    const insertData = {
      user_id: cleanUserId,
      action,
      description: description || null,
      metadata: metadata || null,
    };

    console.log('📝 [logUserActivity] Insert data:', insertData);

    const { data, error } = await supabaseAdmin
      .from('user_activity_logs')
      .insert(insertData)
      .select();

    if (error) {
      console.error('❌ [logUserActivity] Error logging user activity:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: cleanUserId,
        action,
        insertData
      });
      // No lanzar error para no interrumpir el flujo principal
    } else {
      console.log('✅ [logUserActivity] Activity logged successfully:', {
        userId: cleanUserId,
        action,
        insertedId: data?.[0]?.id,
        insertedAt: data?.[0]?.created_at,
        insertedUserId: data?.[0]?.user_id
      });

      // Verificar si debemos enviar notificación por email
      try {
        await checkAndSendNotification(cleanUserId, action, description || null, metadata, data?.[0]?.created_at);
      } catch (notificationError: any) {
        // No fallar el logging si la notificación falla
        console.warn('⚠️ [logUserActivity] Error checking/sending notification (no crítico):', notificationError.message);
      }
    }
  } catch (error: any) {
    console.error('❌ [logUserActivity] Exception logging user activity:', {
      error: error?.message,
      stack: error?.stack,
      userId,
      action
    });
    // No lanzar error para no interrumpir el flujo principal
  }
}

/**
 * Obtiene el último log de actividad de un usuario
 * OPTIMIZADO: Logging reducido para mejorar performance
 */
export async function getLastUserActivity(userId: string): Promise<ActivityLog | null> {
  try {
    const cleanUserId = userId.trim();
    
    const { data, error } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', cleanUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Si el error es porque no hay registros (PGRST116), es normal - no loggear
      if (error.code === 'PGRST116') {
        return null;
      }
      // Solo loggear errores reales
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [getLastUserActivity] Supabase error:', {
          error: error.message,
          code: error.code,
          userId: cleanUserId
        });
      }
      return null;
    }

    return data as ActivityLog;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ [getLastUserActivity] Exception:', error);
    }
    return null;
  }
}

/**
 * Obtiene los últimos logs de actividad para múltiples usuarios en una sola query
 * OPTIMIZADO: Una sola query en lugar de N queries individuales
 */
export async function getLastUserActivitiesForUsers(userIds: string[]): Promise<Map<string, ActivityLog | null>> {
  if (!userIds || userIds.length === 0) {
    return new Map();
  }

  try {
    // Obtener la última actividad de cada usuario usando una query con DISTINCT ON
    // Esto es más eficiente que hacer N queries individuales
    const { data, error } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .in('user_id', userIds.map(id => id.trim()))
      .order('user_id', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [getLastUserActivitiesForUsers] Supabase error:', error);
      }
      // Retornar mapa vacío en caso de error
      return new Map();
    }

    // Crear un mapa con la última actividad de cada usuario
    const activitiesMap = new Map<string, ActivityLog | null>();
    
    // Inicializar todos los usuarios con null
    userIds.forEach(id => activitiesMap.set(id.trim(), null));
    
    // Agrupar por user_id y tomar solo la primera (más reciente) de cada uno
    const userActivities = new Map<string, ActivityLog>();
    if (data && Array.isArray(data)) {
      data.forEach((activity: ActivityLog) => {
        const userId = activity.user_id.trim();
        if (!userActivities.has(userId)) {
          userActivities.set(userId, activity);
        }
      });
    }
    
    // Actualizar el mapa final
    userActivities.forEach((activity, userId) => {
      activitiesMap.set(userId, activity);
    });

    return activitiesMap;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ [getLastUserActivitiesForUsers] Exception:', error);
    }
    return new Map();
  }
}

/**
 * Obtiene todos los logs de actividad de un usuario
 */
export async function getUserActivityLogs(
  userId: string,
  limit: number = 100,
  offset: number = 0
): Promise<ActivityLog[]> {
  try {
    console.log('🔍 [getUserActivityLogs] Fetching logs for user:', { 
      userId, 
      userIdType: typeof userId,
      userIdLength: userId?.length,
      limit, 
      offset 
    });
    
    // Limpiar userId primero
    const cleanUserId = userId.trim();
    
    // Verificar también con getLastUserActivity para comparar
    const lastActivity = await getLastUserActivity(cleanUserId);
    console.log('🔍 [getUserActivityLogs] Last activity check:', {
      userId: cleanUserId,
      hasLastActivity: !!lastActivity,
      lastActivityId: lastActivity?.id,
      lastActivityAction: lastActivity?.action
    });
    
    // Primero verificar si hay registros en la tabla
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', cleanUserId);

    console.log('🔍 [getUserActivityLogs] Total count check:', {
      userId: cleanUserId,
      totalCount,
      countError: countError ? {
        message: countError.message,
        code: countError.code
      } : null
    });

    console.log('🔍 [getUserActivityLogs] Query params:', {
      cleanUserId,
      originalUserId: userId,
      userIdsMatch: cleanUserId === userId,
      limit,
      offset
    });

    // Consulta simple, igual que el debug endpoint que funciona
    // Si offset es 0, usar solo limit (como el debug endpoint)
    let query = supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', cleanUserId)
      .order('created_at', { ascending: false });
    
    if (offset === 0) {
      query = query.limit(limit);
    } else {
      query = query.range(offset, offset + limit - 1);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('❌ [getUserActivityLogs] Supabase error:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: cleanUserId,
        limit,
        offset,
        fullError: JSON.stringify(error, null, 2)
      });
      return [];
    }

    if (!data) {
      console.warn('⚠️ [getUserActivityLogs] No data returned for user:', {
        cleanUserId,
        totalCount,
        limit,
        offset
      });
      return [];
    }

    // Verificar si data es un array vacío
    if (Array.isArray(data) && data.length === 0) {
      console.warn('⚠️ [getUserActivityLogs] Empty array returned for user:', {
        cleanUserId,
        totalCount,
        limit,
        offset,
        query: `user_id = '${cleanUserId}'`
      });
    }

    console.log('✅ [getUserActivityLogs] Found logs:', { 
      userId: cleanUserId, 
      originalUserId: userId,
      count: data.length,
      totalCount,
      limit,
      offset,
      isArray: Array.isArray(data),
      dataType: typeof data,
      firstLog: data.length > 0 ? {
        id: data[0].id,
        user_id: data[0].user_id,
        action: data[0].action,
        created_at: data[0].created_at
      } : null,
      logs: data.slice(0, 3).map(l => ({ 
        id: l.id, 
        user_id: l.user_id,
        action: l.action,
        description: l.description,
        created_at: l.created_at 
      }))
    });

    // Asegurarse de que devolvemos un array
    const result = Array.isArray(data) ? data : [];
    console.log('✅ [getUserActivityLogs] Returning result:', {
      resultLength: result.length,
      resultType: typeof result,
      isArray: Array.isArray(result)
    });
    
    return result as ActivityLog[];
  } catch (error) {
    console.error('❌ [getUserActivityLogs] Exception:', error);
    return [];
  }
}

/**
 * Verifica si debe enviar notificación por email y la envía si corresponde
 */
async function checkAndSendNotification(
  userId: string,
  action: ActivityAction,
  description: string | null,
  metadata: ActivityLogMetadata | undefined,
  timestamp: string
): Promise<void> {
  try {
    // Solo enviar notificaciones por email en producción
    // Verificar explícitamente si estamos en producción de Vercel
    const isVercelProduction = process.env.VERCEL_ENV === 'production';
    
    // Detectar producción por URL si VERCEL_ENV no está configurado
    const vercelUrl = process.env.VERCEL_URL || '';
    const isProductionUrl = vercelUrl.includes('v0-remitero.vercel.app') || 
                           vercelUrl.includes('remitero.vercel.app');
    
    // Detectar desarrollo por URL
    const isDevelopmentUrl = vercelUrl.includes('remitero-dev.vercel.app') ||
                            vercelUrl.includes('remitero-git-') ||
                            vercelUrl.includes('-puntoindigo.vercel.app');
    
    const isProduction = isVercelProduction || isProductionUrl;
    const isDevelopment = isDevelopmentUrl;
    
    // Solo enviar emails si estamos EXPLÍCITAMENTE en producción
    // Si es desarrollo o no podemos determinar que es producción, NO enviar
    if (!isProduction || isDevelopment) {
      console.log('ℹ️ [checkAndSendNotification] Entorno no es producción, no se enviará email de notificación', {
        vercelEnv: process.env.VERCEL_ENV || 'not-set',
        vercelUrl: vercelUrl || 'not-set',
        isVercelProduction,
        isProductionUrl,
        isDevelopmentUrl: isDevelopment,
        isProduction,
        willSendEmail: false
      });
      return;
    }

    // Verificar preferencias de notificación
    const { data: preference, error: prefError } = await supabaseAdmin
      .from('notification_preferences')
      .select('enabled, send_email')
      .eq('action', action)
      .single();

    if (prefError || !preference) {
      // Si no hay preferencia o hay error, no enviar notificación
      return;
    }

    // Si no está habilitado o no debe enviar email, salir
    if (!preference.enabled || !preference.send_email) {
      return;
    }

    // Obtener información del usuario que realizó la acción
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.warn('⚠️ [checkAndSendNotification] No se pudo obtener información del usuario:', userError?.message);
      return;
    }

    // Enviar email de notificación
    const emailSent = await sendActivityNotificationEmail({
      action,
      description: description || getActionDescription(action, metadata),
      userName: user.name || 'Usuario desconocido',
      userEmail: user.email || 'email@desconocido.com',
      metadata,
      timestamp: timestamp || new Date().toISOString()
    });

    if (emailSent) {
      console.log('✅ [checkAndSendNotification] Email de notificación enviado:', {
        action,
        userId,
        userEmail: user.email
      });
    } else {
      console.warn('⚠️ [checkAndSendNotification] No se pudo enviar email de notificación:', {
        action,
        userId
      });
    }
  } catch (error: any) {
    // No lanzar error, solo loguear
    console.error('❌ [checkAndSendNotification] Error:', {
      error: error?.message,
      stack: error?.stack,
      action,
      userId
    });
  }
}

// Re-exportar getActionDescription para compatibilidad
export { getActionDescription } from "./user-activity-types";

