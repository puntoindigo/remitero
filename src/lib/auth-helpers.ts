import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Obtiene el companyId correcto considerando impersonation
 * Si hay impersonation activa, retorna el companyId del usuario impersonado
 * Si no hay impersonation, retorna el companyId del usuario de la sesión
 */
export async function getEffectiveCompanyId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  // Si hay impersonation activa, usar el companyId del usuario impersonado
  // Esto se maneja en el frontend con localStorage, pero en el backend
  // necesitamos una forma de obtener esta información
  
  // Por ahora, retornamos el companyId de la sesión
  // En el futuro, podríamos pasar el companyId como header o query param
  return session.user.companyId || null;
}

/**
 * Obtiene el rol efectivo considerando impersonation
 */
export async function getEffectiveRole(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  // Por ahora, retornamos el rol de la sesión
  // En el futuro, podríamos manejar impersonation en el backend
  return session.user.role || null;
}

/**
 * Verifica si el usuario actual puede acceder a datos de una empresa específica
 */
export async function canAccessCompany(companyId: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return false;
  }

  // SUPERADMIN puede acceder a cualquier empresa
  if (session.user.role === 'SUPERADMIN') {
    return true;
  }

  // Otros usuarios solo pueden acceder a su propia empresa
  return session.user.companyId === companyId;
}
