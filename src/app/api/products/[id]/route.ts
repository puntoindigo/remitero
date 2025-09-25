import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withPrisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let session: any = null;
  
  try {
    logger.info("PUT /api/products/[id] - Starting", { productId: params.id });
    
    session = await getServerSession(authOptions);
    logger.debug("Session retrieved", { 
      hasSession: !!session, 
      userId: session?.user?.id,
      userRole: session?.user?.role,
      companyId: session?.user?.companyId 
    });
    
    // Verificar autenticación básica
    if (!session?.user) {
      logger.warn("No session found", { endpoint: "/api/products/[id]" });
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Para SUPERADMIN, permitir acceso sin companyId
    // Para otros roles, requerir companyId
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      logger.warn("No companyId in session for non-superadmin user", { 
        userId: session.user.id,
        role: session.user.role 
      });
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    const productId = params.id;
    const body = await request.json();
    
    logger.debug("Request details", { 
      productId, 
      requestBody: body,
      userId: session.user.id 
    });

    // Validar datos de entrada
    const updateData: any = {};
    
    if (body.stock) {
      if (body.stock === 'IN_STOCK' || body.stock === 'OUT_OF_STOCK') {
        updateData.stock = body.stock;
      } else {
        logger.error("Invalid stock value", { 
          stockValue: body.stock,
          productId,
          userId: session.user.id 
        });
        return NextResponse.json({ 
          error: "Valor inválido", 
          message: `Valor de stock inválido: ${body.stock}. Use 'IN_STOCK' o 'OUT_OF_STOCK'.` 
        }, { status: 400 });
      }
    }

    // Construir condición WHERE según el rol del usuario
    const whereCondition: any = { id: productId };
    
    // Solo SUPERADMIN puede acceder a productos de cualquier empresa
    if (session.user.role !== 'SUPERADMIN') {
      whereCondition.companyId = session.user.companyId;
    }

    logger.debug("Database query", { 
      whereCondition,
      updateData,
      userRole: session.user.role 
    });

    const product = await withPrisma(async (prisma) => {
      return await prisma.product.update({
        where: whereCondition,
        data: updateData,
        include: { category: true }
      });
    });

    logger.info("Product updated successfully", { 
      productId,
      updatedFields: Object.keys(updateData),
      userId: session.user.id 
    });
    
    return NextResponse.json(product);
  } catch (error: any) {
    logger.error("Error updating product", {
      error: error.message,
      code: error.code,
      meta: error.meta,
      productId: params.id,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      companyId: session?.user?.companyId
    }, "/api/products/[id]", session);
    
    if (error.code === "P2025") {
      return NextResponse.json({ 
        error: "Producto no encontrado",
        message: "El producto solicitado no existe o no tienes permisos para acceder a él."
      }, { status: 404 });
    }

    if (error.code === "P2002") {
      return NextResponse.json({ 
        error: "Conflicto de datos",
        message: "Ya existe un producto con estos datos."
      }, { status: 409 });
    }

    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let session: any = null;
  
  try {
    logger.info("DELETE /api/products/[id] - Starting", { productId: params.id });
    
    session = await getServerSession(authOptions);
    
    // Verificar autenticación básica
    if (!session?.user) {
      logger.warn("No session found for DELETE", { endpoint: "/api/products/[id]" });
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Para SUPERADMIN, permitir acceso sin companyId
    // Para otros roles, requerir companyId
    if (session.user.role !== 'SUPERADMIN' && !session.user.companyId) {
      logger.warn("No companyId in session for non-superadmin user", { 
        userId: session.user.id,
        role: session.user.role 
      });
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Usuario no asociado a una empresa." 
      }, { status: 401 });
    }

    const productId = params.id;

    // Construir condición WHERE según el rol del usuario
    const whereCondition: any = { id: productId };
    
    // Solo SUPERADMIN puede acceder a productos de cualquier empresa
    if (session.user.role !== 'SUPERADMIN') {
      whereCondition.companyId = session.user.companyId;
    }

    await withPrisma(async (prisma) => {
      return await prisma.product.delete({
        where: whereCondition
      });
    });

    logger.info("Product deleted successfully", { 
      productId,
      userId: session.user.id 
    });

    return NextResponse.json({ 
      message: "Producto eliminado correctamente",
      success: true 
    });
  } catch (error: any) {
    logger.error("Error deleting product", {
      error: error.message,
      code: error.code,
      productId: params.id,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      companyId: session?.user?.companyId
    }, "/api/products/[id]", session);
    
    if (error.code === "P2025") {
      return NextResponse.json({ 
        error: "Producto no encontrado",
        message: "El producto solicitado no existe o no tienes permisos para eliminarlo."
      }, { status: 404 });
    }

    if (error.code === "P2003") {
      return NextResponse.json({ 
        error: "No se puede eliminar",
        message: "Este producto está siendo utilizado en otros registros y no puede ser eliminado."
      }, { status: 409 });
    }

    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
}