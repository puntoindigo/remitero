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
    
    // Paso 1: Verificar que withPrisma funciona
    console.log("Testing withPrisma connection...");
    
    const testConnection = await withPrisma(async (prisma) => {
      console.log("Prisma client created successfully");
      return { connected: true };
    });
    
    console.log("withPrisma test result:", testConnection);
    
    // Paso 2: Buscar el producto
    console.log("Searching for product...");
    
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
    
    console.log("Product found:", existingProduct);
    
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Verificar autorización
    if (session.user.role !== 'SUPERADMIN' && existingProduct.companyId !== session.user.companyId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Product found and authorized",
      session: {
        userId: session.user.id,
        userRole: session.user.role,
        companyId: session.user.companyId
      },
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
