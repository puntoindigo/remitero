import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo ADMIN puede impersonar
    console.log('🔍 Session user role:', session.user.role, 'Type:', typeof session.user.role);
    if (session.user.role !== 'ADMIN') {
      console.log('❌ User role is not ADMIN:', session.user.role);
      return NextResponse.json({ error: 'Solo administradores pueden impersonar usuarios' }, { status: 403 });
    }

    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    // No permitir impersonar a sí mismo
    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: 'No puedes impersonar tu propia cuenta' }, { status: 400 });
    }

    // Obtener datos del usuario objetivo
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role, company_id, companies(name)')
      .eq('id', targetUserId)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Crear sesión de impersonation
    const impersonationSession = {
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        companyId: targetUser.company_id,
        companyName: targetUser.companies?.name || null,
        // Guardar datos del admin original
        originalAdmin: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
          companyId: session.user.companyId,
          companyName: session.user.companyName
        }
      },
      impersonation: {
        isActive: true,
        originalUserId: session.user.id,
        originalUserName: session.user.name,
        originalUserEmail: session.user.email,
        startedAt: new Date().toISOString()
      }
    };

    // Registrar en audit log (opcional, si tienes tabla de auditoría)
    console.log(`[IMPERSONATION] Admin ${session.user.name} (${session.user.email}) impersonando a ${targetUser.name} (${targetUser.email})`);

    return NextResponse.json({ 
      success: true, 
      message: `Ahora estás entrando como ${targetUser.name}`,
      session: impersonationSession
    });

  } catch (error) {
    console.error('Error en impersonation:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
