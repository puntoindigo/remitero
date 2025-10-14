import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformCategories, transformCategory } from "@/lib/utils/supabase-transform";

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

    let query = supabaseAdmin
      .from('categories')
      .select(`
        id,
        name,
        created_at,
        updated_at,
        company_id,
        companies (
          id,
          name
        ),
        products (
          id
        )
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
        .from('categories')
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
        console.error('Error counting categories today:', error);
        return NextResponse.json({ error: "Error al contar categorías" }, { status: 500 });
      }

      return NextResponse.json({ count: count || 0 });
    }

    // Solo SUPERADMIN puede ver categorías de todas las empresas
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

    const { data: categories, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudieron cargar las categorías."
      }, { status: 500 });
    }

    return NextResponse.json(transformCategories(categories));
  } catch (error: any) {
    console.error('Error in categories GET:', error);
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
    // Durante impersonation, SUPERADMIN puede crear categorías sin companyId en la sesión
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, companyId } = body;

    console.log('Creating category with:', { name, companyId, sessionUser: session.user });

    // Validaciones básicas
    if (!name) {
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "El nombre de la categoría es requerido." 
      }, { status: 400 });
    }

    // Determinar companyId
    let finalCompanyId = companyId;
    if (session.user.role !== 'SUPERADMIN' && !companyId) {
      finalCompanyId = session.user.companyId;
    }

    // Validar que tenemos un companyId válido
    if (!finalCompanyId) {
      console.log('No finalCompanyId found:', { companyId, sessionUserCompanyId: session.user.companyId, role: session.user.role });
      return NextResponse.json({ 
        error: "Datos faltantes", 
        message: "CompanyId es requerido para crear la categoría." 
      }, { status: 400 });
    }

    console.log('Final companyId:', finalCompanyId);

    // Verificar que no exista una categoría con el mismo nombre en la empresa
    const { data: existingCategory } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('company_id', finalCompanyId)
      .eq('name', name)
      .single();

    if (existingCategory) {
      return NextResponse.json({ 
        error: "Categoría duplicada", 
        message: "Ya existe una categoría con este nombre en la empresa." 
      }, { status: 409 });
    }

    const { data: newCategory, error } = await supabaseAdmin
      .from('categories')
      .insert([{
        name,
        company_id: finalCompanyId
      }])
      .select(`
        id,
        name,
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
      console.error('Error creating category:', error);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo crear la categoría."
      }, { status: 500 });
    }

    return NextResponse.json(transformCategory(newCategory), { status: 201 });
  } catch (error: any) {
    console.error('Error in categories POST:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado."
    }, { status: 500 });
  }
}
