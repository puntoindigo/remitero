import { supabaseAdmin } from "./supabase";
import type { ActivityAction, ActivityLogMetadata, ActivityLog } from "./user-activity-types";

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
    const { error } = await supabaseAdmin
      .from('user_activity_logs')
      .insert({
        user_id: userId,
        action,
        description: description || null,
        metadata: metadata || null,
      });

    if (error) {
      console.error('Error logging user activity:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  } catch (error) {
    console.error('Error logging user activity:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
}

/**
 * Obtiene el último log de actividad de un usuario
 */
export async function getLastUserActivity(userId: string): Promise<ActivityLog | null> {
  try {
    console.log('🔍 [getLastUserActivity] Fetching last activity for user:', { userId });
    
    const { data, error } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Si el error es porque no hay registros (PGRST116), es normal
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [getLastUserActivity] No activity found for user:', userId);
        return null;
      }
      console.error('❌ [getLastUserActivity] Supabase error:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId
      });
      return null;
    }

    if (!data) {
      console.log('ℹ️ [getLastUserActivity] No data returned for user:', userId);
      return null;
    }

    console.log('✅ [getLastUserActivity] Found last activity:', { 
      userId, 
      activityId: data.id,
      action: data.action,
      created_at: data.created_at
    });

    return data as ActivityLog;
  } catch (error) {
    console.error('❌ [getLastUserActivity] Exception:', error);
    return null;
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
    
    // Verificar también con getLastUserActivity para comparar
    const lastActivity = await getLastUserActivity(userId);
    console.log('🔍 [getUserActivityLogs] Last activity check:', {
      userId,
      hasLastActivity: !!lastActivity,
      lastActivityId: lastActivity?.id,
      lastActivityAction: lastActivity?.action
    });
    
    const { data, error } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .offset(offset);

    if (error) {
      console.error('❌ [getUserActivityLogs] Supabase error:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId
      });
      return [];
    }

    if (!data) {
      console.warn('⚠️ [getUserActivityLogs] No data returned for user:', userId);
      return [];
    }

    console.log('✅ [getUserActivityLogs] Found logs:', { 
      userId, 
      count: data.length,
      logs: data.map(l => ({ 
        id: l.id, 
        user_id: l.user_id,
        action: l.action, 
        created_at: l.created_at 
      }))
    });

    return data as ActivityLog[];
  } catch (error) {
    console.error('❌ [getUserActivityLogs] Exception:', error);
    return [];
  }
}

// Re-exportar getActionDescription para compatibilidad
export { getActionDescription } from "./user-activity-types";

