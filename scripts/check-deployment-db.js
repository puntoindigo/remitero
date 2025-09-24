const { PrismaClient } = require('@prisma/client');

async function checkDeploymentDB() {
    console.log('🔍 Verificando conexión a base de datos en el despliegue...');
    
    // Simular las variables de entorno que debería tener el despliegue
    const devDatabaseUrl = "postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require";
    
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: devDatabaseUrl
            }
        }
    });

    try {
        console.log('🔧 PASO 1: Verificando conexión a base de datos de desarrollo...');
        await prisma.$connect();
        console.log('✅ Conexión exitosa a base de datos de desarrollo');

        console.log('');
        console.log('🔧 PASO 2: Verificando usuarios específicos...');
        
        const targetUsers = ['admin@remitero.com', 'admin@empresademo.com'];
        
        for (const email of targetUsers) {
            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    email: true,
                    role: true,
                    name: true,
                    password: true
                }
            });

            if (user) {
                console.log(`✅ Usuario encontrado: ${user.email} (${user.role})`);
                console.log(`   Nombre: ${user.name}`);
                console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
            } else {
                console.log(`❌ Usuario NO encontrado: ${email}`);
            }
        }

        console.log('');
        console.log('🔧 PASO 3: Verificando total de usuarios...');
        const totalUsers = await prisma.user.count();
        console.log(`📊 Total de usuarios en la base de datos: ${totalUsers}`);

        console.log('');
        console.log('🔧 PASO 4: Listando todos los usuarios...');
        const allUsers = await prisma.user.findMany({
            select: {
                email: true,
                role: true,
                name: true
            }
        });

        console.log('👥 Todos los usuarios:');
        allUsers.forEach(user => {
            console.log(`  • ${user.email} (${user.role}) - ${user.name}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDeploymentDB();
