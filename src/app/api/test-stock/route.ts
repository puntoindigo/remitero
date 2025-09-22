import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, stock } = body;
    
    console.log('=== TEST STOCK UPDATE ===');
    console.log('Product ID:', productId);
    console.log('Stock value:', stock);
    console.log('Stock type:', typeof stock);
    console.log('Session company ID:', session.user.companyId);
    
    const product = await prisma.product.update({
      where: { 
        id: productId,
        companyId: session.user.companyId 
      },
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
