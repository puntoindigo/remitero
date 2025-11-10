import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformUser } from "@/lib/utils/supabase-transform";
import bcrypt from "bcryptjs";
import { logUserActivity } from "@/lib/user-activity-logger";

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
    } else if (session.user.role === 'USER') {
      // USER solo puede ver su propio perfil
      if (userId !== session.user.id) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "No tienes permisos para ver otros usuarios." 
        }, { status: 403 });
      }
    } else {
      // Rol desconocido
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
        updated_at,
        is_active,
        enable_botonera,
        enable_pinned_modals
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
    const { name, email, password, role, address, phone, companyId, enableBotonera, enablePinnedModals, isActive } = body;

    // Verificar que el usuario existe y obtener su company_id y rol
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, company_id, role')
      .eq('id', userId)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ 
        error: "Usuario no encontrado",
        message: "El usuario solicitado no existe."
      }, { status: 404 });
    }

    // Verificar permisos de edición
    const isEditingOwnProfile = session.user.id === userId;
    
    if (session.user.role === 'SUPERADMIN') {
      // SUPERADMIN puede editar cualquier usuario
    } else if (session.user.role === 'ADMIN') {
      // ADMIN solo puede editar usuarios de su propia empresa
      if (existingUser.company_id !== session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "No tienes permisos para editar usuarios de otras empresas." 
        }, { status: 403 });
      }
    } else if (session.user.role === 'USER') {
      // USER solo puede editar su propio perfil
      if (!isEditingOwnProfile) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "No tienes permisos para editar otros usuarios." 
        }, { status: 403 });
      }
      
      // USER no puede cambiar ciertos campos de su perfil
      if (role !== undefined && role !== existingUser.role) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "No puedes cambiar tu rol." 
        }, { status: 403 });
      }
      
      // Solo bloquear si companyId está definido Y es diferente del valor actual
      // Permitir undefined, null, o cadena vacía (que significa "no cambiar")
      if (companyId !== undefined && companyId !== null && companyId !== '' && companyId !== existingUser.company_id) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "No puedes cambiar tu empresa." 
        }, { status: 403 });
      }
      
      if (isActive !== undefined && isActive !== existingUser.is_active) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "No puedes cambiar tu estado de activación." 
        }, { status: 403 });
      }
    } else {
      // Rol desconocido
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para editar usuarios." 
      }, { status: 403 });
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
    
    // Solo permitir cambiar el rol si no es USER o si es SUPERADMIN
    if (role && (session.user.role === 'SUPERADMIN' || (session.user.role === 'ADMIN' && !isEditingOwnProfile))) {
      updateData.role = role;
    }
    
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    
    // Solo permitir cambiar enable_botonera si es el usuario actual o SUPERADMIN
    if (enableBotonera !== undefined && (isEditingOwnProfile || session.user.role === 'SUPERADMIN')) {
      updateData.enable_botonera = enableBotonera;
    }
    
    // Solo permitir cambiar enable_pinned_modals si es el usuario actual o SUPERADMIN
    if (enablePinnedModals !== undefined && (isEditingOwnProfile || session.user.role === 'SUPERADMIN')) {
      updateData.enable_pinned_modals = enablePinnedModals;
    }
    
    // Permitir cambiar is_active solo si no es el propio usuario (no puede desactivarse a sí mismo)
    if (isActive !== undefined && !isEditingOwnProfile) {
      updateData.is_active = isActive;
      // Registrar actividad
      await logUserActivity(
        session.user.id,
        isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        isActive ? `Activó usuario ${userId}` : `Desactivó usuario ${userId}`,
        { targetUserId: userId }
      );
    }
    
    // Manejar companyId según el rol
    if (session.user.role === 'SUPERADMIN') {
      // SUPERADMIN puede cambiar companyId libremente
      // Convertir cadena vacía a null para evitar error de UUID
      if (companyId !== undefined && companyId !== null && companyId !== '') {
        updateData.company_id = companyId;
      } else if (companyId === '' || companyId === null) {
        // Permitir establecer a null explícitamente
        updateData.company_id = null;
      }
      // Si companyId es undefined, no actualizar (mantener el valor actual)
    } else if (session.user.role === 'ADMIN') {
      // ADMIN no puede cambiar el companyId, siempre debe ser su propia empresa
      // Si el usuario ya pertenece a otra empresa, no permitir el cambio
      if (companyId !== undefined && companyId !== '' && companyId !== null && companyId !== session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "No puedes asignar usuarios a otras empresas." 
        }, { status: 403 });
      }
      // Forzar el uso de la empresa del ADMIN solo si el usuario no tiene empresa
      if (!existingUser.company_id) {
        updateData.company_id = session.user.companyId;
      }
      // Si companyId es undefined, null o '', no actualizar (mantener el valor actual)
    } else if (session.user.role === 'USER') {
      // USER no puede cambiar companyId - no agregar al updateData
      // La validación ya se hizo arriba, aquí solo nos aseguramos de no actualizarlo
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

    // Verificar que hay algo que actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: "Sin cambios",
        message: "No se proporcionaron datos para actualizar."
      }, { status: 400 });
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
        updated_at,
        is_active,
        enable_botonera,
        enable_pinned_modals
      `)
      .single();

    if (error) {
      console.error('Error updating user:', error);
      console.error('Update data:', updateData);
      console.error('User ID:', userId);
      console.error('Session user ID:', session.user.id);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: error.message || "No se pudo actualizar el usuario."
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
