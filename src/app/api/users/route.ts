import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformUsers, transformUser } from "@/lib/utils/supabase-transform";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

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
        companies (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    // Solo SUPERADMIN puede ver todos los usuarios
    if (session.user.role !== 'SUPERADMIN') {
      if (!session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "Usuario no asociado a una empresa." 
        }, { status: 401 });
      }
      query = query.eq('company_id', session.user.companyId);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar los usuarios."
      }, { status: 500 });
    }

    return NextResponse.json(transformUsers(users));
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
    const { name, email, password, role, address, phone, companyId } = body;

    // Validaciones básicas
    if (!name || !email || !password || !role) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "Nombre, email, contraseña y rol son requeridos." 
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        error: "Contraseña inválida", 
        message: "La contraseña debe tener al menos 6 caracteres." 
      }, { status: 400 });
    }

    // Verificar que el email no exista
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ 
        error: "Email en uso", 
        message: "Ya existe un usuario con este email." 
      }, { status: 409 });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determinar companyId
    let finalCompanyId = companyId;
    if (session.user.role === 'ADMIN' && !companyId) {
      finalCompanyId = session.user.companyId;
    }

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([{
        name,
        email,
        password: hashedPassword,
        role,
        address,
        phone,
        company_id: finalCompanyId
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

    return NextResponse.json(transformUser(newUser), { status: 201 });
  } catch (error: any) {
    console.error('Error in users POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
