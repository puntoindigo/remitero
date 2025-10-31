import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformUser } from "@/lib/utils/supabase-transform";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    const { id: userId } = await params;

    // Verificar permisos de visualización
    if (session.user.role === 'SUPERADMIN') {
      // SUPERADMIN puede ver cualquier usuario
    } else if (session.user.role === 'ADMIN') {
      // ADMIN solo puede ver usuarios de su propia empresa
      // Verificaremos esto después de obtener el usuario
    } else {
      // USER no puede ver otros usuarios
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para ver usuarios." 
      }, { status: 403 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      // Optimización: Sin JOIN de companies
      .select(`
        id,
        name,
        email,
        role,
        address,
        phone,
        company_id,
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ 
        error: "Usuario no encontrado",
        message: "El usuario solicitado no existe."
      }, { status: 404 });
    }

    // Verificar permisos específicos para ADMIN
    if (session.user.role === 'ADMIN') {
      // ADMIN solo puede ver usuarios de su propia empresa
      if (user.company_id !== session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "No tienes permisos para ver usuarios de otras empresas." 
        }, { status: 403 });
      }
    }

    // Agregar estructura mínima sin JOIN costoso
    const userWithCompany = {
      ...user,
      companies: user.company_id ? { id: user.company_id, name: '' } : null
    };

    return NextResponse.json(transformUser(userWithCompany));
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { name, email, password, role, address, phone, companyId } = body;

    // Verificar permisos de edición
    if (session.user.role === 'SUPERADMIN') {
      // SUPERADMIN puede editar cualquier usuario
    } else if (session.user.role === 'ADMIN') {
      // ADMIN solo puede editar usuarios de su propia empresa
      // Verificaremos esto después de obtener el usuario
    } else {
      // USER no puede editar usuarios
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para editar usuarios." 
      }, { status: 403 });
    }

    // Verificar que el usuario existe y obtener su company_id
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, company_id')
      .eq('id', userId)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ 
        error: "Usuario no encontrado",
        message: "El usuario solicitado no existe."
      }, { status: 404 });
    }

    // Verificar permisos específicos para ADMIN
    if (session.user.role === 'ADMIN') {
      // ADMIN solo puede editar usuarios de su propia empresa
      if (existingUser.company_id !== session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "No tienes permisos para editar usuarios de otras empresas." 
        }, { status: 403 });
      }
    }

    // Verificar que el email no esté en uso por otro usuario
    if (email && email !== existingUser?.email) {
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
    
    // Manejar companyId según el rol
    if (session.user.role === 'SUPERADMIN') {
      // SUPERADMIN puede cambiar companyId libremente
      if (companyId !== undefined) updateData.company_id = companyId;
    } else if (session.user.role === 'ADMIN') {
      // ADMIN no puede cambiar el companyId, siempre debe ser su propia empresa
      // Si el usuario ya pertenece a otra empresa, no permitir el cambio
      if (companyId !== undefined && companyId !== session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "No puedes asignar usuarios a otras empresas." 
        }, { status: 403 });
      }
      // Forzar el uso de la empresa del ADMIN
      if (!existingUser.company_id) {
        updateData.company_id = session.user.companyId;
      }
    }

    // Hash de la contraseña si se proporciona
    if (password && password.trim() !== '') {
      if (password?.length < 6) {
        return NextResponse.json({ 
          error: "Contraseña inválida", 
          message: "La contraseña debe tener al menos 6 caracteres." 
        }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Optimización: Sin JOIN de companies en UPDATE
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
        updated_at
      `)
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar el usuario."
      }, { status: 500 });
    }

    // Agregar estructura mínima sin JOIN costoso
    const userWithCompany = {
      ...updatedUser,
      companies: updatedUser.company_id ? { id: updatedUser.company_id, name: '' } : null
    };

    return NextResponse.json(transformUser(userWithCompany));
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    const { id: userId } = await params;

    // Verificar permisos de eliminación
    if (session.user.role === 'SUPERADMIN') {
      // SUPERADMIN puede eliminar cualquier usuario
    } else if (session.user.role === 'ADMIN') {
      // ADMIN solo puede eliminar usuarios de su propia empresa
      // Verificaremos esto después de obtener el usuario
    } else {
      // USER no puede eliminar usuarios
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

    // Verificar que el usuario existe y obtener su company_id
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, role, company_id')
      .eq('id', userId)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ 
        error: "Usuario no encontrado",
        message: "El usuario solicitado no existe."
      }, { status: 404 });
    }

    // Verificar permisos específicos para ADMIN
    if (session.user.role === 'ADMIN') {
      // ADMIN solo puede eliminar usuarios de su propia empresa
      if (existingUser.company_id !== session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "No tienes permisos para eliminar usuarios de otras empresas." 
        }, { status: 403 });
      }
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
