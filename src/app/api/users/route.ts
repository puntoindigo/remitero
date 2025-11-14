import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformUsers, transformUser } from "@/lib/utils/supabase-transform";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";
import { getLastUserActivity, getLastUserActivitiesForUsers, getActionDescription, logUserActivity } from "@/lib/user-activity-logger";
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
    let companyId = searchParams.get('companyId');
    const countToday = searchParams.get('countToday') === 'true';
    
    // Si el usuario no es SUPERADMIN y no se pasó companyId, usar el de la sesión
    // Los usuarios no SUPERADMIN ya están vinculados a una empresa
    if (session.user.role !== 'SUPERADMIN' && !companyId && session.user.companyId) {
      companyId = session.user.companyId;
    }

    // Obtener usuarios sin JOIN (evita problemas con foreign keys en schema dev)
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
        is_active
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
    if (session.user.role === 'USER') {
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

    // OPTIMIZADO: Obtener todas las actividades en una sola query en lugar de N queries
    const userIds = (users || []).map((u: any) => u.id);
    const activitiesMap = await getLastUserActivitiesForUsers(userIds);
    
    // Obtener nombres de empresas para usuarios que tienen company_id
    const companyIds = [...new Set((users || []).filter((u: any) => u.company_id).map((u: any) => u.company_id))];
    const companiesMap = new Map<string, { id: string; name: string }>();
    
    if (companyIds.length > 0) {
      try {
        const { data: companies, error: companiesError } = await supabaseAdmin
          .from('companies')
          .select('id, name')
          .in('id', companyIds);
        
        if (!companiesError && companies) {
          companies.forEach((company: any) => {
            companiesMap.set(company.id, { id: company.id, name: company.name });
          });
        }
      } catch (companiesError) {
        console.warn('⚠️ [Users] Error obteniendo empresas (no crítico):', companiesError);
      }
    }
    
    // Mapear usuarios con sus actividades y empresas
    const usersWithLastActivity = (users || []).map((user: any) => {
      const activity = activitiesMap.get(user.id);
      let lastActivity = null;
      
      if (activity) {
        lastActivity = {
          action: activity.action,
          description: activity.description || getActionDescription(activity.action, activity.metadata as any),
          createdAt: activity.created_at
        };
      }
      
      // Obtener empresa del map
      const company = user.company_id ? companiesMap.get(user.company_id) : null;
      
      return {
        ...user,
        companies: company || (user.company_id ? { id: user.company_id, name: null } : null),
        lastActivity
      };
    });

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
    const { name, email, password, role, companyId } = body;
    
    // Normalizar password: tratar string vacío como null/undefined
    const normalizedPassword = (password && password.trim().length > 0) ? password.trim() : null;

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
    
    // Si no es Gmail, requerir contraseña (solo si se proporciona explícitamente)
    // Si no se proporciona, se generará una temporal automáticamente
    if (!isGmail && normalizedPassword && normalizedPassword.length < 6) {
      return NextResponse.json({ 
        error: "Contraseña inválida", 
        message: "La contraseña debe tener al menos 6 caracteres." 
      }, { status: 400 });
    }
    
    // Usar el nombre proporcionado, o generar desde el email si no se proporciona
    let finalName: string;
    if (name && name.trim() !== '') {
      finalName = name.trim();
    } else {
      // Extraer nombre automáticamente desde el email solo si no se proporciona
      const localPart = finalEmail.split('@')[0];
      const parts = localPart.split(/[._]/);
      if (parts.length >= 2) {
        finalName = parts.map((part: string) => 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ');
      } else {
        finalName = localPart.charAt(0).toUpperCase() + localPart.slice(1).toLowerCase();
      }
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

    // isGmail ya está declarado arriba (línea 232), reutilizamos esa variable
    
    // Hash de la contraseña solo si se proporcionó (no requerida para Gmail)
    let hashedPassword: string | null = null;
    let tempPassword: string | null = null;
    let hasTemporaryPassword = false;
    
    if (isGmail) {
      // Gmail no necesita contraseña
      hashedPassword = null;
      hasTemporaryPassword = false;
      tempPassword = null; // Gmail no tiene contraseña temporal
    } else {
      // Para no-Gmail, SIEMPRE usar contraseña temporal
      // Si se proporciona contraseña, usarla pero marcarla como temporal
      // Si NO se proporciona, generar una automáticamente
      if (normalizedPassword && normalizedPassword.length > 0) {
        // Usuario proporcionó contraseña - usarla pero marcarla como temporal
        tempPassword = normalizedPassword; // Guardar la contraseña para incluirla en el email
        hashedPassword = await bcrypt.hash(normalizedPassword, 10);
        hasTemporaryPassword = true; // SIEMPRE temporal para no-Gmail
        console.log('🔑 [Users] Contraseña proporcionada por usuario (será temporal):', {
          email: finalEmail,
          isGmail: false,
          hasTempPassword: !!tempPassword,
          tempPasswordLength: tempPassword?.length,
          tempPasswordValue: tempPassword ? `${tempPassword.substring(0, 2)}***` : null,
          tempPasswordFull: tempPassword // Log completo para debug (solo en servidor)
        });
      } else {
        // Generar contraseña temporal aleatoria (8 caracteres alfanuméricos)
        const crypto = await import('crypto');
        tempPassword = crypto.randomBytes(4).toString('hex');
        hashedPassword = await bcrypt.hash(tempPassword, 10);
        hasTemporaryPassword = true;
        console.log('🔑 [Users] Contraseña temporal generada automáticamente para usuario no-Gmail:', {
          email: finalEmail,
          isGmail: false,
          hasTempPassword: !!tempPassword,
          tempPasswordLength: tempPassword?.length,
          tempPasswordValue: tempPassword ? `${tempPassword.substring(0, 2)}***` : null,
          tempPasswordFull: tempPassword // Log completo para debug (solo en servidor)
        });
      }
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
    
    // Convertir cadena vacía a null para evitar error de UUID
    if (finalCompanyId === '' || finalCompanyId === null) {
      finalCompanyId = null;
    }

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([{
        name: finalName,
        email: finalEmail,
        password: hashedPassword, // null para Gmail sin contraseña
        role,
        company_id: finalCompanyId,
        is_active: true, // Por defecto, todos los usuarios nuevos están activos
        has_temporary_password: hasTemporaryPassword // Marcar contraseña temporal
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
        is_active
      `)
      .single();
    
    // Obtener empresa si el usuario tiene company_id
    if (newUser && newUser.company_id) {
      try {
        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('id, name')
          .eq('id', newUser.company_id)
          .single();
        
        if (company) {
          (newUser as any).companies = { id: company.id, name: company.name };
        }
      } catch (companyError) {
        console.warn('⚠️ [Users] Error obteniendo empresa para nuevo usuario (no crítico):', companyError);
      }
    }

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
      // URL directa a login para usuarios no-Google
      const loginUrl = process.env.NEXTAUTH_URL 
        ? process.env.NEXTAUTH_URL.replace(/\/$/, '')
        : 'https://remitero-dev.vercel.app';
      
      console.log('📧 [Users] Intentando enviar email de invitación a:', finalEmail);
      console.log('📧 [Users] Estado de tempPassword ANTES de procesar:', {
        tempPasswordType: typeof tempPassword,
        tempPasswordValue: tempPassword,
        tempPasswordIsNull: tempPassword === null,
        tempPasswordIsUndefined: tempPassword === undefined,
        tempPasswordLength: tempPassword?.length || 0,
        isGmail,
        hasTemporaryPassword
      });
      
      console.log('📧 [Users] Parámetros del email:', {
        isGmail,
        hasTempPassword: !!tempPassword,
        tempPasswordLength: tempPassword?.length || 0,
        tempPasswordValue: tempPassword ? `${tempPassword.substring(0, 2)}***` : null,
        tempPasswordFull: tempPassword, // Log completo para debug (solo en servidor)
        willShowInEmail: !isGmail && !!tempPassword && tempPassword.trim().length > 0
      });
      
      // Asegurar que tempPassword no sea string vacío
      const finalTempPassword = (tempPassword && typeof tempPassword === 'string' && tempPassword.trim().length > 0) ? tempPassword.trim() : null;
      
      console.log('📧 [Users] Estado de finalTempPassword DESPUÉS de procesar:', {
        finalTempPasswordType: typeof finalTempPassword,
        finalTempPasswordValue: finalTempPassword,
        finalTempPasswordIsNull: finalTempPassword === null,
        finalTempPasswordLength: finalTempPassword?.length || 0
      });
      
      const emailSent = await sendInvitationEmail({
        to: finalEmail,
        userName: finalName,
        userEmail: finalEmail,
        role: newUser.role,
        loginUrl,
        isGmail,
        tempPassword: finalTempPassword
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
