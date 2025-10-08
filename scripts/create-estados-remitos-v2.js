const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createEstadosRemitosTable() {
  console.log('🔧 Verificando y creando tabla estados_remitos...');
  
  try {
    // Primero verificar si la tabla existe
    const { data: testData, error: testError } = await supabase
      .from('estados_remitos')
      .select('*')
      .limit(1);
    
    if (!testError) {
      console.log('✅ La tabla estados_remitos ya existe');
      
      // Verificar si tiene datos
      const { data: allEstados, error: countError } = await supabase
        .from('estados_remitos')
        .select('*');
      
      if (countError) {
        console.error('❌ Error consultando datos:', countError);
        return;
      }
      
      console.log(`📊 Estados existentes: ${allEstados?.length || 0}`);
      
      if (allEstados && allEstados.length > 0) {
        console.log('✅ La tabla ya tiene datos');
        return;
      }
    } else {
      console.log('❌ La tabla estados_remitos no existe');
      console.log('📋 Necesitas crear la tabla manualmente en el dashboard de Supabase');
      console.log('');
      console.log('🔧 SQL para ejecutar en el dashboard:');
      console.log('');
      console.log('-- 1. Crear tabla estados_remitos');
      console.log('CREATE TABLE estados_remitos (');
      console.log('    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),');
      console.log('    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,');
      console.log('    name VARCHAR(255) NOT NULL,');
      console.log('    description TEXT,');
      console.log('    color VARCHAR(7) NOT NULL DEFAULT \'#6b7280\',');
      console.log('    icon VARCHAR(10) NOT NULL DEFAULT \'📋\',');
      console.log('    is_active BOOLEAN NOT NULL DEFAULT true,');
      console.log('    is_default BOOLEAN NOT NULL DEFAULT false,');
      console.log('    sort_order INTEGER NOT NULL DEFAULT 0,');
      console.log('    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('    UNIQUE(company_id, name)');
      console.log(');');
      console.log('');
      console.log('-- 2. Crear índices');
      console.log('CREATE INDEX idx_estados_remitos_company_id ON estados_remitos(company_id);');
      console.log('CREATE INDEX idx_estados_remitos_active ON estados_remitos(is_active);');
      console.log('');
      console.log('-- 3. Crear trigger para updated_at');
      console.log('CREATE TRIGGER update_estados_remitos_updated_at');
      console.log('    BEFORE UPDATE ON estados_remitos');
      console.log('    FOR EACH ROW');
      console.log('    EXECUTE FUNCTION update_updated_at_column();');
      console.log('');
      return;
    }
    
    // Si la tabla existe pero no tiene datos, insertar estados predefinidos
    console.log('📝 Insertando estados predefinidos...');
    
    // Verificar empresas existentes
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (companiesError) {
      console.error('❌ Error consultando empresas:', companiesError);
      return;
    }
    
    console.log(`🏢 Empresas encontradas: ${companies?.length || 0}`);
    
    if (!companies || companies.length === 0) {
      console.log('⚠️  No hay empresas en la base de datos');
      return;
    }
    
    // Insertar estados predefinidos para cada empresa
    const estadosPredefinidos = [
      { name: 'Pendiente', description: 'Remito creado, esperando procesamiento', color: '#f59e0b', icon: '⏰', sort_order: 1 },
      { name: 'Preparado', description: 'Remito preparado para entrega', color: '#10b981', icon: '✅', sort_order: 2 },
      { name: 'Entregado', description: 'Remito entregado al cliente', color: '#3b82f6', icon: '🚚', sort_order: 3 },
      { name: 'Cancelado', description: 'Remito cancelado', color: '#ef4444', icon: '❌', sort_order: 4 }
    ];
    
    const estadosToInsert = [];
    for (const company of companies) {
      for (const estado of estadosPredefinidos) {
        estadosToInsert.push({
          company_id: company.id,
          name: estado.name,
          description: estado.description,
          color: estado.color,
          icon: estado.icon,
          is_active: true,
          is_default: true,
          sort_order: estado.sort_order
        });
      }
    }
    
    console.log(`📝 Insertando ${estadosToInsert.length} estados...`);
    
    const { data: insertedEstados, error: insertError } = await supabase
      .from('estados_remitos')
      .insert(estadosToInsert)
      .select();
    
    if (insertError) {
      console.error('❌ Error insertando estados:', insertError);
    } else {
      console.log(`✅ Estados predefinidos insertados: ${insertedEstados?.length || 0}`);
    }
    
    // Verificar resultado final
    const { data: finalEstados, error: finalError } = await supabase
      .from('estados_remitos')
      .select('*')
      .limit(10);
    
    if (finalError) {
      console.error('❌ Error verificando resultado:', finalError);
    } else {
      console.log(`📊 Total de estados en la tabla: ${finalEstados?.length || 0}`);
      finalEstados?.forEach(estado => {
        console.log(`  - ${estado.name} (${estado.company_id}) - Activo: ${estado.is_active}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createEstadosRemitosTable();
