import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function POST(request: NextRequest) {
  let prisma: PrismaClient | null = null;
  
  try {
    console.log('🌱 Iniciando seed simple...');
    
    // Crear instancia de Prisma
    prisma = new PrismaClient();
    
    // Probar conexión
    await prisma.$connect();
    console.log('✅ Conexión establecida');
    
    // Crear company
    const company = await prisma.company.create({
      data: { name: "Distribuidora Ruben" }
    });
    console.log('✅ Company creada:', company.name);
    
    return NextResponse.json({ 
      success: true, 
      message: "Seed simple completado",
      data: { company: company.name }
    });
    
  } catch (error) {
    console.error('❌ Error en seed simple:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
