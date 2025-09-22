import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG PRODUCT ENDPOINT ===');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { productId, stock } = body;
    
    // Verificar que el producto existe
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        companyId: session.user.companyId
      },
      select: {
        id: true,
        name: true,
        stock: true
      }
    });
    
    console.log('Existing product:', existingProduct);
    
    if (!existingProduct) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    
    // Actualizar solo el stock
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
        companyId: session.user.companyId
      },
      data: {
        stock: stock
      },
      select: {
        id: true,
        name: true,
        stock: true
      }
    });
    
    console.log('Updated product:', updatedProduct);
    
    return NextResponse.json({ 
      success: true,
      product: updatedProduct
    });
    
  } catch (error: any) {
    console.error('Error in debug endpoint:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      error: "Error en debug endpoint",
      message: error.message,
      name: error.name,
      details: error
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
