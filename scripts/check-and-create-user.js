require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateUser() {
  try {
    console.log('🔍 Verificando usuario daeiman@gmail.com...');
    
    // Buscar el usuario
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'daeiman@gmail.com')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error al buscar usuario:', fetchError);
      return;
    }

    if (existingUser) {
      console.log('✅ Usuario encontrado:');
      console.log(`   - ID: ${existingUser.id}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - Nombre: ${existingUser.name}`);
      console.log(`   - Rol: ${existingUser.role}`);
      console.log(`   - Company ID: ${existingUser.company_id || 'NULL'}`);
      console.log(`   - Creado: ${existingUser.created_at}`);
      
      // Verificar si es SUPERADMIN
      if (existingUser.role === 'SUPERADMIN') {
        console.log('✅ El usuario ya es SUPERADMIN');
      } else {
        console.log('⚠️  El usuario no es SUPERADMIN, actualizando...');
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: 'SUPERADMIN',
            company_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('❌ Error al actualizar usuario:', updateError);
        } else {
          console.log('✅ Usuario actualizado a SUPERADMIN');
        }
      }
    } else {
      console.log('❌ Usuario no encontrado, creando...');
      
      // Crear hash de contraseña
      const hashedPassword = await bcrypt.hash('password', 10);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          email: 'daeiman@gmail.com',
          name: 'Daeiman Admin',
          password: hashedPassword,
          role: 'SUPERADMIN',
          company_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error al crear usuario:', createError);
      } else {
        console.log('✅ Usuario creado exitosamente:');
        console.log(`   - ID: ${newUser.id}`);
        console.log(`   - Email: ${newUser.email}`);
        console.log(`   - Nombre: ${newUser.name}`);
        console.log(`   - Rol: ${newUser.role}`);
        console.log(`   - Contraseña: password`);
      }
    }

    // Verificar empresas
    console.log('\n🔍 Verificando empresas...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, email');

    if (companiesError) {
      console.error('❌ Error al buscar empresas:', companiesError);
    } else {
      console.log(`✅ Encontradas ${companies?.length || 0} empresas:`);
      companies?.forEach(company => {
        console.log(`   - ${company.name} (${company.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
checkAndCreateUser();
