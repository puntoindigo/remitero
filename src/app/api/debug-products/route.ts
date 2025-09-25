import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withPrisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    logger.info("Debug products endpoint called", {
      userId: session.user.id,
      userRole: session.user.role,
      companyId: session.user.companyId
    });

    // Construir condición WHERE según el rol del usuario
    const whereCondition: any = {};
    
    // Solo SUPERADMIN puede acceder a productos de cualquier empresa
    if (session.user.role !== 'SUPERADMIN') {
      whereCondition.companyId = session.user.companyId;
    }

    const products = await withPrisma(async (prisma) => {
      return await prisma.product.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true,
          companyId: true,
          Company: {
            select: {
              id: true,
              name: true
            }
          }
        },
        take: 10 // Solo los primeros 10 para no sobrecargar
      });
    });

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        companyId: session.user.companyId
      },
      whereCondition,
      productsCount: products.length,
      products: products
    });
  } catch (error: any) {
    logger.error("Error in debug products endpoint", {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      error: "Error getting products",
      message: error.message
    }, { status: 500 });
  }
}
