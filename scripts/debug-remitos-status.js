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

async function debugRemitosStatus() {
  try {
    console.log('🔍 Diagnosticando estructura de tabla remitos...');
    
    // 1. Verificar estructura de la tabla remitos
    console.log('\n📋 Estructura de tabla remitos:');
    const { data: remitosStructure, error: structureError } = await supabase
      .from('remitos')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Error consultando estructura:', structureError);
    } else {
      console.log('✅ Estructura encontrada:', Object.keys(remitosStructure?.[0] || {}));
    }
    
    // 2. Verificar valores actuales de status en remitos
    console.log('\n📊 Valores actuales de status en remitos:');
    const { data: remitosStatus, error: statusError } = await supabase
      .from('remitos')
      .select('id, number, status, company_id')
      .limit(10);
    
    if (statusError) {
      console.error('❌ Error consultando status:', statusError);
    } else {
      console.log('✅ Estados actuales:');
      remitosStatus?.forEach(remito => {
        console.log(`  - Remito #${remito.number}: "${remito.status}" (${typeof remito.status})`);
      });
    }
    
    // 3. Verificar estados disponibles en estados_remitos
    console.log('\n🏷️ Estados disponibles en estados_remitos:');
    const { data: estados, error: estadosError } = await supabase
      .from('estados_remitos')
      .select('id, name, company_id, is_active')
      .eq('is_active', true)
      .limit(20);
    
    if (estadosError) {
      console.error('❌ Error consultando estados:', estadosError);
    } else {
      console.log('✅ Estados activos:');
      estados?.forEach(estado => {
        console.log(`  - "${estado.name}" (ID: ${estado.id})`);
      });
    }
    
    // 4. Intentar actualizar un remito con diferentes valores
    console.log('\n🧪 Probando actualizaciones...');
    
    if (remitosStatus && remitosStatus.length > 0) {
      const testRemito = remitosStatus[0];
      console.log(`\n🔄 Probando actualización del remito #${testRemito.number}...`);
      
      // Probar con valor del enum
      const { data: updateResult, error: updateError } = await supabase
        .from('remitos')
        .update({ 
          status: 'PENDIENTE',
          status_at: new Date().toISOString()
        })
        .eq('id', testRemito.id)
        .select('id, status');
      
      if (updateError) {
        console.error('❌ Error actualizando con PENDIENTE:', updateError);
      } else {
        console.log('✅ Actualización exitosa con PENDIENTE:', updateResult?.[0]);
      }
    }
    
    // 5. Verificar si hay restricciones de tipo
    console.log('\n🔍 Verificando restricciones de tipo...');
    const { data: typeCheck, error: typeError } = await supabase
      .rpc('get_table_info', { table_name: 'remitos' });
    
    if (typeError) {
      console.log('⚠️ No se pudo verificar restricciones de tipo (función no disponible)');
    } else {
      console.log('✅ Información de tipos:', typeCheck);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el diagnóstico
debugRemitosStatus();
