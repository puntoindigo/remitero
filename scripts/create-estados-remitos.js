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
  console.log('🔧 Creando tabla estados_remitos...');
  
  try {
    // 1. Crear tabla estados_remitos
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS estados_remitos (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          color VARCHAR(7) NOT NULL DEFAULT '#6b7280',
          icon VARCHAR(10) NOT NULL DEFAULT '📋',
          is_active BOOLEAN NOT NULL DEFAULT true,
          is_default BOOLEAN NOT NULL DEFAULT false,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(company_id, name)
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    if (createError) {
      console.error('❌ Error creando tabla:', createError);
      return;
    }
    console.log('✅ Tabla estados_remitos creada');
    
    // 2. Crear índices
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_estados_remitos_company_id ON estados_remitos(company_id);
      CREATE INDEX IF NOT EXISTS idx_estados_remitos_active ON estados_remitos(is_active);
    `;
    
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexesSQL });
    if (indexError) {
      console.error('❌ Error creando índices:', indexError);
    } else {
      console.log('✅ Índices creados');
    }
    
    // 3. Verificar empresas existentes
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (companiesError) {
      console.error('❌ Error consultando empresas:', companiesError);
      return;
    }
    
    console.log(`🏢 Empresas encontradas: ${companies?.length || 0}`);
    companies?.forEach(company => {
      console.log(`  - ${company.name} (${company.id})`);
    });
    
    // 4. Insertar estados predefinidos para cada empresa
    if (companies && companies.length > 0) {
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
      
      const { data: insertedEstados, error: insertError } = await supabase
        .from('estados_remitos')
        .insert(estadosToInsert)
        .select();
      
      if (insertError) {
        console.error('❌ Error insertando estados:', insertError);
      } else {
        console.log(`✅ Estados predefinidos insertados: ${insertedEstados?.length || 0}`);
      }
    }
    
    // 5. Verificar resultado final
    const { data: finalEstados, error: finalError } = await supabase
      .from('estados_remitos')
      .select('*')
      .limit(5);
    
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
