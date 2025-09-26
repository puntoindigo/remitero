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
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        stock,
        created_at,
        updated_at,
        company_id,
        category_id,
        categories (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    // Solo SUPERADMIN puede ver productos de todas las empresas
    if (session.user.role !== 'SUPERADMIN') {
      if (!session.user.companyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "Usuario no asociado a una empresa." 
        }, { status: 401 });
      }
      query = query.eq('company_id', session.user.companyId);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar los productos."
      }, { status: 500 });
    }

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error in products GET:', error);
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

    // Verificar que el usuario tenga companyId (excepto SUPERADMIN)
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, stock, categoryId, companyId } = body;

    // Validaciones básicas
    if (!name || !price) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "Nombre y precio son requeridos." 
      }, { status: 400 });
    }

    if (price <= 0) {
      return NextResponse.json({ 
        error: "Precio inválido", 
        message: "El precio debe ser mayor a 0." 
      }, { status: 400 });
    }

    // Determinar companyId
    let finalCompanyId = companyId;
    if (session.user.role !== 'SUPERADMIN' && !companyId) {
      finalCompanyId = session.user.companyId;
    }

    // Verificar que no exista un producto con el mismo nombre en la empresa
    const { data: existingProduct } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('company_id', finalCompanyId)
      .eq('name', name)
      .single();

    if (existingProduct) {
      return NextResponse.json({ 
        error: "Producto duplicado", 
        message: "Ya existe un producto con este nombre en la empresa." 
      }, { status: 409 });
    }

    const { data: newProduct, error } = await supabaseAdmin
      .from('products')
      .insert([{
        name,
        description,
        price: parseFloat(price),
        stock: stock || 'OUT_OF_STOCK',
        category_id: categoryId || null,
        company_id: finalCompanyId
      }])
      .select(`
        id,
        name,
        description,
        price,
        stock,
        created_at,
        updated_at,
        company_id,
        category_id,
        categories (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo crear el producto."
      }, { status: 500 });
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error in products POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
