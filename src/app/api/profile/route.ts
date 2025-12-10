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
        has_temporary_password,
        pagination_items_per_page
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
      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .select('name')
        .eq('id', user.company_id)
        .single();
      
      if (!companyError && company) {
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
      paginationItemsPerPage: user.pagination_items_per_page || 10
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
  console.log('🔐 [API Profile] PUT request recibido');
  try {
    const session = await getServerSession(authOptions);
    console.log('👤 [API Profile] Sesión obtenida', {
      hasSession: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (!session?.user?.id) {
      console.error('❌ [API Profile] No hay sesión');
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada." 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, oldPassword, password, confirmPassword, enableBotonera, enablePinnedModals, paginationItemsPerPage } = body;
    console.log('📥 [API Profile] Body recibido', {
      hasName: !!name,
      hasEmail: !!email,
      hasPhone: !!phone,
      hasAddress: !!address,
      hasPassword: !!password,
      passwordLength: password?.length,
      hasConfirmPassword: !!confirmPassword
    });

    // Obtener usuario actual para validaciones
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('email, password, has_temporary_password')
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

    // NO permitir cambiar el email desde el perfil (solo admins pueden cambiar emails de otros usuarios)
    // Si se intenta cambiar el email, ignorarlo silenciosamente
    if (email !== undefined && email.trim() !== '' && email !== existingUser.email) {
      console.warn('⚠️ [API Profile] Intento de cambiar email desde perfil, ignorado:', {
        userId: session.user.id,
        currentEmail: existingUser.email,
        attemptedEmail: email.trim()
      });
      // No actualizar el email - el usuario no puede cambiar su propio email
    }

    // Actualizar teléfono si se proporciona
    if (phone !== undefined) {
      updateData.phone = phone.trim() || null;
    }

    // Actualizar dirección si se proporciona
    if (address !== undefined) {
      updateData.address = address.trim() || null;
    }

    // Actualizar enableBotonera si se proporciona
    if (enableBotonera !== undefined) {
      updateData.enable_botonera = enableBotonera === true;
    }

    // Actualizar enablePinnedModals si se proporciona
    if (enablePinnedModals !== undefined) {
      updateData.enable_pinned_modals = enablePinnedModals === true;
    }

    // Actualizar preferencia de paginación (solo para ADMIN y SUPERADMIN)
    if (paginationItemsPerPage !== undefined) {
      const validValues = [10, 25, 50, 100];
      if (validValues.includes(paginationItemsPerPage)) {
        // Solo permitir a ADMIN y SUPERADMIN
        if (session.user.role === 'ADMIN' || session.user.role === 'SUPERADMIN') {
          updateData.pagination_items_per_page = paginationItemsPerPage;
        } else {
          return NextResponse.json({ 
            error: "No autorizado", 
            message: "Solo los administradores pueden cambiar la preferencia de paginación." 
          }, { status: 403 });
        }
      } else {
        return NextResponse.json({ 
          error: "Valor inválido", 
          message: "La preferencia de paginación debe ser 10, 25, 50 o 100." 
        }, { status: 400 });
      }
    }

    // Actualizar contraseña si se proporciona
    let passwordChanged = false;
    if (password && password.trim() !== '') {
      console.log('🔑 [API Profile] Procesando cambio de contraseña', {
        passwordLength: password.length,
        hasOldPassword: !!oldPassword
      });

      // Validar que se proporcione la contraseña anterior (excepto si tiene contraseña temporal)
      if (!existingUser.has_temporary_password) {
        if (!oldPassword || oldPassword.trim() === '') {
          return NextResponse.json({ 
            error: "Contraseña anterior requerida", 
            message: "Debes ingresar tu contraseña actual para cambiarla." 
          }, { status: 400 });
        }

        // Verificar que la contraseña anterior sea correcta
        if (existingUser.password) {
          const isOldPasswordValid = await bcrypt.compare(oldPassword.trim(), existingUser.password);
          if (!isOldPasswordValid) {
            return NextResponse.json({ 
              error: "Contraseña incorrecta", 
              message: "La contraseña actual no es correcta." 
            }, { status: 400 });
          }
        }
      }

      if (password.length < 6) {
        console.warn('⚠️ [API Profile] Contraseña muy corta');
        return NextResponse.json({ 
          error: "Contraseña inválida", 
          message: "La contraseña debe tener al menos 6 caracteres." 
        }, { status: 400 });
      }

      if (password !== confirmPassword) {
        console.warn('⚠️ [API Profile] Contraseñas no coinciden');
        return NextResponse.json({ 
          error: "Contraseñas no coinciden", 
          message: "Las contraseñas no coinciden." 
        }, { status: 400 });
      }

      console.log('🔐 [API Profile] Hasheando contraseña...');
      updateData.password = await bcrypt.hash(password, 10);
      passwordChanged = true;
      // Si se cambia la contraseña, limpiar el flag de temporal
      updateData.has_temporary_password = false;
      console.log('✅ [API Profile] Contraseña hasheada, passwordChanged = true, has_temporary_password = false');
    }

    // Verificar que hay algo que actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: "Sin cambios",
        message: "No se proporcionaron datos para actualizar."
      }, { status: 400 });
    }

    // Actualizar usuario
    console.log('💾 [API Profile] Actualizando usuario en BD', {
      userId: session.user.id,
      updateFields: Object.keys(updateData),
      passwordChanged
    });

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
        has_temporary_password,
        pagination_items_per_page
      `)
      .single();

    if (updateError) {
      console.error('❌ [API Profile] Error actualizando usuario:', updateError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: updateError.message || "No se pudo actualizar el perfil."
      }, { status: 500 });
    }

    console.log('✅ [API Profile] Usuario actualizado en BD', {
      userId: updatedUser.id,
      hasTemporaryPassword: updatedUser.has_temporary_password
    });

    // Registrar actividad
    console.log('📝 [API Profile] Registrando actividad', { passwordChanged });
    if (passwordChanged) {
      await logUserActivity(session.user.id, 'PASSWORD_CHANGED', 'Cambió su contraseña', {
        wasTemporary: existingUser.has_temporary_password || false
      });
      console.log('✅ [API Profile] Actividad PASSWORD_CHANGED registrada');
    } else {
      await logUserActivity(session.user.id, 'UPDATE_PROFILE', 'Actualizó su perfil', {
        changedFields: Object.keys(updateData).filter(key => key !== 'password' && key !== 'has_temporary_password')
      });
      console.log('✅ [API Profile] Actividad UPDATE_PROFILE registrada');
    }

    // Obtener nombre de la empresa si existe
    let companyName: string | undefined = undefined;
    if (updatedUser.company_id) {
      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .select('name')
        .eq('id', updatedUser.company_id)
        .single();
      
      if (!companyError && company) {
        companyName = company.name;
      }
    }

    const responseData = {
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
      paginationItemsPerPage: updatedUser.pagination_items_per_page || 10
    };

    console.log('📤 [API Profile] Enviando respuesta exitosa', {
      userId: responseData.id,
      hasTemporaryPassword: responseData.hasTemporaryPassword,
      passwordChanged
    });

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error in profile PUT:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}

