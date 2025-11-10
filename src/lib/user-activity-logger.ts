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
 */
export async function getLastUserActivity(userId: string): Promise<ActivityLog | null> {
  try {
    const cleanUserId = userId.trim();
    console.log('🔍 [getLastUserActivity] Fetching last activity for user:', { 
      userId: cleanUserId,
      originalUserId: userId 
    });
    
    const { data, error } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', cleanUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Si el error es porque no hay registros (PGRST116), es normal
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [getLastUserActivity] No activity found for user:', cleanUserId);
        return null;
      }
      console.error('❌ [getLastUserActivity] Supabase error:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: cleanUserId
      });
      return null;
    }

    if (!data) {
      console.log('ℹ️ [getLastUserActivity] No data returned for user:', cleanUserId);
      return null;
    }

    console.log('✅ [getLastUserActivity] Found last activity:', { 
      userId: cleanUserId, 
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

    const { data, error } = await supabaseAdmin
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', cleanUserId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .offset(offset);

    if (error) {
      console.error('❌ [getUserActivityLogs] Supabase error:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: cleanUserId,
        limit,
        offset,
        fullError: error
      });
      return [];
    }

    if (!data) {
      console.warn('⚠️ [getUserActivityLogs] No data returned for user:', cleanUserId);
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

// Re-exportar getActionDescription para compatibilidad
export { getActionDescription } from "./user-activity-types";

