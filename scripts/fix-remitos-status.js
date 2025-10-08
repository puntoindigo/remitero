require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRemitosStatus() {
  try {
    console.log('🔍 Buscando remitos con estado incorrecto...');
    
    // Buscar remitos que no tengan estado 'PENDIENTE' o que tengan estado nulo
    const { data: remitos, error: fetchError } = await supabase
      .from('remitos')
      .select('id, number, status, company_id')
      .or('status.is.null,status.neq.PENDIENTE');

    if (fetchError) {
      console.error('❌ Error al buscar remitos:', fetchError);
      return;
    }

    console.log(`📊 Encontrados ${remitos?.length || 0} remitos con estado incorrecto`);

    if (!remitos || remitos.length === 0) {
      console.log('✅ No hay remitos que corregir');
      return;
    }

    // Actualizar cada remito
    for (const remito of remitos) {
      console.log(`🔄 Actualizando remito #${remito.number} (ID: ${remito.id})`);
      
      const { error: updateError } = await supabase
        .from('remitos')
        .update({ 
          status: 'PENDIENTE',
          status_at: new Date().toISOString()
        })
        .eq('id', remito.id);

      if (updateError) {
        console.error(`❌ Error al actualizar remito #${remito.number}:`, updateError);
      } else {
        console.log(`✅ Remito #${remito.number} actualizado a PENDIENTE`);
      }
    }

    console.log('🎉 Proceso completado');
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
fixRemitosStatus();
