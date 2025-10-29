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
    const countToday = searchParams.get('countToday') === 'true';
    

    // Optimización: Sin JOINs innecesarios para máxima velocidad
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
        category_id
      `)
      .order('created_at', { ascending: false });

    // Determinar qué companyId usar
    const effectiveCompanyId = companyId || session.user.companyId;

    if (countToday) {
      // Si solo necesitamos el conteo de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let countQuery = supabaseAdmin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (session.user.role !== 'SUPERADMIN') {
        if (!effectiveCompanyId) {
          return NextResponse.json({ 
            error: "No autorizado", 
            message: "Usuario no asociado a una empresa." 
          }, { status: 401 });
        }
        countQuery = countQuery.eq('company_id', effectiveCompanyId);
      } else if (effectiveCompanyId) {
        countQuery = countQuery.eq('company_id', effectiveCompanyId);
      }

      const { count, error } = await countQuery;
      
      if (error) {
        console.error('Error counting products today:', error);
        return NextResponse.json({ error: "Error al contar productos" }, { status: 500 });
      }

      return NextResponse.json({ count: count || 0 });
    }

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

    // Agregar estructura mínima para categories sin JOIN costoso
    const productsWithCategories = (products || []).map((product: any) => ({
      ...product,
      categories: product.category_id ? { id: product.category_id, name: '' } : null
    }));

    return NextResponse.json(transformProducts(productsWithCategories));
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
        category_id
      `)
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo crear el producto."
      }, { status: 500 });
    }

    // Agregar category structure sin JOIN
    const productWithCategory = {
      ...newProduct,
      categories: newProduct.category_id ? { id: newProduct.category_id, name: '' } : null
    };

    return NextResponse.json(transformProduct(productWithCategory));
  } catch (error: any) {
    console.error('Error in products POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
