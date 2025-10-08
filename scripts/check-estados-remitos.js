const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEstadosRemitos() {
  console.log('🔍 Verificando tabla estados_remitos...');
  
  try {
    // Intentar consultar directamente la tabla
    const { data: estados, error: estadosError } = await supabase
      .from('estados_remitos')
      .select('*')
      .limit(1);
    
    if (estadosError) {
      console.error('❌ Error consultando estados_remitos:', estadosError);
      
      // Si es error de tabla no encontrada, verificar otras tablas
      if (estadosError.code === 'PGRST116' || estadosError.message.includes('relation "estados_remitos" does not exist')) {
        console.log('❌ La tabla estados_remitos NO existe');
        console.log('🔍 Verificando otras tablas...');
        
        // Intentar consultar otras tablas conocidas
        const tables = ['companies', 'users', 'remitos', 'products', 'clients', 'categories'];
        for (const table of tables) {
          const { error } = await supabase.from(table).select('*').limit(1);
          if (error) {
            console.log(`  ❌ ${table}: ${error.message}`);
          } else {
            console.log(`  ✅ ${table}: existe`);
          }
        }
        return;
      }
      return;
    }
    
    console.log('✅ La tabla estados_remitos existe');
    
    // Verificar datos completos
    const { data: allEstados, error: allEstadosError } = await supabase
      .from('estados_remitos')
      .select('*')
      .limit(10);
    
    if (allEstadosError) {
      console.error('❌ Error consultando datos:', allEstadosError);
      return;
    }
    
    console.log(`📊 Total de estados encontrados: ${allEstados?.length || 0}`);
    
    if (allEstados && allEstados.length > 0) {
      console.log('📋 Primeros estados:');
      allEstados.forEach(estado => {
        console.log(`  - ${estado.name} (${estado.company_id}) - Activo: ${estado.is_active}`);
      });
    } else {
      console.log('⚠️  No hay datos en la tabla');
    }
    
    // Verificar empresas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(5);
    
    if (companiesError) {
      console.error('❌ Error consultando empresas:', companiesError);
      return;
    }
    
    console.log(`🏢 Empresas disponibles: ${companies?.length || 0}`);
    companies?.forEach(company => {
      console.log(`  - ${company.name} (${company.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkEstadosRemitos();
