import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformUsers, transformUser } from "@/lib/utils/supabase-transform";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";
import { getLastUserActivity, getActionDescription, logUserActivity } from "@/lib/user-activity-logger";

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
        const lastActivity = await getLastUserActivity(user.id);
        return {
          ...user,
          companies: user.companies || (user.company_id ? { id: user.company_id, name: null } : null),
          lastActivity: lastActivity ? {
            action: lastActivity.action,
            description: lastActivity.description || getActionDescription(lastActivity.action, lastActivity.metadata as any),
            createdAt: lastActivity.created_at
          } : null
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
      finalName = parts.map(part => 
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
      console.error('Error creating user:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo crear el usuario."
      }, { status: 500 });
    }

    console.log('User created successfully:', { 
      id: newUser?.id, 
      name: newUser?.name, 
      email: newUser?.email,
      company_id: newUser.company_id,
      role: newUser.role
    });

    // Log de creación de usuario
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

    // Registrar actividad
    await logUserActivity(
      session.user.id,
      'CREATE_USER',
      `Creó usuario ${newUser?.name} (${newUser?.email})`,
      { targetUserId: newUser?.id }
    );

    return NextResponse.json(transformUser(newUser), { status: 201 });
  } catch (error: any) {
    console.error('Error in users POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
