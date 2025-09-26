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
    console.log("=== PUT /api/products/[id] START ===");
    console.log("Product ID:", params.id);
    console.log("Request URL:", request.url);
    console.log("Request method:", request.method);
    console.log("TEST COMMIT - Deploy trigger");
    
    logger.info("PUT /api/products/[id] - Starting", { productId: params.id });
    
    session = await getServerSession(authOptions);
    console.log("Session retrieved:", session);
    console.log("Has session:", !!session);
    console.log("User ID:", session?.user?.id);
    console.log("User role:", session?.user?.role);
    console.log("Company ID:", session?.user?.companyId);
    
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
    
    console.log("Request body:", body);
    console.log("Product ID from params:", productId);
    console.log("User ID from session:", session.user.id);
    
    logger.debug("Request details", { 
      productId, 
      requestBody: body,
      userId: session.user.id 
    });

    // Validar datos de entrada
    const updateData: any = {};
    
    console.log("Validating input data...");
    console.log("Body.stock:", body.stock);
    console.log("Type of body.stock:", typeof body.stock);
    
    if (body.stock) {
      if (body.stock === 'IN_STOCK' || body.stock === 'OUT_OF_STOCK') {
        updateData.stock = body.stock;
        console.log("Stock value validated:", updateData.stock);
      } else {
        console.log("Invalid stock value:", body.stock);
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
    
    console.log("Update data:", updateData);

    // Construir condición WHERE según el rol del usuario
    const whereCondition: any = { id: productId };
    
    console.log("Building WHERE condition...");
    console.log("User role:", session.user.role);
    console.log("Is SUPERADMIN:", session.user.role === 'SUPERADMIN');
    
    // Solo SUPERADMIN puede acceder a productos de cualquier empresa
    if (session.user.role !== 'SUPERADMIN') {
      whereCondition.companyId = session.user.companyId;
      console.log("Added companyId to WHERE condition:", session.user.companyId);
    }

    console.log("Final WHERE condition:", whereCondition);
    console.log("Update data:", updateData);

    logger.debug("Database query", { 
      whereCondition,
      updateData,
      userRole: session.user.role 
    });

    console.log("About to execute withPrisma...");
    
    const product = await withPrisma(async (prisma) => {
      console.log("Inside withPrisma callback, executing update...");
      const result = await prisma.product.update({
        where: whereCondition,
        data: updateData
      });
      console.log("Update successful, result:", result);
      return result;
    });
    
    console.log("withPrisma completed, product:", product);

    console.log("Product updated successfully!");
    console.log("Updated fields:", Object.keys(updateData));
    
    logger.info("Product updated successfully", { 
      productId,
      updatedFields: Object.keys(updateData),
      userId: session.user.id 
    });
    
    console.log("Returning response with product:", product);
    return NextResponse.json(product);
  } catch (error: any) {
    console.log("=== ERROR CAUGHT ===");
    console.log("Error message:", error.message);
    console.log("Error code:", error.code);
    console.log("Error meta:", error.meta);
    console.log("Error stack:", error.stack);
    console.log("Product ID:", params.id);
    console.log("User ID:", session?.user?.id);
    console.log("User role:", session?.user?.role);
    console.log("Company ID:", session?.user?.companyId);
    console.log("=== END ERROR ===");
    
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