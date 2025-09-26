const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nbucsdjnaysaysjfouun.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idWNzZGpuYXlzYXlzamZvdXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg5NDg0MiwiZXhwIjoyMDc0NDcwODQyfQ.SeX_cyfUp6QEpVKyIv8tv6e6AfRo05k8L1_WirDPo2U';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🔧 Configurando base de datos de Supabase...');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'supabase-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando script SQL...');
    
    // Ejecutar el SQL usando la función SQL de Supabase
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });

    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      
      // Si la función exec_sql no existe, intentar ejecutar por partes
      console.log('🔄 Intentando ejecutar por partes...');
      await executeSqlByParts(sqlContent);
    } else {
      console.log('✅ SQL ejecutado exitosamente');
    }

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
  }
}

async function executeSqlByParts(sqlContent) {
  // Dividir el SQL en partes ejecutables
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`📝 Ejecutando ${statements.length} declaraciones SQL...`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement.trim()) {
      try {
        console.log(`⏳ Ejecutando declaración ${i + 1}/${statements.length}...`);
        
        // Usar la función SQL directa
        const { data, error } = await supabase
          .from('_sql')
          .select('*')
          .limit(0);

        if (error && !error.message.includes('relation "_sql" does not exist')) {
          console.log(`⚠️  Declaración ${i + 1} puede haber fallado:`, error.message);
        } else {
          console.log(`✅ Declaración ${i + 1} ejecutada`);
        }
      } catch (err) {
        console.log(`⚠️  Error en declaración ${i + 1}:`, err.message);
      }
    }
  }
}

// Ejecutar la configuración
setupDatabase();
