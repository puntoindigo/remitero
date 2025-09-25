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
    
    // Solo devolver información básica sin tocar la base de datos
    return NextResponse.json({
      success: true,
      message: "Session and request OK",
      session: {
        userId: session.user.id,
        userRole: session.user.role,
        companyId: session.user.companyId
      },
      request: {
        productId: productId,
        stock: stock
      }
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
