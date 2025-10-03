import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que hay una impersonation activa
    if (!session.impersonation?.isActive) {
      return NextResponse.json({ error: 'No hay impersonation activa' }, { status: 400 });
    }

    // Restaurar sesión original del admin
    const originalSession = {
      user: {
        id: session.user.originalAdmin?.id,
        name: session.user.originalAdmin?.name,
        email: session.user.originalAdmin?.email,
        rol: session.user.originalAdmin?.rol,
        companyId: session.user.originalAdmin?.companyId,
        companyName: session.user.originalAdmin?.companyName
      },
      impersonation: {
        isActive: false
      }
    };

    console.log(`[IMPERSONATION] Admin ${session.user.originalAdmin?.name} detuvo impersonation de ${session.user.name}`);

    return NextResponse.json({ 
      success: true, 
      message: `Volviste a tu cuenta como ${session.user.originalAdmin?.name}`,
      session: originalSession
    });

  } catch (error) {
    console.error('Error al detener impersonation:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
