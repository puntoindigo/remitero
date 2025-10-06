import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo SUPERADMIN puede acceder a los logs
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Solo superadministradores pueden acceder a los logs' }, { status: 403 });
    }

    // Obtener los logs
    const logs = logger.getLogs();
    
    // Limpiar logs antiguos
    logger.cleanOldLogs();

    // Log de acceso a los logs
    logger.log({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'ACCESS_LOGS',
      resource: 'Sistema',
      details: 'Descargó archivo de logs'
    });

    // Devolver como archivo de texto
    return new NextResponse(logs, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="user-actions-${new Date().toISOString().split('T')[0]}.log"`
      }
    });

  } catch (error) {
    console.error('Error al obtener logs:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
