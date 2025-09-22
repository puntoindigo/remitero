import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, stock } = body;
    
    console.log('=== TEST STOCK UPDATE ===');
    console.log('Product ID:', productId);
    console.log('Stock value:', stock);
    console.log('Stock type:', typeof stock);
    
    const product = await prisma.product.update({
      where: { id: productId },
      data: { stock: stock },
      include: { category: true }
    });
    
    console.log('Update successful:', product);
    
    return NextResponse.json({ 
      success: true,
      product: product
    });
    
  } catch (error: any) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ 
      error: "Error updating stock",
      message: error.message,
      details: error
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
