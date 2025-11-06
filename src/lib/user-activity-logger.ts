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
    const { data, error } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ActivityLog;
  } catch (error) {
    console.error('Error getting last user activity:', error);
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
    const { data, error } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .offset(offset);

    if (error || !data) {
      return [];
    }

    return data as ActivityLog[];
  } catch (error) {
    console.error('Error getting user activity logs:', error);
    return [];
  }
}

// Re-exportar getActionDescription para compatibilidad
export { getActionDescription } from "./user-activity-types";

