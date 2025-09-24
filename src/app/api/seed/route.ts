import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Iniciando seed básico...');
    
    // Crear company
    const company = await prisma.company.create({
      data: { name: "Distribuidora Ruben" }
    });
    console.log('✅ Company creada:', company.name);
    
    // Crear usuario
    const hashedPassword = await bcrypt.hash("daedae123", 10);
    const user = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@remitero.com",
        password: hashedPassword,
        role: "SUPERADMIN",
        companyId: company.id
      }
    });
    console.log('✅ Usuario creado:', user.name);
    
    // Crear categoría
    const category = await prisma.category.create({
      data: {
        name: "Productos de Limpieza",
        companyId: company.id
      }
    });
    console.log('✅ Categoría creada:', category.name);
    
    // Crear producto
    const product = await prisma.product.create({
      data: {
        name: "Detergente Líquido",
        description: "Detergente líquido para ropa",
        unitPrice: 450.00,
        stock: "IN_STOCK",
        categoryId: category.id,
        companyId: company.id
      }
    });
    console.log('✅ Producto creado:', product.name);
    
    // Crear cliente
    const client = await prisma.client.create({
      data: {
        name: "Cliente Demo",
        address: "Av. Principal 123",
        phone: "+54 11 1234-5678",
        email: "cliente@demo.com",
        companyId: company.id
      }
    });
    console.log('✅ Cliente creado:', client.name);
    
    return NextResponse.json({ 
      success: true, 
      message: "Seed básico completado",
      data: {
        company: company.name,
        user: user.name,
        category: category.name,
        product: product.name,
        client: client.name
      }
    });
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}
