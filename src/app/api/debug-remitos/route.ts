import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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
      .from('remitos')
      .select(`
        id,
        number,
        status,
        status_at,
        notes,
        created_at,
        updated_at,
        company_id,
        client_id,
        created_by_id,
        clients (
          id,
          name,
          email,
          phone
        ),
        users (
          id,
          name,
          email
        ),
        remito_items (
          id,
          quantity,
          product_name,
          product_desc,
          unit_price,
          line_total,
          products (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1);

    // Solo SUPERADMIN puede ver remitos de todas las empresas
    if (session.user.role !== 'SUPERADMIN') {
      if (!session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "Usuario no asociado a una empresa." 
        }, { status: 401 });
      }
      query = query.eq('company_id', session.user.companyId);
    }

    const { data: remitos, error } = await query;

    if (error) {
      console.error('Error fetching remitos:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar los remitos.",
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: remitos?.length || 0,
      remitos: remitos,
      debug: {
        firstRemito: remitos?.[0] || null,
        hasRemitoItems: remitos?.[0]?.remito_items ? true : false,
        remitoItemsType: typeof remitos?.[0]?.remito_items,
        remitoItemsLength: remitos?.[0]?.remito_items?.length || 0,
        remitoItemsContent: remitos?.[0]?.remito_items || null
      }
    });
  } catch (error: any) {
    console.error('Error in debug remitos GET:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado.",
      details: error.message
    }, { status: 500 });
  }
}
