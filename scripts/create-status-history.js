const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

async function createStatusHistory() {
    console.log('📝 Creando historial de estado para remitos...');
    
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL || "postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"
            }
        }
    });

    try {
        await prisma.$connect();
        console.log('✅ Conexión exitosa a la base de datos');

        // Obtener los remitos existentes
        const remitos = await prisma.remito.findMany({
            take: 2,
            include: {
                User: true
            }
        });

        console.log(`📄 Encontrados ${remitos.length} remitos`);

        for (const remito of remitos) {
            // Crear historial de estado
            const statusHistory = await prisma.statusHistory.create({
                data: {
                    id: uuidv4(),
                    remitoId: remito.id,
                    status: 'PENDIENTE',
                    at: remito.createdAt,
                    byUserId: remito.createdById
                }
            });

            console.log(`✅ Historial creado para remito #${remito.number}: ${statusHistory.status}`);
        }

        // Verificar el conteo
        const historyCount = await prisma.statusHistory.count();
        console.log(`📊 Total de registros de historial: ${historyCount}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createStatusHistory();
