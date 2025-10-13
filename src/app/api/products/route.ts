import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformProducts, transformProduct } from "@/lib/utils/supabase-transform";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Obtener companyId de los query parameters (para impersonation)
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    

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

    // Determinar qué companyId usar
    const effectiveCompanyId = companyId || session.user.companyId;

    // Solo SUPERADMIN puede ver productos de todas las empresas
    if (session.user.role !== 'SUPERADMIN') {
      if (!effectiveCompanyId) {
        return NextResponse.json({ 
          error: "No autorizado", 
          message: "Usuario no asociado a una empresa." 
        }, { status: 401 });
      }
      query = query.eq('company_id', effectiveCompanyId);
    } else if (effectiveCompanyId) {
      // SUPERADMIN puede filtrar por empresa específica
      query = query.eq('company_id', effectiveCompanyId);
    }

    const { data: products, error } = await query;
    

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar los productos."
      }, { status: 500 });
    }

    return NextResponse.json(transformProducts(products));
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

    const body = await request.json();
    const { name, description, price, stock, categoryId, companyId } = body;
    
    console.log('Creating product with:', { name, description, price, stock, categoryId, companyId });

    if (!name || !companyId) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El nombre del producto y companyId son requeridos." 
      }, { status: 400 });
    }

    // Verificar que no exista un producto con el mismo nombre en la misma empresa
    const { data: existingProduct } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('name', name)
      .eq('company_id', companyId)
      .single();

    if (existingProduct) {
      return NextResponse.json({ 
        error: "Producto duplicado", 
        message: "Ya existe un producto con este nombre en esta empresa." 
      }, { status: 409 });
    }

    const { data: newProduct, error } = await supabaseAdmin
      .from('products')
      .insert([{
        name,
        description: description || null,
        price: price || 0,
        stock: stock || 'OUT_OF_STOCK',
        category_id: categoryId || null,
        company_id: companyId
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

    return NextResponse.json(transformProduct(newProduct));
  } catch (error: any) {
    console.error('Error in products POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
