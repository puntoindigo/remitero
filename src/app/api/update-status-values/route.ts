import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Solo SUPERADMIN puede ejecutar esta operación." 
      }, { status: 401 });
    }

    console.log('🔄 Actualizando valores de estado EN_TRANSITO a PREPARADO...');

    // Actualizar remitos
    const { data: remitosData, error: remitosError } = await supabaseAdmin
      .from('remitos')
      .update({ status: 'PREPARADO' })
      .eq('status', 'EN_TRANSITO')
      .select('id, status');

    if (remitosError) {
      console.error('❌ Error actualizando remitos:', remitosError);
      return NextResponse.json({ 
        error: "Error actualizando remitos",
        message: remitosError.message
      }, { status: 500 });
    }

    // Actualizar status_history
    const { data: historyData, error: historyError } = await supabaseAdmin
      .from('status_history')
      .update({ status: 'PREPARADO' })
      .eq('status', 'EN_TRANSITO')
      .select('id, status');

    if (historyError) {
      console.error('❌ Error actualizando status_history:', historyError);
      return NextResponse.json({ 
        error: "Error actualizando status_history",
        message: historyError.message
      }, { status: 500 });
    }

    console.log('🎉 Actualización completada');

    return NextResponse.json({ 
      success: true,
      message: "Actualización completada",
      remitosUpdated: remitosData?.length || 0,
      historyUpdated: historyData?.length || 0
    });

  } catch (error: any) {
    console.error('❌ Error general:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: error.message
    }, { status: 500 });
  }
}
