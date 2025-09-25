import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withPrisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    console.log("=== TEST UPDATE START ===");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }
    
    const body = await request.json();
    console.log("Body:", body);
    
    const { productId, stock } = body;
    
    // Solo verificar que el producto existe, sin actualizar
    const existingProduct = await withPrisma(async (prisma) => {
      return await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          companyId: true,
          stock: true
        }
      });
    });
    
    console.log("Existing product:", existingProduct);
    
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Verificar autorización
    if (session.user.role !== 'SUPERADMIN' && existingProduct.companyId !== session.user.companyId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    
    // Solo devolver el producto existente sin actualizar
    return NextResponse.json({
      success: true,
      message: "Product found and authorized",
      product: existingProduct,
      requestedStock: stock
    });
    
  } catch (error: any) {
    console.error("=== ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);
    console.error("=== END ERROR ===");
    
    return NextResponse.json({
      error: "Test failed",
      message: error.message,
      code: error.code,
      stack: error.stack
    }, { status: 500 });
  }
}
