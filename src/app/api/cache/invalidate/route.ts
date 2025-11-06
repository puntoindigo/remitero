import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cacheManager } from "@/lib/cache-manager";
import { invalidateCacheByTag, invalidateCachePattern } from "@/middleware/cache";

/**
 * API para invalidar caché manualmente
 * Solo para ADMIN y SUPERADMIN
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo ADMIN y SUPERADMIN pueden invalidar caché
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { type, key, pattern, tag } = body;

    if (type === 'key' && key) {
      cacheManager.invalidate(key);
      return NextResponse.json({ success: true, message: `Caché invalidado: ${key}` });
    }

    if (type === 'pattern' && pattern) {
      invalidateCachePattern(pattern);
      return NextResponse.json({ success: true, message: `Caché invalidado por patrón: ${pattern}` });
    }

    if (type === 'tag' && tag) {
      invalidateCacheByTag(tag);
      return NextResponse.json({ success: true, message: `Caché invalidado por tag: ${tag}` });
    }

    if (type === 'all') {
      cacheManager.clear();
      return NextResponse.json({ success: true, message: 'Todo el caché ha sido limpiado' });
    }

    return NextResponse.json({ error: "Tipo de invalidación no válido" }, { status: 400 });
  } catch (error) {
    console.error('Error invalidando caché:', error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * GET: Obtener estadísticas del caché
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo ADMIN y SUPERADMIN pueden ver estadísticas
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const stats = cacheManager.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

