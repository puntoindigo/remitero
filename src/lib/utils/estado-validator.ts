import { supabaseAdmin } from "@/lib/supabase";

/**
 * Valida si un estado existe y está activo para una empresa específica por nombre
 */
export async function validateEstadoForCompany(
  estadoName: string, 
  companyId: string
): Promise<{ isValid: boolean; estado?: any; error?: string }> {
  try {
    const { data: estado, error } = await supabaseAdmin
      .from('estados_remitos')
      .select('id, name, is_active, is_default')
      .eq('company_id', companyId)
      .eq('name', estadoName)
      .eq('is_active', true)
      .single();

    if (error || !estado) {
      return {
        isValid: false,
        error: `El estado "${estadoName}" no existe o no está activo para esta empresa.`
      };
    }

    return {
      isValid: true,
      estado
    };
  } catch (error) {
    console.error('Error validating estado:', error);
    return {
      isValid: false,
      error: 'Error al validar el estado.'
    };
  }
}

/**
 * Valida si un estado existe y está activo para una empresa específica por ID
 */
export async function validateEstadoByIdForCompany(
  estadoId: string, 
  companyId: string
): Promise<{ isValid: boolean; estado?: any; error?: string }> {
  try {
    const { data: estado, error } = await supabaseAdmin
      .from('estados_remitos')
      .select('id, name, is_active, is_default')
      .eq('company_id', companyId)
      .eq('id', estadoId)
      .eq('is_active', true)
      .single();

    if (error || !estado) {
      return {
        isValid: false,
        error: `El estado "${estadoId}" no existe o no está activo para esta empresa.`
      };
    }

    return {
      isValid: true,
      estado
    };
  } catch (error) {
    console.error('Error validating estado by ID:', error);
    return {
      isValid: false,
      error: 'Error al validar el estado.'
    };
  }
}

/**
 * Obtiene todos los estados activos para una empresa
 */
export async function getEstadosActivosForCompany(
  companyId: string
): Promise<{ estados: any[]; error?: string }> {
  try {
    const { data: estados, error } = await supabaseAdmin
      .from('estados_remitos')
      .select('id, name, description, color, icon, is_active, is_default, sort_order')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      return {
        estados: [],
        error: 'Error al obtener los estados de la empresa.'
      };
    }

    return {
      estados: estados || []
    };
  } catch (error) {
    console.error('Error getting estados for company:', error);
    return {
      estados: [],
      error: 'Error al obtener los estados de la empresa.'
    };
  }
}

/**
 * Valida múltiples estados para una empresa
 */
export async function validateEstadosForCompany(
  estadosNames: string[], 
  companyId: string
): Promise<{ isValid: boolean; validEstados: string[]; invalidEstados: string[]; error?: string }> {
  try {
    const { data: estados, error } = await supabaseAdmin
      .from('estados_remitos')
      .select('name')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .in('name', estadosNames);

    if (error) {
      return {
        isValid: false,
        validEstados: [],
        invalidEstados: estadosNames,
        error: 'Error al validar los estados.'
      };
    }

    const validEstados = (estados || []).map(e => e.name);
    const invalidEstados = estadosNames.filter(name => !validEstados.includes(name));

    return {
      isValid: invalidEstados.length === 0,
      validEstados,
      invalidEstados
    };
  } catch (error) {
    console.error('Error validating estados:', error);
    return {
      isValid: false,
      validEstados: [],
      invalidEstados: estadosNames,
      error: 'Error al validar los estados.'
    };
  }
}
