const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nbucsdjnaysaysjfouun.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idWNzZGpuYXlzYXlzamZvdXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg5NDg0MiwiZXhwIjoyMDc0NDcwODQyfQ.SeX_cyfUp6QEpVKyIv8tv6e6AfRo05k8L1_WirDPo2U';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de Supabase...');

    // 1. Crear empresa
    console.log('📦 Creando empresa...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([
        {
          name: 'Empresa Demo'
        }
      ])
      .select()
      .single();

    if (companyError) {
      console.error('Error creando empresa:', companyError);
      return;
    }

    console.log('✅ Empresa creada:', company.name);

    // 2. Crear usuarios
    console.log('👥 Creando usuarios...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          name: 'Super Administrador',
          email: 'superadmin@remitero.com',
          password: hashedPassword,
          role: 'SUPERADMIN',
          company_id: null
        },
        {
          name: 'Administrador Demo',
          email: 'admin@empresademo.com',
          password: hashedPassword,
          role: 'ADMIN',
          company_id: company.id,
          address: 'Av. Principal 123',
          phone: '+54 11 1234-5678'
        },
        {
          name: 'Usuario Demo',
          email: 'user@empresademo.com',
          password: hashedPassword,
          role: 'USER',
          company_id: company.id,
          address: 'Calle Secundaria 456',
          phone: '+54 11 8765-4321'
        }
      ])
      .select();

    if (usersError) {
      console.error('Error creando usuarios:', usersError);
      return;
    }

    console.log('✅ Usuarios creados:', users.length);

    // 3. Crear categorías
    console.log('📂 Creando categorías...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .insert([
        {
          company_id: company.id,
          name: 'Electrónicos'
        },
        {
          company_id: company.id,
          name: 'Ropa'
        },
        {
          company_id: company.id,
          name: 'Hogar'
        }
      ])
      .select();

    if (categoriesError) {
      console.error('Error creando categorías:', categoriesError);
      return;
    }

    console.log('✅ Categorías creadas:', categories.length);

    // 4. Crear clientes
    console.log('👤 Creando clientes...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .insert([
        {
          company_id: company.id,
          name: 'Cliente Principal',
          address: 'Av. Comercial 789',
          phone: '+54 11 1111-2222',
          email: 'cliente@principal.com'
        },
        {
          company_id: company.id,
          name: 'Cliente Secundario',
          address: 'Calle Industrial 321',
          phone: '+54 11 3333-4444',
          email: 'cliente@secundario.com'
        }
      ])
      .select();

    if (clientsError) {
      console.error('Error creando clientes:', clientsError);
      return;
    }

    console.log('✅ Clientes creados:', clients.length);

    // 5. Crear productos
    console.log('🛍️ Creando productos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert([
        {
          company_id: company.id,
          category_id: categories[0].id,
          name: 'Laptop Dell',
          description: 'Laptop Dell Inspiron 15 3000',
          price: 450000.00,
          stock: 'IN_STOCK'
        },
        {
          company_id: company.id,
          category_id: categories[0].id,
          name: 'Mouse Inalámbrico',
          description: 'Mouse inalámbrico Logitech',
          price: 15000.00,
          stock: 'IN_STOCK'
        },
        {
          company_id: company.id,
          category_id: categories[1].id,
          name: 'Camisa Polo',
          description: 'Camisa polo de algodón',
          price: 25000.00,
          stock: 'OUT_OF_STOCK'
        },
        {
          company_id: company.id,
          category_id: categories[2].id,
          name: 'Mesa de Centro',
          description: 'Mesa de centro de madera',
          price: 85000.00,
          stock: 'IN_STOCK'
        }
      ])
      .select();

    if (productsError) {
      console.error('Error creando productos:', productsError);
      return;
    }

    console.log('✅ Productos creados:', products.length);

    // 6. Crear remito de ejemplo
    console.log('📋 Creando remito de ejemplo...');
    const { data: remito, error: remitoError } = await supabase
      .from('remitos')
      .insert([
        {
          company_id: company.id,
          number: 1,
          client_id: clients[0].id,
          status: 'PENDIENTE',
          notes: 'Remito de prueba',
          created_by_id: users[1].id // admin@empresademo.com
        }
      ])
      .select()
      .single();

    if (remitoError) {
      console.error('Error creando remito:', remitoError);
      return;
    }

    console.log('✅ Remito creado:', remito.number);

    // 7. Crear items del remito
    console.log('📝 Creando items del remito...');
    const { data: remitoItems, error: remitoItemsError } = await supabase
      .from('remito_items')
      .insert([
        {
          remito_id: remito.id,
          product_id: products[0].id,
          quantity: 1,
          product_name: products[0].name,
          product_desc: products[0].description,
          unit_price: products[0].price,
          line_total: products[0].price
        },
        {
          remito_id: remito.id,
          product_id: products[1].id,
          quantity: 2,
          product_name: products[1].name,
          product_desc: products[1].description,
          unit_price: products[1].price,
          line_total: products[1].price * 2
        }
      ])
      .select();

    if (remitoItemsError) {
      console.error('Error creando items del remito:', remitoItemsError);
      return;
    }

    console.log('✅ Items del remito creados:', remitoItems.length);

    // 8. Crear historial de estado
    console.log('📊 Creando historial de estado...');
    const { data: statusHistory, error: statusHistoryError } = await supabase
      .from('status_history')
      .insert([
        {
          remito_id: remito.id,
          status: 'PENDIENTE',
          by_user_id: users[1].id
        }
      ])
      .select();

    if (statusHistoryError) {
      console.error('Error creando historial de estado:', statusHistoryError);
      return;
    }

    console.log('✅ Historial de estado creado');

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- Empresa: ${company.name} (${company.id})`);
    console.log(`- Usuarios: ${users.length}`);
    console.log(`- Categorías: ${categories.length}`);
    console.log(`- Clientes: ${clients.length}`);
    console.log(`- Productos: ${products.length}`);
    console.log(`- Remitos: 1`);
    console.log(`- Items: ${remitoItems.length}`);
    console.log(`- Historial: 1`);
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log('SuperAdmin: superadmin@remitero.com / admin123');
    console.log('Admin: admin@empresademo.com / admin123');
    console.log('User: user@empresademo.com / admin123');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  }
}

// Ejecutar el seed
seedDatabase();
