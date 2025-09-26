import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    const userId = params.id;

    // Solo SUPERADMIN puede ver cualquier usuario
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para ver este usuario." 
      }, { status: 403 });
    }

    const { data: user, error } = await supabaseAdmin
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
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ 
        error: "Usuario no encontrado",
        message: "El usuario solicitado no existe."
      }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error in users GET by ID:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    const userId = params.id;
    const body = await request.json();
    const { name, email, password, role, address, phone, companyId } = body;

    // Solo SUPERADMIN puede editar cualquier usuario
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para editar este usuario." 
      }, { status: 403 });
    }

    // Verificar que el usuario existe
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ 
        error: "Usuario no encontrado",
        message: "El usuario solicitado no existe."
      }, { status: 404 });
    }

    // Verificar que el email no esté en uso por otro usuario
    if (email && email !== existingUser.email) {
      const { data: emailUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', userId)
        .single();

      if (emailUser) {
        return NextResponse.json({ 
          error: "Email en uso", 
          message: "Ya existe otro usuario con este email." 
        }, { status: 409 });
      }
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (companyId !== undefined) updateData.company_id = companyId;

    // Hash de la contraseña si se proporciona
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return NextResponse.json({ 
          error: "Contraseña inválida", 
          message: "La contraseña debe tener al menos 6 caracteres." 
        }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
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
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar el usuario."
      }, { status: 500 });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error in users PUT:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    const userId = params.id;

    // Solo SUPERADMIN puede eliminar usuarios
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para eliminar usuarios." 
      }, { status: 403 });
    }

    // No permitir que un SUPERADMIN se elimine a sí mismo
    if (session.user.id === userId) {
      return NextResponse.json({ 
        error: "Operación no permitida", 
        message: "No puedes eliminar tu propia cuenta." 
      }, { status: 400 });
    }

    // Verificar que el usuario existe
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ 
        error: "Usuario no encontrado",
        message: "El usuario solicitado no existe."
      }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo eliminar el usuario."
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Usuario eliminado correctamente",
      success: true 
    });
  } catch (error: any) {
    console.error('Error in users DELETE:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
