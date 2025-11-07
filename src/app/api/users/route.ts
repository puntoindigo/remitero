import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformUsers, transformUser } from "@/lib/utils/supabase-transform";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";
import { getLastUserActivity, getActionDescription, logUserActivity } from "@/lib/user-activity-logger";
import { sendInvitationEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Obtener companyId de los query parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const countToday = searchParams.get('countToday') === 'true';

    // Incluir JOIN con companies para obtener el nombre de la empresa
    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        address,
        phone,
        company_id,
        created_at,
        updated_at,
        is_active,
        companies (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros según el rol y parámetros
    console.log('Filtering logic:', {
      userRole: session.user.role,
      companyId,
      userCompanyId: session.user.companyId
    });

    if (countToday) {
      // Si solo necesitamos el conteo de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let countQuery = supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (session.user.role === 'SUPERADMIN') {
        if (companyId) {
          countQuery = countQuery.eq('company_id', companyId);
        }
      } else {
        if (!session.user.companyId) {
          return NextResponse.json({ 
            error: "No autorizado", 
            message: "Usuario no asociado a una empresa." 
          }, { status: 401 });
        }
        countQuery = countQuery.eq('company_id', session.user.companyId);
      }

      const { count, error } = await countQuery;
      
      if (error) {
        console.error('Error counting users today:', error);
        return NextResponse.json({ error: "Error al contar usuarios" }, { status: 500 });
      }

      return NextResponse.json({ count: count || 0 });
    }

    // USER no puede acceder a esta ruta
    if (session.user.role === 'OPERADOR') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para ver usuarios." 
      }, { status: 403 });
    }

    if (session.user.role === 'SUPERADMIN') {
      // SUPERADMIN puede ver todos los usuarios o filtrar por empresa
      if (companyId) {
        console.log('SUPERADMIN filtering by company:', companyId);
        query = query.eq('company_id', companyId);
      } else {
        console.log('SUPERADMIN showing all users');
      }
    } else {
      // ADMIN solo puede ver usuarios de su empresa
      if (!session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "Usuario no asociado a una empresa." 
        }, { status: 401 });
      }
      console.log('ADMIN filtering by user company:', session.user.companyId);
      query = query.eq('company_id', session.user.companyId);
    }

    // Si el usuario actual no es SUPERADMIN, excluir usuarios SUPERADMIN de los resultados
    if (session.user.role !== 'SUPERADMIN') {
      query = query.neq('role', 'SUPERADMIN');
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar los usuarios."
      }, { status: 500 });
    }

    // Obtener último estado de actividad para cada usuario
    const usersWithLastActivity = await Promise.all(
      (users || []).map(async (user: any) => {
        let lastActivity = null;
        try {
          const activity = await getLastUserActivity(user.id);
          if (activity) {
            lastActivity = {
              action: activity.action,
              description: activity.description || getActionDescription(activity.action, activity.metadata as any),
              createdAt: activity.created_at
            };
          }
        } catch (activityError: any) {
          // Si falla obtener la actividad, continuar sin ella (no crítico)
          console.warn(`⚠️ [Users] Error al obtener actividad para usuario ${user.id}:`, activityError.message);
        }
        
        return {
          ...user,
          companies: user.companies || (user.company_id ? { id: user.company_id, name: null } : null),
          lastActivity
        };
      })
    );

    return NextResponse.json(transformUsers(usersWithLastActivity));
  } catch (error: any) {
    console.error('Error in users GET:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Solo SUPERADMIN y ADMIN pueden crear usuarios
    if (!['SUPERADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para crear usuarios." 
      }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, role, companyId } = body;

    // Validaciones básicas
    if (!email || !role) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "Email y rol son requeridos." 
      }, { status: 400 });
    }

    // Si el email no tiene @, autocompletarlo a @gmail.com
    let finalEmail = email;
    if (!finalEmail.includes('@')) {
      finalEmail = `${finalEmail.trim()}@gmail.com`;
    }
    
    // Detectar si es Gmail
    const isGmail = finalEmail.toLowerCase().endsWith('@gmail.com') || finalEmail.toLowerCase().endsWith('@googlemail.com');
    
    // Si no es Gmail, requerir contraseña
    if (!isGmail && (!password || password.length < 6)) {
      return NextResponse.json({ 
        error: "Contraseña inválida", 
        message: "La contraseña es requerida y debe tener al menos 6 caracteres para emails no Gmail." 
      }, { status: 400 });
    }
    
    // Extraer nombre automáticamente desde el email
    const localPart = finalEmail.split('@')[0];
    let finalName: string;
    const parts = localPart.split(/[._]/);
    if (parts.length >= 2) {
      finalName = parts.map((part: string) => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join(' ');
    } else {
      finalName = localPart.charAt(0).toUpperCase() + localPart.slice(1).toLowerCase();
    }

    // Verificar que el email no exista
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', finalEmail)
      .single();

    if (existingUser) {
      return NextResponse.json({ 
        error: "Email en uso", 
        message: "Ya existe un usuario con este email." 
      }, { status: 409 });
    }

    // Hash de la contraseña solo si se proporcionó (no requerida para Gmail)
    let hashedPassword: string | null = null;
    if (password && password.length > 0) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Determinar companyId
    // ADMIN siempre debe usar su propia empresa, no puede asignar usuarios a otras empresas
    let finalCompanyId = companyId;
    if (session.user.role === 'ADMIN') {
      if (!session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "Usuario no asociado a una empresa." 
        }, { status: 401 });
      }
      // Forzar el uso de la empresa del ADMIN, ignorar cualquier companyId proporcionado
      finalCompanyId = session.user.companyId;
    }

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([{
        name: finalName,
        email: finalEmail,
        password: hashedPassword, // null para Gmail sin contraseña
        role,
        company_id: finalCompanyId,
        is_active: true // Por defecto, todos los usuarios nuevos están activos
      }])
      .select(`
        id,
        name,
        email,
        role,
        address,
        phone,
        company_id,
        created_at,
        is_active,
        companies (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('❌ [Users] Error creating user:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: error.message || "No se pudo crear el usuario."
      }, { status: 500 });
    }

    if (!newUser) {
      console.error('❌ [Users] Usuario creado pero newUser es null');
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "El usuario se creó pero no se pudo recuperar."
      }, { status: 500 });
    }

    console.log('✅ [Users] User created successfully:', { 
      id: newUser?.id, 
      name: newUser?.name, 
      email: newUser?.email,
      company_id: newUser.company_id,
      role: newUser.role
    });

    // Log de creación de usuario (no crítico)
    try {
      logger.logCreate(
        {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role
        },
        'Usuario',
        newUser?.id,
        `Usuario: ${newUser?.name} (${newUser?.email}) - Rol: ${newUser.role}`
      );
    } catch (logError: any) {
      console.warn('⚠️ [Users] Error en logger.logCreate (no crítico):', logError.message);
    }

    // Registrar actividad (no crítico)
    try {
      await logUserActivity(
        session.user.id,
        'CREATE_USER',
        `Creó usuario ${newUser?.name} (${newUser?.email})`,
        { targetUserId: newUser?.id }
      );
    } catch (activityError: any) {
      console.warn('⚠️ [Users] Error al registrar actividad (no crítico):', activityError.message);
    }

    // Enviar email de invitación al nuevo usuario
    try {
      const loginUrl = process.env.NEXTAUTH_URL 
        ? `${process.env.NEXTAUTH_URL.replace(/\/$/, '')}/auth/login`
        : 'https://remitero-dev.vercel.app/auth/login';
      
      console.log('📧 [Users] Intentando enviar email de invitación a:', finalEmail);
      
      const emailSent = await sendInvitationEmail({
        to: finalEmail,
        userName: finalName,
        userEmail: finalEmail,
        role: newUser.role,
        loginUrl
      });
      
      if (emailSent) {
        console.log('✅ [Users] Email de invitación enviado exitosamente a:', finalEmail);
      } else {
        console.warn('⚠️ [Users] No se pudo enviar el email de invitación a:', finalEmail);
        console.warn('⚠️ [Users] El usuario fue creado correctamente, pero el email no se envió');
        console.warn('⚠️ [Users] Revisa los logs anteriores para ver el error específico');
      }
    } catch (emailError: any) {
      // No fallar la creación del usuario si el email falla, solo loguear el error
      console.error('❌ [Users] Excepción al enviar email de invitación (no crítico):', {
        error: emailError.message,
        stack: emailError.stack,
        to: finalEmail
      });
      console.error('⚠️ [Users] El usuario fue creado correctamente, pero el email falló');
    }

    // Transformar y retornar el usuario creado
    try {
      const transformedUser = transformUser(newUser);
      if (!transformedUser) {
        console.error('❌ [Users] Error al transformar usuario:', newUser);
        return NextResponse.json({ 
          error: "Error interno del servidor",
          message: "No se pudo procesar el usuario creado."
        }, { status: 500 });
      }
      return NextResponse.json(transformedUser, { status: 201 });
    } catch (transformError: any) {
      console.error('❌ [Users] Error al transformar usuario:', {
        error: transformError.message,
        stack: transformError.stack,
        newUser
      });
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "El usuario se creó pero hubo un error al procesarlo."
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ [Users] Error in users POST:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: error.message || "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
