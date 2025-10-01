const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Company ID de Distribuidora Ruben
const COMPANY_ID = 'b3bcb1b3-cb6b-4900-b1ff-91048729598d';

// Productos con categorías organizadas
const productsData = [
  // CERVEZAS
  { name: "Brahma x12", price: 29500, category: "Cervezas" },
  { name: "Quilmes x12", price: 29500, category: "Cervezas" },
  { name: "Stella x12", price: 44000, category: "Cervezas" },
  
  // GASEOSAS
  { name: "Coca x8 Retornable", price: 20800, category: "Gaseosas" },
  { name: "Coca x6", price: 17300, category: "Gaseosas" },
  { name: "Coca x12", price: 14800, category: "Gaseosas" },
  { name: "Coca x8", price: 23000, category: "Gaseosas" },
  { name: "Coca Lata x6", price: 5800, category: "Gaseosas" },
  
  // ENERGIZANTES
  { name: "Monster x6", price: 13600, category: "Energizantes" },
  { name: "Power x6", price: 9950, category: "Energizantes" },
  { name: "Cunnington x6", price: 8800, category: "Energizantes" },
  
  // AGUAS
  { name: "Saborizada x6", price: 7850, category: "Aguas" },
  { name: "Saborizada x12", price: 9000, category: "Aguas" },
  { name: "Agua x6", price: 5800, category: "Aguas" },
  { name: "Agua x1L", price: 8500, category: "Aguas" },
  { name: "Agua x12 Gas", price: 8950, category: "Aguas" },
  
  // SERVICIOS
  { name: "Envío", price: 4000, category: "Servicios" },
  
  // VINOS
  { name: "Toro Caja x12", price: 18000, category: "Vinos" },
  { name: "Toro Litro x12", price: 22000, category: "Vinos" },
  { name: "SiCom x6", price: 6900, category: "Vinos" },
  
  // APERITIVOS
  { name: "Fernet Litro", price: 18900, category: "Aperitivos" },
  { name: "Gancia Litro", price: 5990, category: "Aperitivos" },
  { name: "Cinzano Litro", price: 6950, category: "Aperitivos" },
  { name: "Obrero Litro", price: 4450, category: "Aperitivos" },
  { name: "Cynar Litro", price: 8680, category: "Aperitivos" },
  
  // BEBIDAS ESPECIALES
  { name: "Speed x12", price: 26700, category: "Bebidas Especiales" },
  { name: "Sidra x6", price: 14900, category: "Bebidas Especiales" },
  { name: "Smirnoff", price: 7400, category: "Bebidas Especiales" },
  { name: "Otro Loco x6", price: 21500, category: "Bebidas Especiales" },
  { name: "Valentin x6", price: 18900, category: "Bebidas Especiales" },
  { name: "Estancia MZA x6", price: 16900, category: "Bebidas Especiales" },
  { name: "M. Torino x6", price: 8500, category: "Bebidas Especiales" },
];

async function populateDistribuidoraRuben() {
  try {
    console.log('🚀 Poblando Distribuidora Ruben...');
    console.log(`📦 ${productsData.length} productos a crear`);

    // 1. Verificar empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', COMPANY_ID)
      .single();

    if (companyError || !company) {
      console.error('❌ No se encontró la empresa con ID:', COMPANY_ID);
      return;
    }

    console.log(`✅ Empresa: ${company.name}`);

    // 2. Crear categorías y obtener sus IDs
    const categories = [...new Set(productsData.map(p => p.category))];
    console.log(`📂 Creando ${categories.length} categorías...`);

    const categoryMap = {};
    
    for (const categoryName of categories) {
      // Verificar si ya existe
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .eq('company_id', COMPANY_ID)
        .single();

      if (existingCategory) {
        console.log(`✅ Categoría ya existe: ${categoryName}`);
        categoryMap[categoryName] = existingCategory.id;
      } else {
        // Crear nueva categoría
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({
            name: categoryName,
            company_id: COMPANY_ID
          })
          .select('id')
          .single();

        if (categoryError) {
          console.error(`❌ Error creando categoría ${categoryName}:`, categoryError);
          continue;
        }

        console.log(`✅ Categoría creada: ${categoryName}`);
        categoryMap[categoryName] = newCategory.id;
      }
    }

    // 3. Crear productos
    console.log(`📦 Creando ${productsData.length} productos...`);
    
    const productsToInsert = productsData.map(product => ({
      name: product.name,
      description: `Producto: ${product.name}`,
      price: product.price,
      category_id: categoryMap[product.category],
      company_id: COMPANY_ID
    }));

    const { data: insertedProducts, error: productsError } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select('id, name, price, category_id');

    if (productsError) {
      console.error('❌ Error creando productos:', productsError);
      return;
    }

    console.log(`✅ ${insertedProducts.length} productos creados exitosamente`);

    // 4. Mostrar resumen
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`🏢 Empresa: ${company.name}`);
    console.log(`📂 Categorías: ${categories.length}`);
    categories.forEach(cat => {
      const count = productsData.filter(p => p.category === cat).length;
      console.log(`  - ${cat}: ${count} productos`);
    });
    console.log(`📦 Total productos: ${insertedProducts.length}`);
    console.log('\n🎉 ¡Población completada exitosamente!');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar directamente
populateDistribuidoraRuben();
