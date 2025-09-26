const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

async function updateStatusValues() {
  try {
    console.log('🔄 Actualizando valores de estado EN_TRANSITO a PREPARADO...');

    // Actualizar remitos
    const { data: remitosData, error: remitosError } = await supabase
      .from('remitos')
      .update({ status: 'PREPARADO' })
      .eq('status', 'EN_TRANSITO')
      .select('id, status');

    if (remitosError) {
      console.error('❌ Error actualizando remitos:', remitosError);
    } else {
      console.log(`✅ Remitos actualizados: ${remitosData?.length || 0}`);
    }

    // Actualizar status_history
    const { data: historyData, error: historyError } = await supabase
      .from('status_history')
      .update({ status: 'PREPARADO' })
      .eq('status', 'EN_TRANSITO')
      .select('id, status');

    if (historyError) {
      console.error('❌ Error actualizando status_history:', historyError);
    } else {
      console.log(`✅ Status history actualizado: ${historyData?.length || 0}`);
    }

    console.log('🎉 Actualización completada');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

updateStatusValues();
