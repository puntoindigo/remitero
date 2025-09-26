import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformClient } from "@/lib/utils/supabase-transform";

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

    // Verificar que el usuario tenga companyId (excepto SUPERADMIN)
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    const clientId = params.id;
    const body = await request.json();
    const { name, address, phone, email } = body;

    // Validaciones básicas
    if (!name) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El nombre del cliente es requerido." 
      }, { status: 400 });
    }

    // Verificar que el cliente existe y el usuario tiene acceso
    const { data: existingClient, error: fetchError } = await supabaseAdmin
      .from('clients')
      .select('id, name, company_id')
      .eq('id', clientId)
      .single();

    if (fetchError || !existingClient) {
      return NextResponse.json({ 
        error: "Cliente no encontrado",
        message: "El cliente solicitado no existe o no tienes permisos para acceder a él."
      }, { status: 404 });
    }

    // Verificar autorización para usuarios no SUPERADMIN
    if (session.user.role !== 'SUPERADMIN' && existingClient.company_id !== session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado",
        message: "No tienes permisos para acceder a este cliente."
      }, { status: 403 });
    }

    // Verificar que el nombre no esté en uso por otro cliente de la misma empresa
    if (name !== existingClient.name) {
      const { data: nameClient } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('company_id', existingClient.company_id)
        .eq('name', name)
        .neq('id', clientId)
        .single();

      if (nameClient) {
        return NextResponse.json({ 
          error: "Nombre en uso", 
          message: "Ya existe otro cliente con este nombre en la empresa." 
        }, { status: 409 });
      }
    }

    const { data: updatedClient, error } = await supabaseAdmin
      .from('clients')
      .update({ name, address, phone, email })
      .eq('id', clientId)
      .select(`
        id,
        name,
        address,
        phone,
        email,
        created_at,
        updated_at,
        company_id,
        companies (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo actualizar el cliente."
      }, { status: 500 });
    }

    return NextResponse.json(transformClient(updatedClient));
  } catch (error: any) {
    console.error('Error in clients PUT:', error);
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

    // Verificar que el usuario tenga companyId (excepto SUPERADMIN)
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    const clientId = params.id;

    // Verificar que el cliente existe y el usuario tiene acceso
    const { data: existingClient, error: fetchError } = await supabaseAdmin
      .from('clients')
      .select('id, company_id')
      .eq('id', clientId)
      .single();

    if (fetchError || !existingClient) {
      return NextResponse.json({ 
        error: "Cliente no encontrado",
        message: "El cliente solicitado no existe o no tienes permisos para acceder a él."
      }, { status: 404 });
    }

    // Verificar autorización para usuarios no SUPERADMIN
    if (session.user.role !== 'SUPERADMIN' && existingClient.company_id !== session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado",
        message: "No tienes permisos para eliminar este cliente."
      }, { status: 403 });
    }

    // Verificar si el cliente está siendo usado en remitos
    const { data: remitos } = await supabaseAdmin
      .from('remitos')
      .select('id')
      .eq('client_id', clientId)
      .limit(1);

    if (remitos && remitos.length > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar",
        message: "Este cliente está siendo utilizado en remitos y no puede ser eliminado."
      }, { status: 409 });
    }

    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) {
      console.error('Error deleting client:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo eliminar el cliente."
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Cliente eliminado correctamente",
      success: true 
    });
  } catch (error: any) {
    console.error('Error in clients DELETE:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
