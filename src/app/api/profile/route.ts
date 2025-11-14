import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { logUserActivity } from "@/lib/user-activity-logger";

// GET: Obtener perfil del usuario actual
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada." 
      }, { status: 401 });
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
        is_active,
        enable_botonera,
        enable_pinned_modals,
        has_temporary_password
      `)
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo obtener el perfil del usuario."
      }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ 
        error: "No encontrado", 
        message: "Usuario no encontrado." 
      }, { status: 404 });
    }

    // Obtener nombre de la empresa si existe
    let companyName: string | undefined = undefined;
    if (user.company_id) {
      const { data: company } = await supabaseAdmin
        .from('companies')
        .select('name')
        .eq('id', user.company_id)
        .single();
      
      if (company) {
        companyName = company.name;
      }
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address || null,
      phone: user.phone || null,
      company: user.company_id ? { id: user.company_id, name: companyName || '' } : null,
      createdAt: user.created_at,
      is_active: user.is_active,
      enable_botonera: user.enable_botonera ?? false,
      enable_pinned_modals: user.enable_pinned_modals ?? false,
      hasTemporaryPassword: user.has_temporary_password === true,
    });
  } catch (error: any) {
    console.error('Error in profile GET:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

// PUT: Actualizar perfil del usuario actual
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada." 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, password, confirmPassword } = body;

    // Obtener usuario actual para validaciones
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('email, has_temporary_password')
      .eq('id', session.user.id)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo obtener la información del usuario."
      }, { status: 500 });
    }

    const updateData: any = {};

    // Actualizar nombre si se proporciona
    if (name !== undefined && name.trim() !== '') {
      updateData.name = name.trim();
    }

    // Actualizar email si se proporciona y es diferente
    if (email !== undefined && email.trim() !== '' && email !== existingUser.email) {
      // Verificar que el email no esté en uso
      const { data: emailCheck } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email.trim())
        .neq('id', session.user.id)
        .single();

      if (emailCheck) {
        return NextResponse.json({ 
          error: "Email en uso",
          message: "Este email ya está registrado por otro usuario."
        }, { status: 400 });
      }

      updateData.email = email.trim();
    }

    // Actualizar teléfono si se proporciona
    if (phone !== undefined) {
      updateData.phone = phone.trim() || null;
    }

    // Actualizar dirección si se proporciona
    if (address !== undefined) {
      updateData.address = address.trim() || null;
    }

    // Actualizar contraseña si se proporciona
    let passwordChanged = false;
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return NextResponse.json({ 
          error: "Contraseña inválida", 
          message: "La contraseña debe tener al menos 6 caracteres." 
        }, { status: 400 });
      }

      if (password !== confirmPassword) {
        return NextResponse.json({ 
          error: "Contraseñas no coinciden", 
          message: "Las contraseñas no coinciden." 
        }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(password, 10);
      passwordChanged = true;
      // Si se cambia la contraseña, limpiar el flag de temporal
      updateData.has_temporary_password = false;
    }

    // Verificar que hay algo que actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: "Sin cambios",
        message: "No se proporcionaron datos para actualizar."
      }, { status: 400 });
    }

    // Actualizar usuario
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', session.user.id)
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
        enable_pinned_modals,
        has_temporary_password
      `)
      .single();

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: updateError.message || "No se pudo actualizar el perfil."
      }, { status: 500 });
    }

    // Registrar actividad
    if (passwordChanged) {
      await logUserActivity(session.user.id, 'PASSWORD_CHANGED', 'Cambió su contraseña', {
        wasTemporary: existingUser.has_temporary_password || false
      });
    } else {
      await logUserActivity(session.user.id, 'UPDATE_PROFILE', 'Actualizó su perfil', {
        changedFields: Object.keys(updateData).filter(key => key !== 'password' && key !== 'has_temporary_password')
      });
    }

    // Obtener nombre de la empresa si existe
    let companyName: string | undefined = undefined;
    if (updatedUser.company_id) {
      const { data: company } = await supabaseAdmin
        .from('companies')
        .select('name')
        .eq('id', updatedUser.company_id)
        .single();
      
      if (company) {
        companyName = company.name;
      }
    }

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      address: updatedUser.address || null,
      phone: updatedUser.phone || null,
      company: updatedUser.company_id ? { id: updatedUser.company_id, name: companyName || '' } : null,
      createdAt: updatedUser.created_at,
      is_active: updatedUser.is_active,
      enable_botonera: updatedUser.enable_botonera ?? false,
      enable_pinned_modals: updatedUser.enable_pinned_modals ?? false,
      hasTemporaryPassword: updatedUser.has_temporary_password === true,
    });
  } catch (error: any) {
    console.error('Error in profile PUT:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

