import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyIdParam = searchParams.get("companyId");

    const effectiveCompanyId = session.user.role === 'SUPERADMIN'
      ? (companyIdParam || null)
      : session.user.companyId;

    if (!effectiveCompanyId) {
      return NextResponse.json({ error: "Empresa no definida" }, { status: 400 });
    }

    // Cargar estados activos para mapear IDs a nombres
    const { data: estados } = await supabaseAdmin
      .from('estados_remitos')
      .select('id, name')
      .eq('company_id', effectiveCompanyId)
      .eq('is_active', true);

    const estadoMap = new Map<string, string>((estados || []).map((e: any) => [e.id, e.name]));

    // Tiempos para "hoy"
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const startIso = startOfToday.toISOString();

    // Remitos: obtener solo columnas necesarias
    const { data: remitosData, error: remitosErr } = await supabaseAdmin
      .from('remitos')
      .select('id, status, created_at', { count: 'exact' })
      .eq('company_id', effectiveCompanyId)
      .order('created_at', { ascending: false });

    if (remitosErr) {
      return NextResponse.json({ error: 'Error remitos' }, { status: 500 });
    }

    const totalRemitos = remitosData?.length || 0;
    const byStatusMap: Record<string, { id: string; name: string; count: number }> = {};
    let todayRemitos = 0;
    for (const r of remitosData || []) {
      const id = r.status as string;
      const name = estadoMap.get(id) || 'Desconocido';
      if (!byStatusMap[id]) byStatusMap[id] = { id, name, count: 0 };
      byStatusMap[id].count += 1;
      if (r.created_at >= startIso) todayRemitos += 1;
    }

    // Conteos simples
    const [clientesCountRes, productosCountRes, categoriasCountRes, usuariosTodayRes, clientesTodayRes, productosTodayRes, categoriasTodayRes] = await Promise.all([
      supabaseAdmin.from('clients').select('id', { count: 'exact', head: true }).eq('company_id', effectiveCompanyId),
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('company_id', effectiveCompanyId),
      supabaseAdmin.from('categories').select('id', { count: 'exact', head: true }).eq('company_id', effectiveCompanyId),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('company_id', effectiveCompanyId).gte('created_at', startIso),
      supabaseAdmin.from('clients').select('id', { count: 'exact', head: true }).eq('company_id', effectiveCompanyId).gte('created_at', startIso),
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('company_id', effectiveCompanyId).gte('created_at', startIso),
      supabaseAdmin.from('categories').select('id', { count: 'exact', head: true }).eq('company_id', effectiveCompanyId).gte('created_at', startIso),
    ]);

    const responseBody = {
      remitos: {
        total: totalRemitos,
        byStatus: Object.values(byStatusMap),
        today: todayRemitos,
      },
      productos: { total: productosCountRes.count || 0, today: productosTodayRes.count || 0 },
      clientes: { total: clientesCountRes.count || 0, today: clientesTodayRes.count || 0 },
      categorias: { total: categoriasCountRes.count || 0, today: categoriasTodayRes.count || 0 },
      usuarios: { today: usuariosTodayRes.count || 0 },
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


