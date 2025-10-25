const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Estados básicos que se crearán automáticamente
const basicEstados = [
  { name: 'Pendiente', description: 'Remito creado, esperando procesamiento', color: '#f59e0b' },
  { name: 'En Proceso', description: 'Remito siendo procesado', color: '#3b82f6' },
  { name: 'Completado', description: 'Remito completado exitosamente', color: '#10b981' },
  { name: 'Cancelado', description: 'Remito cancelado', color: '#ef4444' }
];

async function createBasicEstados() {
  try {
    console.log('🔍 Verificando si existen estados básicos...');
    
    // Obtener todas las empresas
    const { data: empresas, error: empresasError } = await supabase
      .from('companies')
      .select('id, name');

    if (empresasError) {
      console.error('❌ Error obteniendo empresas:', empresasError);
      return;
    }

    if (!empresas || empresas.length === 0) {
      console.log('⚠️  No hay empresas en el sistema. Creando estados básicos para empresa por defecto...');
      return;
    }

    console.log(`📊 Encontradas ${empresas.length} empresas`);

    for (const empresa of empresas) {
      console.log(`\n🏢 Procesando empresa: ${empresa.name} (${empresa.id})`);
      
      // Verificar si ya existen estados para esta empresa
      const { data: existingEstados, error: estadosError } = await supabase
        .from('estados_remitos')
        .select('id, name')
        .eq('company_id', empresa.id);

      if (estadosError) {
        console.error(`❌ Error verificando estados para ${empresa.name}:`, estadosError);
        continue;
      }

      if (existingEstados && existingEstados.length > 0) {
        console.log(`✅ ${empresa.name} ya tiene ${existingEstados.length} estados. Saltando...`);
        continue;
      }

      // Crear estados básicos para esta empresa
      console.log(`🔧 Creando estados básicos para ${empresa.name}...`);
      
      const estadosToCreate = basicEstados.map(estado => ({
        name: estado.name,
        description: estado.description,
        color: estado.color,
        company_id: empresa.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data: newEstados, error: createError } = await supabase
        .from('estados_remitos')
        .insert(estadosToCreate)
        .select();

      if (createError) {
        console.error(`❌ Error creando estados para ${empresa.name}:`, createError);
        continue;
      }

      console.log(`✅ Creados ${newEstados.length} estados básicos para ${empresa.name}:`);
      newEstados.forEach(estado => {
        console.log(`   - ${estado.name} (${estado.color})`);
      });
    }

    console.log('\n🎉 Proceso completado!');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
createBasicEstados()
  .then(() => {
    console.log('✅ Script ejecutado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error);
    process.exit(1);
  });
