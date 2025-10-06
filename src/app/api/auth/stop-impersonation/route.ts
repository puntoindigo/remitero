import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Como usamos localStorage para impersonation, simplemente confirmamos que el admin puede detener
    // La lógica real de detener impersonation se maneja en el frontend
    console.log(`[IMPERSONATION] Admin ${session.user.name} solicitó detener impersonation`);

    return NextResponse.json({ 
      success: true, 
      message: `Impersonation detenida correctamente`,
      session: {
        user: session.user,
        impersonation: {
          isActive: false
        }
      }
    });

  } catch (error) {
    console.error('Error al detener impersonation:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
