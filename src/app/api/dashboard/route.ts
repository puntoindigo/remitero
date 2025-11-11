import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { withCache } from "@/middleware/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyIdParam = searchParams.get("companyId");

    const effectiveCompanyId = session.user.role === 'SUPERADMIN'
      ? (companyIdParam && companyIdParam !== "" ? companyIdParam : null)
      : session.user.companyId;

    // Para SUPERADMIN, permitir null (todas las empresas)
    // Para otros roles, requerir companyId
    if (!effectiveCompanyId && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: "Empresa no definida" }, { status: 400 });
    }

    // Cargar estados activos para mapear IDs a nombres
    // Si effectiveCompanyId es null (todas las empresas), no filtrar por company_id
    let estadosQuery = supabaseAdmin
      .from('estados_remitos')
      .select('id, name')
      .eq('is_active', true);
    
    if (effectiveCompanyId) {
      estadosQuery = estadosQuery.eq('company_id', effectiveCompanyId);
    }
    
    const { data: estados } = await estadosQuery;

    const estadoMap = new Map<string, string>((estados || []).map((e: any) => [e.id, e.name]));

    // Tiempos para "hoy"
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const startIso = startOfToday.toISOString();

    // Remitos: obtener solo columnas necesarias
    // Si effectiveCompanyId es null (todas las empresas), no filtrar por company_id
    let remitosQuery = supabaseAdmin
      .from('remitos')
      .select('id, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (effectiveCompanyId) {
      remitosQuery = remitosQuery.eq('company_id', effectiveCompanyId);
    }
    
    const { data: remitosData, error: remitosErr } = await remitosQuery;

    if (remitosErr) {
      return NextResponse.json({ error: 'Error remitos' }, { status: 500 });
    }

    const totalRemitos = remitosData?.length || 0;
    const byStatusMap: Record<string, { id: string; name: string; count: number }> = {};
    let todayRemitos = 0;
    
    // Calcular remitos por día (últimos 30 días)
    const daysMap: Record<string, number> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    
    // Inicializar todos los días con 0
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      daysMap[dateKey] = 0;
    }
    
    for (const r of remitosData || []) {
      const id = r.status as string;
      const name = estadoMap.get(id) || 'Desconocido';
      if (!byStatusMap[id]) byStatusMap[id] = { id, name, count: 0 };
      byStatusMap[id].count += 1;
      if (r.created_at >= startIso) todayRemitos += 1;
      
      // Contar por día
      const remitoDate = new Date(r.created_at);
      if (remitoDate >= thirtyDaysAgo) {
        const dateKey = remitoDate.toISOString().split('T')[0];
        if (daysMap[dateKey] !== undefined) {
          daysMap[dateKey] = (daysMap[dateKey] || 0) + 1;
        }
      }
    }
    
    // Convertir a array ordenado para el gráfico
    const remitosByDay = Object.entries(daysMap)
      .map(([date, count]) => ({
        date,
        count,
        label: new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Función helper para construir queries con o sin filtro de company_id
    const buildQuery = (table: string, filters: any[] = []) => {
      let query = supabaseAdmin.from(table).select('id', { count: 'exact', head: true });
      if (effectiveCompanyId) {
        query = query.eq('company_id', effectiveCompanyId);
      }
      filters.forEach(filter => {
        if (filter.type === 'eq') {
          query = query.eq(filter.field, filter.value);
        } else if (filter.type === 'gte') {
          query = query.gte(filter.field, filter.value);
        }
      });
      return query;
    };

    // Conteos simples
    // Solo SUPERADMIN puede ver empresas (no filtrar por company_id)
    const empresasQuery = session.user.role === 'SUPERADMIN'
      ? supabaseAdmin.from('companies').select('id', { count: 'exact', head: true })
      : Promise.resolve({ count: 0 });

    const [clientesCountRes, productosCountRes, productosConStockRes, productosSinStockRes, categoriasCountRes, usuariosCountRes, usuariosTodayRes, clientesTodayRes, productosTodayRes, categoriasTodayRes, empresasCountRes] = await Promise.all([
      buildQuery('clients'),
      buildQuery('products'),
      buildQuery('products', [{ type: 'eq', field: 'stock', value: 'IN_STOCK' }]),
      buildQuery('products', [{ type: 'eq', field: 'stock', value: 'OUT_OF_STOCK' }]),
      buildQuery('categories'),
      buildQuery('users'),
      buildQuery('users', [{ type: 'gte', field: 'created_at', value: startIso }]),
      buildQuery('clients', [{ type: 'gte', field: 'created_at', value: startIso }]),
      buildQuery('products', [{ type: 'gte', field: 'created_at', value: startIso }]),
      buildQuery('categories', [{ type: 'gte', field: 'created_at', value: startIso }]),
      empresasQuery,
    ]);

    const responseBody = {
      remitos: {
        total: totalRemitos,
        byStatus: Object.values(byStatusMap),
        today: todayRemitos,
        byDay: remitosByDay,
      },
      productos: { 
        total: productosCountRes.count || 0, 
        conStock: productosConStockRes.count || 0,
        sinStock: productosSinStockRes.count || 0,
        today: productosTodayRes.count || 0 
      },
      clientes: { total: clientesCountRes.count || 0, today: clientesTodayRes.count || 0 },
      categorias: { total: categoriasCountRes.count || 0, today: categoriasTodayRes.count || 0 },
      usuarios: { total: usuariosCountRes.count || 0, today: usuariosTodayRes.count || 0 },
      empresas: { total: empresasCountRes.count || 0 },
    };

    const res = NextResponse.json(responseBody);
    // Cache en edge/proxy: 30s con revalidación oportuna
    res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return res;
  } catch (err) {
    console.error('Error /api/dashboard:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}


